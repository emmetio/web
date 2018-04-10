'use strict';

const reAttributeName = /^!?[\w\-:$@]+\.?$/;
const braces = {
	'(': ')',
	'[': ']',
	'{': '}'
};
const reverseBraces = {
	')': '(',
	']': '[',
	'}': '{'
};

/**
 * Emmet abbreviation parsing mode
 */
export default function() {
	return {
		startState() {
			return {
				braces: [],
				attr: 0
			};
		},
		token(stream, state) {
			// Handle braces first to exit text or attribute context as soon as possible
			if (stream.peek() in braces) {
				state.braces.push(stream.next());
				return 'bracket';
			} else if (stream.peek() in reverseBraces) {
				if (last(state.braces) === reverseBraces[stream.next()]) {
					state.braces.pop();
					return 'bracket';
				}

				return 'bracket error';
			}

			if (inAttribute(state)) {
				return parseAttribute(stream, state);
			}

			if (inText(state)) {
				return parseText(stream);
			}

			if (stream.eatWhile(ident)) {
				return 'tag';
			}

			const ch = stream.next();

			if (ch === '.') {
				stream.eatWhile(ident);
				return 'attribute class';
			}

			if (ch === '#') {
				stream.eatWhile(ident);
				return 'attribute id';
			}

			if (ch === '*') {
				stream.eatWhile(num);
				return 'number';
			}

			if (ch === '+' || ch === '>' || ch === '^' || ch === '/') {
				return 'operator';
			}

			stream.next();
			return 'error';
		}
	};
}

function ident(ch) {
	return /[a-z0-9-_$@!%]/.test(ch);
}

function num(ch) {
	return /[0-9]/.test(ch);
}

function quote(ch) {
	return ch === '"' || ch === '\'';
}

function unquoted(ch) {
	return !quote(ch) && !/[\s=[\]]/.test(ch);
}

function inAttribute(state) {
	return last(state.braces) === '[';
}

function inText(state) {
	return last(state.braces) === '{';
}

function consumeQuoted(stream) {
	if (quote(stream.peek())) {
		const ch = stream.next();

		while (!stream.eol()) {
			if (stream.eat(ch)) {
				break;
			}

			stream.eat('\\'); // Skip escaped character, e.g. \"
			stream.next();
		}

		return true;
	}

	return false;
}

/**
 * Parse abbreviation attributes from given state: a value inside `[]`
 * @param {CodeMirror.StringStream} stream
 * @param {Object} state
 */
function parseAttribute(stream, state) {
	const quotedAttr = 'string attribute-value';
	const unquotedAttr = 'string-2 attribute-value';

	if (!state.attr) {
		// No attribute state, expect name or implicit value
		if (consumeQuoted(stream)) {
			// Consumed quoted value: anonymous attribute
			return quotedAttr;
		} else if (consumeUnquoted(stream)) {
			// Consumed next word: could be either attribute name or unquoted default value
			if (!reAttributeName.test(stream.current())) {
				// Unquoted anonymous attribute
				return unquotedAttr;
			} else {
				state.attr++; // expect =
				return 'attribute attribute-name';
			}
		} else if (stream.eatSpace()) {
			return null;
		}
	} else if (state.attr === 1) {
		if (stream.eat('=')) {
			state.attr++;
			return null;
		}

		// looks like next attribute
		state.attr = 0;
		return parseAttribute(stream, state);
	} else if (state.attr === 2) {
		// Expect attribute value after '='
		state.attr = 0;
		if (consumeQuoted(stream)) {
			return quotedAttr;
		} else if (consumeUnquoted(stream)) {
			return unquotedAttr;
		}
	}

	// Unexpected state
	state.attr = 0;
	stream.next();
	return 'error';
}

/**
 * Parse abbreviation text from given state: a value inside `{}`
 * @param {CodeMirror.StringStream} stream
 */
function parseText(stream) {
	let stack = 0, ch;

	while (!stream.eol()) {
		if (stream.peek() === '}' && stack <= 0) {
			// Reached the end of text value
			break;
		}

		ch = stream.next();
		if (ch === '{') {
			stack++;
		} else if (ch === '}') {
			stack--;
		} else if (ch === '\\') {
			stream.next();
		}
	}

	return 'text';
}

function consumeUnquoted(stream) {
	return stream.eatWhile(unquoted);
}

function last(arr) {
	return arr[arr.length - 1];
}
