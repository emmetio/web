import assert from 'assert';
import store from '../src/lib/store';

describe('Store', () => {
	beforeEach(() => store.reset());
	const byKey = (snippets, key) => snippets.find(snippet => snippet.key === key);

	it('get snippets', () => {
		// Get global snippets
		const markupSnippets = store.getSnippets('markup');
		assert(markupSnippets.length > 0);
		assert(byKey(markupSnippets, 'a'));

		// Get syntax-specific snippets
		const htmlSnippets = store.getSnippets('html');
		assert(markupSnippets.length > 0);
		assert(byKey(markupSnippets, 'a'));
	});

	it('update snippets', () => {
		// Set global markup snippets
		let markupSnippets = store.getSnippets('markup');
		store.setSnippets('markup', markupSnippets.concat([{
			key: 'a',
			value: 'a[title="markup"]'
		}, {
			key: 'snip1',
			value: 'snip[title="markup"]'
		}]));

		markupSnippets = store.getSnippets('markup');
		assert.equal(byKey(markupSnippets, 'br').value, 'br/');
		assert.equal(byKey(markupSnippets, 'a').value, 'a[title="markup"]');
		assert.equal(byKey(markupSnippets, 'snip1').value, 'snip[title="markup"]');

		// Set syntax-specific snippets
		store.setSnippets('html', markupSnippets.concat([{
			key: 'a',
			value: 'a.html'
		}, {
			key: 'snip2',
			value: 'snip[title="html"]'
		}]));

		markupSnippets = store.getSnippets('markup');
		const htmlSnippets = store.getSnippets('html');

		assert.equal(byKey(markupSnippets, 'br').value, 'br/');
		assert.equal(byKey(htmlSnippets, 'br').value, 'br/');
		assert.equal(byKey(markupSnippets, 'a').value, 'a[title="markup"]');
		assert.equal(byKey(htmlSnippets, 'a').value, 'a.html');
		assert(byKey(markupSnippets, 'snip1'));
		assert(byKey(htmlSnippets, 'snip1'));
		assert(!byKey(markupSnippets, 'snip2'));
		assert(byKey(htmlSnippets, 'snip2'));

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
