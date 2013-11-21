'use strict';
/*jshint asi: true */

var test = require('tap').test
var resolve = require('../lib/resolve-shims');

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\nno dependencies, external shim file, no expose', function (t) {
  resolve(require.resolve('./nodeps/extshim/vendor/non-cjs'), function (err, res) {
    if (err) return t.fail(err);
    t.deepEqual(res, { exports: 'noncjs', depends: undefined }, 'resolves noncjs shim correctly')
    t.end();
  });
})

test('\nno dependencies, external shim, exposed as non-cjs', function (t) {
  resolve(require.resolve('./nodeps/extshim-exposed/vendor/non-cjs'), function (err, res) {
    if (err) return t.fail(err);
    t.deepEqual(res, { exports: 'noncjs', depends: undefined }, 'resolves noncjs shim correctly')
    t.end();
  });
})

test('\nno dependencies, inline shims, no expose', function (t) {
  resolve(require.resolve('./nodeps/inlineshim/vendor/non-cjs'), function (err, res) {
    if (err) return t.fail(err);
    t.deepEqual(res, { exports: 'noncjs', depends: undefined }, 'resolves noncjs shim correctly')
    t.end();
  });
})

test('\nno dependencies, inline shims, exposed as non-cjs', function (t) {
  resolve(require.resolve('./nodeps/inlineshim-exposed/vendor/non-cjs'), function (err, res) {
    if (err) return t.fail(err);
    t.deepEqual(res, { exports: 'noncjs', depends: undefined }, 'resolves noncjs shim correctly')
    t.end();
  });
})