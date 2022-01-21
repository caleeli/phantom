<script>
	import api from "../api";
	import { debounce } from "lodash";
	export let path = "";
	export let method = "get";
	export let params = {};
	export let value = null;
	let endpoint;
	function refreshInstance() {
		endpoint = api(path)
			[method.toLowerCase()](null, params)
			.then((data) => {
				value = data;
				return data;
			});
	}
	export let refresh = 1;
	// export let refresh = debounce(refreshInstance, 1000);
	let refreshI = debounce(refreshInstance, 1000);
	refreshInstance();
	// on params change, refresh
	$: if (refresh && params) {
		refreshI();
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
