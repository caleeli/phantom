<script>
	import Router from "svelte-spa-router";
	import { location } from "svelte-spa-router";
	import Home from "./panels/Home.svelte";
	import AddResource from "./panels/AddResource.svelte";
	let options = [
		{ href: "/", label: "Home", component: Home },
		{ href: "/add_resource", label: "+ Resource", component: AddResource },
	];
	const routes = {};
	options.forEach(({ href, component }) => {
		routes[href] = component;
	});
	// Listen events from main page
	if (chrome.runtime.onMessage) {
		chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
			if (request.type === "reload") {
				window.location.reload();
			}
		});
	}
</script>

<div>
	{#each options as option}
		/
		<a
			class={$location == option.href ? "active" : ""}
			href={`#${option.href}`}
		>
			<span>{option.label}</span>
		</a>
	{/each}
</div>
<hr />
<Router {routes} />

<style>
	.active {
		font-weight: bold;
	}
</style>
