<script>
	import api from "../api";
	export let path = "";
	export let method = "get";
	export let value;
	let endpoint;
	export function refresh() {
		endpoint = api(path)
			[method.toLowerCase()]()
			.then((data) => {
				value = data;
				return data;
			});
	}
	refresh();
</script>

{#await endpoint}
	<i class="fas fa-spinner fa-spin" />
{:then response}
	<slot {response} />
{/await}
