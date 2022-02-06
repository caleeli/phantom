<script type="ts">
    import api from "../../api";

    const env = process.env;
    const apiBase = env.dev_api_base || "http://localhost/";

    export let params = {id: null};

    let model = {
        name: "",
        table: "",
        url: "",
        id: "id",
        fields: [],
        where: "",
        sort: "",
        filters: [],
        data: [],
        actions: "edit,view,print",
    };
    let modelDefaults = {
        table: "${name}",
        url: "${name}",
    };
    let fieldDefaults = {
        label: "${capitalize(name)}",
        select: "${name}",
        create: ":${name}",
        update: ":${name}",
    };
    let changed = {};
    let response = "";
    window["capitalize"] = function (word) {
        const lower = word.toLowerCase();
        return word.charAt(0).toUpperCase() + lower.slice(1);
    };
    if (params.id) {
        loadModel(params.id);
    }
    function loadModel(id) {
        api(apiBase + "resource").get(id).then(resource => {
            model = resource.attributes;
        });
    }
    function inputField(event, model1, defaults) {
        const name = event.target["name"];
        const value = event.target["value"];
        if (!changed[model1]) {
            changed[model1] = {};
        }
        changed[model1][name] = value != "";
        Object.keys(defaults).forEach((key) => {
            const defaultValue = defaults[key]
                ? new Function(
                      ...Object.keys(model1),
                      "return `" + defaults[key] + "`"
                  )(...Object.values(model1))
                : undefined;
            if (!changed[model1][key] && defaultValue !== undefined) {
                model1[key] = defaultValue;
            }
        });
        model = model;
    }
    function addField() {
        const field = {
            name: "",
            typeDB: "varchar(64)",
            type: "text",
            select: "",
            create: "",
            update: "",
            showInList: true,
            showInCreate: true,
            showInUpdate: true,
        };
        model.fields.push(field);
        model = model;
    }
    function removeField(field) {
        model.fields.splice(model.fields.indexOf(field), 1);
        model = model;
    }
    function createResource() {
        api(apiBase + "resource")
            .post({
                data: {
                    attributes: model,
                },
            })
            .then(async (result) => {
                response = result;
            });
    }
    function addData() {
        const row = {};
        model.fields.forEach((field) => {
            row[field.name] = "";
        });
        model.data.push(row);
        model = model;
    }
    function removeData(row) {
        model.data.splice(model.data.indexOf(row), 1);
        model = model;
    }
    function addFilter() {
        const filter = {
            declaration: "",
            expression: "",
        };
        model.filters.push(filter);
        model = model;
    }
</script>

<label>
    Name:
    <input
        name="name"
        bind:value={model.name}
        on:input={(event) => inputField(event, model, modelDefaults)}
    />
</label>

<label>
    Table:
    <input
        name="table"
        bind:value={model.table}
        on:input={(event) => inputField(event, model, modelDefaults)}
    />
</label>

<label>
    URL: /api/
    <input
        name="url"
        bind:value={model.url}
        on:input={(event) => inputField(event, model, modelDefaults)}
    />
</label>
<br />

<label>
    ID field:
    <input
        name="id"
        bind:value={model.id}
        on:input={(event) => inputField(event, model, modelDefaults)}
    />
</label>
<br />

<datalist id="types">
    <option value="text" />
    <option value="email" />
    <option value="password" />
    <option value="number" />
    <option value="tel" />
    <option value="date" />
    <option value="datetime" />
    <option value="checkbox" />
</datalist>

Fields <button on:click={addField}>+</button><br />
{#each model.fields as field}
    <div class="flex">
        <button on:click={() => removeField(field)}>-</button>
        <label>
            Field:
            <input
                name="name"
                type="text"
                bind:value={field.name}
                on:input={(event) => inputField(event, field, fieldDefaults)}
            />
        </label>
        <label>
            Label:
            <input
                name="label"
                type="text"
                bind:value={field.label}
                on:input={(event) => inputField(event, field, fieldDefaults)}
            />
        </label>
        <label>
            Type (DB):
            <input
                name="typeDB"
                type="text"
                bind:value={field.typeDB}
                on:input={(event) => inputField(event, field, fieldDefaults)}
            />
        </label>
        <label>
            Type (UI):
            <input
                name="type"
                type="text"
                bind:value={field.type}
                on:input={(event) => inputField(event, field, fieldDefaults)}
                list="types"
            />
        </label>
        <label>
            Select (SQL):
            <input
                name="select"
                type="text"
                bind:value={field.select}
                on:input={(event) => inputField(event, field, fieldDefaults)}
            />
        </label>
        <label>
            Create (SQL):
            <input
                name="create"
                type="text"
                bind:value={field.create}
                on:input={(event) => inputField(event, field, fieldDefaults)}
            />
        </label>
        <label>
            Update (SQL):
            <input
                name="update"
                type="text"
                bind:value={field.update}
                on:input={(event) => inputField(event, field, fieldDefaults)}
            />
        </label>
        <label>
            <input
                name="showInList"
                type="checkbox"
                bind:checked={field.showInList}
            />
            list {field.showInList}
        </label>
        <label>
            <input
                name="showInCreate"
                type="checkbox"
                bind:checked={field.showInCreate}
            />
            create
        </label>
        <label>
            <input
                name="showInUpdate"
                type="checkbox"
                bind:checked={field.showInUpdate}
            />
            update
        </label>
    </div>
{/each}

<label>
    Where:
    <textarea name="where" cols="80" bind:value={model.where} />
</label>
<br />

<label>
    Sort:
    <input name="sort" bind:value={model.sort} placeholder="e.g.: name,-id" />
</label>
<br />

<label>
    Enabled actions:
    <input
        name="actions"
        bind:value={model.actions}
        placeholder="e.g.: edit,view,print"
    />
</label>
<br />

<hr />
Available filters:<button on:click={addFilter}>+</button><br />
{#each model.filters as filter}
    <div class="flex">
        <button on:click={() => removeField(filter)}>-</button>
        <label>
            Declaration:
            <input
                name="declaration"
                type="text"
                bind:value={filter.declaration}
                placeholder="e.g.: findByName(name)"
            />
        </label>
        <label>
            Expression:
            <input
                name="expression"
                type="text"
                bind:value={filter.expression}
                placeholder={"e.g.: and name like ${contains($text)}"}
            />
        </label>
    </div>
{/each}

<hr />
Initial Data:<button on:click={addData}>+</button><br />
<table>
    <tr>
        <th />
        {#each model.fields as field}
            <th>{field.label}</th>
        {/each}
    </tr>
    {#each model.data as row}
        <tr>
            <td><button on:click={() => removeData(row)}>-</button></td>
            {#each model.fields as field}
                <td><input bind:value={row[field.name]} /></td>
            {/each}
        </tr>
    {/each}
</table>
<hr />
<button on:click={createResource}>CREATE</button>

<style>
    label {
        display: inline-block;
        width: 15em;
        flex-grow: 1;
    }
    input[type="text"] {
        width: 100%;
        display: block;
    }
    .flex {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
    }
</style>
