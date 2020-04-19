import fs from 'fs';
import path from 'path';
import endorphin from '@endorphinjs/rollup-plugin-endorphin';
import sass from 'node-sass';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: './src/main.ts',
    output: {
        sourcemap: true,
        dir: './out',
        assetFileNames: `[name][extname]`,
        format: 'iife'
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        json(),
        typescript(),
        endorphin({
            css: {
                name: 'emmet.css',
                preprocess(type, data, file) {
                    // Detect stylesheet type: CSS, SCSS etc.
                    // Detect it either from `type` argument (a `type="..." attribute
                    // value of tag that contains stylesheet) or from file name
                    // (for external stylesheets)
                    if (type === 'scss' || (file && file.endsWith('.scss'))) {
                        return sass.renderSync({
                            data, file,

                            // Required for proper source map generation
                            outFile: file,
                            sourceMap: true,
                            sourceMapContents: true
                        });
                    }

                    return data;
                }
            }
        })
    ]
};

function json() {
    return {
        load(id) {
            if (path.extname(id) === '.json') {
                return 'export default ' + fs.readFileSync(id);
            }
        }
    };
}
