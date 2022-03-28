<script>
	import { tick } from "svelte";
	import api from "../api";
	import Api from "./Api.svelte";
	import { onMount } from "svelte";

	export let value;
	export let config;
	let datalist;
	let key = new Date().getTime() + Math.random();
	let focused = false;
	let maskedValue = "";
	let focusedInput;

	function onChangeDataList(target) {
		const value = target.value;
		loadMasked(value);
		if (!config || !config["on:select"]) {
			return;
		}
		const options = datalist.options;
		for (let i = 0; i < options.length; i++) {
			if (options[i].value === value) {
				const row = JSON.parse(options[i].getAttribute("row"));
				const map = row.attributes;
				const keys = Object.keys(map);
				const values = keys.map((key) => JSON.stringify(map[key]));
				config["on:select"].forEach((callback) => {
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
	function prepareListParams(config, value) {
		const params = { ...config.params };
		if (params.filter) {
			params.filter = params.filter.map((filter) =>
				new Function("value", "return `" + filter + "`")(
					JSON.stringify(value)
				)
			);
		}
		return params;
	}
	function expression(text, object) {
		if (!text || !object) {
			return "";
		}
		return new Function(...Object.keys(object), "return `" + text + "`")(
			...Object.values(object)
		);
	}
	async function loadMasked(value) {
		if (config.text) {
			let row = await api(config.model).get(value);
			if (row instanceof Array) {
				maskedValue = value;
			} else {
				maskedValue = expression(config.text, row);
			}
		} else {
			maskedValue = value;
		}
	}
	async function onfocus() {
		focused = true;
		await tick();
		if (focusedInput) {
			focusedInput.focus();
		}
	}
	function onblur() {
		focused = false;
	}
	onMount(() => {
		loadMasked(value);
	});
</script>

{#if focused}
	<input
		bind:this={focusedInput}
		{...$$restProps}
		bind:value
		on:change={(event) => {
			onChangeDataList(event.target);
		}}
		list={`list-${key}`}
		on:blur={onblur}
		on:input
	/>
{:else}
	<input {...$$restProps} value={maskedValue} on:focus={onfocus} />
{/if}
<datalist bind:this={datalist} id={`list-${key}`}>
	<Api
		path={config.model}
		params={prepareListParams(config, value)}
		let:response={options}
	>
		{#each options as option}
			<option
				value={expression(config.value, option)}
				row={JSON.stringify(option)}
			>
				{expression(config.text, option)}
			</option>
		{/each}
	</Api>
</datalist>
