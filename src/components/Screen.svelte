<script type="ts">
  import Input from "./Input.svelte";
  import Label from "./Label.svelte";

  export let url: string = "";

  function compile(code: string) {
    const parser = window.document.createElement("div");
    parser.innerHTML = code;
    const screen = parser.querySelector("screen") as HTMLInputElement;
    const rows = screen.textContent.trim().split("\n");
    const maxRowLength = rows.reduce((max, row) => Math.max(max, row.length), 0);
    const result = [];
    rows.forEach((row) => {
      const cells = row.match(/\[[^\[\]]+\]|[^\[\]]+/g);
      const rowResult = [];
      cells.forEach((cell) => {
        const size = (cell.length / maxRowLength) * 100;
        if (cell.startsWith("[")) {
          rowResult.push({type: Input, props: { size }});
        } else {
          const content = cell;
          rowResult.push({type: Label, content, props: { size }});
        }
      });
      result.push(rowResult);
    });
    return result;
  }
  function loadScreen(url: string) {
    return fetch(url)
      .then((response) => response.text())
      .then((source) => compile(source))
      .then((compiled) => {
        return compiled;
      });
  }
</script>

<div class="screen">
  {#if url}
    {#await loadScreen(url) then items}
      {#each items as row}
        <div class="screen-row">
          {#each row as item}
            <svelte:component this={item.type} {...item.props}>
              {#if item.content}{item.content}{/if}
            </svelte:component>
          {/each}
        </div>
      {/each}
    {/await}
  {/if}
</div>

<style>
  .screen {
    display: flex;
    flex-direction: column;
  }
  .screen-row {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>
