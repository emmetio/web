<form ref:form on:submit="submit(event)" on:reset="reset(event)" on:keydown="handleKeyDown(event)">
	<table>
		<tr>
			{#each schema as header}
				<th class={header.id} style="width: {header.width != null ? header.width : 'auto'}">{header.label}</th>
			{/each}
			<th class="controls"></th>
		</tr>
		{#each _items as _row, rowIx}
			<tr class="{rowIx === row ? 'active' : ''}" data-row={rowIx} on:click="handleClick(rowIx, event)">
				{#each schema as _cell, cellIx}
					<td class={_cell.id} data-cell={cellIx}>
						<div class="field {_row.error(cellIx) ? 'error' : ''}">
							{#if rowIx === row && cellIx === cell}
								<Editor
									value={_row.value(cellIx)}
									error={_row.error(cellIx)}
									mode={_cell.syntax}
									autofocus={cellIx === cell}
									on:change="_setValue(rowIx, cellIx, event.value, event.error)"/>
							{:else}
								{_row.value(cellIx)}
							{/if}
						</div>
					</td>
				{/each}
				<td class="controls">
					{#each actions as action}
						<span class="button" data-action={action.name} title={action.label}>
							<Icon icon={action.name} />
						</span>
					{/each}
				</td>
			</tr>
		{/each}
	</table>
	<div class="actions">
		<Button type="submit" disabled={!isUpdated || hasErrors}>Submit</Button>
		<Button type="reset" disabled={!isUpdated} secondary>Reset</Button>
	</div>
</form>

<style type="text/scss">
	table {
		border: 0;
		width: 100%;
		table-layout: fixed;
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

		&.controls {
			border-bottom: 0;
			width: 70px;
		}
	}

	td {
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
		overflow: hidden;
		transition-duration: 0.3s;
		transition-property: border-color, box-shadow;

		tr:not(.active) & {
			cursor: pointer;
		}

		tr.active & {
			border-color: #D6D6D6;
			box-shadow: 1px 1px 6px 0 rgba(0,0,0,0.14);
		}

		&.error {
			color: #ff0000;

			tr.active & {
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

		&:not(:first-child) {
			margin-left: 5px;
		}

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
import EditableRow from './assets/editable-row';

const TAB_KEY = 9;
const ENTER_KEY = 13;
const ESC_KEY = 27;

function createEditableRows(items) {
	return items.map(item => new EditableRow(item));
}

export default {
	data() {
		return {
			schema: [{
				id: 'name',
				label: 'Name',
				syntax: '',
				width: '200px'
			}, {
				id: 'value',
				label: 'Value',
				syntax: ''
			}],
			items: [
				['name1', 'value1'],
				['name2', 'value2']
			],
			actions: [{
				name: 'add',
				label: 'Add row'
			}, {
				name: 'remove',
				label: 'Remove row'
			}],
			row: -1,
			cell: -1,
			createCell: schema => '',
			_items: []
		};
	},

	onstate({ changed, current }) {
		// Create backing structure for handling changes
		if (changed.items) {
			this.set({ _items: createEditableRows(current.items) });
		}
	},

	computed: {
		isUpdated: ({ _items, items }) => _items.length !== items.length || _items.some(item => item.updated),
		hasErrors: ({ _items }) => _items.some(item => item.hasError)
	},

	methods: {
		/**
		 * @param {Number} row
		 * @param {Number} cell
		 */
		toggleEdit(row, cell) {
			this.set({ row, cell });
		},

		/**
		 * @param {Event} event
		 */
		submit(event) {
			event.preventDefault();

			const { _items } = this.get();
			const items = _items
				.filter(item => !item.empty)
				.map(item => item.value);

			this.fire('submit', { items });
			this.toggleEdit(-1);
		},

		reset(event) {
			event.preventDefault();

			this.set({
				_items: createEditableRows(this.get().items),
				row: -1,
				cell: -1
			});
		},

		resetActive() {
			this.set({ row: -1, cell: -1 });
		},

		insertAfter(i) {
			const { schema, createCell, _items } = this.get();
			const updatedItems = _items.slice();
			updatedItems.splice(i + 1, 0, new EditableRow(schema.map(createCell)));

			this._set({ _items: updatedItems });
			this.toggleEdit(i + 1, 0);
		},

		remove(i) {
			let { row, _items } = this.get();

			_items = _items.slice();
			_items.splice(i, 1);

			this._set({
				_items,
				row: row === i ? -1 : row
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
					this.set({ row: -1 });
					break;

				case TAB_KEY:
					event.shiftKey ? this._prevField() : this._nextField();
					break;
			}
		},

		/**
		 * Handle click on table row
		 * @param {Number} rowIx
		 * @param {MouseEvent} event
		 */
		handleClick(rowIx, event) {
			const button = event.target.closest('.button');

			if (button) {
				const action = button.getAttribute('data-action');
				if (action === 'add') {
					this.insertAfter(rowIx);
				} else if (action === 'remove') {
					this.remove(rowIx);
				}
			} else {
				const cell = event.target.closest('td');
				const cellIx = cell && cell.getAttribute('data-cell');
				if (cellIx) {
					this.toggleEdit(rowIx, Number(cellIx));
				}
			}
		},

		/**
		 * Moves focus to next field in editor
		 */
		_nextField() {
			let { row, cell, schema, items } = this.get();

			cell++;
			if (cell >= schema.length) {
				row++;
				cell = 0;
			}

			if (row >= items.length) {
				row = cell = -1;
			}

			this.toggleEdit(row, cell);
		},

		/**
		 * Moves focus to previour field in editor
		 */
		_prevField() {
			let { row, cell, schema, items } = this.get();

			cell--;
			if (cell < 0) {
				row--;
				cell = items.length - 1;
			}

			if (row < 0) {
				row = cell = -1;
			}

			this.toggleEdit(row, cell);
		},

		/**
		 * Updates `cellIx` value at given `rowIx`
		 * @param {Number} rowIx
		 * @param {Number} cellIx
		 * @param {*} value
		 * @param {Error} [value]
		 */
		_setValue(rowIx, cellIx, value, error) {
			console.log('set value', rowIx, cellIx, value, error);
			let { _items } = this.get();
			const row = _items[rowIx];

			if (row && row.update(cellIx, value, error)) {
				this.set({ _items: _items.slice() });
			} else {
				throw new Error(`Row index ${rowIx} is out of bounds`);
			}

		}
	},

	components: {
		Editor, Button, Icon
	}
};
</script>
