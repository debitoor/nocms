const mochaEslint = require('mocha-eslint');

mochaEslint([
	'../dist/index.js',
	'./test/**/*.js'
]);
