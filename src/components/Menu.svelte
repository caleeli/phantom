<script type="ts">
	import { location } from "svelte-spa-router";
	// expandido por defecto
	let aside = isMobile() ? "collapsed" : "expanded";
	// avatar aleatorio
	let avatar = "images/avatar/avatar-1.jpg";
	let options = [
		{ href: "/dashboard", label: "Cuadro de Mando", icon: "tachometer-alt" },
		{ href: "/cajas", label: "Cajas", icon: "cash-register" },
		{ href: "/clientes", label: "Clientes", icon: "user-tie" },
		{ href: "/creditos", label: "Creditos", icon: "credit-card" },
		{ href: "/admin/users", label: "Usuarios", icon: "users" },
		{ href: "/admin/profile", label: "Perfil", icon: "user" },
	];
	// colapsa el menu lateral
	function collapseSidebar() {
		aside = "collapsed";
	}
	// expande el menu lateral
	function expandSidebar() {
		aside = "expanded";
	}
	// check if is a mobile device
	function isMobile() {
		return window.innerWidth < 768;
	}
</script>

<aside class={aside}>
	<button id="hide-sidebar" on:click={collapseSidebar}>
		<i class="fas fa-chevron-circle-left" />
	</button>
	<button id="show-sidebar" on:click={expandSidebar}>
		<i class="fas fa-chevron-circle-right" />
	</button>
	<div class="figure-bg">
		<figure>
			<img src={avatar} alt="user" />
			<figcaption>@juan</figcaption>
		</figure>
	</div>
	{#each options as option}
		<a class={$location == option.href ? "active" : ""} href={`#${option.href}`}>
			<i class={`fas fa-${option.icon}`} />
			<span>{ option.label }</span>
		</a>
	{/each}
	<footer>
		<span>© 2022 coredump</span>
	</footer>
</aside>

<style>
</style>
