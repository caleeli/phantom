<script>
  import { onMount } from "svelte";
  import { _ } from "../helpers";
  export let width = "auto";
  export let colspan = "1";
  export let value;
  $: cssVarStyles = `--width:${isNaN(width) ? width : width + "%"};--colspan:${colspan};`;
  const config = value;
  // === include 'setup' then 'config' above ===
  let canvas;
  let chart;
  onMount(() => {
    config.data.datasets.forEach((dataset) => {
      if (dataset.label) {
        dataset.label = _(dataset.label);
      }
    });
    config.data.labels.forEach((label, index) => {
      config.data.labels[index] = _(label);
    });
    if (config.options && config.options.plugins && config.options.plugins.title) {
      config.options.plugins.title.text = _(config.options.plugins.title.text);
    }
    chart = new Chart(canvas, config);
  });
</script>

<div class="content" style={cssVarStyles}>
  <canvas bind:this={canvas} />
  <slot />
</div>

<style>
  div {
    width: var(--width);
    grid-column: span var(--colspan);
  }
</style>
