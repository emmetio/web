<div class="scope-picker">
	Scope:
	<div class="scope">
		<span class="label">{ currentScope.name }</span>
		<ul class="popup">
			{#each scopes as item}
				<li class="{scope === item.id ? 'selected' : ''}" on:click="select(item.id)">{ item.name }</li>
			{/each}
		</ul>
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
	list-style-type: none;
	margin: 0;
	padding: 0;
	left: 0;
	top: 100%;
	background: #ffffff;
	box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.3);
	border-radius: 3px;
	opacity: 0;
	transform: translateY(-30px);
	transition-property: opacity, transform;
	transition-duration: 0.2s;
	pointer-events: none;

	li {
		padding: 8px;
		cursor: pointer;

		&:hover {
			background: #efefef;
		}

		&:first-child {
			border-top-left-radius: inherit;
			border-top-right-radius: inherit;
		}

		&:last-child {
			border-bottom-left-radius: inherit;
			border-bottom-right-radius: inherit;
		}
	}
}

.label:hover + .popup,
.popup:hover {
	opacity: 1;
	transform: translateY(0);
	pointer-events: all;
}
</style>

<script>
import store from '../lib/store';

export default {
	store: () => store,
	data() {
		return {
			scope: 'markup'
		};
	},

	computed: {
		scopes({ $syntaxes }) {
			return [
				{ id: 'markup', name: 'All markup syntaxes' },
				{ id: 'stylesheet', name: 'All stylesheet syntaxes' }
			].concat($syntaxes);
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
	}
}
</script>
