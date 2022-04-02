<script lang="ts">
	import Abm from "../components/ABM.svelte";
	import * as config from "../../models/actividades.json";
	import * as planAnualConfig from "../../models/plan_anual.json";
	import FormFields from "../components/FormFields.svelte";
	import api from "../api";
	import { pop } from "svelte-spa-router";

	export let params;

	// initialize plan_anual with empty values
	const attrs = Object.keys(planAnualConfig.attributes);
	const attributes = attrs.reduce((acc, key) => {
		acc[key] = "";
		return acc;
	}, {});

	let plan_anual = {
		attributes,
	};
	let goback = true;
	api("plan_anual")
		.get(params.id)
		.then((data) => {
			plan_anual = data;
		});
	// Listen ESC key to route back
	function handleKeydown(event: { keyCode: number }) {
		if (event.keyCode === 27) {
			if (goback) {
				pop();
			}
		}
	}
	function onpopup(event) {
		console.log("popup", event.detail.action);
		goback = event.detail.action === 'close';
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<Abm {config} params={{ params: { plan_anual_id: params.id } }} on:popup={onpopup}>
	<div slot="header">
		<FormFields
			config={planAnualConfig}
			bind:registro={plan_anual}
			dataTest="plan_anual"
		/>
	</div>
</Abm>
