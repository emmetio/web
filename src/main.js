import App from './components/app.svelte';
import store from './lib/store';

new App({
	target: document.querySelector('body'),
	store
});
