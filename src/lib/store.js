'use strict';

import markupSnippets from '@emmetio/snippets/html.json';
import stylesheetSnippets from '@emmetio/snippets/css.json';
import { Store } from 'svelte/store';
import { get, set, objectsEqual } from './utils';

const defaultSnippets = {
	markup: markupSnippets,
	stylesheet: stylesheetSnippets
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
	 * @return {Object[]}
	 */
	getSnippets(scope) {
		const { config } = this.get();

		if (scope in defaultSnippets) {
			// Global snippets
			return dictToArray({
				...defaultSnippets[scope],
				...get(config, `globals.${scope}.snippets`)
			});
		}

		// Check if given scope is a valid syntax
		const syntax = this.getSyntaxById(scope);
		if (syntax) {
			// Return syntax-specific snippets, inherited from user globals and
			// default snippets
			return dictToArray({
				...defaultSnippets[scope],
				...get(config, `globals.${syntax.type}.snippets`),
				...get(config, `syntax.${syntax.id}.snippets`)
			});
		}

		return null;
	}

	/**
	 * Saves given snippets into config
	 * @param {String} scope
	 * @param {Object[]} data
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

		if (scope in defaultSnippets) {
			defaults.push(defaultSnippets[scope]);
			targetKey = `globals.${scope}.snippets`;
		} else {
			const syntax = this.getSyntaxById(syntax);
			if (syntax) {
				defaults.push(
					defaultSnippets[syntax.type],
					get(config, `globals.${syntax.type}.snippets`)
				);
				targetKey = `syntax.${syntax.id}.snippets`;
			}
		}

		if (!targetKey) {
			const patch = arrayToDict(data.filter(item => !hasItem(item, defaults)));
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
 * Converts given dictionary to array of objects
 * @param {Object} dict
 * @return {Object[]}
 */
function dictToArray(dict) {
	return Object.keys(dict).map(key => ({ key, value: dict[key] }));
}

/**
 * Converts given array, created by `dictToArray()`, back to dictionary
 * @param {Object[]} arr
 * @return {Object}
 */
function arrayToDict(arr) {
	return arr.reduce((out, obj) => {
		out[obj.key] = obj.value;
		return out;
	}, {});
}

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
 * @param {Object} item A `{ key, value }` items
 * @param {Object[]} dicts
 * @returns {Boolean}
 */
function hasItem(item, dicts) {
	for (let i = dicts.length - 1; i >= 0; i--) {
		if (dicts[i][item.key] === item.value) {
			return true;
		}
	}

	return false;
}
