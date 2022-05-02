import App from './App.svelte';
import './global.d.ts';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.locale('es');

window.onload = () => {
	new App({
		target: document.body,
		props: {
		}
	});

};
