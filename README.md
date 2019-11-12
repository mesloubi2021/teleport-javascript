# teleport-javascript

[![Coverage Status](https://coveralls.io/repos/github/codenirvana/teleport-javascript/badge.svg?branch=master)](https://coveralls.io/github/codenirvana/teleport-javascript?branch=master) [![Build Status](https://travis-ci.org/codenirvana/teleport-javascript.svg?branch=master)](https://travis-ci.org/codenirvana/teleport-javascript) [![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

A super light and fast JavaScript object (de)serialization that includes undefined, bigint, regex, etc.

### Installation
```console
$ npm -i teleport-javascript
```

### Usage
```js
const {parse, stringify} = require('teleport-javascript');

const obj = {
  key: 'value',
  undefined: undefined,
  regex: /a-z/gi,
  set: new Set([-Infinity, NaN, Infinity]),
  bigint: 900719925474099123n
};
obj.circular = obj;

const stringified = stringify(obj);
// '[{"key":"1","undefined":"_0","regex":"_1","set":"_2","bigint":"_3","circular":"0"},"value",["u","R;/a-z/gi","S;[[\\"_0\\",\\"_1\\",\\"_2\\"],[\\"n;-Infinity\\",\\"n;NaN\\",\\"n;Infinity\\"]]","b;900719925474099123"]]'

const parsed = parse(stringified);
// {
//   key: 'value',
//   undefined: undefined,
//   regex: /a-z/gi,
//   set: Set { -Infinity, NaN, Infinity },
//   bigint: 900719925474099123n,
//   circular: [Circular]
// }
```

### Supported Data Types
* String
* Number _(including NaN, Infinity, -Infinity)_
* BigInt
* Boolean
* Null
* Undefined
* Array
  - Int8Array
  - Uint8Array
  - Uint8ClampedArray
  - Int16Array
  - Uint16Array
  - Int32Array
  - Uint32Array
  - Float32Array
  - Float64Array
* Symbol
* Object _(including circular reference)_
  - RegExp
  - Map
  - Set

### Benchmarks
[Benchmark Results](test/bench.txt)

## License
ISC
