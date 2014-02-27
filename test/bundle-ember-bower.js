'use strict';
/*jshint asi: true */

process.env.BROWSERIFYSHIM_DIAGNOSTICS=1;

// reproduces: https://github.com/thlorenz/browserify-shim/issues/30
var browserify = require('browserify')
  , test = require('tap').test
  , path = require('path')
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

      t.equal(main.ENV, 'this is ember env', 'shims ember correctly and fixes requires')
      t.deepEqual(main.$(), { jquery: '1.8.3' }, 'resolves jquery')
      t.equal(main.Handlebars, 'this is handlebars', 'resolves handlebars')
      t.end()
    });
}


test('\nbundling pack that has ember with invalid requires, installed via bower'
    , bundleNcheck.bind(null, './ember-bower'))
