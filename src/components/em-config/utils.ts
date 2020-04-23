import { EmmetMap, EmmetMapDiff, ConfigField } from '../../types';

export type KeyValueList = KeyValueItem[];

export interface KeyValueItem {
    id: number | string;
    key: string;
    value: string;
}

export type SubmitEvent<I extends KeyValueItem> = CustomEvent<SubmitEventDetails<I>>;

export interface SubmitEventDetails<I extends KeyValueItem> {
    key: string;
    value: string;
    item: I;
}

let idCounter = 0;
export function createKeyValueItem(key: string, value: string): KeyValueItem {
    return { id: idCounter++, key, value };
}

/**
 * Returns diff map of values from `list`, which differ from original data source.
 * Each diff entry contains either new value or `null` if value should be removed
 * from `source`
 */
export function keyValueListDiff(list: KeyValueList, source: EmmetMap): EmmetMapDiff {
    const result: EmmetMapDiff = {};
    const lookup = new Set<string>();

    // Find updated values
    list.forEach(item => {
        if (item.value !== source[item.key]) {
            result[item.key] = item.value;
        }
        lookup.add(item.key);
    });

    // Check for missing key for original source: mark such keys as removed
    Object.keys(source).forEach(key => {
        if (!lookup.has(key)) {
            result[key] = null;
        }
    });

    return result;
}

/**
 * Creates object with current values from `list`
 */
export function keyValueListToMap(list: KeyValueList): EmmetMap {
    const result: EmmetMap = {};
    list.forEach(item => result[item.key] = item.value);
    return result;
}

/**
 * Helper function which updated given key-value list in immutable way with data,
 * specified in submit event from key-value component.
 * @param items
 * @param event
 */
export function updateKeyValueListOnSubmit(items: KeyValueList, event: SubmitEvent<KeyValueItem>): KeyValueList {
    const ix = items.findIndex(item => item.id === event.detail.item.id);
    if (ix !== -1) {
        const { key, value } = event.detail;
        items = [...items];

        if (!key.trim()) {
            // Empty key: remove value
            items.splice(ix, 1);
        } else {
            items[ix] = {
                ...items[ix],
                key: key.trim(),
                value: value.trim(),
            };
        }
    }

    return items;
}

/**
 * Updates value of `name` field in given field list, including nested items,
 * in an immutable way
 */
export function updateField(fields: ConfigField[], name: string, value: string | boolean): ConfigField[] {
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (field.name === name) {
            fields = [...fields];
            fields[i] = { ...field, value } as ConfigField;
            break;
        }

        if (field.children) {
            const children = updateField(field.children, name, value);
            if (children !== field.children) {
                fields = [...fields];
                fields[i] = { ...field, children } as ConfigField;
                break;
            }
        }
    }

    return fields;
}
