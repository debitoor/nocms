import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	plugins: [
		babel(),
		nodeResolve({
			jsnext: true,
			main: true
		}),
		commonjs({
			include: 'node_modules/**'
		}),
		uglify()
	]
};