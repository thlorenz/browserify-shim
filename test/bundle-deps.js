'use strict';
/*jshint asi: true */

var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')

function bundleNcheck(relPath, t) {
  browserify( { ignoreGlobals: true })
    .require(require.resolve(relPath))
    .bundle(function (err, src) {
      if (err) { t.fail(err); return t.end(); }

      var ctx = { window: {}, console: console };
      ctx.self = ctx.window;
      var require_ = vm.runInNewContext(src, ctx);
       
      var main = require_(require.resolve(relPath));

      t.deepEqual(main(), { noncjs: { name: 'non-cjs', version: 1.1 } }, 'shims non-cjs, requireing non-cjs-dep ');
      t.end()
    });
}

test('\nshimming deps with external shim, with depends all exposed'
    , bundleNcheck.bind(null, './deps/extshim/main'))

test('\nshimming nodeps with inlined shim, with depends all exposed'
    , bundleNcheck.bind(null, './deps/inlineshim/main'))
