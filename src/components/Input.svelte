<script>
  export let size = 1;
  let styles = {
    size: `${size}%`,
  };
  $: cssVarStyles = Object.entries(styles)
    .map(([key, value]) => `--${key}:${value}`)
    .join(";");
</script>

<input style={cssVarStyles} />
<slot />

<style>
  input {
    width: var(--size);
  }
</style>
