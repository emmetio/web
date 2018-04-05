<span class="label" title="Choose output syntax">{{ current.name }}</span>
<ul class="items">
	{{#each syntaxes as syntax}}
	<li class="{{ syntax.id === selected ? 'selected' : '' }}" on:click="fire('select', syntax)">
		{{ syntax.name }}
	</li>
	{{/each}}
</ul>

<style>
.label {
	display: inline-block;
	cursor: pointer;
	line-height: inherit;
}

.items {
	display: block;
	list-style: none;
	position: absolute;
	top: 100%;
	right: 0;
	background: #ffffff;
	color: #000000;
	border-radius: 5px;
	box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
	padding: 0;
	margin: 5px 0 0;
	transition: transform 0.2s 0.2s ease-out;
	transform-origin: 100% 0;
	transform: scale(0);
}

.label:hover + .items,
.items:hover {
	transform: scale(1);
	transition-delay: 0;
}

.items li {
	padding: 5px 10px 5px 20px;
	cursor: pointer;
	position: relative;
}

.items li:first-child {
	border-top-left-radius: inherit;
	border-top-right-radius: inherit;
}

.items li:last-child {
	border-bottom-left-radius: inherit;
	border-bottom-right-radius: inherit;
}

.items li:hover {
	background: #eeeeee;
}

.items li.selected::before {
	content: '✓';
	display: inline-block;
	width: 1em;
	margin-right: -1em;
	position: relative;
	left: -13px;
}
</style>


<script>
export default {
	data() {
		return {
			syntaxes: [],
			selected: ''
		};
	},

	computed: {
		/**
		 * @param {String[]} syntaxes
		 * @param {String} selected
		 */
		current(syntaxes, selected) {
			return selected
				? syntaxes.find(item => item.id === selected)
				: syntaxes[0];
		}
	}
};
</script>
