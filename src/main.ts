import App from './App.svelte';
import './global.d.ts';

window.onload = () => {
	new App({
		target: document.body,
		props: {
		}
	});

};
