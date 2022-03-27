<script>
	import "../helpers/dialog.ts";
	import { tick } from "svelte";
	import api from "../api";
	import { indexToCol } from "../api/Sheet";
	import Api from "../components/Api.svelte";
	import Grid from "../components/Grid.svelte";
	import GridTemplate from "../components/GridTemplate.svelte";
	import Menu from "../components/Menu.svelte";
	import Topbar from "../components/Topbar.svelte";
	import { translations } from "../helpers";
	import FormFields from "./FormFields.svelte";
	export let config = {
		attributes: {},
		ui: {},
	};
	export let configCreate = {
		attributes: {},
		ui: {},
	};

	let tableConfig = {
		headers: [],
		cells: {},
	};

	const _ = translations.setLabels(config.labels);

	let colIndex = 1;
	let textToFind = "";
	if (!config.ui) {
		throw "No config.ui defined";
	}
	tableConfig.headers = Object.keys(config.ui).reduce((headers, key) => {
		const visible =
			config.ui[key].showInList === undefined ||
			config.ui[key].showInList;
		if (visible) {
			headers.push({
				label: _(key),
				align: config.ui[key]?.align || "left",
			});
		}
		return headers;
	}, []);
	tableConfig.cells = Object.keys(config.ui).reduce((cells, key) => {
		const visible =
			config.ui[key].showInList === undefined ||
			config.ui[key].showInList;
		const showInCreate =
			config.ui[key].showInCreate === undefined ||
			config.ui[key].showInCreate;
		const showInUpdate =
			config.ui[key].showInUpdate === undefined ||
			config.ui[key].showInUpdate;
		if (visible) {
			const col = indexToCol(colIndex);
			cells[col] = Object.assign(
				{
					value: `attributes.${key}`,
					format: config.ui[key]?.format,
					align: config.ui[key]?.align || "left",
					showInCreate: showInCreate,
					showInUpdate: showInUpdate,
					groupRows: config.ui[key]?.groupRows,
				},
				config.ui[key]
			);
			colIndex++;
		}
		return cells;
	}, {});

	let create_buttons =
		config.createButtons && config.createButtons.length
			? config.createButtons
			: [
					{
						name: "_model",
						icon: "plus",
						type: "submit",
					},
			  ];
	let tableData = [],
		list,
		params = {
			page: 1,
			per_page: config.pagination?.per_page || 10,
			filter: [],
			sort: config.sort?.join(","),
		};
	let edit, view, create;
	let editRecord = null;
	let newRecord = null;
	function refreshList() {
		params = params;
	}
	function defaultValues(configAttributes, template) {
		return Object.keys(configAttributes).reduce((acc, key) => {
			acc[key] = template[key] || config.ui[key]?.default || "";
			return acc;
		}, {});
	}
	async function crear(template = {}) {
		// apply template settings
		if (template && Object.keys(template).length > 0) {
			// deep clone config into configCreate
			configCreate = JSON.parse(JSON.stringify(config));
			Object.keys(configCreate.ui).forEach((key) => {
				configCreate.ui[key].showInCreate = false;
			});
			Object.keys(template).forEach((key) => {
				configCreate.ui[key].showInCreate = true;
			});
		}
		// init default values
		newRecord = {
			attributes: defaultValues(config.create, template),
		};
		await tick();
		create.showModal();
	}
	async function crearSubRow() {
		// let subRow = {};
		// await tick();
		// create.showModal();
	}
	async function editar(event) {
		editRecord = event.detail;
		await tick();
		edit.showModal();
	}
	async function visualizar(event) {
		editRecord = event.detail;
		await tick();
		view.showModal();
	}
	async function imprimir(event) {
		editRecord = event.detail;
		await tick();
		window.print();
	}
	async function postRecord() {
		api(config.url)
			.post({ data: newRecord })
			.then(async () => {
				refreshList();
				await tick();
				create.close();
			});
	}
	async function putRecord() {
		api(config.url)
			.put(editRecord.id, { data: editRecord })
			.then(async () => {
				refreshList();
				await tick();
				edit.close();
			});
	}
	function findText() {
		params.page = 1;
		params.filter = [`findText(${JSON.stringify(textToFind)})`];
	}
	function loadMore() {
		params.page++;
		refreshList();
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
			let:running
			attachPages={true}
		>
			<form
				on:submit|preventDefault={() => {
					return false;
				}}
			>
				<button
					data-testid="filter-submit"
					type="submit"
					on:click|preventDefault={findText}
					style="display:none;"
				>
					{_("Buscar")}
				</button>
				<slot name="header"></slot>
				<GridTemplate>
					<div>
						{#each create_buttons as button}
							<button
								data-testid={button.name}
								type={button.type}
								on:click={() => crear(button.attributes)}
							>
								<i class={`fas fa-${button.icon}`} />
								{_(button.name)}
							</button>
						{/each}
					</div>
					<div>
						<input
							class="search w-100"
							data-testid="filter"
							bind:value={textToFind}
							placeholder={_("Search")}
						/>
					</div>
				</GridTemplate>
				<Grid
					bind:value={tableData}
					config={tableConfig}
					on:edit={editar}
					on:view={visualizar}
					on:print={imprimir}
					on:insertSubRow={crearSubRow}
				/>
				<div class="center">
					<br />
					<button
						data-testid="load-more"
						type="button"
						on:click|preventDefault={loadMore}
					>
						<svg
							width="12"
							height="12"
							viewBox="0 0 26 26"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g>
								{#if running}
									<animateTransform
										attributeName="transform"
										attributeType="XML"
										type="rotate"
										from="0 13 13"
										to="360 13 13"
										dur="1s"
										repeatCount="indefinite"
									/>
								{/if}
								<circle
									cx="21.0"
									cy="13.0"
									r="3"
									fill="#7BDD76"
								/>
								<circle
									cx="15.47213595499958"
									cy="20.60845213036123"
									r="3"
									fill="#69A7FF"
								/>
								<circle
									cx="6.527864045000421"
									cy="17.702282018339787"
									r="3"
									fill="#E373FF"
								/>
								<circle
									cx="6.52786404500042"
									cy="8.297717981660217"
									r="3"
									fill="#FFB961"
								/>
								<circle
									cx="15.472135954999578"
									cy="5.391547869638771"
									r="3"
									fill="#FF625B"
								/>
							</g>
						</svg>
						{_("Load more")}
					</button>
				</div>
			</form>
		</Api>
	</GridTemplate>
</main>

<dialog bind:this={create}>
	{#if newRecord && config.create}
		<form style="min-width:50vw">
			<FormFields {config} bind:registro={newRecord} dataTest="create" />
			<footer>
				<button
					type="submit"
					on:click|preventDefault={postRecord}
					data-testid="create-submit"
				>
					{_("Crear")}
				</button>
				<button
					on:click|preventDefault={() => create.close()}
					data-testid="create-cancel"
				>
					{_("Cancelar")}
				</button>
			</footer>
		</form>
	{/if}
</dialog>

<dialog bind:this={edit}>
	{#if editRecord && config.update}
		<form style="min-width:50vw">
			<FormFields {config} bind:registro={editRecord} dataTest="edit" />
			<footer>
				<button
					type="submit"
					on:click|preventDefault={putRecord}
					data-testid="edit-submit"
				>
					{_("Actualizar")}
				</button>
				<button
					on:click|preventDefault={() => edit.close()}
					data-testid="edit-cancel"
				>
					{_("Cancelar")}
				</button>
			</footer>
		</form>
	{/if}
</dialog>

<dialog bind:this={view}>
	{#if editRecord && config.create}
		<form style="min-width:50vw">
			<dl>
				{#each Object.entries(config.create) as [key, value]}
					<dt>{_(key)}</dt>
					<dd data-testid={`view-${key}`}>
						{editRecord.attributes[key]}
					</dd>
				{/each}
			</dl>
			<footer>
				<button
					on:click|preventDefault={() => view.close()}
					data-testid="view-close"
				>
					{_("Cerrar")}
				</button>
			</footer>
		</form>
	{/if}
</dialog>
{#if editRecord && config.create}
	<form style="min-width:50vw" class="to-print">
		<dl>
			{#each Object.entries(config.create) as [key, value]}
				<dt>{_(key)}</dt>
				<dd data-testid={`print-${key}`}>
					{editRecord.attributes[key]}
				</dd>
			{/each}
		</dl>
	</form>
{/if}
