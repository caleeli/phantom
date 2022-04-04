<script>
	import { createEventDispatcher } from "svelte";
	import api from "../api";
	import { translations as _ } from "../helpers";

	export let value;
	export let min;
	export let max;

	const dispatch = createEventDispatcher();

	function oninput(event) {
		dispatch("input", { value: event.target.value });
	}
</script>

<input
	{...$$restProps}
	class={`input-progress ${$$restProps.class || ""}`}
	{value}
	type="number"
	{min}
	{max}
	style={`--progress:${((value - min) / (max - min)) * 100}%;`}
	on:input={oninput}
/>

<style>
	.input-progress {
		background: linear-gradient(
			to right,
			var(--success) var(--progress),
			var(--input-bg) var(--progress)
		);
	}
</style>
