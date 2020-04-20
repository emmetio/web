import { Changes } from 'endorphin';
import { notify } from 'endorphin/helpers';
import { EmmetEditor } from '@emmetio/codemirror-plugin';
import { EmComponent } from '../../lib/types';
import { EmEditor } from '../em-editor/em-editor';
import { escapeString, unescapeString } from '../../lib/utils';

export type EmConfigKeyValue = EmComponent<EmConfigKeyValueProps, EmConfigKeyValueState> & {
    refs: {
        key?: EmEditor;
        value?: EmEditor;
    }
}

export type SubmitEvent = CustomEvent<SubmitEventDetails>;

interface SubmitEventDetails {
    key: string;
    value: string;
    originalKey: string;
    originalValue: string;
}

interface EmConfigKeyValueProps {
    key: string;
    value: string;
    keyMode?: string;
    valueMode?: string;
    editField?: 'key' | 'value';
}

interface EmConfigKeyValueState {
    key: string;
    value: string;
    editing: boolean;
    hover: boolean;
    autofocus?: 'key' | 'value' | null;
    extraKeys: KeyMap;
}

interface KeyMap {
    [shortcut: string]: (editor: EmmetEditor) => void
}

/**
 * Current;y active component
 */
let active: EmConfigKeyValue | null = null;

export const events = {
    mouseenter(component: EmConfigKeyValue) {
        component.setState({ hover: true });
    },
    mouseleave(component: EmConfigKeyValue) {
        component.setState({ hover: false });
    },
    dblclick(component: EmConfigKeyValue, evt: MouseEvent) {
        const autofocus = (evt.target as HTMLElement).closest('.value') ? 'value' : 'key';
        edit(component, autofocus);
    }
}

export function state(component: EmConfigKeyValue): EmConfigKeyValueState {
    return {
        key: '',
        value: '',
        hover: false,
        editing: false,
        extraKeys: {
            Esc() {
                component.setState({ editing: false });
            },
            Enter() {
                submit(component);
            },
            Tab(editor) {
                const { key, value } = component.refs;
                if (key && value) {
                    const blurPos = { line: 0, ch: 0 };
                    if (key.editor === editor) {
                        key.editor.setCursor(blurPos);
                        value.focus();
                    } else {
                        value.editor.setCursor(blurPos);
                        key.focus();
                    }
                }
            }
        }
    };
}

export function didChange(component: EmConfigKeyValue, { editField, key, value }: Changes<EmConfigKeyValueProps>) {
    if (editField && editField.current) {
        edit(component, editField.current);
    }

    if (key) {
        component.setState({ key: escapeString(key.current || '') });
    }

    if (value) {
        component.setState({ value: escapeString(value.current || '') });
    }
}

export function willUnmount(component: EmConfigKeyValue) {
    if (active === component) {
        active = null;
    }
}

export function onEditClick(component: EmConfigKeyValue) {
    edit(component, 'value');
}

export function edit(component: EmConfigKeyValue, autofocus: 'key' | 'value') {
    if (active) {
        reset(active);
    }

    component.setState({
        editing: true,
        autofocus
    });

    active = component;
}

export function submit(component: EmConfigKeyValue) {
    const { key, value } = component.refs;
    if (key && value && !key.error && !value.error) {
        notify(component, 'submit', {
            key: unescapeString(key.value),
            value: unescapeString(value.value),
            originalKey: component.props.key,
            originalValue: component.props.value,
        } as SubmitEventDetails);
        reset(component);
    }
}

export function reset(component: EmConfigKeyValue) {
    component.setState({ editing: false });
    if (active === component) {
        active = null;
    }
}
