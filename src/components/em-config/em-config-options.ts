import { ConfigFieldType, ConfigChooseValue, EmComponent, ConfigField } from '../../types';
import { escapeString } from '../../lib/utils';
import { updateField } from './utils';
import { notify } from 'endorphin/helpers';
import { Changes } from 'endorphin';

export type OptionField = OptionFieldBase | OptionFieldChoose;
export type Data = { [name: string]: DataValue };
export type DataValue = string | boolean | null;

export interface OptionFieldBase {
    name: string;
    label: string;
    type: ConfigFieldType;
    comment?: string;
    children?: OptionField[];
}

export interface OptionFieldChoose extends OptionFieldBase {
    type: ConfigFieldType.Choose;
    items: string[] | ConfigChooseValue[];
}

interface EmConfigOptionsProps {
    form: OptionField[];
    data: Data
    defaults: Data;
}

interface EmConfigOptionsState {
    form: ConfigField[];
}

export type EmConfigOptions = EmComponent<EmConfigOptionsProps, EmConfigOptionsState>;

export const events = {
    change(component: EmConfigOptions, evt: Event) {
        const elem = evt.target as HTMLInputElement;
        const name = elem.name;
        const value = elem.type === 'checkbox' ? elem.checked : elem.value;
        const { form } = component.state;
        const updated = updateField(form, name, value)

        if (form !== updated) {
            component.setState({
                form: updated
            });
            console.log('update', calculateDiff(component));

            notify(component, 'update', calculateDiff(component));
        }
    }
}

export function didChange(component: EmConfigOptions, { form, data, defaults }: Changes<EmConfigOptionsProps>) {
    if (form || data || defaults) {
        component.setState({ form: createForm(component) });
    }
}

function createForm(component: EmConfigOptions): ConfigField[] {
    return convertFields(component, component.props.form);
}

function convertFields(component: EmConfigOptions, fields: OptionField[]): ConfigField[] {
    return fields.map(input => {
        const field = {
            ...input,
            value: getValue(component, input.name)
        } as ConfigField;

        if (field.children) {
            field.children = convertFields(component, field.children)
        }

        return field;
    });
}

function getValue(component: EmConfigOptions, name: string): DataValue {
    const { data, defaults } = component.props;
    let value: DataValue = null;

    if (data && name in data) {
        value = data[name];
    } else if (defaults) {
        return defaults[name];
    }

    if (typeof value === 'string') {
        value = escapeString(value);
    }

    return value;
}

/**
 * Calculates diff from given component’s state against default values
 */
function calculateDiff(component: EmConfigOptions): Data {
    const data: Data = {};
    const { state } = component;
    const { defaults } = component.props;
    state.form.forEach(opt => {
        if (opt.value !== defaults[opt.name]) {
            data[opt.name] = opt.value;
        }
    });

    return data;
}
