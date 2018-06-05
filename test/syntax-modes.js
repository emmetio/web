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
			['[', 'bracket open'],
			['foo', 'attribute attribute-name'],
			['=', 'operator'],
			['bar', 'string-2 attribute-value'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('div.a[b=c]'), [
			['div', 'tag'],
			['.a', 'attribute class'],
			['[', 'bracket open'],
			['b', 'attribute attribute-name'],
			['=', 'operator'],
			['c', 'string-2 attribute-value'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('div[b=c].a'), [
			['div', 'tag'],
			['[', 'bracket open'],
			['b', 'attribute attribute-name'],
			['=', 'operator'],
			['c', 'string-2 attribute-value'],
			[']', 'bracket close'],
			['.a', 'attribute class']
		]);

		assert.deepEqual(parse('div[a=b][c="d"]'), [
			['div', 'tag'],
			['[', 'bracket open'],
			['a', 'attribute attribute-name'],
			['=', 'operator'],
			['b', 'string-2 attribute-value'],
			[']', 'bracket close'],
			['[', 'bracket open'],
			['c', 'attribute attribute-name'],
			['=', 'operator'],
			['"d"', 'string attribute-value'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('[a=b]'), [
			['[', 'bracket open'],
			['a', 'attribute attribute-name'],
			['=', 'operator'],
			['b', 'string-2 attribute-value'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('.a[b=c]'), [
			['.a', 'attribute class'],
			['[', 'bracket open'],
			['b', 'attribute attribute-name'],
			['=', 'operator'],
			['c', 'string-2 attribute-value'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('[b=c].a#d'), [
			['[', 'bracket open'],
			['b', 'attribute attribute-name'],
			['=', 'operator'],
			['c', 'string-2 attribute-value'],
			[']', 'bracket close'],
			['.a', 'attribute class'],
			['#d', 'attribute id']
		]);

		assert.deepEqual(parse('[b=c]a'), [
			['[', 'bracket open'],
			['b', 'attribute attribute-name'],
			['=', 'operator'],
			['c', 'string-2 attribute-value'],
			[']', 'bracket close'],
			['a', 'tag']
		]);

		assert.deepEqual(parse('[a]'), [['[', 'bracket open'], ['a', 'attribute attribute-name'], [']', 'bracket close']]);
		assert.deepEqual(parse('[a b c]'), [
			['[', 'bracket open'],
			['a', 'attribute attribute-name'],
			[' ', null],
			['b', 'attribute attribute-name'],
			[' ', null],
			['c', 'attribute attribute-name'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('[a=b c= d=e]'), [
			['[', 'bracket open'],
			['a', 'attribute attribute-name'],
			['=', 'operator'],
			['b', 'string-2 attribute-value'],
			[' ', null],
			['c', 'attribute attribute-name'],
			['=', 'operator'],
			[' ', null],
			['d', 'attribute attribute-name'],
			['=', 'operator'],
			['e', 'string-2 attribute-value'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('[a=b.c d=тест]'), [
			['[', 'bracket open'],
			['a', 'attribute attribute-name'],
			['=', 'operator'],
			['b.c', 'string-2 attribute-value'],
			[' ', null],
			['d', 'attribute attribute-name'],
			['=', 'operator'],
			['тест', 'string-2 attribute-value'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('[a="b" c=\'d\' e=""]'), [
			['[', 'bracket open'],
			['a', 'attribute attribute-name'],
			['=', 'operator'],
			['"b"', 'string attribute-value'],
			[' ', null],
			['c', 'attribute attribute-name'],
			['=', 'operator'],
			['\'d\'', 'string attribute-value'],
			[' ', null],
			['e', 'attribute attribute-name'],
			['=', 'operator'],
			['""', 'string attribute-value'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('[a="foo\'bar" b=\'foo"bar\' c="foo\\"bar"]'), [
			['[', 'bracket open'],
			['a', 'attribute attribute-name'],
			['=', 'operator'],
			['"foo\'bar"', 'string attribute-value'],
			[' ', null],
			['b', 'attribute attribute-name'],
			['=', 'operator'],
			['\'foo"bar\'', 'string attribute-value'],
			[' ', null],
			['c', 'attribute attribute-name'],
			['=', 'operator'],
			['"foo\\"bar"', 'string attribute-value'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('[a. b.]'), [
			['[', 'bracket open'],
			['a', 'attribute attribute-name'],
			['.', 'operator'],
			[' ', null],
			['b', 'attribute attribute-name'],
			['.', 'operator'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('[foo={1 + 2} bar={fn(1, "foo")}]'), [
			['[', 'bracket open'],
			['foo', 'attribute attribute-name'],
			['=', 'operator'],
			['{1 + 2}', 'variable-3 attribute-value'],
			[' ', null],
			['bar', 'attribute attribute-name'],
			['=', 'operator'],
			['{fn(1, "foo")}', 'variable-3 attribute-value'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('[name=${1} value=${2:test}]'), [
			['[', 'bracket open'],
			['name', 'attribute attribute-name'],
			['=', 'operator'],
			['${1}', 'variable-3 attribute-value'],
			[' ', null],
			['value', 'attribute attribute-name'],
			['=', 'operator'],
			['${2:test}', 'variable-3 attribute-value'],
			[']', 'bracket close']
		]);
	});

	it('with text node', () => {
		assert.deepEqual(parse('div{foo}'), [['div', 'tag'], ['{', 'bracket open'], ['foo', 'text'], ['}', 'bracket close']]);
		assert.deepEqual(parse('{foo}'), [['{', 'bracket open'], ['foo', 'text'], ['}', 'bracket close']]);
		assert.deepEqual(parse('{a b c}'), [['{', 'bracket open'], ['a b c', 'text'], ['}', 'bracket close']]);
		assert.deepEqual(parse('{a "b c"}'), [['{', 'bracket open'], ['a "b c"', 'text'], ['}', 'bracket close']]);
		assert.deepEqual(parse('{isn\'t bad}'), [['{', 'bracket open'], ['isn\'t bad', 'text'], ['}', 'bracket close']]);
		assert.deepEqual(parse('{foo(a => {return "b"});}'), [['{', 'bracket open'], ['foo(a => {return "b"});', 'text'], ['}', 'bracket close']]);
		assert.deepEqual(parse('{foo(a => {return "b\\}"});}'), [['{', 'bracket open'], ['foo(a => {return "b\\}"});', 'text'], ['}', 'bracket close']]);
		assert.deepEqual(parse('{foo\\}bar}'), [['{', 'bracket open'], ['foo\\}bar', 'text'], ['}', 'bracket close']]);
		assert.deepEqual(parse('{foo\\{bar\\}baz}'), [['{', 'bracket open'], ['foo\\{bar\\}baz', 'text'], ['}', 'bracket close']]);
		// assert.deepEqual(parse('{foo\\"}bar}'), [['{', 'bracket'], ['foo\\"}bar', 'text'], ['}', 'bracket']]);
	});

	it('mixed', () => {
		assert.deepEqual(parse('div.foo{bar}'), [
			['div', 'tag'],
			['.foo', 'attribute class'],
			['{', 'bracket open'],
			['bar', 'text'],
			['}', 'bracket close']
		]);

		assert.deepEqual(parse('.foo{bar}#baz'), [
			['.foo', 'attribute class'],
			['{', 'bracket open'],
			['bar', 'text'],
			['}', 'bracket close'],
			['#baz', 'attribute id']
		]);

		assert.deepEqual(parse('.foo[b=c]{bar}'), [
			['.foo', 'attribute class'],
			['[', 'bracket open'],
			['b', 'attribute attribute-name'],
			['=', 'operator'],
			['c', 'string-2 attribute-value'],
			[']', 'bracket close'],
			['{', 'bracket open'],
			['bar', 'text'],
			['}', 'bracket close'],
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
			['[', 'bracket open'],
			['b', 'attribute attribute-name'],
			['=', 'operator'],
			['c', 'string-2 attribute-value'],
			[']', 'bracket close'],
			['*10', 'number']
		]);

		assert.deepEqual(parse('.a*10[b=c]'), [
			['.a', 'attribute class'],
			['*10', 'number'],
			['[', 'bracket open'],
			['b', 'attribute attribute-name'],
			['=', 'operator'],
			['c', 'string-2 attribute-value'],
			[']', 'bracket close']
		]);

		assert.deepEqual(parse('.a*10{text}'), [
			['.a', 'attribute class'],
			['*10', 'number'],
			['{', 'bracket open'],
			['text', 'text'],
			['}', 'bracket close']
		]);

		assert.deepEqual(parse('*123foo'), [['*123', 'number'], ['foo', 'tag']]);
		assert.deepEqual(parse('*'), [['*', 'number']]);
	});

	it('self-closing', () => {
		assert.deepEqual(parse('div/'), [['div', 'tag'], ['/', 'operator']]);
		assert.deepEqual(parse('.foo/'), [['.foo', 'attribute class'], ['/', 'operator']]);

		assert.deepEqual(parse('.foo[bar]/'), [
			['.foo', 'attribute class'],
			['[', 'bracket open'],
			['bar', 'attribute attribute-name'],
			[']', 'bracket close'],
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

	it('errors', () => {
		assert.throws(() => parse('a<'), err => err.ch === 1);
		assert.throws(() => parse('foo[bar'), err => err.ch === 3);
		assert.throws(() => parse('foo(bar'), err => err.ch === 3);
		assert.throws(() => parse('foo[bar)'), err => err.ch === 7);
		assert.throws(() => parse('foo[bar="baz]'), err => err.ch === 8);
	});
});
