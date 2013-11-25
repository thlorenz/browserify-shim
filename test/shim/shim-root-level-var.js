'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , proxyquire = require('proxyquire')

test('when I shim a module that declares its export as a var on the root level instead of attaching it to the window', function (t) {

  var entry = require.resolve('./fixtures/entry-requires-root-level-var.js');
  var file = require.resolve('./fixtures/shims/root-level-var');

  function resolveShims (file_, msgs, cb) {
    var res = file_ === file
      ? { exports: 'nineties' } 
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

      t.equal(
          require_(entry).message
        , "I declare vars on the script level and expect them to get attached to the window because I'm doin' it 90s style baby!"
        , 'shims that sucker'
      );
      t.end()
    })
})
