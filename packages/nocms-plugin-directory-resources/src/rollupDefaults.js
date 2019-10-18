import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import postcss from 'rollup-plugin-postcss';

const inputOptions = {
	plugins: [
		postcss({
			extract: false,
			modules: true,
			use: ['sass'],
		}),
		babel({
			presets: [
				[
					'@babel/preset-env',
					{
						targets: {
							chrome: '58',
							ie: '11'
						}
					}
				]
			],
			plugins: [
				[
					'@babel/plugin-transform-react-jsx', {
						pragma: 'h',
						pragmaFrag: 'Preact.Fragment'
					}
				]
			]
		}),
		nodeResolve({
			jsnext: false,
			main: true
		}),
		commonjs({
			include: 'node_modules/**'
		}),
		replace({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
		uglify()
	]
};

const outputOptions = {
	format: 'iife',
	strict: false
};

export default {
	inputOptions,
	outputOptions
};
