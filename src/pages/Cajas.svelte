<script>
	import Api from "../components/Api.svelte";
	import Grid from "../components/Grid.svelte";
	import GridTemplate from "../components/GridTemplate.svelte";
	import Menu from "../components/Menu.svelte";
	import Topbar from "../components/Topbar.svelte";
	let config = {
		headers: [
			{
				label: "Nro de transacción",
			},
			{
				label: "Fecha de transacción",
			},
			{
				label: "Cliente",
			},
			{
				label: "Cuenta",
			},
			{
				label: "Ingreso",
				align: "right",
			},
			{
				label: "Egreso",
				align: "right",
			},
		],
		cells: {
			A: {
				value: "attributes.id",
			},
			B: {
				value: "attributes.fecha",
			},
			C: {
				value: "attributes.nombre",
			},
			D: {
				value: "attributes.cuenta",
			},
			E: {
				value: "attributes.ingreso",
				format: "Bs. ${currency(value)}",
				align: "right",
			},
			F: {
				value: "attributes.egreso",
				format: "Bs. ${currency(value)}",
				align: "right",
			},
		},
	};
	let caja = {};
	let ingreso;
	let registro = {
		attributes: {
			fecha: "",
			nombre: "",
			cuenta: "",
			ingreso: "",
			egreso: "",
		},
	};
</script>

<Topbar>Cajas</Topbar>
<Menu />

<main>
	<GridTemplate>
		<Api path="transacciones" bind:value={caja}>
			<form>
				<GridTemplate>
					<div>
						<button
							type="submit"
							on:click={() => ingreso.showModal()}
						>
							<i class="fas fa-plus" /> Ingreso
						</button>
						<button type="reset">
							<i class="fas fa-minus" /> Egreso
						</button>
					</div>
					<div>
						<input class="search" placeholder="cliente" />
					</div>
				</GridTemplate>
				<Grid bind:value={caja} {config} />
			</form>
		</Api>
	</GridTemplate>
</main>

<dialog bind:this={ingreso}>
	<form style="min-width:50vw">
		<h3>Registrar ingreso</h3>
		<dl>
			<dt>Fecha</dt>
			<dd><input type="date" bind:value={registro.attributes.fecha} /></dd>
			<dt>Cliente</dt>
			<dd><input bind:value={registro.attributes.nombre} /></dd>
			<dt>Cuenta</dt>
			<dd><input type="number" bind:value={registro.attributes.cuenta} /></dd>
			<dt>Ingreso</dt>
			<dd>
				<input type="number" bind:value={registro.attributes.ingreso} />
			</dd>
			<dt>Egreso</dt>
			<dd>
				<input type="number" bind:value={registro.attributes.egreso} />
			</dd>
		</dl>
		<footer>
			<button type="submit">Guardar</button>
			<button on:click={() => ingreso.close()}>Cancelar</button>
		</footer>
	</form>
</dialog>

<style>
	input {
		width: 100%;
	}
</style>
