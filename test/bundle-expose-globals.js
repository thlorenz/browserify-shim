'use strict';
/*jshint asi: true */

var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var jquery = 'the jquery';
function bundleNcheck(relPath, t) {
  browserify( { ignoreGlobals: true })
    .require(require.resolve(relPath))
    .bundle(function (err, src) {
      if (err) { t.fail(err); return t.end(); }

      var ctx = { window: { $: jquery }, console: console };
      ctx.self = ctx.window;
      var require_ = vm.runInNewContext(src, ctx);
       
      var main = require_(require.resolve(relPath));
      t.deepEqual(
          main()
        , { noncjs: { name: 'non-cjs', version: 1.1 }, $: 'the jquery' }
        , 'shims non-cjs and exposes jquery'
      );
      t.end()
    });
}

test('\nshimming nodeps with inlined shim, no depends, but exposing jquery'
    , bundleNcheck.bind(null, './exposify/inlineshim/main'))

test('\nshimming nodeps with external shim, no depends, but exposing jquery'
    , bundleNcheck.bind(null, './exposify/extshim/main'))
