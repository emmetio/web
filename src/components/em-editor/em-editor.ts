import { notify, getSlot } from 'endorphin/helpers';
import createEditor from '../../lib/codemirror';
import { EmComponent, EmmetEditor, EmmetConfig } from '../../types';

interface EmEditorProps {
    autofocus?: boolean;
    lineNumbers?: boolean;
    singleLine?: boolean;
    extraKeys?: { [name: string]: (editor: EmmetEditor) => void };
    mode: string;
    readOnly?: boolean;
    options?: EmmetConfig;
}

type ParseError = Error & { pos: number };

interface EmEditorState {
    error?: ParseError | null;
    errPos?: number;
    _onChange(): void;
    _onBlur(): void;
}

interface EmEditorExtend {
    /** Current editor value */
    readonly value: string;

    /** Editor error, if any */
    readonly error: ParseError | null;

    /** Set focus on current editor field */
    focus(): void;
}

export type EmEditor = EmComponent<EmEditorProps, EmEditorState> & EmEditorExtend & {
    /** Editor instance */
    editor: EmmetEditor;
};

const snippetMask = /[a-zA-Z0-9-_$@!:|]/;

export const extend: EmEditorExtend = {
    get value(this: EmEditor): string {
        return this.editor ? this.editor.getValue() : '';
    },

    get error(this: EmEditor): ParseError | null {
        return this.state.error || null;
    },

    /** Set focus on current editor field */
    focus(this: EmEditor) {
        this.editor.focus();
    }
};

export function props(): EmEditorProps {
    return {
        mode: 'text/html',
    };
}

export function didMount(component: EmEditor) {
    const editor = component.editor = createEditor(component);
    const valueSlot = getSlot(component, '') as HTMLElement;

    updateEditorOptions(editor, component.props);

    if (valueSlot) {
        editor.setValue(valueSlot.innerText);
    }

    component.state._onChange = () => {
        const error = validate(editor);

        if (error) {
            const coords = editor.charCoords({ line: 0, ch: error.pos }, 'div');
            component.setState({
                error,
                errPos: coords.left + (coords.right - coords.left) / 2
            });
        } else {
            component.setState({ error: null });
        }

        notify(component, 'change', { error });
    };

    editor.on('change', component.state._onChange);

    if (component.props.autofocus) {
        editor.execCommand('selectAll');
    }
}

export function didChange(component: EmEditor) {
    const { editor } = component;

    if (editor) {
        updateEditorOptions(editor, component.props);
    }
}

export function didSlotUpdate(component: EmEditor, slotName: string, elem: HTMLElement) {
    const { editor } = component;
    if (editor && slotName === '') {
        editor.setValue(elem.innerText);
    }
}

export function willUnmount(component: EmEditor) {
    component.editor.off('change', component.state._onChange);
    // component.editor.off('blur', component.state._onBlur);
    // @ts-ignore Dispose editor reference
    component.editor = component.state._onChange = component.state._onBlur = null;
}

/**
 * Tries to validate given editor content, if possible, and returns error object
 * if content is invalid
 */
function validate(editor: EmmetEditor): ParseError | undefined {
    const mode = editor.getOption('mode');
    if (mode === 'emmet-abbreviation') {
        try {
            editor.parseAbbreviation(editor.getValue(), 'markup');
        } catch(err) {
            return err;
        }
    } else if (mode === 'emmet-css-abbreviation') {
        try {
            editor.parseAbbreviation(editor.getValue(), 'stylesheet');
        } catch (err) {
            return err;
        }
    } else if (mode === 'emmet-snippet') {
        const value = editor.getValue();
        for (let i = 0; i < value.length; i++) {
            if (!snippetMask.test(value[i])) {
                const err = new Error('Invalid character') as ParseError;
                err.pos = i;
                return err;
            }
        }
    }
}

function updateEditorOptions(editor: EmmetEditor, options: EmEditorProps) {
    Object.keys(options).forEach(k => {
        const value = options[k];
        if (k === 'autofocus' && value) {
            editor.focus();
            editor.execCommand('selectAll');
        } else if (k === 'options') {
            // @ts-ignore
            const emmet = editor.getOption('emmet');
            // @ts-ignore
            editor.setOption('emmet', {
                ...emmet,
                ...value
            });
        } else if (k === 'singleLine') {
            editor.setOption('scrollbarStyle', value ? 'null' : 'native');
        } else {
            editor.setOption(k as keyof CodeMirror.EditorConfiguration, value);
        }
    });
}
