# teleport-javascript

A super light (0.9K) and fast JavaScript object (de)serialization that includes undefined, bigint, regex, etc.",

### Installation
```console
$ npm -i teleport-javascript
```

### Usage
```js
// ESM
import {parse, stringify} from 'teleport-javascript/esm';

// CJS
const {parse, stringify} = require('teleport-javascript/cjs');

const a = [{}];
a[0].a = a;
a.push(a);
a[0].b = new Map([[Symbol('s'), new Set([1, /a-z/, -Infinity])]]);
a[0].c = undefined;

const stringified = stringify(a);
// '[["1","0"],{"a":"0","b":"_0","c":"_1"},["M;[[\\"1\\"],[\\"_0\\",\\"_1\\"],[\\"s;s\\",\\"S;[[1,\\\\\\"_0\\\\\\",\\\\\\"_1\\\\\\"],[\\\\\\"R;/a-z/\\\\\\",\\\\\\"n;-Infinity\\\\\\"]]\\"]]","u"]]'

const parsed = parse(stringified);
// [
//   {
//     a: [ [Circular], [Circular] ],
//     b: Map { Symbol(s) => Set { 1, /a-z/, -Infinity } },
//     c: undefined
//   }
// ]
```

### Supported Data Types
* String
* Number _(including NaN, Infinity, -Infinity)_
* BigInt
* Boolean
* Null
* Undefined
* Array
* Symbol
* Object _(including circular reference)_
  - RegExp
  - Map
  - Set

### Benchmarks
[Benchmark Results](test/bench.txt)

## License
ISC
