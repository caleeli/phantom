<script lang="ts">
	import Abm from "../components/ABM.svelte";
	import * as config from "../../models/actividades.json";
	import * as planAnualConfig from "../../models/plan_anual.json";
	import FormFields from "../components/FormFields.svelte";
	import api from "../api";

	export let params = {
		id: null,
	};

	// initialize plan_anual with empty values
	const attrs = Object.keys(planAnualConfig.attributes);
    const form = JSON.parse(JSON.stringify(planAnualConfig));
    form.ui = Object.keys(form.ui).reduce(
        (res, key) => {
            if (form.ui[key].showInUpdate !== false) {
                res[key] = form.ui[key];
            }
            return res;
        },
        {}
    );
	const attributes = attrs.reduce((acc, key) => {
		acc[key] = "";
		return acc;
	}, {});

	let plan_anual = {
		attributes,
	};
	api("plan_anual")
		.get(params.id)
		.then((data) => {
			plan_anual = data;
		});
</script>

<Abm
	{config}
	params={{ params: { plan_anual_id: params.id } }}
	enable_goback={true}
>
	<div slot="header">
		<FormFields
			config={form}
			bind:registro={plan_anual}
			dataTest="plan_anual"
		/>
	</div>
</Abm>
