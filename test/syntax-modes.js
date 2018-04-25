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

// These are unit-test samples from Emmet abbreviation parser
describe('Abbreviation mode', () => {
	const parse = str => _parse(str, abbreviationMode());

	it('simple', () => {
		assert.deepEqual(parse('foo'), [['foo', 'tag']]);
		assert.deepEqual(parse('foo.bar'), [['foo', 'tag'], ['.bar', 'attribute class']]);
		assert.deepEqual(parse('foo#bar'), [['foo', 'tag'], ['#bar', 'attribute id']]);
		assert.deepEqual(parse('.foo#bar'), [['.foo', 'attribute class'], ['#bar', 'attribute id']]);
		assert.deepEqual(parse('.foo.bar'), [['.foo', 'attribute class'], ['.bar', 'attribute class']]);
		assert.deepEqual(parse('.foo_bar'), [['.foo_bar', 'attribute class']]);
		assert.deepEqual(parse('.'), [['.', 'attribute class']]);
		assert.deepEqual(parse('.#'), [['.', 'attribute class'], ['#', 'attribute id']]);
	});

	it('with attributes', () => {
		assert.deepEqual(parse('div[foo=bar]'), [
			['div', 'tag'],
			['[', 'bracket'],
			['foo', 'attribute attribute-name'],
			['=', null],
			['bar', 'string-2 attribute-value'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('div.a[b=c]'), [
			['div', 'tag'],
			['.a', 'attribute class'],
			['[', 'bracket'],
			['b', 'attribute attribute-name'],
			['=', null],
			['c', 'string-2 attribute-value'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('div[b=c].a'), [
			['div', 'tag'],
			['[', 'bracket'],
			['b', 'attribute attribute-name'],
			['=', null],
			['c', 'string-2 attribute-value'],
			[']', 'bracket'],
			['.a', 'attribute class']
		]);

		assert.deepEqual(parse('div[a=b][c="d"]'), [
			['div', 'tag'],
			['[', 'bracket'],
			['a', 'attribute attribute-name'],
			['=', null],
			['b', 'string-2 attribute-value'],
			[']', 'bracket'],
			['[', 'bracket'],
			['c', 'attribute attribute-name'],
			['=', null],
			['"d"', 'string attribute-value'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('[a=b]'), [
			['[', 'bracket'],
			['a', 'attribute attribute-name'],
			['=', null],
			['b', 'string-2 attribute-value'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('.a[b=c]'), [
			['.a', 'attribute class'],
			['[', 'bracket'],
			['b', 'attribute attribute-name'],
			['=', null],
			['c', 'string-2 attribute-value'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('[b=c].a#d'), [
			['[', 'bracket'],
			['b', 'attribute attribute-name'],
			['=', null],
			['c', 'string-2 attribute-value'],
			[']', 'bracket'],
			['.a', 'attribute class'],
			['#d', 'attribute id']
		]);

		assert.deepEqual(parse('[b=c]a'), [
			['[', 'bracket'],
			['b', 'attribute attribute-name'],
			['=', null],
			['c', 'string-2 attribute-value'],
			[']', 'bracket'],
			['a', 'tag']
		]);

		assert.deepEqual(parse('[a]'), [['[', 'bracket'], ['a', 'attribute attribute-name'], [']', 'bracket']]);
		assert.deepEqual(parse('[a b c]'), [
			['[', 'bracket'],
			['a', 'attribute attribute-name'],
			[' ', null],
			['b', 'attribute attribute-name'],
			[' ', null],
			['c', 'attribute attribute-name'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('[a=b c= d=e]'), [
			['[', 'bracket'],
			['a', 'attribute attribute-name'],
			['=', null],
			['b', 'string-2 attribute-value'],
			[' ', null],
			['c', 'attribute attribute-name'],
			['=', null],
			[' ', null],
			['d', 'attribute attribute-name'],
			['=', null],
			['e', 'string-2 attribute-value'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('[a=b.c d=тест]'), [
			['[', 'bracket'],
			['a', 'attribute attribute-name'],
			['=', null],
			['b.c', 'string-2 attribute-value'],
			[' ', null],
			['d', 'attribute attribute-name'],
			['=', null],
			['тест', 'string-2 attribute-value'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('[a="b" c=\'d\' e=""]'), [
			['[', 'bracket'],
			['a', 'attribute attribute-name'],
			['=', null],
			['"b"', 'string attribute-value'],
			[' ', null],
			['c', 'attribute attribute-name'],
			['=', null],
			['\'d\'', 'string attribute-value'],
			[' ', null],
			['e', 'attribute attribute-name'],
			['=', null],
			['""', 'string attribute-value'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('[a="foo\'bar" b=\'foo"bar\' c="foo\\"bar"]'), [
			['[', 'bracket'],
			['a', 'attribute attribute-name'],
			['=', null],
			['"foo\'bar"', 'string attribute-value'],
			[' ', null],
			['b', 'attribute attribute-name'],
			['=', null],
			['\'foo"bar\'', 'string attribute-value'],
			[' ', null],
			['c', 'attribute attribute-name'],
			['=', null],
			['"foo\\"bar"', 'string attribute-value'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('[a. b.]'), [
			['[', 'bracket'],
			['a', 'attribute attribute-name'],
			['.', 'operator'],
			[' ', null],
			['b', 'attribute attribute-name'],
			['.', 'operator'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('[foo={1 + 2} bar={fn(1, "foo")}]'), [
			['[', 'bracket'],
			['foo', 'attribute attribute-name'],
			['=', null],
			['{1 + 2}', 'variable-3 attribute-value'],
			[' ', null],
			['bar', 'attribute attribute-name'],
			['=', null],
			['{fn(1, "foo")}', 'variable-3 attribute-value'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('[name=${1} value=${2:test}]'), [
			['[', 'bracket'],
			['name', 'attribute attribute-name'],
			['=', null],
			['${1}', 'string-2 attribute-value'],
			[' ', null],
			['value', 'attribute attribute-name'],
			['=', null],
			['${2:test}', 'string-2 attribute-value'],
			[']', 'bracket']
		]);
	});

	it('with text node', () => {
		assert.deepEqual(parse('div{foo}'), [['div', 'tag'], ['{', 'bracket'], ['foo', 'text'], ['}', 'bracket']]);
		assert.deepEqual(parse('{foo}'), [['{', 'bracket'], ['foo', 'text'], ['}', 'bracket']]);
		assert.deepEqual(parse('{a b c}'), [['{', 'bracket'], ['a b c', 'text'], ['}', 'bracket']]);
		assert.deepEqual(parse('{a "b c"}'), [['{', 'bracket'], ['a "b c"', 'text'], ['}', 'bracket']]);
		assert.deepEqual(parse('{isn\'t bad}'), [['{', 'bracket'], ['isn\'t bad', 'text'], ['}', 'bracket']]);
		assert.deepEqual(parse('{foo(a => {return "b"});}'), [['{', 'bracket'], ['foo(a => {return "b"});', 'text'], ['}', 'bracket']]);
		assert.deepEqual(parse('{foo(a => {return "b\\}"});}'), [['{', 'bracket'], ['foo(a => {return "b\\}"});', 'text'], ['}', 'bracket']]);
		assert.deepEqual(parse('{foo\\}bar}'), [['{', 'bracket'], ['foo\\}bar', 'text'], ['}', 'bracket']]);
		assert.deepEqual(parse('{foo\\{bar\\}baz}'), [['{', 'bracket'], ['foo\\{bar\\}baz', 'text'], ['}', 'bracket']]);
		// assert.deepEqual(parse('{foo\\"}bar}'), [['{', 'bracket'], ['foo\\"}bar', 'text'], ['}', 'bracket']]);
	});

	it('mixed', () => {
		assert.deepEqual(parse('div.foo{bar}'), [
			['div', 'tag'],
			['.foo', 'attribute class'],
			['{', 'bracket'],
			['bar', 'text'],
			['}', 'bracket']
		]);

		assert.deepEqual(parse('.foo{bar}#baz'), [
			['.foo', 'attribute class'],
			['{', 'bracket'],
			['bar', 'text'],
			['}', 'bracket'],
			['#baz', 'attribute id']
		]);

		assert.deepEqual(parse('.foo[b=c]{bar}'), [
			['.foo', 'attribute class'],
			['[', 'bracket'],
			['b', 'attribute attribute-name'],
			['=', null],
			['c', 'string-2 attribute-value'],
			[']', 'bracket'],
			['{', 'bracket'],
			['bar', 'text'],
			['}', 'bracket'],
		]);
	});

	it('repeated', () => {
		assert.deepEqual(parse('div.foo*3'), [
			['div', 'tag'],
			['.foo', 'attribute class'],
			['*3', 'number']
		]);

		assert.deepEqual(parse('.a[b=c]*10'), [
			['.a', 'attribute class'],
			['[', 'bracket'],
			['b', 'attribute attribute-name'],
			['=', null],
			['c', 'string-2 attribute-value'],
			[']', 'bracket'],
			['*10', 'number']
		]);

		assert.deepEqual(parse('.a*10[b=c]'), [
			['.a', 'attribute class'],
			['*10', 'number'],
			['[', 'bracket'],
			['b', 'attribute attribute-name'],
			['=', null],
			['c', 'string-2 attribute-value'],
			[']', 'bracket']
		]);

		assert.deepEqual(parse('.a*10{text}'), [
			['.a', 'attribute class'],
			['*10', 'number'],
			['{', 'bracket'],
			['text', 'text'],
			['}', 'bracket']
		]);

		assert.deepEqual(parse('*123foo'), [['*123', 'number'], ['foo', 'tag']]);
		assert.deepEqual(parse('*'), [['*', 'number']]);
	});

	it('self-closing', () => {
		assert.deepEqual(parse('div/'), [['div', 'tag'], ['/', 'operator']]);
		assert.deepEqual(parse('.foo/'), [['.foo', 'attribute class'], ['/', 'operator']]);

		assert.deepEqual(parse('.foo[bar]/'), [
			['.foo', 'attribute class'],
			['[', 'bracket'],
			['bar', 'attribute attribute-name'],
			[']', 'bracket'],
			['/', 'operator']
		]);

		assert.deepEqual(parse('.foo/*3'), [
			['.foo', 'attribute class'],
			['/', 'operator'],
			['*3', 'number']
		]);

		assert.deepEqual(parse('.foo*3/'), [
			['.foo', 'attribute class'],
			['*3', 'number'],
			['/', 'operator']
		]);
	});
});
