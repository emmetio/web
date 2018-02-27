<textarea name="code" autofocus="{{ autofocus }}" ref:editor></textarea>

<style>
textarea {
	display: block;
	width: 100%;
	height: 5em;
}
</style>

<script>
'use strict';

import createEditor from '../lib/codemirror';

export default {
	oncreate() {
		this.editor = createEditor(this.refs.editor, this.get());
	},

	ondestroy() {
		this.editor.toTextArea();
		this.editor = null;
	},

	data() {
		return {
			autofocus: true,
			mode: 'text/html',
			lineNumbers: false
		};
	}
};
</script>
