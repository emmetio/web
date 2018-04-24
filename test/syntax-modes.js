'use strict';

import assert from 'assert';
import snippetNameMode from '../src/lib/snippet-name-mode';
import abbreviationMode from '../src/lib/markup-abbreviation-mode';
import StringStream from './assets/StringStream';

function _parse(str, mode) {
	const stream = new StringStream(str);
	const state = mode.startState && mode.startState();
	const tokens = [];
	let token;

	while (!stream.eol()) {
		stream.start = stream.pos;
		token = mode.token(stream, state);
		tokens.push([stream.current(), token]);
	}

	if (state.parseError) {
		throw state.parseError;
	}

	return tokens;
}

describe('Snippet Name mode', () => {
	const parse = str => _parse(str, snippetNameMode());

	it('parse' , () => {
		assert.deepEqual(parse('foo'), [['foo', 'tag']]);
		assert.deepEqual(parse('foo:bar'), [['foo:bar', 'tag']]);
		assert.deepEqual(parse('foo|bar'), [['foo', 'tag'], ['|', 'operator'], ['bar', 'tag']]);
	});

	it('detect errors', () => {
		assert.throws(() => parse('<foo'), err => err.ch === 0);
		assert.throws(() => parse('fo<o'), err => err.ch === 2);
	});
});

describe('Abbreviation mode', () => {
	const parse = str => _parse(str, abbreviationMode());

	it('parse', () => {
		assert.deepEqual(parse('foo'), [['foo', 'tag']]);
		assert.deepEqual(parse('foo.bar'), [['foo', 'tag'], ['.bar', 'attribute class']]);
		assert.deepEqual(parse('foo#bar'), [['foo', 'tag'], ['#bar', 'attribute id']]);
		assert.deepEqual(parse('.foo#bar'), [['.foo', 'attribute class'], ['#bar', 'attribute id']]);

		// console.log(parse('foo.bar'));
	});
});
