<script>
	import api from "../api";
	import { debounce } from "lodash";
	export let path = "";
	export let method = "get";
	export let params = {};
	export let attachPages = false;
	export let value = null;
	export let delay = 500;
	let endpoint = new Promise(()=>{});
	function refreshApi() {
		const isFirstPage = !(params?.page > 1);
		endpoint = api(path)
			[method.toLowerCase()](null, params)
			.then((data) => {
				if (attachPages && !isFirstPage) {
					value.push(...data);
					value = value;
				} else {
					value = data;
				}
				return value;
			});
	}
	export let refresh = 1;
	let delayedRefreshApi = debounce(refreshApi, delay);
	// on params change, refresh
	$: if (refresh && params) {
		delayedRefreshApi();
	}
</script>

{#await endpoint}
	<slot response={[]} running={true} />
{:then response}
	<slot {response} running={false} />
{/await}
