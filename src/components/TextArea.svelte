<script>
  export let size = 1;
  export let value;
  let styles = {
    size: `${size}%`,
  };
  $: cssVarStyles = Object.entries(styles)
    .map(([key, value]) => `--${key}:${value}`)
    .join(";");
</script>

<textarea {...$$props} style={cssVarStyles} bind:value={value}></textarea>
<slot />

<style>
  textarea {
    width: var(--size);
  }
</style>
