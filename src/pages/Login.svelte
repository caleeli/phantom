<script>
    import { push } from "svelte-spa-router";
	import { onMount } from 'svelte';

	let username;
	let password;

    onMount(() => {
        setTimeout(() => {
            document.querySelector('input[name="username"]').focus();
        }, 1);
	});

	function onSubmit() {
		try {
			aws_amplify.Amplify.Auth.signIn(username, password)
			.then((user) => {
				console.log(user);
				push("#/test");
			}).catch((error) => {
				alert(error.message);
			});
		} catch (error) {
			console.error(error);
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
