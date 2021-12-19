<script lang="ts">
	import Api from "../components/Api.svelte";
	import Donut from "../components/Donut.svelte";
	import GridTemplate from "../components/GridTemplate.svelte";
	import Menu from "../components/Menu.svelte";
	import Screen from "../components/Screen.svelte";
	import Topbar from "../components/Topbar.svelte";
	import { _ } from "../helpers";

	/*let indicadores = api("indicadores").get();
	indicadores = await indicadores;

	let indicadorA = {
		title: "Nro de clientes",
		value: indicadores.clientes,
		color: "black",
	};

	let indicadorB = {
		title: "Cartera actual",
		value: "Bs. " + currency(indicadores.cartera),
		color: "black",
	};
	let indicadorC = {
		title: "Monto en mora",
		value: "Bs. " + currency(indicadores.mora),
		color: "black",
	};
	let indicadorD = {
		title: "Porcentaje de mora",
		value: currency(indicadores.porcentaje_mora) + "%",
		color: "black",
	};
	let dona = {
		type: "doughnut",
		data: {
			labels: indicadores.dist_cartera.map((row) => row.producto),
			datasets: [
				{
					data: indicadores.dist_cartera.map((row) => row.monto),
					backgroundColor: [
						"lightblue",
						"yellow",
						"lightgreen",
						"salmon",
					],
					hoverOffset: 4,
				},
			],
		},
		options: {
			plugins: {
				title: {
					display: true,
					text: "Distribución de la cartera",
				},
			},
		},
	};
	let dona2 = {
		type: "doughnut",
		data: {
			labels: indicadores.dist_mora.map((row) => row.producto),
			datasets: [
				{
					data: indicadores.dist_mora.map((row) => row.monto),
					backgroundColor: [
						"lightblue",
						"yellow",
						"lightgreen",
						"salmon",
					],
					hoverOffset: 4,
				},
			],
		},
		options: {
			plugins: {
				title: {
					display: true,
					text: "Distribución de la mora",
				},
			},
		},
	};
	let dona3 = {
		type: "line",
		data: {
			labels: ["Request", "Review", "Approved", "Rejected"],
			datasets: [
				{
					label: "My First Dataset",
					data: [65, 59, 80, 81, 56, 55, 40],
					fill: true,
					borderColor: "#ffc1d0",
					backgroundColor: "#ffc1d080",
					tension: 0.1,
				},
				{
					label: "My Second Dataset",
					data: [35, 79, 40, 91, 46, 55, 70],
					fill: true,
					borderColor: "#99d1f8",
					backgroundColor: "#99d1f880",
					tension: 0.1,
				},
			],
		},
		options: {
			plugins: {
				title: {
					display: true,
					text: "Distribución de la mora",
				},
			},
		},
	};*/
	let indicadores = {
		indicadores: {},
		graficos: [],
	};
</script>

<Topbar>Inicio</Topbar>
<Menu />

<main>
	<h2>{_("Cuadro de mando")}</h2>
	<Api path="indicadores" bind:value={indicadores}>
		<GridTemplate min_width="15rem">
			{#each Object.entries(indicadores.indicadores) as [nombre, valor]}
				<form>
					<h2>{valor}</h2>
					<span>{nombre}</span>
				</form>
			{/each}
		</GridTemplate>
		<GridTemplate>
			{#each indicadores.graficos as grafico}
				<Donut bind:value={grafico} />
			{/each}
		</GridTemplate>
	</Api>
</main>
