<script lang="ts">
	/** Pages **/
	import Router from "svelte-spa-router";
	import Alert from "./components/Alert.svelte";
	import Login from "./pages/Login.svelte";
	import Home from "./pages/Home.svelte";
	import Test from "./pages/Test.svelte";
	import Dashboard from "./pages/Dashboard.svelte";
	import AdminProfile from "./pages/AdminProfile.svelte";
	import Cajas from "./pages/Cajas.svelte";
	import Creditos from "./pages/Creditos.svelte";
	import Clientes from "./pages/Clientes.svelte";
	import AdminUsers from "./pages/AdminUsers.svelte";
	import PlanAnual from "./pages/PlanAnual.svelte";
	import Actividades from "./pages/Actividades.svelte";
	import Informes from "./pages/Informes.svelte";
	import Movimientos from "./pages/Movimientos.svelte";
	import Topbar from "./components/Topbar.svelte";
	import Menu from "./components/Menu.svelte";

	let currentPage = "";

	const routes = {
		"/": Login,
		"/home": Home,
		"/test": Test,
		"/dashboard": Dashboard,
		"/admin/profile": AdminProfile,
		"/admin/users": AdminUsers,
		"/cajas": Cajas,
		"/creditos": Creditos,
		"/clientes": Clientes,
		"/plan_anual": PlanAnual,
		"/plan_anual/:id/actividades": Actividades,
		"/informes": Informes,
		"/informe/:id/movimientos": Movimientos,
	};
	function routeLoaded(event) {
		currentPage = event.detail.location;
	}
</script>

<Alert />
{#if currentPage && currentPage !== "/"}
	<Topbar />
	<Menu />
{/if}

<Router {routes} on:routeLoaded={routeLoaded} />
