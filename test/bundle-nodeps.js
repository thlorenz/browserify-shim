'use strict';
/*jshint asi: true */

var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function bundleNcheck(relPath, t) {
  browserify( { ignoreGlobals: true })
    .require(require.resolve(relPath))
    .bundle(function (err, src) {
      if (err) { t.fail(err); return t.end(); }

      var ctx = { window: {}, console: console };
      ctx.self = ctx.window;
      var require_ = vm.runInNewContext(src, ctx);
       
      var main = require_(require.resolve(relPath));
      t.deepEqual(main(), { name: 'non-cjs', version: 1.1 }, 'shims non-cjs');
      t.end()
    });
}

test('\nshimming nodeps with external shim, no depends'
    , bundleNcheck.bind(null, './nodeps/extshim/main'))

test('\nshimming nodeps with external shim, no depends, exposed non-cjs'
    , bundleNcheck.bind(null, './nodeps/extshim-exposed/main'))

test('\nshimming nodeps with inlined shim, no depends'
    , bundleNcheck.bind(null, './nodeps/inlineshim/main'))

test('\nshimming nodeps with inlined shim, no depends, exposed non-cjs'
    , bundleNcheck.bind(null, './nodeps/inlineshim-exposed/main'))
