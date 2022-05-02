<script>
    export let width = 300;
    export let show = false;
    let x;
    let y;
    let style = "";
    let menu;
    function clickOutside(event) {
        // if target is outdide the tooltip, hide it
        if (event.target !== menu && !menu.contains(event.target)) {
            show = false;
        }
    }
    $: {
        if (menu) {
            const owner = menu.parentNode;
            // get static owner position
            const ownerRect = owner.getBoundingClientRect();
            x = ownerRect.x;
            y = ownerRect.y + ownerRect.height;
            // if x + width > screen width, flip the tooltip to the left
            if (x + width + 32 >= window.innerWidth) {
                x = window.innerWidth - width - 32;
            }
        }
        style = `--display:${
            show ? "block" : "none"
        }; left:${x}px; top:${y}px; width: ${width}px;`;
    }
</script>

<svelte:window on:click={clickOutside} />

<div bind:this={menu} class="content popup-menu" {style}>
    <slot />
</div>

<style>
    .popup-menu {
        position: fixed;
        z-index: 9999;
        display: var(--display);
        margin: 0px;
    }
</style>
