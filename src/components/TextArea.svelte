<script>
  export let width = 1;
  export let value;
  $: cssVarStyles = `--width:${width}%`;
</script>

<textarea {...$$props} style={cssVarStyles} bind:value={value}></textarea>
<slot />

<style>
  textarea {
    width: var(--width);
  }
</style>
