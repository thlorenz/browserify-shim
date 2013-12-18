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

      t.deepEqual(
          main
        , { root: '$.position', fn: '$.fn.position', ui: '$.ui.position' }
        , 'shims it correctly including requiring its dependends'
      );
      t.end()
    });
}

test('\nbundling pack that has shimmed bower component dependency'
    , bundleNcheck.bind(null, './bower'))
