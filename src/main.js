import Editor from './components/editor.svelte';

new Editor({
	target: document.querySelector('body'),
	data: {
		mode: 'text/markup-abbreviation',
		lineNumbers: false
	}
});
