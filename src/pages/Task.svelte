<script lang="ts">
  import Menu from "../components/Menu.svelte";
  import Screen from "../components/Screen.svelte";
  export let params: {id: string};
</script>

<header>Talento Humano</header>

<Menu />

<main>
  <Screen url={`../api/tasks/${params.id}.html`} params={params} />
</main>

<style>
  main {
    margin-top: 0px;
  }
</style>
