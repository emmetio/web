require('reify');

// Enable recent ECMA features support like object spread
const acornParser = require('reify/lib/parsers/acorn');
acornParser.options.ecmaVersion = 9;
