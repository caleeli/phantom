<script lang="ts">
	let tooltip;
	let text = "";

	let width = 100;
	let cien749 = 107.49;
	let cien9085 = 109.085;
	let cien9812 = 109.812;
	let cien10492 = 110.492;
	let cien11 = 111;
	let cien10486 = 110.486;
	let cien9231 = 109.231;
	let cien803 = 108.03;

	let tooltipX = 0;
	let tooltipY = 0;
	let transform = "";

	$:{
		cien749 = width + 7.49;
		cien9085 = width + 9.085;
		cien9812 = width + 9.812;
		cien10492 = width + 10.492;
		cien11 = width + 11;
		cien10486 = width + 10.486;
		cien9231 = width + 9.231;
		cien803 = width + 8.03;
	}
	function handleMouseMove(event) {
		// Absolute position of the mouse over the screen
		let x = event.clientX;
		let y = event.clientY;
		// Consider the scroll
		x -= window.scrollX;
		y -= window.scrollY;
		// Consider the position of the tooltip
		x -= 10;
		y -= 35;
		let target = event.target;
		while (target && !target.getAttribute("tooltip")) {
			target = target.parentElement;
		}
		if (target) {
			text = target.getAttribute("tooltip");
			// Set the position of the tooltip
			tooltipX = x;
			tooltipY = y;
		} else {
			text = "";
		}
		width = text.length * 8;
		transform = "";
		// Check if the tooltip is out of the screen
		if (x + width +12 >= window.innerWidth) {
			// Flip the tooltip to the left
			tooltipX = tooltipX - width + 10;
			transform = `scale(-1, 1) translate(${-width - 12}, 0)`;
		}
	}
</script>

<svelte:window on:mousemove={handleMouseMove} />

<svg
	bind:this={tooltip}
	class="tooltip"
	width={width + 12}
	height="34"
	viewBox={`0 0 ${width + 12} 34`}
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	style={`
		display: ${text ? "block" : "none"};
		left: ${tooltipX}px;
		top: ${tooltipY}px;
	`}
>
	<path
		transform={transform}
		d={`M11.5302 24.9859L11.2602 33L25.6244 24.9859H${cien749}C${cien749} 24.9859 ${cien9085} 24.5319 ${cien9812} 23.8007C${cien10492} 23.1165 ${cien11} 21.5996 ${cien11} 21.5996V4.04762C${cien11} 4.04762 ${cien10486} 2.59483 ${cien9812} 1.95943C${cien9231} 1.41149 ${cien803} 1 ${cien803} 1H3.80805C3.80805 1 2.76641 1.29749 2.24202 1.73368C1.5091 2.34335 1 3.87831 1 3.87831V22.1076C1 22.1076 1.61669 23.371 2.24202 23.97C2.77265 24.4783 3.80805 24.9859 3.80805 24.9859H11.5302Z`}
		fill="var(--azafran)"
		stroke="var(--negro)"
	/>
	<text
		x="8"
		y="18"
		fill="var(--negro)"
	>
		{text}
	</text>
</svg>

<style>
	.tooltip {
		position: absolute;
		pointer-events: none;
	}
</style>
