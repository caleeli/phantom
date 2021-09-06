<script>
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  export let items = [];
  const flipDurationMs = 300;
  const dropTargetStyle = {};
  const dropTargetClasses = ["drop-zone-on-dragged"];
  function handleDndConsider(e) {
    items = e.detail.items;
  }
  function handleDndFinalize(e) {
    items = e.detail.items;
  }
</script>

<div
  class={$$props.class}
  use:dndzone={{ items, flipDurationMs, dropTargetStyle, dropTargetClasses }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
  {#each items as item (item.id)}
    <div animate:flip={{ duration: flipDurationMs }}>
      <slot {item} />
    </div>
  {/each}
</div>
