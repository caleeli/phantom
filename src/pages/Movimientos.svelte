<script lang="ts">
	import Abm from "../components/ABM.svelte";
	import * as config from "../../models/movimientos.json";
	import * as informeConfig from "../../models/informes.json";
	import FormFields from "../components/FormFields.svelte";
	import api from "../api";

	export let params = {
		id: null,
	};

	let informe = {
		attributes: JSON.parse(
			JSON.stringify(informeConfig.createButtons[0].attributes)
		),
	};
	api("informes")
		.get(params.id)
		.then((data) => {
			informe = data;
		});
</script>

<Abm {config} params={{ params: { informe_id: params.id } }}>
	<div slot="header">
		<FormFields
			config={informeConfig}
			bind:registro={informe}
			dataTest="informe"
		/>
	</div>
</Abm>
