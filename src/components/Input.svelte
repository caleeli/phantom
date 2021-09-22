<script>
  export let width = 1;
  export let value;
  $: cssVarStyles = `--width:${width}%`;
</script>

<input {...$$restProps} style={cssVarStyles} bind:value={value} />
<slot />

<style>
  input {
    width: var(--width);
  }
</style>
