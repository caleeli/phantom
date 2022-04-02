<script lang="ts">
	export let value;
	export let separator = ",";
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let from = String(value).split(separator)[0] || '';
	let to = String(value).split(separator)[1] || '';

	$: {
		from = String(value).split(separator)[0] || '';
		to = String(value).split(separator)[1] || '';
	}

	function oninput() {
		dispatch("input", {value:`${from}${separator}${to}`});
	}
</script>

<div class="date-range">
	<input {...$$restProps} type="date" bind:value={from} on:input={oninput} />
	<input {...$$restProps} type="date" bind:value={to} on:input={oninput} />
</div>
