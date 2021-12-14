<script>
  export let width = 100;
  export let size = 2;
  export let value = "";
  export let align = "center";
  let style = `--width:${width}%;--align:${align};--size:${size}rem;`;
</script>

<figure {style}>
  <img src={value} alt={value} /><br />
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
    overflow: hidden;
  }
</style>
