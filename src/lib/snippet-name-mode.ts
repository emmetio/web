import { Mode } from 'codemirror';

interface SnippetModeState {
	parseError?: ParseModeError;
}

/**
 * Emmet snippet name parsing mode
 */
export default function snippetNameMode(): Mode<SnippetModeState> {
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

function ident(ch: string): boolean {
	return /[a-zA-Z0-9-_$@!%:]/.test(ch);
}

function separator(ch: string): boolean {
	return ch === '|';
}
