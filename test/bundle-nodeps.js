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
    .require(require.resolve('./nodeps/extshim/main'))
    .bundle(function (err, src) {
      if (err) { t.fail(err); return t.end(); }

      var ctx = { window: {}, console: console };
      ctx.self = ctx.window;
      var require_ = vm.runInNewContext(src, ctx);
       
      var main = require_(require.resolve('./nodeps/extshim/main'));
      t.deepEqual(main(), { name: 'non-cjs', version: 1.1 }, 'shims non-cjs');
      t.end()
    });
})
