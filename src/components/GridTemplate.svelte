<script lang="ts">
	export let min_width = "20rem";
	export let min_height = "5rem";
	let style = `--min-width: ${min_width}; --min-height: ${min_height};`;
</script>

<div class="grid-template" {style}>
	<slot />
</div>

<style>
	.grid-template {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(min(var(--min-width), 100%), 1fr)
		);
		grid-gap: 1rem;
		grid-auto-rows: minmax(var(--min-height), auto);
	}
</style>
