<script>
	import api from "../api";
	export let path = "";
	export let method = "get";
</script>

{#await api(path)[method.toLowerCase()]()}
	<i class="fas fa-spinner fa-spin" />
{:then response}
	<slot {response} />
{/await}
