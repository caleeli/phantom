<script>
	import api from "../api";
	import { debounce } from "lodash";
	export let path = "";
	export let method = "get";
	export let params = {};
	export let value = null;
	let endpoint;
	function refreshApi() {
		endpoint = api(path)
			[method.toLowerCase()](null, params)
			.then((data) => {
				value = data;
				return data;
			});
	}
	export let refresh = 1;
	let delayedRefreshApi = debounce(refreshApi, 100);
	// on params change, refresh
	$: if (refresh && params) {
		delayedRefreshApi();
	}
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
