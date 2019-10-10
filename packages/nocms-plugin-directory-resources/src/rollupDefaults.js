import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';

const inputOptions = {
	plugins: [
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
