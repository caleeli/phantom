<script>
	import Api from "../components/Api.svelte";
	import Avatar from "../components/Avatar.svelte";
	import Grid from "../components/Grid.svelte";
	import GridTemplate from "../components/GridTemplate.svelte";
	import Menu from "../components/Menu.svelte";
	import Topbar from "../components/Topbar.svelte";
	let config = {
		headers: [
			{
				label: "",
			},
			{
				label: "",
			},
		],
		cells: {
			A: {
				value: "attributes.name",
			},
			B: {
				value: "attributes.enabled",
				control: "checkbox",
				align: "right",
			},
		},
	};
	let user = {};
</script>

<Topbar>Perfil</Topbar>
<Menu />

<main>
	<GridTemplate>
		<Api path="users/1?include=permissions,roles" bind:value={user}>
			<div>
				<form>
					<Avatar value={user.attributes.avatar} size="4">
						{user.attributes.name}
					</Avatar>
					<dl>
						<dt><i class="fas fa-sign-in-alt" /></dt>
						<dd><input bind:value={user.attributes.username} /></dd>
						<dt><i class="fas fa-envelope" /></dt>
						<dd><input value={user.attributes.email} /></dd>
						<dt><i class="fas fa-phone" /></dt>
						<dd><input value={user.attributes.phone} /></dd>
					</dl>
				</form>
			</div>
			<form style="grid-column: span 2">
				<h3>Roles</h3>
				<Grid bind:value={user.relationships.roles.data} {config} />
				<h3>Permisos</h3>
				<Grid bind:value={user.relationships.permissions.data} {config} />
			</form>
		</Api>
	</GridTemplate>
</main>

<style>
	input {
		width: 100%;
	}
</style>
