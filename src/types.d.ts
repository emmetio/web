type ParseModeError = Error & { ch?: number };
type SyntaxType = 'markup' | 'stylesheet';

interface EditorHintOptions {
	completeSingle?: boolean;
	alignWithWord?: boolean;
	closeCharacters?: RegExp;
	closeOnUnfocus?: boolean;
	completeOnSingleClick?: boolean;
}

interface EmmetCompletion {
	range: CodeMirror.Range;
	type: string;
	label?: string;
	preview?: string;
	insert(): void;
}

interface EmmetCompletionResult {
	from: CodeMirror.Position;
	to: CodeMirror.Position;
	list: EmmetCompletion[]
}

interface Abbreviation { }

declare module '@emmetio/snippets' {
	export interface Snippets {
		[key: string]: string;
	}

	export interface SnippetsRegistry {
		css: Snippets;
		html: Snippets;
		xsl: Snippets;
		[syntax: string]: Snippets;
	}

	const registry: SnippetsRegistry;

	export default registry;
}

declare module '@emmetio/codemirror-plugin' {
	export default function setupEmmet(cm: typeof CodeMirror): void;

}
