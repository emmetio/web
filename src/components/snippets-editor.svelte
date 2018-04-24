<table>
	<tr>
		<th class="name">Name</th>
		<th class="abbreviation">Abbreviation</th>
	</tr>
	{#each snippets as snippet, i}
		<tr class="{i === active ? 'active' : ''}" on:click="toggleEdit(i, event)">
			<td class="name">
				<div class="field {i === active ? 'active' : ''}" data-name="key">
					{#if i === active}
						<Editor value={snippet.key} mode="emmet-snippet-name" autofocus={context == 'key'} />
					{:else}
						{snippet.key}
					{/if}
				</div>
			</td>
			<td class="abbreviation">
				<div class="field {i === active ? 'active' : ''}" data-name="value">
					{#if i === active}
						<Editor value={snippet.value} mode="emmet-abbreviation"  autofocus={context == 'value'} />
					{:else}
						{snippet.value}
					{/if}
				</div>
			</td>
		</tr>
	{/each}
</table>
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
</style>
<script>
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
			context: null
		};
	},

	methods: {
		/**
		 * @param {Number} active
		 * @param {MouseEvent} event
		 */
		toggleEdit(active, event) {
			if (active !== this.get().active) {
				const context = event.target.closest('.field').getAttribute('data-name');
				console.log('set active to', active, context);

				this.set({ active, context });
			}
		}
	},

	components: {
		Editor
	}
};
</script>
