import { Changes } from 'endorphin';
import { notify, getSlot } from 'endorphin/helpers';
import { EmmetEditor, EmmetConfig } from '@emmetio/codemirror-plugin';
import createEditor, { EditorOptions } from '../../lib/codemirror';
import { EmComponent } from '../../lib/types';

interface EmEditorProps {
    autofocus?: boolean;
    lineNumbers?: boolean;
    singleLine?: boolean;
    extraKeys?: { [name: string]: (editor: EmmetEditor) => void };
    mode: string;
    readOnly?: boolean;
    options?: EmmetConfig;
}

type ParseError = Error & { ch: number };

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
    const editorOpt = { ...component.props } as EditorOptions;
    if (component.props.singleLine) {
        editorOpt.scrollbarStyle = 'null';
    }
    const editor = component.editor = createEditor(component, editorOpt);
    const valueSlot = getSlot(component, '') as HTMLElement;

    if (valueSlot) {
        editor.setValue(valueSlot.innerText);
    }

    component.state._onChange = () => {
        const doc = editor.getDoc();
        const value = doc.getValue();
        const line = doc.getCursor().line;
        const { parseError: error } = editor.getStateAfter(line);

        if (error) {
            const coords = editor.charCoords({ line: 0, ch: error.ch }, 'local');
            component.setState({
                error,
                errPos: coords.left + (coords.right - coords.left) / 2
            });
        } else {
            component.setState({ error: null });
        }

        notify(component, 'change', { value, error });
    };

    editor.on('change', component.state._onChange);

    if (component.props.autofocus) {
        editor.execCommand('selectAll');
    }
}

export function didChange(component: EmEditor, changes: Changes<EmEditorProps>) {
    const { editor } = component;

    if (!editor) {
        return;
    }

    Object.keys(changes).forEach(k => {
        const value = changes[k]!.current;
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
