<script type="ts">
  import { get, set } from "lodash";
  import { tick } from "svelte";
  import api from "../api";
  import Input from "./Input.svelte";
  import Label from "./Label.svelte";
  import Button from "./Button.svelte";
  import TextArea from "./TextArea.svelte";
  import Avatar from "./Avatar.svelte";
  import Donut from "./Donut.svelte";
  import Icon from "./Icon.svelte";
  import Grid from "./Grid.svelte";
  import unique from "../unique";

  const types = { Input, Label, Button, TextArea, Avatar, Donut, Icon, Grid };
  export let width = "100%";
  export let url: string = "";
  export let code: string = "";
  export let value: Object = {};
  export let screens: Object = {};
  export let templates: Object = {};
  let data = value;
  let className = '';
  let style = `--width:${width}%;`;

  function compile(code: string) {
    const parser = window.document.createElement("div");
    parser.innerHTML = code;
    // Get <template> elements as [{id: template}...]
    Array.from(parser.querySelectorAll("template")).reduce(
      (templates, template) => {
        templates[template.id] = template.innerHTML;
        return templates;
      },
      templates as any
    );
    Array.from(parser.querySelectorAll("screen")).forEach((screen, index) => {
      if (index === 0) {
        return;
      }
      if (screen.id) {
        screens[screen.id] = screen.outerHTML;
      }
    });
    const screen = parser.querySelector("screen") as HTMLInputElement;
    className = screen.getAttribute("class");
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
          // parse cell as [id:type=value]
          let [, id, type, value] = cell.match(/^\[([^:]*)(?::([^=\s]+)\s*)?(?:=(.*))?\]$/);
          const def = { id: '', type: Input as any, props, text: '' as any };
          if (type && !id) {
            id = `v${unique()}`;
          }
          id = id.trim();
          if (id) {
            def.id = id;
            if (value && value.trim()) {
              data[id] = JSON.parse(value);
            }
            refs[`$${id}`] = def;
          }
          if (type && templates[type]) {
            def.type = Label as any;
            def.text = (data) => parseTemplate(templates[type])(data[id]);
          } else if (type && screens[type]) {
            def.type = "Screen";
            def.props["code"] = screens[type];
            def.props["screens"] = screens;
            def.props["templates"] = templates;
          } else if (type) {
            def.type = types[type] as any;
          } else if (!id) {
            def.type = Label as any;
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
        .replace(/\$(\w+)/g, (ref) => `refs[${JSON.stringify(ref)}]`);
      if (code) {
        (new Function('data', 'api', code))(data, api);
      }
    }
    return result as [
      [{ id: string; type: string; props: {}; text: Function }]
    ];
  }
  async function loadScreen(url: string, code: string) {
    const response = !code && url && await fetch(url);
    const source = code || await response.text();
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
      if (prop === "$data") {
        return target;
      }
      return get(target, prop);
    },
    set(target, prop, value) {
      if (prop === "$data") {
        data = value;
      } else {
        set(target, prop, value);
        data = data;
      }
      return true;
    },
  });
</script>

<div class={`screen ${className}`} {style}>
  {#if url || code}
    {#await loadScreen(url, code) then items}
      {#each items as row}
        <div class="screen-row">
          {#each row as item}
            {#if item.type==="Screen"}
              <svelte:self
                {...item.props}
                bind:value={dataRef[item.id]}
              />
            {:else}
              <svelte:component
                this={item.type}
                {...item.props}
                bind:value={dataRef[item.id]}
              >
                <!-- svelte-ignore missing-declaration -->
                {#if item.text}{@html item.text instanceof Function
                    ? item.text(dataRef)
                    : item.text}{/if}
              </svelte:component>
            {/if}
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
    width: var(--width);
  }
  .screen-row {
    display: flex;
    flex-direction: row;
    align-items: start;
  }
</style>
