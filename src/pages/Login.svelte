<script>
	import { user } from '../store';
	import { onMount } from 'svelte';
    import { push } from "svelte-spa-router";

	let username;
	let password;
    let dialog;
    let dialogMessage = '';

    onMount(() => {
        setTimeout(() => {
            document.querySelector('input[name="username"]').focus();
        }, 1);
	});

	function onSubmit() {
		try {
			aws_amplify.Amplify.Auth.signIn(username, password)
			.then((response) => {
				user.update(() => response);
				push("#/test");
			}).catch((error) => {
                console.log(error);
                window.alert(error.message);
			});
		} catch (error) {
            console.log(error);
            window.alert(error.message);
		}
    }
</script>

<main>
    <form on:submit|preventDefault={onSubmit}>
        <h3>LOGIN</h3>
        <p>Please login into your account</p>
        <input bind:value={username} type="text" name="username" placeholder="Username" />
        <input bind:value={password} type="password" name="password" placeholder="Password" />
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
