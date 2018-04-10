<div class="editor" ref:editor></div>
<div class="error" ref:error>{{ error && error.message || '' }}</div>

<style>
ref:editor,
ref:editor :global(.CodeMirror) {
	width: inherit;
	height: inherit;
	border-radius: inherit;
	font-size: inherit;
	min-height: inherit;
}

.error {
	position: absolute;
	background: #f00;
	color: #ffffff;
	padding: 10px;
	padding: 5px;
	border-radius: 5px;
	font-size: 12px;
	max-width: 400px;
	margin-left: -7px;
	margin-top: 3px;
}

.error::before {
	display: block;
	content: '';
	position: absolute;
	width: 7px;
	height: 7px;
	background: inherit;
	transform: rotate(45deg);
	left: 8px;
	top: -2px;
}

.error:empty {
	display: none;
}
</style>

<script>
'use strict';

import createEditor from '../lib/codemirror';

export default {
	oncreate() {
		this.editor = createEditor(this.refs.editor, this.get());
		this._onChange = () => {
			const value = this.editor.getValue();
			this.fire('change', { value });
			this.set({ value });
		};
		this.editor.on('change', this._onChange);

		this.observe('mode', mode => this.editor.setOption('mode', mode));

		this.observe('value', value => {
			value = value == null ? '' : String(value);
			if (this.editor.getValue() !== value) {
				this.editor.setValue(value);
			}
		});
		this.observe('error', value => {
			if (value) {
				this.editor.addWidget({
					line: value.line,
					ch: value.ch
				}, this.refs.error);
			} else if (this.refs.error.parentNode) {
				this.refs.error.parentNode.removeChild(this.refs.error);
			}
		});
	},

	ondestroy() {
		this.editor.off('change', this._onChange);
		this.editor = null;
	},

	data() {
		return {
			autocomplete: false,
			autofocus: false,
			lineNumbers: false,
			autoCloseBrackets: true,
			mode: 'text/html',
			value: '',
			readOnly: false,
			error: null
		};
	},

	methods: {
		/**
		 * Set focus on current editor field
		 */
		focus() {
			this.editor.focus();
		}
	}
};
</script>
