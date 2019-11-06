var TJS = require('../cjs');

var a = [];
var o = {};

console.assert(TJS.stringify(a) === '[[]]', 'empty Array');
console.assert(TJS.stringify(o) === '[{}]', 'empty Object');

a.push(a);
o.o = o;

console.assert(TJS.stringify(a) === '[["0"]]', 'recursive Array');
console.assert(TJS.stringify(o) === '[{"o":"0"}]', 'recursive Object');

var b = TJS.parse(TJS.stringify(a));
console.assert(Array.isArray(b) && b[0] === b, 'restoring recursive Array');

a.push(1, 'two', true);
o.one = 1;
o.two = 'two';
o.three = true;

console.assert(TJS.stringify(a) === '[["0",1,"1",true],"two"]', 'values in Array');
console.assert(TJS.stringify(o) === '[{"o":"0","one":1,"two":"1","three":true},"two"]', 'values in Object');


a.push(o);
o.a = a;

console.assert(TJS.stringify(a) === '[["0",1,"1",true,"2"],"two",{"o":"2","one":1,"two":"1","three":true,"a":"0"}]', 'object in Array');
console.assert(TJS.stringify(o) === '[{"o":"0","one":1,"two":"1","three":true,"a":"2"},"two",["2",1,"1",true,"0"]]', 'array in Object');

a.push({test: 'OK'}, [1, 2, 3]);
o.test = {test: 'OK'};
o.array = [1, 2, 3];

console.assert(TJS.stringify(a) === '[["0",1,"1",true,"2","3","4"],"two",{"o":"2","one":1,"two":"1","three":true,"a":"0","test":"5","array":"6"},{"test":"7"},[1,2,3],{"test":"7"},[1,2,3],"OK"]', 'objects in Array');
console.assert(TJS.stringify(o) === '[{"o":"0","one":1,"two":"1","three":true,"a":"2","test":"3","array":"4"},"two",["2",1,"1",true,"0","5","6"],{"test":"7"},[1,2,3],{"test":"7"},[1,2,3],"OK"]', 'objects in Object');

a = TJS.parse(TJS.stringify(a));
o = TJS.parse(TJS.stringify(o));

console.assert(a[0] === a, 'parsed Array');
console.assert(o.o === o, 'parsed Object');

console.assert(
  a[1] === 1 &&
  a[2] === 'two' &&
  a[3] === true &&
  a[4] instanceof Object &&
  JSON.stringify(a[5]) === JSON.stringify({test: 'OK'}) &&
  JSON.stringify(a[6]) === JSON.stringify([1, 2, 3]),
  'array values are all OK'
);

console.assert(a[4] === a[4].o && a === a[4].o.a, 'array recursive values are OK');

console.assert(
  o.one === 1 &&
  o.two === 'two' &&
  o.three === true &&
  Array.isArray(o.a) &&
  JSON.stringify(o.test) === JSON.stringify({test: 'OK'}) &&
  JSON.stringify(o.array) === JSON.stringify([1, 2, 3]),
  'object values are all OK'
);

console.assert(o.a === o.a[0] && o === o.a[4], 'object recursive values are OK');

console.assert(TJS.parse(TJS.stringify(1)) === 1, 'numbers can be parsed too');
console.assert(TJS.parse(TJS.stringify(false)) === false, 'booleans can be parsed too');
console.assert(TJS.parse(TJS.stringify(null)) === null, 'null can be parsed too');
console.assert(TJS.parse(TJS.stringify('test')) === 'test', 'strings can be parsed too');

var d = new Date;
console.assert(TJS.parse(TJS.stringify(d)) === d.toISOString(), 'dates can be parsed too');

console.assert(TJS.parse(
  TJS.stringify(d),
  function (key, value) {
    if (typeof value === 'string' && /^[0-9:.ZT-]+$/.test(value))
      return new Date(value);
    return value;
  }
) instanceof Date, 'dates can be revived too');

console.assert(TJS.parse(
  TJS.stringify({
    sub: {
      one23: 123,
      date: d
    }
  }),
  function (key, value) {
    if (key !== '' && typeof value === 'string' && /^[0-9:.ZT-]+$/.test(value))
      return new Date(value);
    return value;
  }
).sub.date instanceof Date, 'dates can be revived too');


// borrowed from CircularJSON


(function () {
  var special = "\\x7e"; // \x7e is ~
  //console.log(TJS.stringify({a:special}));
  //console.log(TJS.parse(TJS.stringify({a:special})).a);
  console.assert(TJS.parse(TJS.stringify({a:special})).a === special, 'no problem with simulation');
  special = "~\\x7e";
  console.assert(TJS.parse(TJS.stringify({a:special})).a === special, 'no problem with special char');
}());

