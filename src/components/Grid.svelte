<script>
	import Sheet from "../api/Sheet";
	import { createEventDispatcher } from "svelte";
	import { translations } from "../helpers";

	const dispatch = createEventDispatcher();

	export let value = [];
	export let width = 100;
	export let config;

	const _ = translations.setLabels(config.labels);
	let style = `--width:${width}%;`;
	const sheet = new Sheet(config, value);
	const actionIcons = {
		view: "eye",
		open: "folder-open",
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
						{#if sheet.cell[row] && sheet.firstInGroup(row, col)}
							<td
								align={sheet.cell[row][col].align}
								rowspan={sheet.rowspan(row, col)}
								colspan={sheet.colspan(row, col)}
							>
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
												tooltip={_(action)}
												aria-label="{_(action)}"
											>
												<i
													class="fa fa-{iconAlias(
														action
													)}"
												/>
											</a>
										{/each}
									</div>
								{:else if sheet.cell[row][col].type === "file"}
									<a href={sheet.ref[`${row},${col}`]} target="_blank">{sheet.format[`${row},${col}`]}</a>
								{:else}
									{sheet.format[`${row},${col}`]}
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
		border: 1px double #ababab;
		border-bottom-width: 3px;
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
	.cell {
		display: flex;
	}
</style>
