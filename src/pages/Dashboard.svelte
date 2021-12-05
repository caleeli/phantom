<script lang="ts">
import Donut from "../components/Donut.svelte";
import Menu from "../components/Menu.svelte";
import Screen from "../components/Screen.svelte";
import Topbar from "../components/Topbar.svelte";
let donut=[];
</script>

<Topbar>Inicio</Topbar>
<Menu />

<main>
    <Screen url={`../api/dashboard.html`} />
</main>
