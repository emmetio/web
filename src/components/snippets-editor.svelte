<form ref:form on:submit="submit(event)" on:reset="reset(event)">
	<table>
		<tr>
			<th class="name">Name</th>
			<th class="abbreviation">Abbreviation</th>
		</tr>
		{#each items as snippet, i}
			<tr class="{i === active ? 'active' : ''}">
				<td class="name" on:click="toggleEdit(i, 'key')">
					<div class="field {i === active ? 'active' : ''} {snippet.keyError ? 'error' : ''}">
						{#if i === active}
							<Editor
								value={snippet.key}
								error={snippet.keyError}
								mode="emmet-snippet-name"
								autofocus={field === 'key'}
								on:change="_setKey(i, event)"/>
						{:else}
							{snippet.key}
						{/if}
					</div>
				</td>
				<td class="abbreviation" on:click="toggleEdit(i, 'value')">
					<div class="field {i === active ? 'active' : ''} {snippet.valueError ? 'error' : ''}">
						{#if i === active}
							<Editor
								value={snippet.value}
								error={snippet.valueError}
								mode="emmet-abbreviation"
								autofocus={field === 'value'}
								on:change="_setValue(i, event)"/>
						{:else}
							{snippet.value}
						{/if}
					</div>
				</td>
			</tr>
		{/each}
	</table>
	<div class="actions">
		<Button type="submit" disabled={!isUpdated}>Submit</Button>
		<Button type="reset" disabled={!isUpdated} secondary>Reset</Button>
	</div>
</form>

<style>
	table {
		border: 0;
		width: 100%;
	}

	td, th {
		padding: 0;
		margin: 0;
		border-bottom: 1px solid #efefef;
		text-align: left;
	}

	th {
		font-weight: bold;
		font-size: 1.4em;
		padding: 3px 10px;
	}

	th.name {
		width: 200px;
	}

	td.name {
		padding-right: 10px;
	}

	.field {
		margin: 5px 0;
		padding: 4px 10px;
		font-family: 'Fira Code', Menlo, Consolas, monospace;
		font-size: 14px;
		border-radius: 3px;
		border: 1px solid transparent;
		white-space: nowrap;
		text-overflow: ellipsis;
		line-height: 1.5;
		transition-duration: 0.3s;
		transition-property: border-color, box-shadow;
	}

	.field:not(.active) {
		cursor: pointer;
	}

	.field.active {
		border-color: #D6D6D6;
		box-shadow: 1px 1px 6px 0 rgba(0,0,0,0.14);
	}

	.field.active.error {
		border-color: red;
		box-shadow: 1px 1px 6px 0 rgba(255,0,0,0.14);
	}

	.field.error:not(.active) {
		color: #ff0000;
	}

	table :global(.CodeMirror),
	table :global(.CodeMirror-scroll) {
		font-family: inherit;
		font-size: inherit;
		overflow: visible !important;
		padding: 0;
		margin: 0;
	}

	table :global(.CodeMirror-line),
	table :global(.CodeMirror-lines) {
		padding: 0;
	}

	.actions {
		margin-top: 20px;
	}
</style>
<script>
import Button from './button.svelte';
import Editor from './editor.svelte';

function isEmptySnippet(snippet) {
	return !snippet.key && !snippet.value;
}

function createEditSnippets(snippets) {
	return snippets.map(snippet => ({
		...snippet,
		originalKey: snippet.key,
		originalValue: snippet.value
	}));
}

function isUpdated(snippet) {
	return snippet.key !== snippet.originalKey
		|| snippet.value !== snippet.originalValue;
}

export default {
	data() {
		return {
			snippets: [{
				key: 'a:tel',
				value: 'a[href=\'tel:+${0}\']'
			}, {
				key: 'bdo',
				value: 'bdo[dir]'
			}, {
				key: 'link',
				value: 'link[rel=stylesheet href]/'
			}],
			active: -1,
			field: null,
			_items: []
		};
	},

	onstate({ changed, current }) {
		// Create backing structure for handling changes
		if (changed.snippets) {
			this.set({ _items: createEditSnippets(current.snippets) });
		}
	},

	computed: {
		items: ({ _items }) => _items,
		isUpdated: ({ _items }) => _items.some(isUpdated)
	},

	methods: {
		/**
		 * @param {Number} active
		 * @param {MouseEvent} event
		 */
		toggleEdit(active, field) {
			this.set({ active, field });
		},

		/**
		 * @param {Event} event
		 */
		submit(event) {
			event.preventDefault();

			const { _items } = this.get();
			const snippets = _items
				.filter(snippet => !isEmptySnippet(snippet))
				.map(snippet => ({
					key: snippet.key,
					value: snippet.value
				}));

			this.fire('submit', { snippets });
		},

		reset(event) {
			event.preventDefault();

			this.set({
				_items: createEditSnippets(this.get().snippets),
				active: -1
			})
		},

		_setKey(i, event) {
			this._setSnippetData(i, {
				key: event.value,
				keyError: event.error
			});
		},

		_setValue(i, event) {
			this._setSnippetData(i, {
				value: event.value,
				valueError: event.error
			});
		},

		/**
		 * Updates data of snippet at index `i`
		 * @param {Number} i
		 * @param {Object} data
		 */
		_setSnippetData(i, data) {
			let { _items } = this.get();

			if (_items[i]) {
				_items = _items.slice();
				_items[i] = {
					..._items[i],
					...data
				}
				this.set({ _items });
			} else {
				throw new Error(`Index ${i} is out of bounds`);
			}
		}
	},

	components: {
		Editor, Button
	}
};
</script>
