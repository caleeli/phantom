<script>
	import Api from "../components/Api.svelte";
	export let params = {};
	let value = {};
</script>

<Api bind:value bind:params>
	<div>
		{value}
	</div>
</Api>
