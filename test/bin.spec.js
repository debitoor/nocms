import path from 'path';
import {execFileSync} from 'child_process';
import dirCompare from 'dir-compare';

const sites = [
	'./test/sites/site-with-one-page-and-no-layout',
	'./test/sites/site-with-one-page-and-a-hidden-directory',
	'./test/sites/site-with-many-pages'
];

describe ('bin', () => {
	sites.forEach(describeSite);
});

function describeSite (site) {
	describe(site, () => {
		let comparison;
		let actualDir = path.join(site, 'actual').split(path.sep).join('/');
		let expectedDir = path.join(site, 'expected').split(path.sep).join('/');
		let srcDir = path.join(site, 'src').split(path.sep).join('/');

		before(() => {
			execFileSync('node', ['./bin/main.js', 'compile', '--in-dir', srcDir, '--out-dir', actualDir]);
		});

		before(() => {
			let options = {
				compareContent: true
			};
		
			comparison = dirCompare.compareSync(actualDir, expectedDir, options);
		});

		it ('should compile as expected', () => {
			if (!comparison.same) {
				let err = new Error(`site did not compile as expected
${JSON.stringify(comparison.diffSet.filter(diff => diff.state !== 'equal'), null, 4)}
`);
				err.comparison = comparison;

				throw err;
			}
		});
	});
}