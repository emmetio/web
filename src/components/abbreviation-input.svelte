<div class="abbreviation">
	<div class="input">
		<Editor ref:input bind:value error="{{ expanded.error }}" autofocus mode="emmet-abbreviation" />
	</div>
	{{#if syntaxPicker }}
		<div class="syntax-picker">
			<SyntaxPicker :syntaxes on:select="setSyntax(event.id)" selected="{{ syntax }}" />
		</div>
	{{/if}}
</div>
{{#if preview }}
<div class="preview">
	<Editor value="{{ expanded.value }}" mode="{{ mime }}" readOnly="nocursor" />
</div>
{{/if}}
<div class="comment">
	<slot name="comment"></slot>
</div>
<style>
.abbreviation {
	position: relative;
	z-index: 2;
	border: 1px solid #ccc;
	box-shadow: 2px 2px 9px rgba(0, 0, 0, 0.2);
	line-height: 1.5em;
	height: 1.5em;
	min-height: 30px;
	font-size: 15px;
	border-radius: 2px;
	display: flex;
}

.abbreviation :global(.CodeMirror),
.abbreviation :global(.CodeMirror-scroll) {
	overflow: visible !important;
}

.input {
	flex: 1 1;
	height: 100%;
}

.syntax-picker {
	flex: 0 0;
	margin: 2px;
	padding: 2px 4px;
	position: relative;
	background: #aaaaaa;
	color: #ffffff;
	font-size: 12px;
	border-radius: 2px;
}

.preview {
	position: relative;
	z-index: 1;
	height: 300px;
	font-size: 12px;
}

.comment {
	font-size: 10px;
	color: #cccccc;
}
</style>

<script>
import Editor from './editor.svelte';
import SyntaxPicker from './syntax-picker.svelte';
import { expand } from '@emmetio/expand-abbreviation';
import resolveConfig from '@emmetio/config';

const syntaxes = [
	{ id: 'html', name: 'HTML', mime: 'text/html' },
	{ id: 'xml', name: 'XML', mime: 'text/xml' },
	{ id: 'css', name: 'CSS', mime: 'text/css' },
	{ id: 'sass', name: 'SASS', mime: 'text/x-sass' },
	{ id: 'jsx', name: 'JSX', mime: 'text/jsx' },
	{ id: 'slim', name: 'Slim', mime: 'text/x-slim' },
	{ id: 'haml', name: 'HAML', mime: 'text/x-haml' },
	{ id: 'pug', name: 'Pug', mime: 'text/x-pug' }
];

export default {
	oncreate() {
		this.observe('expanded', payload => {
			this._valid = !payload.error;
			this.fire('change', {
				value: this.get('value'),
				valid: this._valid
			});
		});
	},

	data() {
		return {
			syntaxes,
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
		mime(syntaxes, syntax) {
			const item = syntaxes.find(item => item.id === syntax) || syntaxes[0];
			return item.mime;
		},

		expanded: (value, syntax, config) => {
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
	},

	components: {
		Editor,
		SyntaxPicker
	}
};
</script>
