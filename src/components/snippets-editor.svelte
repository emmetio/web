<form ref:form on:submit="submit()">
	<table>
		<tr>
			<th class="name">Name</th>
			<th class="abbreviation">Abbreviation</th>
		</tr>
		{#each items as snippet, i}
			<tr class="{i === active ? 'active' : ''}" on:click="toggleEdit(i, event)">
				<td class="name">
					<div class="field {i === active ? 'active' : ''} {snippet.keyError ? 'error' : ''}" data-name="key">
						{#if i === active}
							<Editor
								value={snippet.key}
								error={snippet.keyError}
								mode="emmet-snippet-name"
								autofocus={context == 'key'}
								on:change="_setKey(i, event)"/>
						{:else}
							{snippet.key}
						{/if}
					</div>
				</td>
				<td class="abbreviation">
					<div class="field {i === active ? 'active' : ''} {snippet.valueError ? 'error' : ''}" data-name="value">
						{#if i === active}
							<Editor
								value={snippet.value}
								error={snippet.valueError}
								mode="emmet-abbreviation"
								autofocus={context == 'value'}
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
		<Button>Submit</Button>
		<Button secondary>Reset</Button>
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
			context: null,
			_changes: []
		};
	},

	computed: {
		items({ snippets, _changes }) {
			const total = Math.max(snippets.length, _changes.length);
			const result = [];

			for (let i = 0; i < total; i++) {
				if (_changes[i] !== null) {
					result.push(snippets[i] || _changes[i]);
				}
			}

			return result;
		}
	},

	methods: {
		/**
		 * @param {Number} active
		 * @param {MouseEvent} event
		 */
		toggleEdit(active, event) {
			if (active !== this.get().active) {
				const context = event.target.closest('.field').getAttribute('data-name');

				this.set({ active, context });
			}
		},

		submit() {
			const { snippets } = this.get();
			console.log('will submit', snippets);
			this.fire({ snippets });
		},

		_setKey(i, event) {
			console.log('set key', i , event);
			this._setSnippetData(i, 'key', event.value);
		},

		_setValue(i, event) {
			console.log('set value', i, event);
			this._setSnippetData(i, 'value', event.value);
		},

		/**
		 * Updates snippet `key` data at index `i`
		 * @param {Number} i
		 * @param {String} key
		 * @param {String} value
		 */
		_setSnippetData(i, key, value) {
			/** @type {Array} */
			const snippets = this.get().snippets.slice();

			if (i >= 0 && i < snippets.length) {
				// XXX Svelte doesn’t support object spread with dynamic keys?
				// { ...obj, [key]: value }
				snippets[i] = { ...snippets[i] };
				snippets[i][key] = value;
				this.set({ snippets });
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
