'use strict';

import markupSnippets from '@emmetio/snippets/html.json';
import stylesheetSnippets from '@emmetio/snippets/css.json';
import xslSnippets from '@emmetio/snippets/xsl.json';
import { Store } from 'svelte/store';
import { get, set, objectsEqual } from './utils';

const defaultSnippets = {
	markup: markupSnippets,
	stylesheet: stylesheetSnippets,
	xsl: xslSnippets
};

class EmmetStore extends Store {
	/**
	 * Finds syntax object by its ID
	 * @param {String} id
	 * @return {Object}
	 */
	getSyntaxById(id) {
		return this.get().syntaxes.find(item => item.id === id);
	}

	/**
	 * Returns snippets defined in given scope
	 * @param {String} scope
	 * @return {Object}
	 */
	getSnippets(scope) {
		const { config } = this.get();

		if (isGlobalScope(scope)) {
			// Global snippets
			return {
				...defaultSnippets[scope],
				...get(config, `globals.${scope}.snippets`)
			};
		}

		// Check if given scope is a valid syntax
		const syntax = this.getSyntaxById(scope);
		if (syntax) {
			// Return syntax-specific snippets, inherited from user globals and
			// default snippets
			return {
				...defaultSnippets[syntax.type],
				...get(config, `globals.${syntax.type}.snippets`),
				...defaultSnippets[syntax.id],
				...get(config, `syntax.${syntax.id}.snippets`)
			};
		}

		return null;
	}

	/**
	 * Saves given snippets into config
	 * @param {String} scope
	 * @param {Object} data
	 * @returns {Boolean} Returns `true` if data differs from one in config and
	 * was successfully saved
	 */
	setSnippets(scope, data) {
		// We should take into account that given data is merged from global and
		// default data and we should save updated snippets only, relative to its
		// scope
		const { config } = this.get();
		const defaults = [];
		let targetKey;

		if (isGlobalScope(scope)) {
			defaults.push(defaultSnippets[scope]);
			targetKey = `globals.${scope}.snippets`;
		} else {
			const syntax = this.getSyntaxById(scope);
			if (syntax) {
				defaults.push(
					defaultSnippets[syntax.type],
					get(config, `globals.${syntax.type}.snippets`),
					defaultSnippets[syntax.id],
				);
				targetKey = `syntax.${syntax.id}.snippets`;
			}
		}

		if (targetKey) {
			const patch = {};
			Object.keys(data).forEach(key => {
				if (!hasItem(defaults, key, data[key])) {
					patch[key] = data[key];
				}
			});

			const prev = get(config, targetKey);
			if (!objectsEqual(patch, prev)) {
				this.set({
					config: set(config, targetKey, patch)
				});

				return true;
			}
		} else {
			console.warn('Unknown scope: ', scope);
		}

		return false;
	}

	/**
	 * Resets all user data from store
	 */
	reset() {
		this.set({ config: createConfig() });
	}
}

const store = new EmmetStore({
	/**
	 * All syntaxes, supported by Emmet
	 */
	syntaxes: [
		{ id: 'html', name: 'HTML', mime: 'text/html', type: 'markup' },
		{ id: 'xml', name: 'XML', mime: 'text/xml', type: 'markup' },
		{ id: 'xsl', name: 'XSL', mime: 'text/xsl', type: 'markup' },
		{ id: 'jsx', name: 'JSX', mime: 'text/jsx', type: 'markup' },
		{ id: 'pug', name: 'Pug', mime: 'text/x-pug', type: 'markup' },
		{ id: 'slim', name: 'Slim', mime: 'text/x-slim', type: 'markup' },
		{ id: 'haml', name: 'HAML', mime: 'text/x-haml', type: 'markup' },

		{ id: 'css', name: 'CSS', mime: 'text/css', type: 'stylesheet' },
		{ id: 'sass', name: 'SASS', mime: 'text/x-sass', type: 'stylesheet' },
		{ id: 'scss', name: 'SCSS', mime: 'text/x-scss', type: 'stylesheet' },
		{ id: 'less', name: 'LESS', mime: 'text/x-less', type: 'stylesheet' },
		{ id: 'sss', name: 'SugarSS', mime: 'text/x-sugarss', type: 'stylesheet' },
		{ id: 'stylus', name: 'Stylus', mime: 'text/x-styl', type: 'stylesheet' }
	],

	/**
	 * @type {EmmetConfig} Current config, as defined in `@emmetio/config`
	 */
	config: createConfig()
}, { immutable: true });

export default store;

/**
 * Creates Emmet config stub
 * @returns {EmmetConfig}
 */
function createConfig() {
	return {
		version: 1,
		globals: {
			markup: {},
			stylesheet: {}
		},
		syntax: {}
	};
}

/**
 * Check if given `items` exists in given array dictionaries and has the same
 * value
 * @param {Object[]} dicts
 * @param {String} key
 * @param {String} value
 * @returns {Boolean}
 */
function hasItem(dicts, key, value) {
	for (let i = dicts.length - 1, dict; i >= 0; i--) {
		dict = dicts[i];
		if (dict && dict[key] === value) {
			return true;
		}
	}

	return false;
}

function isGlobalScope(scope) {
	return scope === 'markup' || scope === 'stylesheet';
}
