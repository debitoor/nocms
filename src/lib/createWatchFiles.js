import chokidar  from 'chokidar';

export default function createWatchFiles (dir) {
	return function watchFiles (pattern, callback) {
		return chokidar.watch(pattern, {cwd: dir});
	};
}