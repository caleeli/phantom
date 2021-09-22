<script>
  export let width = 1;
  export let onclick = () => {};
  let cssVarStyles = `--width:${width}%`;
  function click(event) {
    onclick(event);
  }
</script>

<button {...$$restProps} style={cssVarStyles} on:click={click}><slot /></button>

<style>
  button {
    width: var(--width);
  }
</style>
