<script lang="ts">
	import { translations as _ } from "../../helpers";
	import api from "../../api";

	const env = process.env;
	const apiBase = env.dev_api_base || "http://localhost/dev/";

	function listResources() {
		return api(apiBase + "resource").get();
	}
</script>

{_("Bienvenido al panel de desarrador")}

<table>
	<tr>
		<th>Resource</th>
		<th>Action</th>
	</tr>
	{#await listResources() then resources}
		{#each resources as resource}
			<tr>
				<td>{resource['attributes']['name']}</td>
				<td>
					<a href="#/resource/{resource['id']}">Edit</a>
				</td>
			</tr>
		{/each}
	{/await}
</table>
