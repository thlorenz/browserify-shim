'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , shim = require('..')

test('when I shim a commonJS module in order to alias it without installing it as a node_module', function (t) {
  
  function getSrc(debug) {
    return browserify({ debug: debug })
      .use(shim({ alias: 'cjs', path: './fixtures/shims/commonjs-module', exports: null }))
      .addEntry(__dirname + '/fixtures/entry-requires-cjs.js')
      .bundle()
      .shim()
  }

  t.test('when bundled in debug mode', function (t) {
    var ctx = { window: {} };
    vm.runInNewContext(getSrc(true), ctx);
    t.equal(ctx.window.require('/entry-requires-cjs'), 'super duper export', 'requires cjs properly from the given path');
    t.end()
  })

  t.test('when bundled in non debug mode', function (t) {
    var ctx = { window: {} };
    vm.runInNewContext(getSrc(false), ctx);
    t.equal(ctx.window.require('/entry-requires-cjs'), 'super duper export', 'requires cjs properly from the given path');
    t.end()
  })
});
