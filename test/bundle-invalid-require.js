'use strict';
/*jshint asi: true */

process.env.BROWSERIFYSHIM_DIAGNOSTICS=1;

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
      t.equal(main(), 'I survived the horror of humans messing with my brain', 'shims that module just fine');
      t.end()
    });
}

test('\nshimming a module that has an invalid require that needs to be renamed' 
    , bundleNcheck.bind(null, './invalid-require/main'))
