<script>
	import { _ } from "../helpers";
	import Api from "./Api.svelte";
	import api from "../api";
	import InputFile from "./InputFile.svelte";

	export let config;
	export let registro;
	export let dataTest;

	async function uploadFile(fileupload, target, key) {
		let formData = new FormData();
		formData.append("file", fileupload.files[0]);
		return api("upload")
			.post(formData)
			.then((data) => {
				target[key] = data.attributes.url;
				registro = registro;
				// clean select file
				fileupload.value = "";
			});
	}
	function prepareListParams(config, value) {
		const params = { ...config.params };
		params.filter = params.filter.map((filter) =>
			new Function("value", "return `" + filter + "`")(
				JSON.stringify(value)
			)
		);
		return params;
	}
	function onChangeDataList(target, dataListId, configList) {
		const value = target.value;
		if (!configList || !configList["on:select"]) {
			return;
		}
		const options = window.document.getElementById(dataListId).options;
		for (let i = 0; i < options.length; i++) {
			if (options[i].value === value) {
				const row = JSON.parse(options[i].getAttribute("row"));
				const map = row.attributes;
				const keys = Object.keys(map);
				const values = keys.map((key) => JSON.stringify(map[key]));
				configList["on:select"].forEach((callback) => {
					callback = new Function(
						...keys,
						"return `" + callback + "`"
					)(...values);
					new Function("set", ...keys, callback)((key, value) => {
						registro.attributes[key] = value;
					}, ...keys);
				});
			}
		}
	}
</script>

<dl>
	{#each Object.entries(config.create) as [key, value]}
		{#if !config.ui[key]?.hideInCreate}
			<dt>{_(key)}</dt>
			<dd>
				{#if config.ui[key]?.type === "file"}
					<InputFile
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						type={config.ui[key]?.type || "text"}
						value={registro.attributes[key]}
						on:input={(event) => {
							console.log(event);
							registro.attributes[key] = (event.target || event.detail).value;
						}}
					/>
				{:else}
					<input
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						type={config.ui[key]?.type || "text"}
						value={registro.attributes[key]}
						on:input={(event) => {
							registro.attributes[key] = event.target.value;
						}}
						on:change={(event) => {
							onChangeDataList(
								event.target,
								`list-${key}`,
								config.ui[key]?.list,
								config.ui[key]
							);
						}}
						list={config.ui[key]?.list ? `list-${key}` : undefined}
					/>
				{/if}
				{#if config.ui[key]?.list}
					<datalist id={`list-${key}`}>
						<Api
							path={config.ui[key].list.model}
							params={prepareListParams(
								config.ui[key].list,
								registro.attributes[key]
							)}
							let:response={options}
						>
							{#each options as option}
								<option
									value={option.attributes[
										config.ui[key].list.value
									]}
									row={JSON.stringify(option)}
								>
									{option.attributes[
										config.ui[key].list.text
									]}
								</option>
							{/each}
						</Api>
					</datalist>
				{/if}
			</dd>
		{/if}
	{/each}
</dl>
