<script>
  export let size = 1;
  let styles = {
    size: `${size}%`,
  };
  $: cssVarStyles = Object.entries(styles)
    .map(([key, value]) => `--${key}:${value}`)
    .join(";");
</script>

<div {...$$props} style={cssVarStyles}><slot /></div>

<style>
  div {
    width: var(--size);
  }
</style>
