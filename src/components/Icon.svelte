<script>
  export let value = 'dot-circle';
  export let width = 1;
  export let size = 2;
  export let align = "center";
  let style = `--width:${width}%;--align:${align};--size:${size}rem;`;
</script>

<span {style}>
  <i class={`fas fa-${value}`} />
  <slot />
</span>

<style>
  span {
    width: var(--width);
    text-align: var(--align);
  }
</style>
