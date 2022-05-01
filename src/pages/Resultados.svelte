<script lang="ts">
    import Abm from "../components/ABM.svelte";
    import * as config from "../../models/resultados.json";
    import * as actividadesConfig from "../../models/actividades.json";
    import FormFields from "../components/FormFields.svelte";
    import api from "../api";

    export let params = {
        id: null,
    };

    // initialize actividad with empty values
    const attrs = Object.keys(actividadesConfig.attributes);
    const form = JSON.parse(JSON.stringify(actividadesConfig));
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

    let actividad = {
        attributes,
    };
    api("actividades")
        .get(params.id)
        .then((data) => {
            actividad = data;
        });
</script>

<Abm
    {config}
    params={{ params: { actividad_id: params.id } }}
    enable_goback={true}
>
    <div slot="header">
        <FormFields
            config={form}
            bind:registro={actividad}
            dataTest="actividad"
        />
    </div>
</Abm>
