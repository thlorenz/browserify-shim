'use strict';
/*jshint asi: true */
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

test('\nwhen I shim "jquery" and shim a lib that depends on it', function (t) {

  function resolveShims (file_, msgs, cb) {
    var res;
    if (file_ === jqueryPath) res = jquery;
    if (file_ === dependentPath) res = dependent;
    
    setTimeout(cb.bind(null, null, { shim: res }), 0)
  }

  var shim = proxyquire('../../', {
    './lib/resolve-shims': resolveShims
  })
  
  var entry = require.resolve('./fixtures/entry-requires-depend-on-jquery');

  browserify()
    .transform(shim)
    .require(entry)
    .bundle(function (err, src) {
      if (err) t.fail(err);

      var ctx = { window: {}, console: console };
      ctx.self = ctx.window;
      vm.runInNewContext(src, ctx);
      var require_ = ctx.require;
      var dep = ctx.require(entry);

      t.equal(dep.jqVersion, '1.8.3', 'when dependent gets required, $ is attached to the window');
      t.end()
    });

});

test('\nwhen I shim "jquery" and _ lib in debug mode and shim a lib that depends on both', function (t) {

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
  var entry = require.resolve('./fixtures/entry-requires-depend-on-jquery-and-_');

  browserify()
    .transform(shim)
    .require(entry)
    .bundle(function (err, src) {
      if (err) t.fail(err);

      var ctx = { window: {}, console: console };
      ctx.self = ctx.window;
      vm.runInNewContext(src, ctx);
      var require_ = ctx.require;
      var dep = ctx.require(entry);

      t.equal(dep.jqVersion, '1.8.3', 'when multidependent gets required, $ is attached to the window');
      t.equal(dep._(), 'super underscore', 'and _ is attached to the window');
      t.end()
    })
});
