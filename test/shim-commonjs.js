'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , shim = require('..')

test('when I shim a commonJS module in order to alias it without installing it as a node_module', function (t) {
  
  var src = browserify({ debug: true })
    .use(shim({ alias: 'cjs', path: './fixtures/shims/commonjs-module', exports: null }))
    .addEntry(__dirname + '/fixtures/entry-requires-cjs.js')
    .bundle()
    .shim()

  var ctx = { window: {} };
  vm.runInNewContext(src, ctx);

  t.equal(ctx.window.require('/entry-requires-cjs'), 'super duper export', 'requires cjs properly from the given path');
  t.end()
});
