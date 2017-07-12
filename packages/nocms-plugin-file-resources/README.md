# nocms-plugin-file-resources
File Resources for NOCMS

[![Build Status](https://travis-ci.org/debitoor/nocms-plugin-file-resources.svg?branch=master)](https://travis-ci.org/debitoor/nocms-plugin-file-resources)
[![NPM Version](https://img.shields.io/npm/v/nocms-plugin-file-resources.svg)](https://www.npmjs.com/package/nocms-plugin-file-resources)
[![NSP Status](https://nodesecurity.io/orgs/debitoor/projects/7a3d76aa-a822-4451-95fe-a9b574105edb/badge)](https://nodesecurity.io/orgs/debitoor/projects/7a3d76aa-a822-4451-95fe-a9b574105edb)

## Config

In order to use this plugin with nocms, you have to supply nocms it with a config file `.nocmsrc` - placed in the root of the project.

**Syntax:** 

```
{
	"plugins": {
		"file-resources": {
			providers: [
				{ path: "./", glob: "**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)" },
				{ path: "../../", glob: "shared/**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)" },
				{ path: "../../shared/favicon", glob: "*" }
			]
		}
	}
}
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
