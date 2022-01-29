<script>
	import Sheet from "../api/Sheet";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let value = [];
	export let width = 100;
	let style = `--width:${width}%;`;

	export let config;
	const sheet = new Sheet(config, value);
	const actionIcons = {
		view: "eye",
	};
	function iconAlias(icon) {
		return actionIcons[icon] || icon;
	}
</script>

<div {style}>
	<table role="table">
		<tr>
			{#each config.headers as header}
				<th align={header.align || "left"}>{header.label}</th>
			{/each}
		</tr>
		{#if value}
			{#each value as data, row}
				<tr>
					{#each config.headers as header, col}
						{#if sheet.cell[row]}
							<td align={sheet.cell[row][col].align}>
								{#if sheet.cell[row][col].control === "checkbox"}
									<input
										type="checkbox"
										bind:checked={sheet.ref[
											`${row},${col}`
										]}
									/>
								{:else if sheet.cell[row][col].control === "actions"}
									<div class="no-wrap">
										{#each sheet.cell[row][col].actions as action}
											<!-- svelte-ignore a11y-invalid-attribute -->
											<a
												class="action"
												on:click={dispatch(
													action,
													data
												)}
												href="javascript:void(0)"
												data-testid={`action-${action}`}
											>
												<i
													class="fa fa-{iconAlias(
														action
													)}"
												/>
											</a>
										{/each}
									</div>
								{:else}
									{@html sheet.format[`${row},${col}`]}
								{/if}
							</td>
						{/if}
					{/each}
				</tr>
			{/each}
		{/if}
	</table>
	<slot />
</div>

<style>
	div {
		width: var(--width);
		overflow: auto;
	}
	table {
		min-width: 100%;
		border-collapse: collapse;
	}
	table th {
		background-color: #e4e4e4;
		border: 1px solid #ababab;
		border-bottom-width: 2px;
		padding: 0.3rem 0.5rem;
		cursor: pointer;
	}
	table td {
		border: 1px solid #d9d9d9;
		padding: 0.2rem 0.5rem;
		cursor: cell;
	}

	table tr:nth-child(odd) {
		background-color: #f9f9f9;
	}

	.action {
		display: inline-block;
		margin-left: 0.5rem;
	}
</style>
