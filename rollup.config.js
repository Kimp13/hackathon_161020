import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import postcss from "rollup-plugin-postcss";
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import config from 'sapper/config/rollup.js';
import pkg from './package.json';

import path from 'path';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const onwarn = (warning, onwarn) =>
	(warning.code === 'MISSING_EXPORT' && /'preload'/.test(warning.message)) ||
	(warning.code === 'CIRCULAR_DEPENDENCY' && /[/\\]@sapper[/\\]/.test(warning.message)) ||
  onwarn(warning);
  
/**
 * svelte-preprocess
 */
const preprocess = sveltePreprocess({
  sass: {
    includePaths: ['./src/theme']
  }
});

const aliases = () => ({
  resolve: [".svelte", ".js", ".scss", ".css"],
  entries: [
    {
      find: /^@smui\/([^\/]+)$/,
      replacement: path.resolve(
        __dirname,
        "node_modules",
        "@smui",
        "$1",
        "index.js"
      )
    },
    {
      find: /^@smui\/([^\/]+)\/(.*)$/,

      replacement: path.resolve(__dirname, "node_modules", "@smui", "$1", "$2")
    }
  ]
});

const postcssConfig = () => ({
  extensions: [".scss", ".sass"],
  extract: false,
  minimize: true,
  use: [
    [
      "sass",
      {
        includePaths: [
          "./src/theme",
          "./node_modules",
          // This is only needed because we're using a local module. :-/
          // Normally, you would not need this line.
          path.resolve(__dirname, "..", "node_modules")
        ]
      }
    ]
  ]
});

export default {
	client: {
		input: config.client.input(),
		output: config.client.output(),
		plugins: [
      alias(aliases()),
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			svelte({
				dev,
				hydratable: true,
        emitCss: false,
        css: true,
        preprocess
			}),
			resolve({
				browser: true,
				dedupe: ['svelte']
			}),
			commonjs(),
      postcss(postcssConfig()),

			legacy && babel({
				extensions: ['.js', '.mjs', '.html', '.svelte'],
				babelHelpers: 'runtime',
				exclude: ['node_modules/@babel/**'],
				presets: [
					['@babel/preset-env', {
						targets: '> 0.25%, not dead'
					}]
				],
				plugins: [
					'@babel/plugin-syntax-dynamic-import',
					['@babel/plugin-transform-runtime', {
						useESModules: true
					}]
				]
			}),

			!dev && terser({
				module: true
			})
		],

		preserveEntrySignatures: false,
		onwarn,
	},

	server: {
		input: config.server.input(),
		output: config.server.output(),
		plugins: [
      alias(aliases()),
			replace({
				'process.browser': false,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			svelte({
				generate: 'ssr',
        hydratable: true,
        emitCss: false,
        css: true,
        dev,
        preprocess
			}),
			resolve({
				dedupe: ['svelte']
			}),
      commonjs(),
      postcss(postcssConfig())
		],
		external: Object.keys(pkg.dependencies).concat(require('module').builtinModules),

		preserveEntrySignatures: 'strict',
		onwarn,
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		plugins: [
			resolve(),
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			commonjs(),
			!dev && terser()
		],

		preserveEntrySignatures: false,
		onwarn,
	}
};
