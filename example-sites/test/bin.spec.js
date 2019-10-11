const path = require('path');
const execFileSync = require('child_process').execFileSync;
const dirCompare = require('dir-compare');
const assert = require('assert');

const sites = {
	'./test/sites/site-with-one-page-and-a-script': 0,
	'./test/sites/site-with-one-page-and-no-layout': 0,
	'./test/sites/site-with-one-page-and-a-hidden-directory': 0,
	'./test/sites/site-with-many-pages': 0,
	'./test/sites/site-with-one-page-and-four-variants': 0,
	'./test/sites/site-with-invalid-pug-file': 1,
	'./test/sites/site-with-one-page-and-a-script': 0
};

describe('bin', () => {
	Object.keys(sites).forEach(site => {
		describeSite(site, sites[site]);
	});
});

function describeSite (site, expectedCode) {
	describe(site, () => {
		let actualCode;
		let comparison;
		let actualDir = path.join(site, 'actual').split(path.sep).join('/');
		let expectedDir = path.join(site, 'expected').split(path.sep).join('/');
		let srcDir = path.join(site, 'src').split(path.sep).join('/');

		before(() => {
			try {
				execFileSync('node', ['./node_modules/nocms/bin/nocms.js', 'compile', '--in-dir', srcDir, '--out-dir', actualDir], {stdio: [0,1,2]});
				actualCode = 0;
			} catch (err) {
				actualCode = err.status;
			}
		});

		before(() => {
			let options = {
				compareContent: true
			};

			comparison = dirCompare.compareSync(actualDir, expectedDir, options);
		});

		it (`should exit with expected code ${expectedCode}`, () => {
			assert.equal(actualCode, expectedCode);
		});

		it ('should write expected resources to the output directory', () => {
			// it is alright for the comparison to fail if we expect it to fail
			console.log('#########################');
			console.log('comparison.same', comparison.same, 'expectedCode', expectedCode, 'actualCode', actualCode);
			console.log(comparison.same !== true && expectedCode === 0);
			if (comparison.same !== true && expectedCode === 0) {
				console.log('PROCEEDING WITH ERROR THROWING')
				let err = new Error(`site did not compile as expected
${JSON.stringify(comparison.diffSet.filter(diff => diff.state !== 'equal'), null, 4)}
`);
				err.comparison = comparison;
				throw err;
			}
		});
	});
}
