<script>
	import { translations } from "../helpers";
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
	{#each Object.entries(config.ui) as [key, fieldConfig]}
		{#if key !== "_actions"}
			<dt>{_(key)}</dt>
			<dd>
				{#if fieldConfig?.type === "file"}
					<InputFile
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						type={fieldConfig?.type || "text"}
						value={registro.attributes[key]}
						on:input={(event) => {
							registro.attributes[key] = (
								event.target || event.detail
							).value;
						}}
					/>
				{:else if fieldConfig?.type === "textarea"}
					<textarea
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						type={fieldConfig?.type || "text"}
						value={registro.attributes[key]}
						on:input={(event) => {
							registro.attributes[key] = event.target.value;
						}}
					/>
				{:else if fieldConfig?.type === "select"}
					<InputSelect
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						type={fieldConfig?.type || "text"}
						value={registro.attributes[key]}
						context={registro}
						config={fieldConfig?.list}
						on:set={(event) => {
							registro.attributes[event.detail.key] =
								event.detail.value;
						}}
						on:input={(event) => {
							registro.attributes[key] = (
								event.target || event.detail
							).value;
						}}
					/>
				{:else if fieldConfig?.type === "daterange"}
					<InputDateRange
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						value={registro.attributes[key]}
						separator={fieldConfig?.separator || " 🠖 "}
						context={registro}
						on:input={(event) => {
							registro.attributes[key] = (
								event.target || event.detail
							).value;
						}}
					/>
				{:else if fieldConfig?.list}
					<InputList
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						type={fieldConfig?.type || "text"}
						value={registro.attributes[key]}
						context={registro}
						config={fieldConfig?.list}
						on:input={(event) => {
							registro.attributes[key] = (
								event.target || event.detail
							).value;
						}}
					/>
				{:else}
					<input
						class="w-100"
						data-testid={`${dataTest}-${key}`}
						type={fieldConfig?.type || "text"}
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
