<script lang="ts">
	/** Pages **/
	import Router from "svelte-spa-router";
	import Login from "./pages/Login.svelte";
	import Home from "./pages/Home.svelte";
	import Test from "./pages/Test.svelte";
	import Task from "./pages/Task.svelte";
	const routes = {
		"/": Login,
		"/home": Home,
		"/test": Test,
		"/task/:id": Task,
	};
</script>

<Router {routes}/>
