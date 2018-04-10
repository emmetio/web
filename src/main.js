import AbbrEditor from './components/abbreviation-input.svelte';

new AbbrEditor({
	target: document.querySelector('body'),
	data: {
		syntax: 'html',
		value: 'ul>li.item*4',
		syntaxPicker: true,
		preview: true
	}
});
