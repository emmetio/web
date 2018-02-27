<div class="editor" ref:editor></div>
<style>
	ref:editor {
		border: 1px solid #ccc;
		box-shadow: 2px 2px 9px rgba(0, 0, 0, 0.2);
		line-height: 1.5;
		height: 1.5em;
		min-height: 30px;
		font-size: 15px;
		border-radius: 2px;
	}

	ref:editor :global(.CodeMirror) {
		height: 100%;
		border-radius: inherit;
		font-size: inherit;
	}
</style>

<script>
import CodeMirror from 'codemirror';
import markupAbbreviation from '../lib/markup-abbreviation-mode';

CodeMirror.defineMode('emmet-markup-abbreviation', markupAbbreviation);

export default {
	oncreate() {
		this.editor = CodeMirror(this.refs.editor, this.get());
	},

	ondestroy() {
		this.editor = null;
	},

	data() {
		return {
			autofocus: true,
			mode: 'emmet-markup-abbreviation',
			value: ''
		};
	}
};
</script>
