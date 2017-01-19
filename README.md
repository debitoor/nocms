# NOCMS
"NO, You don't need a CMS" is what you are going to tell your boss the next time he comes running waving his arms and yelling incomprehensibly about some new microsite for his wife's pony he wants to make in drupal, wordpress or any of the 1 billion other "let's stuff all your content in a mysql database and front it with some 10 year old php scripts" things that pop up in your facebook feed disguised as content.

[![Build Status](https://travis-ci.org/debitoor/nocms.svg?branch=master)](https://travis-ci.org/debitoor/nocms)

## Install
``` bash
$ npm install nocms --save
```

## Usage

### Compile
``` bash
$ nocms compile --in-dir ./src/ --out-dir ./compiled/
```

### Server
``` bash
$ nocms server --in-dir ./src/ --out-dir ./compiled/
```

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
