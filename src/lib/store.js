'use strict';

import { Store } from 'svelte/store';

export default new Store({
	syntaxes: [
		{ id: 'html', name: 'HTML', mime: 'text/html' },
		{ id: 'xml', name: 'XML', mime: 'text/xml' },
		{ id: 'css', name: 'CSS', mime: 'text/css' },
		{ id: 'sass', name: 'SASS', mime: 'text/x-sass' },
		{ id: 'jsx', name: 'JSX', mime: 'text/jsx' },
		{ id: 'slim', name: 'Slim', mime: 'text/x-slim' },
		{ id: 'haml', name: 'HAML', mime: 'text/x-haml' },
		{ id: 'pug', name: 'Pug', mime: 'text/x-pug' }
	]
});
