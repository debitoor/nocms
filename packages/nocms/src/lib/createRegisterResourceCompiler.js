export default function createRegisterResourceProvider (resourceCompilers) {
	return function registerResourceProvider (resourceCompiler) {
		resourceCompilers.push(resourceCompiler);
	};
}