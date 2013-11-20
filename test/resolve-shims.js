'use strict';
/*jshint asi: true */

var test = require('tap').test
var resolve = require('../lib/resolve-shims');

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\nno dependencies, external shim file', function (t) {
  resolve(require.resolve('./nodeps/extshim/vendor/non-cjs'), function (err, res) {
    if (err) return t.fail(err);
    t.deepEqual(res, { exports: 'noncjs', depends: undefined }, 'resolves noncjs shim correctly')
    t.end();
  });
})

