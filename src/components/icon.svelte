<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon" width={width} height={height} viewBox="0 0 16 16">
{#if icon === 'add'}
	<path class="fill" d="M14 7h-5v-5h-2v5h-5v2h5v5h2v-5h5v-2z"></path>
{:elseif icon === 'remove'}
	<path class="fill" d="M12.96 4.46l-1.42-1.42-3.54 3.55-3.54-3.55-1.42 1.42 3.55 3.54-3.55 3.54 1.42 1.42 3.54-3.55 3.54 3.55 1.42-1.42-3.55-3.54 3.55-3.54z"></path>
{/if}
</svg>

<script>
export default {
	data() {
		return {
			width: 16,
			height: 16,
			icon: ''
		}
	}
}
</script>

<style>
.fill {
	fill: currentColor;
	stroke: none;
}
</style>
