<script>
	import Abm from "../components/ABM.svelte";
	import * as config from "../../models/movimientos.json";
	import * as informeConfig from "../../models/informes.json";
	import FormFields from "../components/FormFields.svelte";
	import api from "../api";
	import InputList from "../components/InputList.svelte";
	import InputSelect from "../components/InputSelect.svelte";
	let informe = {
		attributes: JSON.parse(
			JSON.stringify(informeConfig.createButtons[0].attributes)
		),
	};
	api("informes")
		.get("1")
		.then((data) => {
			informe = data;
		});

	let informeList = {
		model: "informes",
		value: "${attributes.id}",
		text: "${attributes.entidad}",
		params: {
			// filter: ["findByText(${value})"],
		},
	};
	let informeId = "";
</script>

<Abm {config}>
	<div slot="header">
		<InputSelect
			class="w-100"
			bind:value={informeId}
			bind:config={informeList}
		/>
		<FormFields
			config={informeConfig}
			bind:registro={informe}
			dataTest="informe"
		/>
	</div>
</Abm>
