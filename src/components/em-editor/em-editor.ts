import { notify } from 'endorphin/helpers';
import createEditor from '../../lib/codemirror';
import { EmComponent, ICodeMirrorOptions } from '../../types';
import { Changes } from 'endorphin';

interface IEmEditorProps extends ICodeMirrorOptions {
	multiline?: boolean;
	autocomplete?: boolean;
	autofocus?: boolean;
	lineNumbers?: boolean;
	mode: string;
	value: string;
	readOnly?: boolean;
	error?: Error;
}

export type EmEditor = EmComponent<IEmEditorProps> & {
	editor: CodeMirror.Editor;
	/** Set focus on current editor field */
	focus(): void;
	_onChange(): void;
	_onBlur(): void;
};

export const extend = {
	/** Set focus on current editor field */
	focus(this: EmEditor) {
		this.editor.focus();
	}
};

export function props(): IEmEditorProps {
	return {
		mode: 'text/html',
		value: '',
	};
}

export function didMount(component: EmEditor) {
	const editor = component.editor = createEditor(component, component.props);
	component._onChange = () => {
		const doc = editor.getDoc();
		const value = doc.getValue();
		const line = doc.getCursor().line;
		const { parseError: error } = editor.getStateAfter(line);

		if (error) {
			editor.addWidget({
				line,
				ch: error.ch
			}, component.refs.error as HTMLElement, false);
		}

		component.setState({ value, error });
		notify(component, 'change', { value, error });
	};

	component._onBlur = () => {
		const doc = editor.getDoc();
		if (doc.somethingSelected()) {
			const pos = { line: 0, ch: 0 };
			doc.setSelection(pos, pos);
		}
	};

	editor.on('change', component._onChange);
	editor.on('blur', component._onBlur);

	if (component.props.autofocus) {
		editor.execCommand('selectAll');
	}
}

export function didUpdate(component: EmEditor, { mode, value, autofocus }: Changes<IEmEditorProps>) {
	const { editor } = component;

	if (mode) {
		editor.setOption('mode', mode.current);
	}

	if (value) {
		const val = value.current == null ? '' : String(value.current);
		if (editor.getValue() !== val) {
			editor.setValue(val);
		}
	}

	if (autofocus && autofocus.current) {
		editor.focus();
		editor.execCommand('selectAll');
	}
}

export function willUnmount(component: EmEditor) {
	component.editor.off('change', component._onChange);
	component.editor.off('blur', component._onBlur);
	component.editor = component._onChange = component._onBlur = null;
}
