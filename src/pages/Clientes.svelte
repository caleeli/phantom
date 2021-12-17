<script>
	import Api from "../components/Api.svelte";
	import Avatar from "../components/Avatar.svelte";
	import Grid from "../components/Grid.svelte";
	import GridTemplate from "../components/GridTemplate.svelte";
	import Menu from "../components/Menu.svelte";
	import Topbar from "../components/Topbar.svelte";
	import { tick } from "svelte";
	import api from "../api";

	let config = {
		headers: [
			{
				label: "Nombre",
			},
			{
				label: "Dirección",
			},
			{
				label: "Telefono",
				align: "right",
			},
			{
				label: "Fecha de registro",
			},
			{
				label: "",
			},
		],
		cells: {
			A: {
				value: "attributes.nombre",
			},
			B: {
				value: "attributes.direccion",
			},
			C: {
				value: "attributes.telefono",
				format: "${value} ${icon('phone')}",
				align: "right",
			},
			D: {
				value: "attributes.fecha",
			},
			E: {
				value: "attributes.id",
				actions: ["edit", "view", "print"],
				control: "actions",
			},
		},
	};
	let caja = {}, list;
	let edit, view, create;
	let registro = null;
	async function crear() {
		registro = {
			attributes: {
				nombre: "",
				direccion: "",
				telefono: "",
				fecha: "",
			},
		};
		await tick();
		create.showModal();
	}
	async function editar(event) {
		registro = event.detail;
		await tick();
		edit.showModal();
	}
	async function visualizar(event) {
		registro = event.detail;
		await tick();
		view.showModal();
	}
	async function imprimir(event) {
		registro = event.detail;
		await tick();
		window.print();
	}
	async function postCliente() {
		api('clientes').post({data: registro}).then(async (response) => {
			list.refresh();
			await tick();
			create.close();
		});
	}
	async function putCliente() {
		api('clientes').put(registro.id, {data: registro}).then(async (response) => {
			list.refresh();
			await tick();
			edit.close();
		});
	}
</script>

<Topbar>Clientes</Topbar>
<Menu />

<main>
	<GridTemplate>
		<Api bind:this={list} path="clientes" bind:value={caja}>
			<form>
				<GridTemplate>
					<div>
						<button type="submit" on:click={crear}>
							<i class="fas fa-plus" /> Cliente
						</button>
					</div>
					<div>
						<input class="search" placeholder="cliente" />
					</div>
				</GridTemplate>
				<Grid
					bind:value={caja}
					{config}
					on:edit={editar}
					on:view={visualizar}
					on:print={imprimir}
				/>
			</form>
		</Api>
	</GridTemplate>
</main>

<dialog bind:this={create}>
	{#if registro}
		<form style="min-width:50vw">
			<Avatar value="images/avatar/avatar-1.jpg" size="4">
				{registro.attributes.nombre}
			</Avatar>
			<dl>
				<dt>Nombre</dt>
				<dd><input bind:value={registro.attributes.nombre} /></dd>
				<dt>Dirección</dt>
				<dd><input bind:value={registro.attributes.direccion} /></dd>
				<dt>Teléfono</dt>
				<dd><input bind:value={registro.attributes.telefono} /></dd>
				<dt>Fecha de registro</dt>
				<dd>
					<input type="date" bind:value={registro.attributes.fecha} />
				</dd>
			</dl>
			<footer>
				<button type="submit" on:click={postCliente}>Crear</button>
				<button on:click={() => create.close()}>Cancelar</button>
			</footer>
		</form>
	{/if}
</dialog>

<dialog bind:this={edit}>
	{#if registro}
		<form style="min-width:50vw">
			<Avatar value="images/avatar/avatar-1.jpg" size="4">
				{registro.attributes.nombre}
			</Avatar>
			<dl>
				<dt>Nombre</dt>
				<dd><input bind:value={registro.attributes.nombre} /></dd>
				<dt>Dirección</dt>
				<dd><input bind:value={registro.attributes.direccion} /></dd>
				<dt>Teléfono</dt>
				<dd><input bind:value={registro.attributes.telefono} /></dd>
				<dt>Fecha de registro</dt>
				<dd>
					<input type="date" bind:value={registro.attributes.fecha} />
				</dd>
			</dl>
			<footer>
				<button type="submit" on:click={putCliente}>Actualizar</button>
				<button on:click={() => edit.close()}>Cancelar</button>
			</footer>
		</form>
	{/if}
</dialog>

<dialog bind:this={view}>
	{#if registro}
		<form style="min-width:50vw">
			<Avatar value="images/avatar/avatar-1.jpg" size="4">
				{registro.attributes.nombre}
			</Avatar>
			<dl>
				<dt>Nombre</dt>
				<dd>{registro.attributes.nombre}</dd>
				<dt>Dirección</dt>
				<dd>{registro.attributes.direccion}</dd>
				<dt>Teléfono</dt>
				<dd>{registro.attributes.telefono}</dd>
				<dt>Fecha de registro</dt>
				<dd>{registro.attributes.fecha}</dd>
			</dl>
			<footer>
				<button on:click={() => view.close()}>Cerrar</button>
			</footer>
		</form>
	{/if}
</dialog>
{#if registro}
	<form style="min-width:50vw" class="to-print">
		<Avatar value="images/avatar/avatar-1.jpg" size="4">
			{registro.attributes.nombre}
		</Avatar>
		<dl>
			<dt>Nombre</dt>
			<dd>{registro.attributes.nombre}</dd>
			<dt>Dirección</dt>
			<dd>{registro.attributes.direccion}</dd>
			<dt>Teléfono</dt>
			<dd>{registro.attributes.telefono}</dd>
			<dt>Fecha de registro</dt>
			<dd>{registro.attributes.fecha}</dd>
		</dl>
	</form>
{/if}

<style>
	input {
		width: 100%;
	}
</style>
