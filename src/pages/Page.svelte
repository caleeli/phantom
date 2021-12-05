<script lang="ts">
import Menu from "../components/Menu.svelte";
import Screen from "../components/Screen.svelte";
import Topbar from "../components/Topbar.svelte";
export let params: {name: string};
let title = params.name.split(/\W/).join(" ");
</script>

<Topbar>{title}</Topbar>
<Menu />

<main>
    <Screen url={`../api/${params.name}.html`} />
</main>
