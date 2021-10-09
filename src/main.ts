import App from './App.svelte';
import './amplify.js';
import './global.d.ts';
const app = new App({
	target: document.body,
	props: {
	}
});

export default app;
