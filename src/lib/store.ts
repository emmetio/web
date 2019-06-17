import snippets, { Snippets } from '@emmetio/snippets';
import { EmmetConfig } from '@emmetio/config';
import { Store } from 'endorphin';
import { get, set, objectsEqual } from './utils';

interface ISyntaxDefinition {
	id: string;
	name: string;
	mime: string;
	type: SyntaxType;
}

interface IStoreData {
	/** All syntaxes, supported by Emmet */
	syntaxes: ISyntaxDefinition[];

	/** Current config, as defined in `@emmetio/config` */
	config: EmmetConfig;
}

class EmmetStore extends Store<IStoreData> {
	/**
	 * Finds syntax definition by its ID
	 */
	public getSyntaxById(id: string): ISyntaxDefinition {
		return this.get().syntaxes.find(item => item.id === id);
	}

	/**
	 * Returns snippets defined in given scope
	 */
	public getSnippets(scope: string): Snippets {
		const { config } = this.get();

		if (isGlobalScope(scope)) {
			// Global snippets
			return {
				...snippets[scope],
				...get(config, `globals.${scope}.snippets`)
			};
		}

		// Check if given scope is a valid syntax
		const syntax = this.getSyntaxById(scope);
		if (syntax) {
			// Return syntax-specific snippets, inherited from user globals and
			// default snippets
			return {
				...snippets[syntax.type],
				...get(config, `globals.${syntax.type}.snippets`),
				...snippets[syntax.id],
				...get(config, `syntax.${syntax.id}.snippets`)
			};
		}

		return null;
	}

	/**
	 * Saves given snippets into config
	 * Returns `true` if data differs from one in config and
	 * was successfully saved
	 */
	public setSnippets(scope: string, data: Snippets): boolean {
		// We should take into account that given data is merged from global and
		// default data and we should save updated snippets only, relative to its
		// scope
		const { config } = this.get();
		const defaults: Snippets[] = [];
		let targetKey;

		if (isGlobalScope(scope)) {
			defaults.push(snippets[scope]);
			targetKey = `globals.${scope}.snippets`;
		} else {
			const syntax = this.getSyntaxById(scope);
			if (syntax) {
				defaults.push(
					snippets[syntax.type],
					get(config, `globals.${syntax.type}.snippets`),
					snippets[syntax.id],
				);
				targetKey = `syntax.${syntax.id}.snippets`;
			}
		}

		if (targetKey) {
			const patch: Snippets = {};
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
	public reset() {
		this.set({ config: createConfig() });
	}
}

const store = new EmmetStore({
	syntaxes: [
		markup('html', 'HTML', 'text/html'),
		markup('xml', 'XML', 'text/xml'),
		markup('xsl', 'XSL', 'text/xsl'),
		markup('jsx', 'JSX', 'text/jsx'),
		markup('pug', 'Pug', 'text/x-pug'),
		markup('slim', 'Slim', 'text/x-slim'),
		markup('haml', 'HAML', 'text/x-haml'),

		stylesheet('css', 'CSS', 'text/css'),
		stylesheet('sass', 'SASS', 'text/x-sass'),
		stylesheet('scss', 'SCSS', 'text/x-scss'),
		stylesheet('less', 'LESS', 'text/x-less'),
		stylesheet('sss', 'SugarSS', 'text/x-sugarss'),
		stylesheet('stylus', 'Stylus', 'text/x-styl')
	],

	config: createConfig()
});

export default store;

/**
 * Returns markup syntax definition
 */
function markup(id: string, name: string, mime: string): ISyntaxDefinition {
	return { id, name, mime, type: 'markup' };
}

/**
 * Returns stylesheet syntax definition
 */
function stylesheet(id: string, name: string, mime: string): ISyntaxDefinition {
	return { id, name, mime, type: 'stylesheet' };
}

/**
 * Creates Emmet config stub
 */
function createConfig(): EmmetConfig {
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
 */
function hasItem(dicts: any[], key: string, value: any): boolean {
	for (let i = dicts.length - 1, dict; i >= 0; i--) {
		dict = dicts[i];
		if (dict && dict[key] === value) {
			return true;
		}
	}

	return false;
}

function isGlobalScope(scope: string): scope is SyntaxType {
	return scope === 'markup' || scope === 'stylesheet';
}
