<button class={secondary ? 'secondary' : ''} on:click="fire('click')">
	<slot>Label</slot>
</button>

<style>
button {
	background: #417505;
	border-radius: 5px;
	padding: 5px;
	font-family: inherit;
	color: #ffffff;
	cursor: pointer;
	padding: 10px;
	font-size: 1.3em;
	border: 0;
}

button.secondary {
	color: #417505;
	background: transparent;
}
</style>

<script>
export default {
	data() {
		return {
			secondary: false
		};
	}
};
</script>
