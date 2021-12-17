<script type="ts">
	import { location } from "svelte-spa-router";
	// expandido por defecto
	let aside = isMobile() ? "collapsed" : "expanded";
	// avatar aleatorio
	let avatar = "images/avatar/avatar-1.jpg";
	let options = [
		// { href: "/home", label: "Inicio", icon: "home" },
		{ href: "/dashboard", label: "Dashboard", icon: "tachometer-alt" },
		{ href: "/admin/profile", label: "Perfil", icon: "user" },
		{ href: "/admin/users", label: "Usuarios", icon: "users" },
		// { href: "/about", label: "About", icon: "question-circle" },
		// { href: "/edit/Test", label: "Edit page", icon: "pen" },
		{ href: "/cajas", label: "Cajas", icon: "cash-register" },
		{ href: "/creditos", label: "Creditos", icon: "credit-card" },
		{ href: "/clientes", label: "Clientes", icon: "user-tie" },
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
		<span>© 2021 coredump</span>
	</footer>
</aside>

<style>
</style>
