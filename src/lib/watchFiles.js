import chokidar  from 'chokidar';

export default function watchFiles (pattern, options) {
	return chokidar.watch(pattern, options);
}