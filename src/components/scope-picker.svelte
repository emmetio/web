<div class="scope-picker">
	Scope:
	<div class="scope" on:mouseover="set({hovered: true})" on:mouseout="set({hovered: false})">
		<span class="label">{ currentScope.label }</span>
		{#if hovered}
			<div class="popup" transition:fly="{y: -30, duration: 200}">
				<PopupMenu items={scopes} selected={scope} on:select="select(event.id)" />
			</div>
		{/if}
	</div>
</div>

<style type="text/scss">
.scope {
	display: inline-block;
	white-space: nowrap;
	position: relative;

	.label {
		color: #417505;
		border-bottom: 1px dotted currentColor;
		cursor: default;
		position: relative;
		z-index: 2;
	}
}

.popup {
	position: absolute;
	top: 100%;
	left: 0;
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
			scope: 'markup'
		};
	},

	computed: {
		scopes({ $syntaxes }) {
			const syntaxes = $syntaxes.map(syntax => ({
				id: syntax.id,
				label: syntax.name
			}))

			return [
				{ id: 'markup', label: 'All markup syntaxes' },
				{ id: 'stylesheet', label: 'All stylesheet syntaxes' }
			].concat(syntaxes);
		},
		currentScope({ scope, scopes }) {
			return scopes.find(item => item.id === scope);
		}
	},

	methods: {
		select(scope) {
			this.set({ scope });
			this.fire('select', { scope });
		}
	},

	transitions: { fly },
	components: { PopupMenu }
}
</script>
