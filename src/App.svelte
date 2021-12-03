<script lang="ts">
	/** Pages **/
	import Router from "svelte-spa-router";
	import Alert from "./components/Alert.svelte";
	import Login from "./pages/Login.svelte";
	import Home from "./pages/Home.svelte";
	import Test from "./pages/Test.svelte";
	import Task from "./pages/Task.svelte";
	import Dashboard from "./pages/Dashboard.svelte";
	const routes = {
		"/": Login,
		"/home": Home,
		"/test": Test,
		"/task/:id": Task,
		"/dashboard": Dashboard,
	};
</script>

<Alert />
<Router {routes}/>