(function () {
  var o = {a: 'a', b: 'b', c: function(){}, d: {e: 123}},
      a = JSON.stringify(o),
      b = TJS.stringify(o);

  console.assert(
    JSON.stringify(JSON.parse(a)) === JSON.stringify(TJS.parse(b)),
    'works as JSON.parse'
  );
  console.assert(
    TJS.stringify(o, function(key, value){
      if (!key || key === 'a') return value;
    }) === '[{"a":"1","b":"_0","c":"_0","d":"_0"},"a",["u"]]',
    'accept callback'
  );
  console.assert(
    JSON.stringify(
      TJS.parse('[{"a":"1"},"a"]', function(key, value){
        if (key === 'a') return 'b';
        return value;
      })
    ) === '{"a":"b"}',
    'revive callback'
  );
}());

(function () {
  var o = {}, before, after;
  o.a = o;
  o.c = {};
  o.d = {
    a: 123,
    b: o
  };
  o.c.e = o;
  o.c.f = o.d;
  o.b = o.c;
  before = TJS.stringify(o);
  o = TJS.parse(before);
  console.assert(
    o.b === o.c &&
    o.c.e === o &&
    o.d.a === 123 &&
    o.d.b === o &&
    o.c.f === o.d &&
    o.b === o.c,
    'recreated original structure'
  );
}());

(function () {
  var o = {};
  o.a = o;
  o.b = o;
  console.assert(
    TJS.stringify(o, function (key, value) {
      if (!key || key === 'a') return value;
    }) === '[{"a":"0","b":"_0"},["u"]]',
    'callback invoked'
  );
  o = TJS.parse('[{"a":"0"}]', function (key, value) {
    if (!key) {
      value.b = value;
    }
    return value;
  });
  console.assert(
    o.a === o && o.b === o,
    'reviver invoked'
  );
}());

(function () {
  var o = {};
  o['~'] = o;
  o['\\x7e'] = '\\x7e';
  o.test = '~';

  o = TJS.parse(TJS.stringify(o));
  console.assert(o['~'] === o && o.test === '~', 'still intact');
  o = {
    a: [
      '~', '~~', '~~~'
    ]
  };
  o.a.push(o);
  o.o = o;
  o['~'] = o.a;
  o['~~'] = o.a;
  o['~~~'] = o.a;
  o = TJS.parse(TJS.stringify(o));
  console.assert(
    o === o.a[3] &&
    o === o.o &&
    o['~'] === o.a &&
    o['~~'] === o.a &&
    o['~~~'] === o.a &&
    o.a === o.a[3].a &&
    o.a.pop() === o &&
    o.a.join('') === '~~~~~~',
    'restructured'
  );

}());

(function () {

  // make sure only own properties are parsed
  Object.prototype.shenanigans = true;

  var
    item = {
      name: 'TEST'
    },
    original = {
      outer: [
        {
          a: 'b',
          c: 'd',
          one: item,
          many: [item],
          e: 'f'
        }
      ]
    },
    str,
    output
  ;
  item.value = item;
  str = TJS.stringify(original);
  output = TJS.parse(str);
  console.assert(str === '[{"outer":"1"},["2"],{"a":"3","c":"4","one":"5","many":"6","e":"7"},"b","d",{"name":"8","value":"5"},["5"],"f","TEST"]', 'string is correct');
  console.assert(
    original.outer[0].one.name === output.outer[0].one.name &&
    original.outer[0].many[0].name === output.outer[0].many[0].name &&
    output.outer[0].many[0] === output.outer[0].one,
    'object too'
  );

  delete Object.prototype.shenanigans;

}());

(function () {
  var
    unique = {a:'sup'},
    nested = {
      prop: {
        value: 123
      },
      a: [
        {},
        {b: [
          {
            a: 1,
            d: 2,
            c: unique,
            z: {
              g: 2,
              a: unique,
              b: {
                r: 4,
                u: unique,
                c: 5
              },
              f: 6
            },
            h: 1
          }
        ]}
      ],
      b: {
        e: 'f',
        t: unique,
        p: 4
      }
    },
    str = TJS.stringify(nested),
    output
  ;
  console.assert(str === '[{"prop":"1","a":"2","b":"3"},{"value":123},["4","5"],{"e":"6","t":"7","p":4},{},{"b":"8"},"f",{"a":"9"},["10"],"sup",{"a":1,"d":2,"c":"7","z":"11","h":1},{"g":2,"a":"7","b":"12","f":6},{"r":4,"u":"7","c":5}]', 'string is OK');
  output = TJS.parse(str);
  console.assert(output.b.t.a === 'sup' && output.a[1].b[0].c === output.b.t, 'so is the object');
}());

(function () {
  var o = {bar: 'something ~ baz'};
  var s = TJS.stringify(o);
  console.assert(s === '[{"bar":"1"},"something ~ baz"]', 'string is correct');
  var oo = TJS.parse(s);
  console.assert(oo.bar === o.bar, 'parse is correct');
}());

