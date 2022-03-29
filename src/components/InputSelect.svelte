<script>
	import { createEventDispatcher } from "svelte";
	import Api from "./Api.svelte";

	const dispatch = createEventDispatcher();

	export let value;
	export let config;
	// workaround
	let options = [];

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
		return new Function(...Object.keys(object), "return `" + text + "`")(
			...Object.values(object)
		);
	}
	function onChangeDataList(target) {
		const value = target.value;
		if (!config || !config["on:select"]) {
			return;
		}
		const options = target.options;
		for (let i = 0; i < options.length; i++) {
			if (options[i].value === value) {
				const row = JSON.parse(options[i].getAttribute("row"));
				const map = row?.attributes || {};
				const keys = Object.keys(map);
				const values = keys.map((key) => JSON.stringify(map[key]));
				config["on:select"].forEach((callback) => {
					callback = new Function(
						...keys,
						"return `" + callback + "`"
					)(...values);
					new Function("set", ...keys, callback)((key, value) => {
						// to reset the target field instead of skip it
						if (value === undefined) value = null;
						dispatch("set", { key, value });
					}, ...keys);
				});
			}
		}
	}
</script>

<!-- svelte-ignore a11y-no-onchange -->
<select
	bind:value
	{...$$restProps}
	on:input
	on:change={(event) => {
		onChangeDataList(event.target);
	}}
>
	<option />
	<Api path={config.model} params={config.params} let:response={options}>
		{#each options as option}
			<option
				value={expression(config.value, option)}
				selected={expression(config.value, option) == value}
				row={JSON.stringify(option)}
			>
				{expression(config.text, option)}
			</option>
		{/each}
	</Api>
</select>
