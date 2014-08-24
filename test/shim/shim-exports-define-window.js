'use strict';
/*jshint asi: true */

var browserify_version = require('./utils/browserify-version');
var browserify =  require('browserify')
  , test       =  require('tap').test
  , vm         =  require('vm')
  , proxyquire =  require('proxyquire')
  ;

var file = require.resolve('./fixtures/shims/lib-with-exports-define-global-problem.js');
var entry = require.resolve('./fixtures/entry-requires-lib-with-global-problem.js');

// More explanation about the issue reproduced by this test inside the fixture itself
function runBundle(fullPaths, cb) {
  function resolveShims (file_, msgs, cb) {
    var res = file_ === file
      ? { exports: 'eve' } 
      : null;
    
    setTimeout(cb.bind(null, null, { shim: res }), 0)
  }

  var shim = proxyquire('../../', {
    './lib/resolve-shims': resolveShims
  })

  browserify(entry, { fullPaths: fullPaths })
    .transform(shim)
    .bundle(function (err, src) {
      if (err) return cb(err);

      var ctx = { window: { name: 'the window' }, console: console };
      ctx.self = ctx.window;
      var require_ = vm.runInNewContext(src, ctx)
      cb(null, require_);
    })
}

test('when a module only attaches to the window after checking for module.exports and define and we browserify it', function (t) {
  runBundle(false, function (err, require_) {
    if (err) { t.fail(err); return t.end() }

    var exp = require_(1);

    t.equal(exp.attachedEve, 'loves adam', 'attaches it to window')
    t.equal(exp.exportedEve, 'loves adam', 'exports it as well')
    t.end()
  })
})

if (browserify_version >= 5)
test('when a module only attaches to the window after checking for module.exports and define and we browserify it, using fullPaths', function (t) {
  runBundle(true, function (err, require_) {
    if (err) { t.fail(err); return t.end() }

    var exp = require_(entry);

    t.equal(exp.attachedEve, 'loves adam', 'attaches it to window')
    t.equal(exp.exportedEve, 'loves adam', 'exports it as well')
    t.end()
  })
})
