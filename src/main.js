import Editor from './components/editor.svelte';

new Editor({
	target: document.querySelector('body'),
	data: {
		lineNumbers: false
	}
});
