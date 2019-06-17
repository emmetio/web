import { Component } from 'endorphin';
import { EmmetStore } from './lib/store';

type ParseModeError = Error & { ch?: number };
type SyntaxType = 'markup' | 'stylesheet';
type EmComponent<P = any, S = any> = Component<P, S, EmmetStore>;

interface ICodeMirrorOptions extends CodeMirror.EditorConfiguration {
	markTagPairs?: boolean;
	autoRenameTags?: boolean;
	autocomplete?: boolean;
}

interface IEditorHintOptions {
	completeSingle?: boolean;
	alignWithWord?: boolean;
	closeCharacters?: RegExp;
	closeOnUnfocus?: boolean;
	completeOnSingleClick?: boolean;
}

interface IEmmetCompletion {
	range: CodeMirror.Range;
	type: string;
	label?: string;
	preview?: string;
	insert(): void;
}

interface IEmmetCompletionResult {
	from: CodeMirror.Position;
	to: CodeMirror.Position;
	list: IEmmetCompletion[]
}

interface IAbbreviation { }
