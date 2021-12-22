<script>
	import { tick } from "svelte";
	import api from "../api";
	import { indexToCol } from "../api/Sheet";
	import Api from "../components/Api.svelte";
	import Grid from "../components/Grid.svelte";
	import GridTemplate from "../components/GridTemplate.svelte";
	import Menu from "../components/Menu.svelte";
	import Topbar from "../components/Topbar.svelte";
	import { _ } from "../helpers";
	export let config = {
		attributes: {},
	};

	let tableConfig = {
		headers: [],
		cells: {},
	};

	_.setLabels(config.labels);

	tableConfig.headers = Object.keys(config.ui).reduce((headers, key) => {
		const visible = !config.ui[key].hideColumn;
		if (visible) {
			headers.push({
				label: _(key),
				align: config.ui[key]?.align || "left",
			});
		}
		return headers;
	}, []);
	let colIndex = 1;
	let textToFind = "";
	tableConfig.cells = Object.keys(config.ui).reduce((cells, key) => {
		const visible = !config.ui[key].hideColumn;
		if (visible) {
			const col = indexToCol(colIndex);
			cells[col] = Object.assign(
				{
					value: `attributes.${key}`,
					format: config.ui[key]?.format,
					align: config.ui[key]?.align || "left",
				},
				config.ui[key]
			);
			colIndex++;
		}
		return cells;
	}, {});

	let create_buttons = config.create_buttons || {
		_model: {
			icon: "plus",
			type: "submit",
		},
	};
	let tableData = {},
		list,
		params = {
			filter: [],
		};
	let edit, view, create;
	let registro = null;
	function defaultValues(configAttributes, template = {}) {
		return Object.keys(configAttributes).reduce((acc, key) => {
			acc[key] = template[key] || config.ui[key]?.default || "";
			return acc;
		}, {});
	}
	async function crear(template = {}) {
		registro = {
			attributes: defaultValues(config.create, template),
		};
		await tick();
		create.showModal();
	}
	async function editar(event) {
		registro = event.detail;
		// registro.attributes = Object.assign(defaultValues(config.update), registro.attributes);
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
	async function postRecord() {
		api(config.url)
			.post({ data: registro })
			.then(async () => {
				list.refresh();
				await tick();
				create.close();
			});
	}
	async function putRecord() {
		api(config.url)
			.put(registro.id, { data: registro })
			.then(async () => {
				list.refresh();
				await tick();
				edit.close();
			});
	}
	function findText() {
		params.filter = [`findText(${JSON.stringify(textToFind)})`];
		list.refresh();
	}
</script>

<Topbar>{_("_models")}</Topbar>
<Menu />

<main>
	<GridTemplate>
		<Api
			bind:this={list}
			path={config.url}
			bind:value={tableData}
			bind:params
		>
			<form
				on:submit|preventDefault={() => {
					return false;
				}}
			>
				<button type="submit" on:click|preventDefault={findText} style="display:none">
					{_("Buscar")}
				</button>
				<GridTemplate>
					<div>
						{#each Object.entries(create_buttons) as [name, button]}
							<button
								type={button.type}
								on:click={() => crear(button.attributes)}
							>
								<i class={`fas fa-${button.icon}`} />
								{_(name)}
							</button>
						{/each}
					</div>
					<div>
						<input
							class="search"
							bind:value={textToFind}
							placeholder={_("_model")}
						/>
					</div>
				</GridTemplate>
				<Grid
					bind:value={tableData}
					config={tableConfig}
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
			<dl>
				{#each Object.entries(config.create) as [key, value]}
					<dt>{_(key)}</dt>
					<dd>
						<input
							type={config.ui[key]?.type || "text"}
							value={registro.attributes[key]}
							on:input={(event) => {
								registro.attributes[key] = event.target.value;
							}}
						/>
					</dd>
				{/each}
			</dl>
			<footer>
				<button type="submit" on:click={postRecord}>Crear</button>
				<button on:click={() => create.close()}>Cancelar</button>
			</footer>
		</form>
	{/if}
</dialog>

<dialog bind:this={edit}>
	{#if registro}
		<form style="min-width:50vw">
			<dl>
				{#each Object.entries(config.update) as [key, value]}
					<dt>{_(key)}</dt>
					<dd>
						<input
							type={config.ui[key]?.type || "text"}
							value={registro.attributes[key]}
							on:input={(event) => {
								registro.attributes[key] = event.target.value;
							}}
						/>
					</dd>
				{/each}
			</dl>
			<footer>
				<button type="submit" on:click={putRecord}>Actualizar</button>
				<button on:click={() => edit.close()}>Cancelar</button>
			</footer>
		</form>
	{/if}
</dialog>

<dialog bind:this={view}>
	{#if registro}
		<form style="min-width:50vw">
			<dl>
				{#each Object.entries(config.create) as [key, value]}
					<dt>{_(key)}</dt>
					<dd>{registro.attributes[key]}</dd>
				{/each}
			</dl>
			<footer>
				<button on:click={() => view.close()}>Cerrar</button>
			</footer>
		</form>
	{/if}
</dialog>
{#if registro}
	<form style="min-width:50vw" class="to-print">
		<dl>
			{#each Object.entries(config.create) as [key, value]}
				<dt>{_(key)}</dt>
				<dd>{registro.attributes[key]}</dd>
			{/each}
		</dl>
	</form>
{/if}

<style>
	input {
		width: 100%;
	}
</style>
