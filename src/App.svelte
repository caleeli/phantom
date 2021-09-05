<script lang="ts">
	/** Pages **/
	import Router from "svelte-spa-router";
	import Login from "./pages/Login.svelte";
	import Home from "./pages/Home.svelte";
	import Test from "./pages/Test.svelte";
	const routes = {
		"/": Login,
		"/home": Home,
		"/test": Test
	};
</script>

<Router {routes}/>
