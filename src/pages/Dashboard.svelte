<script lang="ts">
	import Api from "../components/Api.svelte";
	import Donut from "../components/Donut.svelte";
	import GridTemplate from "../components/GridTemplate.svelte";
	import { translations } from "../helpers";
	import * as config from "../../models/indicadores.json";

	const _ = translations.setLabels(config["labels"]);
	let indicadores = {
		indicadores: {},
		graficos: [],
	};
</script>

<main>
	<Api path="indicadores" bind:value={indicadores} delay={0}>
		<GridTemplate min_width="15rem">
			{#each Object.entries(indicadores.indicadores) as [nombre, valor]}
				<form>
					<h2>{valor}</h2>
					<span>{_(nombre)}</span>
				</form>
			{/each}
		</GridTemplate>
		<GridTemplate min_width="30rem">
			{#each indicadores.graficos as grafico}
				<Donut bind:value={grafico} {...grafico.tplOptions} />
			{/each}
		</GridTemplate>
	</Api>
</main>
