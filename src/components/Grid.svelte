<script>
	export let value = [];
	export let width = 1;
	export let size = 2;
	export let align = "center";
	let style = `--width:${width}%;--align:${align};--size:${size}rem;`;
</script>

<table {style}>
	<tr>
		<th>Permission</th>
		<th>Enabled</th>
	</tr>
	<tr>
		<td>Profile</td>
		<td><input type="checkbox"></td>
	</tr>
	<tr>
		<td>Create Users</td>
		<td><input type="checkbox"></td>
	</tr>
</table>

<style>
	table {
		width: var(--width);
		text-align: var(--align);
	}
</style>
