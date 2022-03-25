<script>
	import Api from "./Api.svelte";

	export let value;
	export let config;
	let datalist;
	let key = new Date().getTime() + Math.random();

	function onChangeDataList(target) {
		const value = target.value;
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
		params.filter = params.filter.map((filter) =>
			new Function("value", "return `" + filter + "`")(
				JSON.stringify(value)
			)
		);
		return params;
	}
	function expression(text, object) {
		return new Function(...Object.keys(object), "return `" + text + "`")(
			...Object.values(object)
		);
	}
</script>

<input
	{...$$restProps}
	bind:value
	on:change={(event) => {
		onChangeDataList(event.target);
	}}
	list={`list-${key}`}
/>
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
