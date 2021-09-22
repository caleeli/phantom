<script>
  export let width = 1;
  $: cssVarStyles = `--width:${width}%`;
</script>

<div {...$$props} style={cssVarStyles}><slot /></div>

<style>
  div {
    width: var(--width);
  }
</style>
