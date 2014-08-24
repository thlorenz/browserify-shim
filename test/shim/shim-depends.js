'use strict';
/*jshint asi: true */
var browserify_version = require('./utils/browserify-version');

var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , proxyquire = require('proxyquire')

var jquery = { exports: '$' };
var jqueryPath = require.resolve('./fixtures/shims/crippled-jquery');

var underscore = { exports: null };
var underscorePath = require.resolve('./fixtures/shims/lib-exporting-_');

var dependent = {
    exports: 'dep'
  , depends: { }
};
dependent.depends[jqueryPath] = '$';
var dependentPath = require.resolve('./fixtures/shims/lib-depending-on-jquery');

var multidependentPath = require.resolve('./fixtures/shims/lib-depending-on-jquery-and-_');
var multidependent = {
    exports: 'dep'
  , depends: { }
};

multidependent.depends[jqueryPath] = '$';
multidependent.depends[underscorePath] = '_';


function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function runFirstBundle(entry, fullPaths, cb) {
  function resolveShims (file_, msgs, cb) {
    var res;
    if (file_ === jqueryPath) res = jquery;
    if (file_ === dependentPath) res = dependent;
    
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

test('\nwhen I shim "jquery" and shim a lib that depends on it', function (t) {

  var entry = require.resolve('./fixtures/entry-requires-depend-on-jquery');

  runFirstBundle(entry, false, function (err, require_) {
    if (err) { t.fail(err); return t.end(); }
    
    var dep = require_(1);
    t.equal(dep.jqVersion, '1.8.3', 'when dependent gets required, $ is attached to the window');
    t.end()
  })
})

if (browserify_version >= 5)
test('\nwhen I shim "jquery" and shim a lib that depends on it, using fullPaths', function (t) {

  var entry = require.resolve('./fixtures/entry-requires-depend-on-jquery');

  runFirstBundle(entry, true, function (err, require_) {
    if (err) { t.fail(err); return t.end(); }
    
    var dep = require_(entry);
    t.equal(dep.jqVersion, '1.8.3', 'when dependent gets required, $ is attached to the window');
    t.end()
  })
})

function runSecondBundle(entry, fullPaths, cb) {
  function resolveShims (file_, msgs, cb) {
    var res;
    if (file_ === jqueryPath) res = jquery;
    if (file_ === underscorePath) res = underscore;
    if (file_ === multidependentPath) res = multidependent;
    
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

test('\nwhen I shim "jquery" and _ lib in debug mode and shim a lib that depends on both', function (t) {

  var entry = require.resolve('./fixtures/entry-requires-depend-on-jquery-and-_');
  runSecondBundle(entry, false, function (err, require_) {
    if (err) { t.fail(err); return t.end(); }

    var dep = require_(1);

    t.equal(dep.jqVersion, '1.8.3', 'when multidependent gets required, $ is attached to the window');
    t.equal(dep._(), 'super underscore', 'and _ is attached to the window');
    t.end()
  })
})

if (browserify_version >= 5)
test('\nwhen I shim "jquery" and _ lib in debug mode and shim a lib that depends on both, using fullPaths', function (t) {

  var entry = require.resolve('./fixtures/entry-requires-depend-on-jquery-and-_');
  runSecondBundle(entry, true, function (err, require_) {
    if (err) { t.fail(err); return t.end(); }

    var dep = require_(entry);

    t.equal(dep.jqVersion, '1.8.3', 'when multidependent gets required, $ is attached to the window');
    t.equal(dep._(), 'super underscore', 'and _ is attached to the window');
    t.end()
  })
})
