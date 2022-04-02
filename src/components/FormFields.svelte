<script>
	import { translations } from "../helpers";
	import api from "../api";
	import InputFile from "./InputFile.svelte";
	import InputList from "./InputList.svelte";
	import InputSelect from "./InputSelect.svelte";
	import InputDateRange from "./InputDateRange.svelte";

	export let config;
	export let registro;
	export let dataTest;
	const _ = translations.setLabels(config.labels);
</script>

<dl>
	{#each Object.entries(config.create) as [key, value]}
		{#if config.ui[key]?.showInCreate === undefined || config.ui[key]?.showInCreate}
			<dt>{_(key)}</dt>
			<dd>
				{#if config.ui[key]?.type === "file"}
					<InputFile
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						type={config.ui[key]?.type || "text"}
						value={registro.attributes[key]}
						on:input={(event) => {
							registro.attributes[key] = (event.target || event.detail).value;
						}}
					/>
				{:else if config.ui[key]?.type === "textarea"}
					<textarea
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						type={config.ui[key]?.type || "text"}
						value={registro.attributes[key]}
						on:input={(event) => {
							registro.attributes[key] = event.target.value;
						}}
					/>
				{:else if config.ui[key]?.type === "select"}
					<InputSelect
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						type={config.ui[key]?.type || "text"}
						value={registro.attributes[key]}
						context={registro}
						config={config.ui[key]?.list}
						on:set={(event) => {
							registro.attributes[event.detail.key] = event.detail.value;
						}}
						on:input={(event) => {
							registro.attributes[key] = (event.target || event.detail).value;
						}}
					/>
				{:else if config.ui[key]?.type === "daterange"}
					<InputDateRange
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						value={registro.attributes[key]}
						separator={config.ui[key]?.separator || ' 🠖 '}
						context={registro}
						on:input={(event) => {
							registro.attributes[key] = (event.target || event.detail).value;
						}}
					/>
				{:else if config.ui[key]?.list}
					<InputList
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						type={config.ui[key]?.type || "text"}
						value={registro.attributes[key]}
						context={registro}
						config={config.ui[key]?.list}
						on:input={(event) => {
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
					/>
				{/if}
			</dd>
		{/if}
	{/each}
</dl>
