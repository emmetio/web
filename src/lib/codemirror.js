'use strict';

import CodeMirror from 'codemirror';
import setupEmmet from '@emmetio/codemirror-plugin';

/* eslint-disable */
import * as closeBrackets from 'codemirror/addon/edit/closebrackets';
import * as xml from 'codemirror/mode/xml/xml';
import * as css from 'codemirror/mode/css/css';
import * as htmlmixed from 'codemirror/mode/htmlmixed/htmlmixed';
import * as javascript from 'codemirror/mode/javascript/javascript';
import * as jsx from 'codemirror/mode/jsx/jsx';
import * as sass from 'codemirror/mode/sass/sass';
import * as haml from 'codemirror/mode/haml/haml';
import * as slim from 'codemirror/mode/slim/slim';
import * as pug from 'codemirror/mode/pug/pug';
import * as hint from 'codemirror/addon/hint/show-hint';
import markupAbbreviation from './markup-abbreviation-mode';
import snippetName from './snippet-name-mode';
/* eslint-enable */

setupEmmet(CodeMirror);
CodeMirror.defineMode('emmet-abbreviation', markupAbbreviation);
CodeMirror.defineMode('emmet-snippet-name', snippetName);

/**
 * Initially setup Emmet support & create CodeMirror instance from given `<textarea>`
 * element
 * @param {HTMLElement} target
 * @return {CodeMirror}
 */
export default function createEditor(target, options) {
	options = Object.assign({
		mode: 'text/html',
		markTagPairs: false,
		autoRenameTags: false,
	}, options);

	const extraKeys = {};

	if (options.autocomplete) {
		extraKeys['Ctrl-Space'] = 'autocomplete';
	}

	options.extraKeys = {
		...extraKeys,
		...options.extraKeys
	};

	const editor = target.nodeName === 'TEXTAREA'
		? CodeMirror.fromTextArea(target, options)
		: CodeMirror(target, options);

	if (options.autocomplete) {
		setupAutocomplete(editor);
	}

	return editor;
}

/**
 * Adds autocomplete provider that opens completion popup when user types
 * Emmet abbreviation
 * @param {CodeMirror} editor
 */
function setupAutocomplete(editor) {
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
		var marker = editor.findEmmetMarker();
		if (marker) {
			clearTimeout(marker.popupDisableTimer);
			marker.popupDisableTimer = null;
		}
	});

	editor.on('endCompletion', () => {
		var marker = editor.findEmmetMarker();
		if (marker) {
			clearTimeout(marker.popupDisableTimer);
			marker.popupDisableTimer = setTimeout(() => marker.autoPopupDisabled = true, 30);
		}
	});

	return editor;
}

// Add completions provider for CodeMirror’s `show-hint` addon
CodeMirror.registerGlobalHelper('hint', 'emmet', (mode, editor) => {
	// Tell `show-hint` module that current helper will provide completions
	return !!editor.getEmmetAbbreviation();
}, (editor) => {
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
		list: completions.list.map(function (completion) {
			return {
				from: completion.range.from,
				to: completion.range.to,
				render(elt) {
					var content = document.createDocumentFragment();
					var label = document.createElement('span');
					label.className = 'emmet-label';

					var preview = document.createElement('span');
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
});
