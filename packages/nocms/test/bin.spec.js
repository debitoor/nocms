import path from 'path';
import {execFileSync} from 'child_process';
import dirCompare from 'dir-compare';
import assert from 'assert';

const sites = {
	'./test/sites/site-with-one-page-and-no-layout': 0,
	// './test/sites/site-with-one-page-and-a-hidden-directory': 0,
	// './test/sites/site-with-many-pages': 0,
	// './test/sites/site-with-one-page-and-four-variants': 0,
	// './test/sites/site-with-invalid-pug-file': 1,
	// './test/sites/site-with-one-page-and-a-script': 0
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
				execFileSync('node', ['./bin/nocms.js', 'compile', '--in-dir', srcDir, '--out-dir', actualDir], {stdio: [0,1,2]});
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
			if (!comparison.same && actualCode === 0) {
				let err = new Error(`site did not compile as expected
${JSON.stringify(comparison.diffSet.filter(diff => diff.state !== 'equal'), null, 4)}
`);
				err.comparison = comparison;

				throw err;
			}
		});
	});
}
