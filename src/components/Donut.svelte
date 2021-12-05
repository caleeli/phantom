<script>
  import { onMount } from "svelte";
  export let width = 1;
  export let value;
  $: cssVarStyles = `--width:${width}%`;
  const config = value;
  // === include 'setup' then 'config' above ===
  let canvas;
  let chart;
  onMount(() => {
    chart = new Chart(canvas, config);
  });
</script>

<div class="content" style={cssVarStyles} >
    <canvas bind:this={canvas}/>
    <slot />
</div>

<style>
    div {
      width: var(--width);
    }
</style>
