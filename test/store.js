import assert from 'assert';
import store from '../src/lib/store';

describe('Store', () => {
	beforeEach(() => store.reset());
	const byKey = (snippets, key) => snippets.find(snippet => snippet.key === key);

	it('get snippets', () => {
		// Get global snippets
		const markupSnippets = store.getSnippets('markup');
		assert.equal(markupSnippets['a'], 'a[href]');

		// Get syntax-specific snippets
		const htmlSnippets = store.getSnippets('html');
		assert.equal(htmlSnippets['a'], 'a[href]');
	});

	it('update snippets', () => {
		// Set global markup snippets
		let markupSnippets = store.getSnippets('markup');
		store.setSnippets('markup', {
			...markupSnippets,
			a: 'a[title="markup"]',
			snip1: 'snip[title="markup"]'
		});

		markupSnippets = store.getSnippets('markup');
		assert.equal(markupSnippets['br'], 'br/');
		assert.equal(markupSnippets['a'], 'a[title="markup"]');
		assert.equal(markupSnippets['snip1'], 'snip[title="markup"]');

		// Set syntax-specific snippets
		store.setSnippets('html', {
			...markupSnippets,
			a: 'a.html',
			snip2: 'snip[title="html"]'
		});

		markupSnippets = store.getSnippets('markup');
		const htmlSnippets = store.getSnippets('html');

		assert.equal(markupSnippets['br'], 'br/');
		assert.equal(htmlSnippets['br'], 'br/');
		assert.equal(markupSnippets['a'], 'a[title="markup"]');
		assert.equal(htmlSnippets['a'], 'a.html');
		assert(markupSnippets['snip1']);
		assert(htmlSnippets['snip1']);
		assert(!markupSnippets['snip2']);
		assert(htmlSnippets['snip2']);

		const config = store.get().config;
		assert.deepEqual(config.globals.markup.snippets, {
			a: 'a[title="markup"]',
			snip1: 'snip[title="markup"]'
		});
		assert.deepEqual(config.syntax.html.snippets, {
			a: 'a.html',
			snip2: 'snip[title="html"]'
		});
	});
});
