import { KeyValueList, updateKeyValueList } from './utils';
import { EmComponent } from '../../types';
import { notify } from 'endorphin/helpers';
import { Changes } from 'endorphin';

const ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
const isMac = ios || /Mac/.test(navigator.platform);

interface EmConfigShortcutsProps {
    shortcuts: KeyValueList;
}

interface EmConfigShortcutsState {
    isMac: boolean;
    conflicts?: string[];
}

export function state(): EmConfigShortcutsState {
    return { isMac };
}

export type EmConfigShortcuts = EmComponent<EmConfigShortcutsProps, EmConfigShortcutsState>;

export function didChange(component: EmConfigShortcuts, { shortcuts }: Changes<EmConfigShortcutsProps>) {
    if (shortcuts) {
        component.setState({ conflicts: getConflicts(shortcuts.current || []) });
    }
}

export function onSubmit(action: string, component: EmConfigShortcuts, evt: CustomEvent) {
    const { shortcuts } = component.props;
    const updated = updateKeyValueList(shortcuts, action, evt.detail.value);
    if (updated !== shortcuts) {
        notify(component, 'update', updated);
    }
}

export function onClear(action: string, component: EmConfigShortcuts) {
    const { shortcuts } = component.props;
    const updated = updateKeyValueList(shortcuts, action, '');
    if (updated !== shortcuts) {
        notify(component, 'update', updated);
    }
}


function getConflicts(shortcuts: KeyValueList): string[] {
    const lookup = new Map<string, string[]>();
    shortcuts.forEach(item => {
        if (item.value) {
            if (!lookup.has(item.value)) {
                lookup.set(item.value, [item.id as string]);
            } else {
                lookup.get(item.value)!.push(item.id as string);
            }
        }
    });

    let conflicts: string[] = [];
    lookup.forEach(actions => {
        if (actions.length > 1) {
            conflicts = conflicts.concat(actions);
        }
    });

    return conflicts;
}
