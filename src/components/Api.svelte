<script>
	import api from "../api";
	export let path = "";
	export let method = "get";
	export let params = {};
	export let value;
	let endpoint;
	export function refresh() {
		endpoint = api(path)
			[method.toLowerCase()](null, params)
			.then((data) => {
				value = data;
				return data;
			});
	}
	refresh();
</script>

{#await endpoint}
	<i
		role="progressbar"
		class="fas fa-spinner fa-spin"
		aria-valuetext="..."
		aria-busy="true"
	/>
{:then response}
	<slot {response} />
{/await}
