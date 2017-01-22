# NOCMS
"NO, You don't need a CMS" is what you are going to tell your boss the next time he comes running waving his arms and yelling incomprehensibly about some new microsite for his wife's pony he wants to make in drupal, wordpress or any of the 1 billion other "let's stuff all your content in a mysql database and front it with some 10 year old php scripts" things that pop up in your facebook feed disguised as content.

[![Build Status](https://travis-ci.org/debitoor/nocms.svg?branch=master)](https://travis-ci.org/debitoor/nocms)

## Install
``` bash
$ npm install nocms --save
```

## CLI Usage

### Compile
Compiles all resources in the input directory and writes them to the output directory.

``` bash
$ nocms compile --in-dir ./src/ --out-dir ./compiled/
```

### Server
Runs a webserver on the port given and compiles resources in the input directory and writes them to the output directory before serving them to the user.
``` bash
$ nocms server --in-dir ./src/ --out-dir ./compiled/ --port 1234
```

NOCMS is multithreaded and spins of one worker instance for each cpu as reported by `os.cpus()`.

## Plugins
A Plugin is any module that exports an `activate` function that when invoked registers one or more providers. 

``` javascript
export function activate (pluginActivationContext)
``` 

Plugins installed in `node_modules` will be activated automatically.

### pluginActivationContext
The plugin activation context gives plugins access to provider registration and to IO functions bound to the input and output directories.

* [findFiles](#findFiles)
* [readFile](#readFile)
* [registerResourceProvider](#registerResourceProvider)
* [watchFiles](#watchFiles)
* [writeFile](#writeFile)

#### findFiles
Finds files relative to the input directory. Returns a `Promise` that resolves with an `Array` of file paths relative to the input directory.

``` javascript
async function findFiles (pattern, options)
```

Parameters:
* pattern: [Glob](https://github.com/isaacs/node-glob) pattern,
* options: Glob options

#### readFile
Asynchronously reads the contents of a file relative to the input directory. Returns a `Promise` that resolves with the contents of the file, a `String` or a `Buffer`.

``` javascript 
async function readFile (file, options)
```

Parameters:
* file: File path relative to the input directory
* options: Same as when calling fs.readFile

#### registerResourceProvider
Registers a resource provider with NOCMS. See [Resource Provider](#resource-provider).

``` javascript 
function registerResourceProvider (resourceProvider)
```

Parameters:
* resourceProvider: An instance of a resource provider

#### watchFiles
Watches files relative to the input directory. Returns a [chokidar](https://github.com/paulmillr/chokidar) instance.

``` javascript 
function watchFiles (pattern, options)
```

Parameters:
* pattern: Glob pattern
* options: Chokidar options

#### writeFile
Asynchronously writes a file to the output directory. Automatically creates any missing parts of the file path before writing the file. Returns a promise.

``` javascript 
async function writeFile (file, data, options) {}
```

Parameters:
* file: file path relative to the output directory.
* data: `String` or `Buffer`
* options: Same as fs.writeFile

Example:
``` javascript
let html = '<html></html>';
await writeFile('index.html', html, 'utf8');
```

### Resource Provider
Resource Providers are responsible for collecting meta data for, and compiling resources. A resource provider has two functions:

#### getResources
Asynchronously provides an `Array` of resource objects. A resource must as a minimum have an `id` field.

``` javascript
async function getResources ()
```

#### compileResource
Asynchronously compiles a resource object and writes the result to the file system. Returns a `Promise` that resolves with `undefined`.

``` javascript
async function compileResource (resource, resourceCompilationContext)
```

Parameters:
* resource: a resource object
* resourceCompilationContext: a resource compilation context.

#### Resource Compilation Context
The resource compilation context is an object with two fields.

* resourceMap: a id/resource map of all resources from all resource providers
* resourceTree: a resource tree of all resources from all resource providers

The resource compilation context can be used to provide resource meta data to templates during compilation.

## Develop
### Compile
``` bash
$ npm run compile
```

### Test
``` bash
$ npm test
```

## License
MIT License

Copyright (c) 2017 [Debitoor](https://debitoor.com/)


Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