(function () {
  var o = {};
  o.a = {
    aa: {
      aaa: 'value1'
    }
  };
  o.b = o;
  o.c = {
    ca: {},
    cb: {},
    cc: {},
    cd: {},
    ce: 'value2',
    cf: 'value3'
  };
  o.c.ca.caa = o.c.ca;
  o.c.cb.cba = o.c.cb;
  o.c.cc.cca = o.c;
  o.c.cd.cda = o.c.ca.caa;

  var s = TJS.stringify(o);
  console.assert(s === '[{"a":"1","b":"0","c":"2"},{"aa":"3"},{"ca":"4","cb":"5","cc":"6","cd":"7","ce":"8","cf":"9"},{"aaa":"10"},{"caa":"4"},{"cba":"5"},{"cca":"2"},{"cda":"4"},"value2","value3","value1"]', 'string is correct');
  var oo = TJS.parse(s);
  console.assert(
  oo.a.aa.aaa = 'value1'
    && oo === oo.b
    && o.c.ca.caa === o.c.ca
    && o.c.cb.cba === o.c.cb
    && o.c.cc.cca === o.c
    && o.c.cd.cda === o.c.ca.caa
    && oo.c.ce === 'value2'
    && oo.c.cf === 'value3',
    'parse is correct'
  );
}());

(function () {
  var
    original = {
      a1: {
        a2: [],
        a3: [{name: 'whatever'}]
      },
      a4: []
    },
    json,
    restored
  ;

  original.a1.a2[0] = original.a1;
  original.a4[0] = original.a1.a3[0];

  json = TJS.stringify(original);
  restored = TJS.parse(json);

  console.assert(restored.a1.a2[0] === restored.a1, '~a1~a2~0 === ~a1');
  console.assert(restored.a4[0] = restored.a1.a3[0], '~a4 === ~a1~a3~0');
}());

if (typeof Symbol !== 'undefined') {
  (function () {
    var o = {a: 1};
    var a = [1, Symbol('test'), 2];
    o[Symbol('test')] = 123;
    console.assert(('[' + JSON.stringify(o) + ']') === TJS.stringify(o), 'Symbol is OK too');
    console.assert(('[[1,"_0",2],["s;test"]]') === TJS.stringify(a), 'non symbol is OK too');
  }());
}

(function () {
  var args = [{a:[1]}, null, '  '];
  console.assert(TJS.stringify.apply(null, args) === "[{\n  \"a\": \"1\"\n},[\n  1\n]]", 'extra args same as JSON');
}());

(function () {
  var o = {a: 1, b: {a: 1, b: 2}};
  var json = JSON.stringify(o, ['b']);
  console.assert(
    TJS.stringify(o, ['b']) === '[{"a":"_0","b":"1"},{"a":"_0","b":2},["u"]]',
    'whitelisted ["b"]: '+ json
  );
}());

(function () {
  var a = { b: { '': { c: { d: 1 } } } };
  a._circular = a.b[''];
  var json = TJS.stringify(a);
  var nosj = TJS.parse(json);
  console.assert(
    nosj._circular === nosj.b[''] &&
    JSON.stringify(nosj._circular) === JSON.stringify(a._circular),
    'empty keys as non root objects work'
  );
  delete a._circular;
  delete nosj._circular;
  console.assert(
    JSON.stringify(nosj) === JSON.stringify(a),
    'objects copied with circular empty keys are the same'
  );
}());

(function () {
  isSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
  isMapsEqual = (a, b) => a.size === b.size && [...a].every(([key]) => { return a.get(key) === b.get(key); });

  console.assert(TJS.parse(TJS.stringify({x: undefined, y: undefined})).hasOwnProperty('x'), 'retains undefined keys');
  console.assert(TJS.parse(TJS.stringify(undefined)) === undefined, 'supports undefined');
  console.assert(TJS.parse(TJS.stringify(Infinity)) === Infinity, 'supports non-finite numbers');
  console.assert(TJS.parse(TJS.stringify(900719925474099123n)) === 900719925474099123n, 'supports bigint');
  console.assert(TJS.parse(TJS.stringify(/^a-z$/gi)).toString() === '/^a-z$/gi', 'supports regex');
  console.assert(TJS.parse(TJS.stringify(Symbol('tjs'))) === Symbol.for('tjs'), 'supports symbol');
  console.assert(isSetsEqual(TJS.parse(TJS.stringify(new Set([1, 2, 3]))), new Set([1, 2, 3])), 'supports set');
  console.assert(isSetsEqual(TJS.parse(TJS.stringify(new Map([[1, '1'], [2, '2']]))), new Map([[1, '1'], [2, '2']])), 'supports map');
}());