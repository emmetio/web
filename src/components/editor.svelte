<div class="container">
	<div class="editor" ref:editor></div>
	<div ref:error>{ error && error.message || '' }</div>
</div>

<style>
ref:editor,
ref:editor :global(.CodeMirror) {
	width: inherit;
	height: inherit;
	border-radius: inherit;
	font-size: inherit;
	min-height: inherit;
}

ref:error {
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

ref:error::before {
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

ref:error:empty {
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
			let error;
			const value = this.editor.getValue();
			const line = this.editor.getCursor().line;
			const state = this.editor.getStateAfter(line);

			if (state.parseError) {
				error = {
					message: state.parseError.message,
					ch: state.parseError.ch,
					line
				};
			}

			this.set({ value, error });
			this.fire('change', { value, error });
		};

		this.editor.on('change', this._onChange);

		if (this.get().autofocus) {
			this.editor.execCommand('selectAll');
		}
	},

	onstate({ changed, current }) {
		if (changed.mode) {
			this.editor.setOption('mode', current.mode);
		}

		if (changed.value) {
			const value = current.value == null ? '' : String(current.value);
			if (this.editor.getValue() !== value) {
				this.editor.setValue(value);
			}
		}

		if (changed.error) {
			if (current.error) {
				this.editor.addWidget({
					line: current.error.line,
					ch: current.error.ch
				}, this.refs.error);
			} else if (this.refs.error.parentNode) {
				this.refs.error.parentNode.removeChild(this.refs.error);
			}
		}
	},

	ondestroy() {
		this.editor.off('change', this._onChange);
		this.editor = this._onChange = null;
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
