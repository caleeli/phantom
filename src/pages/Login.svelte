<script>
    import { push } from "svelte-spa-router";
	import { onMount } from 'svelte';

    onMount(() => {
        setTimeout(() => {
            document.querySelector('input[name="username"]').focus();
        }, 1);
	});
    function login() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1);
        });
    }
    function onSubmit() {
		login().then(() => {
			push("#/test");
		});
    }
</script>

<main>
    <form on:submit|preventDefault={onSubmit}>
        <h3>LOGIN</h3>
        <p>Please login into your account</p>
        <input type="text" name="username" placeholder="Username" />
        <input type="password" name="password" placeholder="Password" />
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
