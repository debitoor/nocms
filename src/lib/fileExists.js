import fs  from 'fs';

export default function fileExists (file) {
	return fs.existsSync(file);
}