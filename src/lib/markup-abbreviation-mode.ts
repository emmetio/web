import { Mode, StringStream } from 'codemirror';

interface BraceStackItem {
	pos: number;
	brace: string;
}

interface EmmetModeState {
	braces: BraceStackItem[],
	attr: number,
	quote?: string,
	parseError?: ParseModeError
}

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
export default function emmetAbbreviationMode(): Mode<EmmetModeState> {
	return {
		startState() {
			return {
				braces: [],
				attr: 0,
				quote: null,
				parseError: null
			};
		},
		token(stream, state) {
			const t = getToken(stream, state);
			if (t === undefined) {
				return unexpectedCharacter(stream, state);
			}

			// Report if closing braces are missing at the end of abbreviation
			if (stream.eol() && state.braces.length && !state.parseError) {
				const pos = last(state.braces).pos;
				state.parseError = error(`No closing brace at ${pos}`, stream);
				state.parseError.ch = pos;
				return 'error';
			}

			return t;
		}
	};
}

/**
 * Consumes token from given stream
 */
function getToken(stream: StringStream, state: EmmetModeState): string {
	// Handle braces first to exit text or attribute context as soon as possible
	const next = stream.peek();
	if (next in braces && !inAttribute(state)) {
		state.braces.push({
			pos: stream.pos,
			brace: stream.next()
		});
		return 'bracket open';
	}

	if (isReverseBrace(next) && lastBrace(state) === reverseBraces[next]) {
		state.braces.pop();
		stream.next();
		return 'bracket close';
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

	if (stream.eat('.')) {
		stream.eatWhile(ident);
		return 'attribute class';
	}

	if (stream.eat('#')) {
		stream.eatWhile(ident);
		return 'attribute id';
	}

	if (stream.eat('*')) {
		stream.eatWhile(num);
		return 'number';
	}

	if (stream.eat(/[+>^/]/)) {
		return 'operator';
	}
}

function ident(ch: string) {
	return /[a-z0-9-_$@!%:]/.test(ch);
}

function num(ch: string) {
	return /[0-9]/.test(ch);
}

function quote(ch: string) {
	return ch === '"' || ch === '\'';
}

function unquoted(ch: string) {
	return !quote(ch) && !/[\s=[[\](){}]/.test(ch);
}

function inAttribute(state: EmmetModeState) {
	return lastBrace(state) === '[';
}

function inText(state: EmmetModeState) {
	return lastBrace(state) === '{';
}

function lastBrace(state: EmmetModeState): string | void {
	const obj = last(state.braces);
	return obj && obj.brace;
}

/**
 * Consumes quoted string and returns parsed token name, if possible
 */
function consumeQuoted(stream: StringStream, state: EmmetModeState): string {
	if (quote(stream.peek())) {
		const start = stream.pos;
		const ch = stream.next();

		while (!stream.eol()) {
			if (stream.eat(ch)) {
				stream.start = start;
				return 'string';
			}

			stream.eat('\\'); // Skip escaped character, e.g. \"
			stream.next();
		}

		// If reached here then string has no closing quote
		state.parseError = error('No matching closing quote', stream);
		state.parseError.ch = start;

		return 'string error';
	}
}

/**
 * Consumes unquoted string and returns parsed token name, if possible
 */
function consumeUnquoted(stream: StringStream): string {
	const start = stream.pos;
	if (stream.eatWhile(unquoted)) {
		stream.start = start;
		return 'string-2';
	}
}

/**
 * Parse abbreviation attributes from given state: a value inside `[]`
 */
function parseAttribute(stream: StringStream, state: EmmetModeState): string {
	const attrValue = 'attribute-value';
	let token;

	if (!state.attr) {
		// No attribute state, expect name or implicit value
		if (stream.eatSpace()) {
			return null;
		}

		if (stream.eat('!')) {
			// implied default attribute
			return 'operator';
		}

		if (token = consumeQuoted(stream, state)) {
			// Consumed quoted value: anonymous attribute
			return `${token} ${attrValue}`;
		}

		if (token = consumeUnquoted(stream)) {
			// Consumed next word: could be either attribute name or unquoted default value
			const value = stream.current();
			if (reAttributeName.test(value)) {
				// Attribute name
				if (value[value.length - 1] === '.') {
					// Default attribute, delegate parsing of `.` to next call
					stream.backUp(1);
				}
				state.attr++; // expect =
				return 'attribute attribute-name';
			}

			// Unquoted anonymous attribute
			return `${token} ${attrValue}`;
		}
	} else if (state.attr === 1) {
		if (stream.eat('=')) {
			// Check for unexpected (but valid) empty attribute value
			if (/\s|\]/.test(stream.peek())) {
				state.attr = 0;
			} else {
				state.attr++;
			}

			return 'operator';
		}

		if (stream.eat('.')) {
			// Boolean attribute
			state.attr = 0;
			return 'operator';
		}

		// looks like next attribute
		state.attr = 0;
		return parseAttribute(stream, state);
	} else if (state.attr === 2) {
		// Expect attribute value after '='
		state.attr = 0;
		if (token = reactExpression(stream, state)
			|| fieldExpression(stream, state)
			|| consumeQuoted(stream, state)
			|| consumeUnquoted(stream)) {
			return `${token} ${attrValue}`;
		}
	}

	// Unexpected state
	state.attr = 0;
	state.parseError = error('Expected attribute value', stream);
}

/**
 * Parse abbreviation text from given state: a value inside `{}`
 */
function parseText(stream: StringStream): string {
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

/**
 * Consumes React-like expression: an attribute value in curly braces
 */
function reactExpression(stream: StringStream, state: EmmetModeState): string {
	if (stream.eat('{')) {
		let stack = 1, ch;

		while (!stream.eol()) {
			ch = stream.next();
			if (ch === '{') {
				stack++;
			} else if (ch === '}') {
				if (--stack === 0) {
					return 'variable-3';
				}
			} else if (ch === '\\') {
				stream.next();
			}
		}

		state.parseError = error('Expecting closing }', stream);

		return 'error';
	}
}

/**
 * Consumes field expression: an attribute value as `${...}`
 */
function fieldExpression(stream: StringStream, state: EmmetModeState): string {
	if (stream.eat('$') && reactExpression(stream, state)) {
		return 'variable-3';
	}
}

function unexpectedCharacter(stream: StringStream, state: EmmetModeState): string {
	state.parseError = error('Unexpected character at ' + stream.pos, stream);

	while (!stream.eol()) {
		stream.next();
	}

	return 'error';
}

function error(message: string, stream: StringStream): ParseModeError {
	const err = new Error(message) as ParseModeError;
	err.ch = stream.pos;
	return err;
}

function last<T>(arr: T[]): T {
	return arr[arr.length - 1];
}

function isReverseBrace(ch: string): ch is keyof typeof reverseBraces {
	return ch in reverseBraces;
}
