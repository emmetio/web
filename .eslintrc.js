module.exports = {
    "env": {
        "es6": true,
		"browser": true,
		"node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
		"ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
		"no-cond-assign": "off",
		"no-empty": [
			"error",
			{ "allowEmptyCatch": true }
		],
		"no-console": "warn"
	},
	"plugins": ["html"],
	"settings": {
		"html/html-extensions": [".html", ".svelte"]
	}
};
