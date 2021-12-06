<script>
	import Sheet from "../api/Sheet";

	export let value = [];
	export let width = 1;
	export let size = 2;
	export let align = "center";
	let style = `--width:${width}%;--align:${align};--size:${size}rem;`;

	let config = {
		headers: [
			{
				label: "",
				align: "left",
			},
			{
				label: "",
			},
		],
		cells: {
			A: {
				value: "attributes.name",
				align: "left",
			},
			B: {
				value: "attributes.enabled",
				control: "checkbox",
			},
		},
	};
	const sheet = new Sheet(config, value);
	window.aaa = value;
</script>

<table {style}>
	<tr>
		{#each config.headers as header}
			<th align={header.align}>{header.label}</th>
		{/each}
	</tr>
	{#each value as data, row}
		<tr>
			{#each config.headers as header, col}
				<td align={sheet.cell[row][col].align}>
					{#if sheet.cell[row][col].control === "checkbox"}
						<input type="checkbox" bind:checked={sheet.ref[`${row},${col}`]} />
					{:else}
						{sheet.ref[`${row},${col}`]}
					{/if}
				</td>
			{/each}
		</tr>
	{/each}
</table>
<slot />

<style>
	table {
		width: var(--width);
		text-align: var(--align);
	}
</style>
