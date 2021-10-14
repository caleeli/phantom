<script>
	import { user } from '../store';
	import { onMount } from 'svelte';
    import { push } from "svelte-spa-router";
    import Auth from '../Auth';

	let username;
	let password;

    const auth = new Auth();

    onMount(async () => {
        // await new Promise(resolve => setTimeout(resolve, 1));
        document.querySelector('input[name="username"]').focus();
	});

	async function onSubmit() {
		try {
			const response = await auth.signIn(username, password)
            user.update(() => response);
            push("#/dashboard");
		} catch (error) {
            window.alert(error.message);
		}
    }
</script>

<main>
    <form on:submit|preventDefault={onSubmit}>
        <h3>LOGIN</h3>
        <p>Please login into your account</p>
        <input bind:value={username} name="username" aria-label="username" placeholder="Username" type="text"/>
        <input bind:value={password} name="password" aria-label="password" placeholder="Password" type="password"/>
        <button type="submit">Login</button>
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
