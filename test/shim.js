'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , shim = require('..')

test('when I shim "jquery" to a crippled jquery file and require it inside the entry file', function (t) {
  
  var src = browserify({ debug: true })
    .use(shim({ alias: 'jquery', path: './fixtures/shims/crippled-jquery', export: '$' }))
    .use(shim.addEntry('./fixtures/entry-requires-jquery'))
    .bundle();

  var ctx = { window: {}, console: console };
  vm.runInNewContext(src, ctx);

  t.equal(ctx.require('/entry-requires-jquery').getJqueryVersion(), '1.8.3', 'requires crippled jquery and gets version');
  t.end()
});
