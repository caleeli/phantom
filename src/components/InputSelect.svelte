<script>
    import Api from "./Api.svelte";

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
</script>

<select {...$$restProps} bind:value>
    <option />
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
</select>
