<script>
  export let width = 1;
  export let size = 2;
  export let value = "";
  export let align = "center";
  let style = `--width:${width}%;--align:${align};--size:${size}rem;`;
</script>

<figure {style}>
  <img src="images/user-regular.svg" alt={value} />
  <slot />
</figure>

<style>
  figure {
    width: var(--width);
    text-align: var(--align);
  }
  figure img {
    border-radius: var(--size);
    width: var(--size);
    height: var(--size);
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    border: 1px solid var(--sidebar-username-border);
    overflow: hidden;
  }
</style>
