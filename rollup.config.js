'use strict';

import svelte from 'rollup-plugin-svelte';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import bubleRollup from 'rollup-plugin-buble';
import buble from 'buble';
import postcss from 'postcss';

const cssProc = postcss();
const bubleOptions = {
	target: { chrome: 50 },
	transforms: {
		modules: false
	},
	objectAssign: 'Object.assign'
};

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		file: 'out/app.js',
		format: 'iife'
	},
	plugins: [
		nodeResolve(),
		svelte({
			generate: 'dom',
			dev: process.env.NODE_ENV !== 'production',
			cascade: false,
			preprocess: {
				script({ content, filename }) {
					return buble.transform(content, Object.assign({
						source: filename
					}, bubleOptions));
				},
				style({ content, filename }) {
					return cssProc.process(content, { from: filename }).then(result => ({
						code: result.css,
						map: result.map
					}));
				}
			},
			css(css) {
				css.write('out/app.css');
			}
		}),
		bubleRollup(Object.assign({
			// Run Buble on non-Svelte local files since Svelte and npm modules
			// are already processed
			include: 'src/**/*.js'
		}, bubleOptions)),
		commonjs()
	]
};
