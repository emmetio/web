<ul>
	{#each items as item (item.id)}
	<li class="{ item.id === selected ? 'selected' : '' }" on:click="fire('select', { id: item.id })">
		{ item.label }
	</li>
	{/each}
</ul>

<style>
ul {
	display: block;
	list-style: none;
	color: inherit;
	padding: 0;
	margin: 0;
	border-radius: inherit;
}

li {
	padding: 5px 10px 5px 20px;
	cursor: pointer;
}

li:first-child {
	border-top-left-radius: inherit;
	border-top-right-radius: inherit;
}

li:last-child {
	border-bottom-left-radius: inherit;
	border-bottom-right-radius: inherit;
}

li:hover {
	background: #eeeeee;
}

li.selected::before {
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
			items: [],
			selected: ''
		};
	}
};
</script>
