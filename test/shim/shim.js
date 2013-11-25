'use strict';
/*jshint asi: true */

var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , proxyquire = require('proxyquire')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('when I shim "jquery" to a crippled jquery filerequire it inside the entry file', function (t) {

  var entry = require.resolve('./fixtures/entry-requires-jquery.js');
  var file = require.resolve('./fixtures/shims/crippled-jquery')

  function resolveShims (file_, msgs, cb) {
    var res = file_ === file
      ? { exports: '$' } 
      : null;
    
    setTimeout(cb.bind(null, null, { shim: res }), 0)
  }

  var shim = proxyquire('../../', {
    './lib/resolve-shims': resolveShims
  })

  browserify()
    .transform(shim)
    .require(entry)
    .bundle(function (err, src) {
      if (err) { t.fail(err); return t.end() }

      var ctx = { window: {}, console: console };
      ctx.self = ctx.window;
      var require_ = vm.runInNewContext(src, ctx);

      t.equal(require_(entry).getJqueryVersion(), '1.8.3', 'requires crippled jquery and gets version');
      t.end()
    })
})
