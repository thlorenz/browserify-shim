'use strict';
/*jshint asi: true */
var browserify_version = require('./utils/browserify-version');

var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , proxyquire = require('proxyquire')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var entry = require.resolve('./fixtures/entry-requires-jquery.js');
var file = require.resolve('./fixtures/shims/crippled-jquery')

function runBundle(fullPaths, cb) {
  function resolveShims (file_, msgs, cb) {
    var res = file_ === file
      ? { exports: '$' } 
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

      var ctx = { window: {}, console: console };
      ctx.self = ctx.window;
      var require_ = vm.runInNewContext(src, ctx);
      cb(null, require_)
    })
}

test('when I shim "jquery" to a crippled jquery filerequire it inside the entry file', function (t) {
  runBundle(false, function (err, require_) {
    if (err) { t.fail(err); return t.end() }
    
    t.equal(require_(1).getJqueryVersion(), '1.8.3', 'requires crippled jquery and gets version');
    t.end()
  })
})

if (browserify_version >= 5)
test('when I shim "jquery" to a crippled jquery filerequire it inside the entry file, using fullPaths', function (t) {
  runBundle(true, function (err, require_) {
    if (err) { t.fail(err); return t.end() }
    
    t.equal(require_(entry).getJqueryVersion(), '1.8.3', 'requires crippled jquery and gets version');
    t.end()
  })
})
