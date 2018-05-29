<button :type class={secondary ? 'secondary' : ''} on:click="fire('click')" :disabled>
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

button:disabled {
	background: #ccc;
	cursor: default;
}

button.secondary {
	color: #417505;
	background: transparent;
}

button.secondary:disabled {
	color: #ccc;
}

</style>

<script>
export default {
	data() {
		return {
			type: 'button',
			disabled: false,
			secondary: false
		};
	}
};
</script>
