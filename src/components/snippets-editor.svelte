<form ref:form on:submit="submit(event)" on:reset="reset(event)" on:keydown="handleKeyDown(event)">
	<table>
		<tr>
			<th class="key">Name</th>
			<th class="value">Abbreviation</th>
			<th class="controls"></th>
		</tr>
		{#each items as snippet, i}
			<tr class="{i === active ? 'active' : ''}" data-ix={i} on:click="handleClick(i, event)">
				<td data-name="key">
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
				<td data-name="value">
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
				<td class="controls">
					<span class="button" data-action="add" title="Add snippet below">
						<Icon icon="add" />
					</span>
					<span class="button" data-action="remove" title="Remove snippet">
						<Icon icon="remove" />
					</span>
				</td>
			</tr>
		{/each}
	</table>
	<div class="actions">
		<Button type="submit" disabled={!isUpdated}>Submit</Button>
		<Button type="reset" disabled={!isUpdated} secondary>Reset</Button>
	</div>
</form>

<style type="text/scss">
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

		&.key {
			width: 200px;
		}

		&.controls {
			border-bottom: 0;
			width: 70px;
		}
	}

	td {
		&[data-name="key"] {
			padding-right: 10px;
		}

		&.controls {
			border-bottom: 0;
			padding-left: 10px;
			white-space: nowrap;
			vertical-align: middle;
		}
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
		min-height: 1.5em;
		transition-duration: 0.3s;
		transition-property: border-color, box-shadow;

		&:not(.active) {
			cursor: pointer;
		}

		&.active {
			border-color: #D6D6D6;
			box-shadow: 1px 1px 6px 0 rgba(0,0,0,0.14);
		}

		&.error {
			color: #ff0000;

			&.active {
				border-color: red;
				box-shadow: 1px 1px 6px 0 rgba(255,0,0,0.14);
			}
		}
	}

	.button {
		$size: 26px;

		display: inline-block;
		width: $size;
		height: $size;
		border: 1px solid currentColor;
		color: #999;
		border-radius: 100%;
		cursor: pointer;
		opacity: 0;
		transition-property: opacity, color, background-color;
		transition-duration: 0.2s;

		tr:hover & {
			opacity: 1;
		}

		&:hover {
			background: #999;
			color: #fff;
		}

		:global(.icon) {
			position: relative;
			left: 5px;
			top: 5px;
		}
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
import Icon from './icon.svelte';

const TAB_KEY = 9;
const ENTER_KEY = 13;
const ESC_KEY = 27;

function isEmptySnippet(snippet) {
	return !snippet.key && !snippet.value;
}

function createEditableSnippets(snippets) {
	return snippets.map(editableSnippet);
}

function editableSnippet(snippet) {
	return {
		...snippet,
		originalKey: snippet.key,
		originalValue: snippet.value
	};
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
			this.set({ _items: createEditableSnippets(current.snippets) });
		}
	},

	computed: {
		items: ({ _items }) => _items,
		isUpdated: ({ _items, snippets }) => _items.length !== snippets.length || _items.some(isUpdated)
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
			this.toggleEdit(-1);
		},

		reset(event) {
			event.preventDefault();

			this.set({
				_items: createEditableSnippets(this.get().snippets),
				active: -1
			})
		},

		insertAfter(i) {
			const _items = this.get()._items.slice();
			_items.splice(i + 1, 0, editableSnippet({ key: '', value: '' }));

			this._set({ _items });
			this.toggleEdit(i + 1, 'key');
		},

		remove(i) {
			let { active, _items } = this.get();

			_items = _items.slice();
			_items.splice(i, 1);

			this._set({
				_items,
				active: active === i ? -1 : active
			});
		},

		/**
		 * Handle keydown event
		 * @param {KeyboardEvent} event
		 */
		handleKeyDown(event) {
			switch (event.keyCode) {
				case ENTER_KEY:
					if (event.shiftKey || event.metaKey || event.ctrlKey) {
						const row = event.target.closest('tr');
						const ix = row && row.getAttribute('data-ix');
						if (ix) {
							this.insertAfter(Number(ix));
						}
					} else {
						this.submit(event);
					}
					break;

				case ESC_KEY:
					this.set({ active: -1 });
					break;

				case TAB_KEY:
					event.shiftKey ? this._prevField() : this._nextField();
					break;
			}
		},

		/**
		 * Handle click on table row
		 * @param {MouseEvent} event
		 */
		handleClick(ix, event) {
			const button = event.target.closest('.button');

			if (button) {
				const action = button.getAttribute('data-action');
				if (action === 'add') {
					this.insertAfter(ix);
				} else if (action === 'remove') {
					this.remove(ix);
				}
			} else {
				const cell = event.target.closest('td');
				const name = cell && cell.getAttribute('data-name');
				if (name) {
					this.toggleEdit(ix, name);
				}
			}
		},

		/**
		 * Moves focus to next field in editor
		 */
		_nextField() {
			let { active, field, _items } = this.get();

			if (field === 'value') {
				active++;
				field = 'key';
			} else {
				field = 'value';
			}

			if (active >= _items.length) {
				active = -1;
			}

			this.toggleEdit(active, field);
		},

		/**
		 * Moves focus to previour field in editor
		 */
		_prevField() {
			let { active, field } = this.get();

			if (field === 'key') {
				active--;
				field = 'value';
			} else {
				field = 'key';
			}

			this.toggleEdit(active, field);
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
		Editor, Button, Icon
	}
};
</script>
