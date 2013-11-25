'use strict';
/*jshint asi: true */
var browserify =  require('browserify')
  , test       =  require('tap').test
  , vm         =  require('vm')
  , proxyquire =  require('proxyquire')
  ;

// More explanation about the issue reproduced by this test inside the fixture itself
test('when a module only attaches to the window after checking for module.exports and define and we browserify it', function (t) {

  var file = require.resolve('./fixtures/shims/lib-with-exports-define-global-problem.js');
  var entry = require.resolve('./fixtures/entry-requires-lib-with-global-problem.js');

  function resolveShims (file_, msgs, cb) {
    var res = file_ === file
      ? { exports: 'eve' } 
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
      if (err) return t.fail(err)

      var ctx = { window: { name: 'the window' }, console: console };
      ctx.self = ctx.window;
      var require_ = vm.runInNewContext(src, ctx)
      var exp = require_(entry);

      t.equal(exp.attachedEve, 'loves adam', 'attaches it to window')
      t.equal(exp.exportedEve, 'loves adam', 'exports it as well')
      t.end()
    })
})
