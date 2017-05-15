# huffin

Human-readable representation of [ed22519][0] public keys, through Huffman
Codes.

## Usage

```js
const id = require('huffin');

const key = Buffer.from(
    '9d7ca59459c65b79c39bd2c75e831e09542abebe7a2054efde2d19072bdbe0a4',
    'hex');
id.stringify(key);  // 'hyper_FJLQ6naoksSNcEou9FAfiV52mfU5NVV6exVANU9c'

id.parse('hyper_FJLQ6naoksSNcEou9FAfiV52mfU5NVV6exVANU9c');  // `key`

// HEX encoding is also available
id.stringify(key, 'hex');
// 'hyper_13af94b28b38cb6f38737a58ebd063c12a8557d7cf440a9dfbc5a320e57'

id.parse('hyper_13af94b28b38cb6f38737a58ebd063c12a8557d7cf440a9dfbc5a320e57');
// `key`
```

## LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2017.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: https://en.wikipedia.org/wiki/EdDSA#Ed25519
