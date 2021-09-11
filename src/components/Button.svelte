<script>
  export let size = 1;
  let styles = {
    size: `${size}%`,
  };
  $: cssVarStyles = Object.entries(styles)
    .map(([key, value]) => `--${key}:${value}`)
    .join(";");
</script>

<button {...$$props} style={cssVarStyles}><slot /></button>

<style>
  input {
    width: var(--size);
  }
</style>
