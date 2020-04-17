import { Changes } from 'endorphin';
import { notify, getSlot } from 'endorphin/helpers';
import createEditor from '../../lib/codemirror';
import { EmComponent } from '../../lib/types';

interface EmEditorProps {
    autofocus?: boolean;
    lineNumbers?: boolean;
    singleLine?: boolean;
    mode: string;
    readOnly?: boolean;
}

type ParseError = Error & { ch: number };

interface EmEditorState {
    error?: ParseError | null;
    errPos?: number;
    _onChange(): void;
    _onBlur(): void;
}

export type EmEditor = EmComponent<EmEditorProps, EmEditorState> & {
    /** Editor instance */
    editor: CodeMirror.Editor;
    /** Set focus on current editor field */
    focus(): void;
};

export const extend = {
    /** Set focus on current editor field */
    focus(this: EmEditor) {
        this.editor.focus();
    },

    /** Returns current editor value */
    get value(this: EmEditor): string {
        return this.editor ? this.editor.getValue() : '';
    }
};

export function props(): EmEditorProps {
    return {
        mode: 'text/html',
    };
}

export function didMount(component: EmEditor) {
    const editor = component.editor = createEditor(component, component.props);
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
            console.log('got error', error);
            const coords = editor.charCoords({ line: 0, ch: error.ch });
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
        } else {
            editor.setOption(k as keyof CodeMirror.EditorConfiguration, value);
        }
    });
}

export function didSlotUpdate(component: EmEditor, slotName: string, elem: HTMLElement) {
    const { editor } = component;
    if (editor && slotName === '') {
        console.log('Update content', elem.innerText);
        editor.setValue(elem.innerText);
    }
}

export function willUnmount(component: EmEditor) {
    component.editor.off('change', component.state._onChange);
    // component.editor.off('blur', component.state._onBlur);
    // @ts-ignore Dispose editor reference
    component.editor = component.state._onChange = component.state._onBlur = null;
}
