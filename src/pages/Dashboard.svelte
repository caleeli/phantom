<script lang="ts">
import Donut from "../components/Donut.svelte";
import Menu from "../components/Menu.svelte";
import Screen from "../components/Screen.svelte";
let donut=[];
</script>

<header>Inicio</header>

<Menu />

<main>
    <Screen url={`../api/dashboard.html`} />
</main>
