'use strict';

/**
 * Emmet snippet name parsing mode
 */
export default function () {
	return {
		startState() {
			return {
				parseError: null
			};
		},

		token(stream, state) {
			if (!state.parseError) {
				if (stream.eatWhile(ident)) {
					return 'tag';
				}

				if (stream.eat(separator)) {
					return 'operator';
				}
			}

			state.parseError = new Error('Unexpected character');
			state.parseError.ch = stream.pos;

			while (!stream.eol()) {
				stream.next();
			}

			return 'error';
		}
	};
}

function ident(ch) {
	return /[a-z0-9-_$@!%:]/.test(ch);
}

function separator(ch) {
	return ch === '|';
}
