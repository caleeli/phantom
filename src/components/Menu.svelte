<script type="ts">
	import { location } from "svelte-spa-router";
	import Api from "./Api.svelte";
	import { user } from '../store';
	// expandido por defecto
	let aside = isMobile() ? "collapsed" : "expanded";
	let avatar = "images/avatar/avatar-1.jpg";
	let username = "...";
	user.subscribe(user => {
		avatar = user.attributes.avatar || "images/avatar/avatar-1.jpg";
		username = user.attributes.username || "...";
	});
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
			<figcaption>@{username}</figcaption>
		</figure>
	</div>
	<Api
		let:response={options}
		path="menus"
		params={{ filter: ["fromLoggedUser()"] }}
	>
		{#each options as option}
			<a
				class={$location == option.attributes.href ? "active" : ""}
				href={`#${option.attributes.href}`}
			>
				<i class={`fas fa-${option.attributes.icon}`} />
				<span>{option.attributes.name}</span>
			</a>
		{/each}
	</Api>
	<footer>
		<span>© 2022 coredump</span>
	</footer>
</aside>

<style>
</style>
