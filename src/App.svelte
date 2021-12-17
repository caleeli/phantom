<script lang="ts">
	/** Pages **/
	import Router from "svelte-spa-router";
	import Alert from "./components/Alert.svelte";
	import Login from "./pages/Login.svelte";
	import Home from "./pages/Home.svelte";
	import Test from "./pages/Test.svelte";
	import Task from "./pages/Task.svelte";
	import Dashboard from "./pages/Dashboard.svelte";
	import Page from "./pages/Page.svelte";
	import AdminProfile from "./pages/AdminProfile.svelte";
	import Cajas from "./pages/Cajas.svelte";
	import Creditos from "./pages/Creditos.svelte";
	import Clientes from "./pages/Clientes.svelte";
	const routes = {
		"/": Login,
		"/home": Home,
		"/test": Test,
		"/task/:id": Task,
		"/dashboard": Dashboard,
		"/page/:name": Page,
		"/admin/profile": AdminProfile,
		"/cajas": Cajas,
		"/creditos": Creditos,
		"/clientes": Clientes,
	};
</script>

<Alert />
<Router {routes} />
