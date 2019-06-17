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
