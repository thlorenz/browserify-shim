'use strict';
/*jshint asi: true */

process.env.BROWSERIFYSHIM_DIAGNOSTICS=1

var test = require('tap').test
var path = require('path');
var resolve = require('../lib/resolve-shims');
var msgs = [];

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\nno dependencies, external shim file, no expose', function (t) {
  resolve(require.resolve('./nodeps/extshim/vendor/non-cjs'), msgs, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.shim, { exports: 'noncjs', depends: undefined }, 'resolves noncjs shim correctly')
    t.end();
  });
})

test('\nno dependencies, external shim, exposed as non-cjs', function (t) {
  resolve(require.resolve('./nodeps/extshim-exposed/vendor/non-cjs'), msgs, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.shim, { exports: 'noncjs', depends: undefined }, 'resolves noncjs shim correctly')
    t.end();
  });
})

test('\nno dependencies, inline shims, no expose', function (t) {
  resolve(require.resolve('./nodeps/inlineshim/vendor/non-cjs'), msgs, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.shim, { exports: 'noncjs', depends: undefined }, 'resolves noncjs shim correctly')
    t.end();
  });
})

test('\nno dependencies, inline shims, exposed as non-cjs', function (t) {
  resolve(require.resolve('./nodeps/inlineshim-exposed/vendor/non-cjs'), msgs, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.shim, { exports: 'noncjs', depends: undefined }, 'resolves noncjs shim correctly')
    t.end();
  });
})

test('\nnon-cjs-dep depends on non-cjs, external shim file, all exposed', function (t) {
  resolve(require.resolve('./deps/extshim/vendor/non-cjs-dep'), msgs, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.shim
     , { exports: 'noncjsdep', depends: { 'non-cjs': 'noncjs' } }
     , 'resolves noncjsdep shim correctly'
    )
    t.end();
  });
})

test('\nnon-cjs-dep depends on non-cjs, inline shims, all exposed', function (t) {
  resolve(require.resolve('./deps/inlineshim/vendor/non-cjs-dep'), msgs, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.shim
     , { exports: 'noncjsdep', depends: { 'non-cjs': 'noncjs' } }
     , 'resolves noncjsdep shim correctly'
    )
    t.end();
  });
})

test('\nnon-cjs-dep depends on non-cjs and non-cjs-core, external shim file, all exposed except non-cjs-core', function (t) {
  resolve(require.resolve('./multideps/extshim/vendor/non-cjs-dep'), msgs, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    var corePath = path.join(__dirname, 'multideps/extshim/vendor/non-cjs-core.js');
    var depends = { 'non-cjs': 'noncjs' }
    depends[corePath] = 'core';
    t.deepEqual(
        res.shim
      , { exports: 'noncjsdep', depends: depends }
      , 'resolves noncjsdep shim correctly'
    )
    t.end();
  });
})

test('\nnon-cjs-dep depends on non-cjs and non-cjs-core, inline shims, all exposed except non-cjs-core', function (t) {
  resolve(require.resolve('./multideps/inlineshim/vendor/non-cjs-dep'), msgs, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    var corePath = path.join(__dirname, 'multideps/inlineshim/vendor/non-cjs-core.js');
    var depends = { 'non-cjs': 'noncjs' }
    depends[corePath] = 'core';
    t.deepEqual(
        res.shim
      , { exports: 'noncjsdep', depends: depends }
      , 'resolves noncjsdep shim correctly'
    )
    t.end();
  });
})

test('\nno dependencies, inline shims, no expose, $ exposified as jquery', function (t) {
  resolve(require.resolve('./exposify/inlineshim/vendor/non-cjs'), msgs, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.shim, { exports: 'noncjs', depends: undefined }, 'resolves noncjs shim correctly')
    t.deepEqual(res.exposeGlobals, { jquery: '$' }, 'resolves expose globals correctly')
    t.end();
  });
})

test('\nno dependencies, external shims, no expose, $ exposified as jquery', function (t) {
  resolve(require.resolve('./exposify/extshim/vendor/non-cjs'), msgs, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.shim, { exports: 'noncjs', depends: undefined }, 'resolves noncjs shim correctly')
    t.deepEqual(res.exposeGlobals, { jquery: '$' }, 'resolves expose globals correctly')
    t.end();
  });
})
