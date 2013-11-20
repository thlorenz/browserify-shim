'use strict';
/*jshint asi: true */

var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}
test('\nshimming nodeps with external shim, no depends', function (t) {
  browserify( { ignoreGlobals: true })
    .require(require.resolve('./nodeps/extshim/main', { expose: 'main' }))
    .bundle(function (err, src) {
      if (err) return t.fail(err);

      var ctx = { window: {}, console: console };
      ctx.self = ctx.window;
      var require_ = vm.runInNewContext(src, ctx);
       
      inspect(require_(require.resolve('./nodeps/extshim/main')).toString());
      t.end()
    });
  
})
