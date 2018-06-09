<h3>Edit snippets</h3>

<ScopePicker bind:scope />
<TableEditor ref:table :actions :schema items={_snippets} on:submit="saveSippets(event.items)" />

<script>
import ScopePicker from './scope-picker.svelte';
import TableEditor from './table-editor.svelte';

export default {
	data() {
		return {
			scope: 'markup',
			schema: [{
				id: 'name',
				label: 'Name',
				syntax: 'emmet-snippet-name',
				width: '200px'
			}, {
				id: 'value',
				label: 'Abbreviation',
				syntax: 'emmet-abbreviation'
			}],
			actions: [{
				name: 'add',
				label: 'Add snippet below'
			}, {
				name: 'remove',
				label: 'Remove snippet'
			}],
			_snippets: []
		};
	},

	oncreate() {
		this.store.on('state', ({ changed }) => {
			if (changed.config) {
				this.updateSnippets();
			}
		});
	},

	onstate({ changed, current }) {
		if (changed.scope) {
			this.updateSnippets();
			this.refs.table.resetActive();
		}
	},

	methods: {
		updateSnippets() {
			const { scope } = this.get();
			const snippets = this.store.getSnippets(scope);

			this.set({
				_snippets: Object.keys(snippets).map(key => [key, snippets[key]])
			});
		},
		saveSippets(data) {
			const { scope } = this.get();
			const snippets = {};
			data.forEach(item => snippets[item[0]] = item[1]);
			this.store.setSnippets(scope, snippets);
		}
	},

	components: {
		ScopePicker, TableEditor
	}
};
</script>
