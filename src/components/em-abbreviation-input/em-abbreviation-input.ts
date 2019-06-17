import { expand } from '@emmetio/expand-abbreviation';
import resolveConfig from '@emmetio/config';

export default {
	onstate({ changed, current }) {
		if (changed.expanded) {
			this._valid = !current.expanded.error;
			this.fire('change', {
				value: this.get().value,
				valid: this._valid
			});
		}
	},

	data() {
		return {
			value: '',
			syntax: 'html',
			config: {
				globals: {
					markup: {
						profile: {
							selfClosingStyle: 'xhtml'
						}
					}
				},
				syntax: {
					jsx: {
						options: {
							jsx: true
						}
					}
				}
			},
			syntaxPicker: false,
			preview: false,
			error: null
		};
	},

	computed: {
		mime({ $syntaxes, syntax }) {
			const item = $syntaxes.find(item => item.id === syntax) || $syntaxes[0];
			return item.mime;
		},

		expanded: ({ value, syntax, config }) => {
			try {
				return {
					value: value ? expand(value, resolveConfig(config, { syntax })) : ''
				};
			} catch (error) {
				const message = (error.originalMessage || error.message)
					.replace(/\b(unexpected\s+)(\d+)/, (str, prefix, code) => prefix + String.fromCharCode(+code));

				return {
					error: {
						message,
						line: 0,
						ch: error.pos,
					}
				};
			}
		}
	},

	methods: {
		setSyntax(syntax) {
			this.set({ syntax });
			this.refs.input.focus();
		},

		/**
		 * Check if currently entered abbreviation is valid
		 * @return {Boolean}
		 */
		isValid() {
			return this._valid;
		}
	}
};
