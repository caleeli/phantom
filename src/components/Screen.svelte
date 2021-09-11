<script type="ts">
  import Input from "./Input.svelte";
  import Label from "./Label.svelte";
  import Button from "./Button.svelte";
  import TextArea from "./TextArea.svelte";

  export let url: string = "";
  let data = {} as any;

  function compile(code: string) {
    const parser = window.document.createElement("div");
    parser.innerHTML = code;
    const screen = parser.querySelector("screen") as HTMLInputElement;
    const rows = screen.innerHTML.trim().split("\n");
    const maxRowLength = rows.reduce(
      (max, row) => Math.max(max, row.length),
      0
    );
    const result = [];
    const refs = {};
    rows.forEach((row) => {
      const cells = row.match(/\[[^\[\]]+\]|[^\[\]]+/g);
      const rowResult = [];
      cells.forEach((cell) => {
        const size = (cell.length / maxRowLength) * 100;
        const props = { size };
        if (cell.startsWith("[")) {
          const id = cell.substr(1, cell.length - 2).trim();
          const def = { type: Input as any, props };
          if (id) {
            def["id"] = id;
            data[id] = null;
            refs[`$${id}`] = def;
          } else {
            def.type = Label;
          }
          rowResult.push(def);
        } else {
          const text = parseTemplate(cell);
          rowResult.push({ type: Label, text, props });
        }
      });
      result.push(rowResult);
    });
    const script = parser.querySelector("script") as HTMLScriptElement;
    if (script) {
      const code = script.textContent
        .trim()
        .replace(/\$\w+/g, (ref) => `refs[${JSON.stringify(ref)}]`);
      if (code) {
        eval(code);
      }
    }
    return result as [
      [{ id: string; type: string; props: {}; text: Function }]
    ];
  }
  function loadScreen(url: string) {
    return fetch(url)
      .then((response) => response.text())
      .then((source) => compile(source))
      .then((compiled) => {
        return compiled;
      });
  }
  function parseTemplate(tpl) {
    if (!window.Handlebars) {
      return () => tpl;
    }
    return window.Handlebars.compile(tpl);
  }
</script>

<div class="screen">
  {#if url}
    {#await loadScreen(url) then items}
      {#each items as row}
        <div class="screen-row">
          {#each row as item}
            <svelte:component
              this={item.type}
              {...item.props}
              bind:value={data[item.id]}
            >
              {#if item.text}{@html item.text instanceof Function
                  ? item.text(data)
                  : item.text}{/if}
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
