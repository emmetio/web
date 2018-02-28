<div class="abbreviation">
	<Editor :value :error on:change="expand(event.value)" autofocus mode="emmet-abbreviation" />
</div>
<div class="preview">
	<Editor value="{{ expanded }}" mode="text/html" readOnly="nocursor" />
</div>

<style>
.abbreviation {
	position: relative;
	z-index: 1;
	border: 1px solid #ccc;
	box-shadow: 2px 2px 9px rgba(0, 0, 0, 0.2);
	line-height: 1.5;
	height: 1.5em;
	min-height: 30px;
	font-size: 15px;
	border-radius: 2px;
}

.abbreviation :global(.CodeMirror),
.abbreviation :global(.CodeMirror-scroll) {
	overflow: visible !important;
}

.preview {
	height: 300px;
	font-size: 12px;
}
</style>

<script>
import Editor from './editor.svelte';
import { expand } from '@emmetio/expand-abbreviation';

export default {
	oncreate() {
		this.expand(this.get('value'));
	},

	data() {
		return {
			value: '',
			expanded: '',
			error: null
		};
	},

	methods: {
		expand(abbr) {
			try {
				this.set({
					expanded: abbr ? expand(abbr) : '',
					error: null
				});
			} catch (error) {
				const message = (error.originalMessage || error.message)
					.replace(/\b(unexpected\s+)(\d+)/, (str, prefix, code) => prefix + String.fromCharCode(+code));

				this.set({
					expanded: '',
					error: {
						message,
						line: 0,
						ch: error.pos,
					}
				});
			}
		}
	},

	components: {
		Editor
	}
};
</script>
