import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import css from 'rollup-plugin-css-only';
import json from '@rollup/plugin-json'
import livereload from 'rollup-plugin-livereload';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';

require('dotenv').config();

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	onwarn(warning, warn) {
		// suppress eval warnings
		if (warning.code === 'EVAL') return
		warn(warning)
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess({ sourceMap: !production }),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),
		json({
			compact: true
		}),
		
		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload({
			watch: 'public',
			delay: 500,
		}),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),

		copy({
			targets: [
				{ src: 'node_modules/aws-amplify/dist/aws-amplify.min.js', dest: 'public/build' },
				{ src: 'node_modules/aws-amplify/dist/aws-amplify.min.js.map', dest: 'public/build' },
			]
		}),

		replace({
			preventAssignment: true,
			'process.env': JSON.stringify({
				auth_driver: process.env.auth_driver,
				cognito_domain: process.env.cognito_domain,
				cognito_client_id: process.env.cognito_client_id,
				cognito_pools_id: process.env.cognito_pools_id,
				cognito_region: process.env.cognito_region,
				api_base: process.env.api_base,
				language: process.env.language,
			}),
		}),
	],
	watch: {
		clearScreen: false
	}
};
