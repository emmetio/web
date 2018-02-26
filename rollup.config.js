'use strict';

import svelte from 'rollup-plugin-svelte';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'postcss';

const cssProc = postcss();

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		file: 'out/main.js',
		format: 'iife'
	},
	plugins: [
		nodeResolve(),
		commonjs(),
		svelte({
			generate: 'dom',
			dev: process.env.NODE_ENV !== 'production',
			cascade: false,
			preprocess: {
				style({ content, filename }) {
					return cssProc.process(content, { from: filename }).then(result => ({
						code: result.css,
						map: result.map
					}));
				}
			},
			css(css) {
				css.write('out/main.css');
			}
		})
	]
};
