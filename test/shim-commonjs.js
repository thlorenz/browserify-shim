'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , shim = require('..')

test('when I shim a commonJS module in order to alias it without installing it as a node_module', function (t) {
  
  var src = browserify({ debug: true })
    .use(shim({ alias: 'cjs', path: './fixtures/shims/commonjs-module', export: null }))
    .use(shim.addEntry('./fixtures/entry-requires-cjs'))
    .bundle();

  var ctx = {};
  vm.runInNewContext(src, ctx);

  t.equal(ctx.require('/entry-requires-cjs'), 'super duper export', 'requires cjs properly from the given path');
  t.end()
});
