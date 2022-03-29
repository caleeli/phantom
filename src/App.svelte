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
	import AdminUsers from "./pages/AdminUsers.svelte";
	import PlanAnual from "./pages/PlanAnual.svelte";
	import Movimientos from "./pages/Movimientos.svelte";
	import Informes from "./pages/Informes.svelte";
	import Topbar from "./components/Topbar.svelte";
	import Menu from "./components/Menu.svelte";

	let currentPage = "";

	const routes = {
		"/": Login,
		"/home": Home,
		"/test": Test,
		// "/task/:id": Task,
		"/dashboard": Dashboard,
		// "/page/:name": Page,
		"/admin/profile": AdminProfile,
		"/admin/users": AdminUsers,
		"/cajas": Cajas,
		"/creditos": Creditos,
		"/clientes": Clientes,
		"/plan_anual": PlanAnual,
		"/informe/:id/movimientos": Movimientos,
		"/informes": Informes,
	};
	function routeLoaded(event) {
		currentPage = event.detail.location;
	}
</script>

<Alert />
{#if currentPage && currentPage!=="/"}
	<Topbar></Topbar>
	<Menu />
{/if}

<Router {routes} on:routeLoaded={routeLoaded} />
