<script type="ts">
  import { get, set } from "lodash";
  import { tick } from "svelte";
  import api from "../api";
  import Input from "./Input.svelte";
  import Label from "./Label.svelte";
  import Button from "./Button.svelte";
  import TextArea from "./TextArea.svelte";
  import Avatar from "./Avatar.svelte";

  export let url: string = "";
  export const params: object = {};
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
        const width = (cell.length / maxRowLength) * 100;
        const props = { width };
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
  async function loadScreen(url: string) {
    const response = await fetch(url);
    const source = await response.text();
    const compiled = compile(source);
    setTimeout(() => {
      tick().then(() => {
        const input = document.querySelector(
          "main input, main select, main textarea"
        );
        if (input) {
          input.focus();
        }
      });
    }, 0);
    return compiled;
  }
  function parseTemplate(tpl) {
    if (!window.Handlebars) {
      return () => tpl;
    }
    return window.Handlebars.compile(tpl);
  }
  const dataRef = new Proxy(data, {
    get(target, prop) {
      return get(target, prop);
    },
    set(target, prop, value) {
      set(target, prop, value);
      data = data;
      return true;
    },
  });
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
              bind:value={dataRef[item.id]}
            >
              <!-- svelte-ignore missing-declaration -->
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
