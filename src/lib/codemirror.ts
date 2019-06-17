import * as CodeMirror from 'codemirror';
import setupEmmet from '@emmetio/codemirror-plugin';

type CodeMirrorHintCheck = (mode: string, editor: CodeMirrorEditor) => void;
type CodeMirrorNS = typeof CodeMirror & {
	registerGlobalHelper(module: string, id: string, check: CodeMirrorHintCheck, callback: (editor: CodeMirrorEditor) => void): void;
};

interface ICodeMirrorOptions extends CodeMirror.EditorConfiguration {
	markTagPairs?: boolean;
	autoRenameTags?: boolean;
	autocomplete?: boolean;
}

type CodeMirrorEditor = CodeMirror.Editor & {
	findEmmetMarker(pos?: number): CodeMirror.TextMarker & { popupDisableTimer?: any, autoPopupDisabled?: boolean };
	getEmmetCompletions(pos?: CodeMirror.Position, force?: boolean): EmmetCompletionResult;
	getEmmetAbbreviation(pos?: CodeMirror.Position, contextAware?: boolean): Abbreviation | void;
	showHint(options?: EditorHintOptions): void;
};

import 'codemirror/addon/edit/closebrackets';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/sass/sass';
import 'codemirror/mode/haml/haml';
import 'codemirror/mode/slim/slim';
import 'codemirror/mode/pug/pug';
import 'codemirror/addon/hint/show-hint';
import markupAbbreviation from './markup-abbreviation-mode';
import snippetName from './snippet-name-mode';

setupEmmet(CodeMirror);
CodeMirror.defineMode('emmet-abbreviation', markupAbbreviation);
CodeMirror.defineMode('emmet-snippet-name', snippetName);

/**
 * Initially setup Emmet support & create CodeMirror instance from given `<textarea>`
 * element
 */
export default function createEditor(target: HTMLElement, options: ICodeMirrorOptions): CodeMirror.Editor {
	options = {
		mode: 'text/html',
		markTagPairs: false,
		autoRenameTags: false,
		...options
	};

	const extraKeys: CodeMirror.KeyMap = {
		Tab: skipMultiline,
		Enter: skipMultiline,
		'Shift-Enter': skipMultiline,
		'Cmd-Enter': skipMultiline
	};

	if (options.autocomplete) {
		extraKeys['Ctrl-Space'] = 'autocomplete';
	}

	if (options.extraKeys && typeof options.extraKeys === 'object') {
		options.extraKeys = {
			...extraKeys,
			...options.extraKeys
		};
	}

	const editor = target.nodeName === 'TEXTAREA'
		? CodeMirror.fromTextArea(target as HTMLTextAreaElement, options)
		: CodeMirror(target, options);

	if (options.autocomplete) {
		setupAutocomplete(editor as CodeMirrorEditor);
	}

	return editor;
}

/**
 * A key handler which will skip default action handler if editor is not in
 * multiline editing mode
 */
function skipMultiline(cm: CodeMirrorEditor) {
	if (cm.getOption('multiline')) {
		return CodeMirror.Pass;
	}
}

/**
 * Adds autocomplete provider that opens completion popup when user types
 * Emmet abbreviation
 */
function setupAutocomplete(editor: CodeMirrorEditor) {
	// Automatically display Emmet completions when cursor enters abbreviation
	// marker if `markEmmetAbbreviation` option was enabled (true by default)
	editor.on('cursorActivity', () => {
		if (editor.getOption('markEmmetAbbreviation')) {
			const marker = editor.findEmmetMarker();
			if (marker && !marker.autoPopupDisabled) {
				editor.showHint({ completeSingle: false });
			}
		}
	});

	// Automatic popup with expanded Emmet abbreviation might be very annoying
	// since almost any latin word can be Emmet abbreviation.
	// So when user hides completion popup with Escape key, we should mark
	// Emmet abbreviation marker under cursor as one that shouldn’t receive
	// automatic completion popup.
	// Since CodeMirror API does not allow us (easily) to detect if completion
	// popup was hidden because of user interaction (Esc key) or because it
	// must recalculate completions on user typing, we will use a timer hack
	editor.on('startCompletion', () => {
		const marker = editor.findEmmetMarker();
		if (marker) {
			clearTimeout(marker.popupDisableTimer);
			marker.popupDisableTimer = null;
		}
	});

	editor.on('endCompletion', () => {
		const marker = editor.findEmmetMarker();
		if (marker) {
			clearTimeout(marker.popupDisableTimer);
			marker.popupDisableTimer = setTimeout(() => marker.autoPopupDisabled = true, 30);
		}
	});

	return editor;
}

// Add completions provider for CodeMirror’s `show-hint` addon
(CodeMirror as CodeMirrorNS).registerGlobalHelper('hint', 'emmet',
	// Tell `show-hint` module that current helper will provide completions
	(mode, editor) => !!editor.getEmmetAbbreviation(),
		editor => {
		// Activate auto-popup, if disabled (see below)
		const marker = editor.findEmmetMarker();
		if (!marker) {
			return;
		}

		clearTimeout(marker.popupDisableTimer);
		marker.autoPopupDisabled = false;

		const completions = editor.getEmmetCompletions();
		return completions && {
			from: completions.from,
			to: completions.to,
			// Transform Emmet completions to ones that supported by `show-hint`
			list: completions.list.map(completion => {
				return {
					from: completion.range.from,
					to: completion.range.to,
					render(elt: HTMLElement) {
						const content = document.createDocumentFragment();
						const label = document.createElement('span');
						label.className = 'emmet-label';

						const preview = document.createElement('span');
						preview.className = 'emmet-preview';

						content.appendChild(label);
						content.appendChild(preview);

						if (completion.type === 'expanded-abbreviation') {
							// It’s an expanded abbreviation completion:
							// render preview for it
							label.className += ' emmet-label__expand';
							label.textContent = 'Expand abbreviation';

							preview.className += ' emmet-preview__expand';
							// Replace tab with a few spaces so preview would take
							// lesser space
							preview.textContent = completion.preview.replace(/\t/g, '  ');
						} else {
							// A regular snippet: render completion abbreviation
							// and its preview
							label.textContent = completion.label;
							preview.textContent = completion.preview;
						}

						elt.appendChild(content);
					},
					hint() {
						// Use completions’ `insert()` method to properly
						// insert Emmet completion
						completion.insert();
					}
				};
			})
		};
	}
);
