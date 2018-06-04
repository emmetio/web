<div class="picker" on:mouseover="set({hovered: true})" on:mouseout="set({hovered: false})">
	<span class="label" title="Choose output syntax">{ current.name }</span>
	{#if hovered}
		<div class="popup" transition:fly="{y: -30, duration: 200}">
			<PopupMenu items={popupItems} :selected on:select="fire('select', { id: event.id })" />
		</div>
	{/if}
</div>

<style>
.label {
	display: inline-block;
	cursor: pointer;
	line-height: inherit;
}

.popup {
	position: absolute;
	top: 100%;
	right: 0;
	background: #ffffff;
	color: #000000;
	border-radius: 5px;
	box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
	margin: 5px 0 0;
}
</style>

<script>
import { fly } from 'svelte-transitions';
import PopupMenu from './popup-menu.svelte';

export default {
	data() {
		return {
			syntaxes: [],
			selected: '',
			hovered: false
		};
	},

	computed: {
		/**
		 * @param {String[]} syntaxes
		 * @param {String} selected
		 */
		current({ syntaxes, selected }) {
			return selected
				? syntaxes.find(item => item.id === selected)
				: syntaxes[0];
		},

		popupItems({ syntaxes }) {
			return syntaxes.map(syntax => ({
				id: syntax.id,
				label: syntax.name
			}))
		}
	},

	transitions: { fly },
	components: { PopupMenu }
};
</script>
