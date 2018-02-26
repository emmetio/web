'use strict';

/**
 * Emmet abbreviation parsing mode
 */
export default function() {
	const reAttributeName = /^\!?[\w\-:\$@]+\.?$/;

	function isIdent(ch) {
		return /[a-z0-9-_$@!%]/.test(ch);
	}

	return {
		startState() {
			return {
				group: 0,
				attr: 0,
				text: 0
			};
		},
		token(stream, state) {

		}
	};
}
