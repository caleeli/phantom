<script>
	import Router from "svelte-spa-router";
	import { location } from "svelte-spa-router";
	import Home from "./panels/Home.svelte";
	import AddResource from "./panels/Resource.svelte";
	let options = [
		{ href: "/", label: "Home", component: Home },
		{
			href: "/resource",
			label: "+ Resource",
			component: AddResource,
			route: "/resource",
		},
		{
			label: "+ Resource",
			component: AddResource,
			route: "/resource/:id",
		},
	];
	const routes = {};
	options.forEach(({ href, component, route }) => {
		routes[route || href] = component;
	});
	// Listen events from main page
	if (chrome.runtime.onMessage) {
		chrome.runtime.onMessage.addListener(function (
			request,
			sender,
			sendResponse
		) {
			if (request.type === "reload") {
				window.location.reload();
			}
		});
	}
</script>

<div>
	{#each options as option}
		{#if option.href}
			/
			<a
				class={$location == option.href ? "active" : ""}
				href={`#${option.href}`}
			>
				<span>{option.label}</span>
			</a>
		{/if}
	{/each}
</div>
<hr />
<Router {routes} />

<style>
	.active {
		font-weight: bold;
	}
</style>
