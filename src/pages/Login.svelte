<script>
	import { user } from "../store";
	import { onMount } from "svelte";
	import { push } from "svelte-spa-router";
	import Auth from "../Auth";
	import { translations as _ } from "../helpers";

	let username = "";
	let password = "";

	const auth = new Auth();

	onMount(async () => {
		document.querySelector('input[name="username"]').focus();
	});

	async function onSubmit() {
		try {
			const response = await auth.signIn(username, password);
			user.update(() => response);
			push("#/dashboard");
		} catch (error) {
			window.alert(error.message);
		}
	}
</script>

<main>
	<form on:submit|preventDefault={onSubmit}>
		<h3>{_("Login")}</h3>
		<p>{_("Please enter your account")}</p>
		<input
			bind:value={username}
			name="username"
			aria-label="username"
			placeholder={_("Username")}
			type="text"
			autocorrect="off"
			autocapitalize="none"
		/>
		<input
			bind:value={password}
			name="password"
			aria-label="password"
			placeholder={_("Password")}
			type="password"
		/>
		<button type="submit">{_("Login")}</button>
	</form>
</main>

<style scoped>
	main {
		background-image: url("../images/login_bg.jpg");
		background-size: cover;
		width: 100vw;
		height: 100vh;
	}
	form {
		max-width: 20rem;
	}
	form input {
		width: 100%;
	}
</style>
