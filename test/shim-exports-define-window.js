'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , shim = require('..')
  , fixture = __dirname +'/fixtures/shims/lib-with-exports-define-global-problem.js'
  ;

// More explanation about the issue reproduced by this test inside the fixture itself
test('when a module only attaches to the window after checking for module.exports and define and we browserify it', function (t) {
  var bundle = browserify({ debug: true })
    .use(shim({ alias: 'eve', path: fixture, exports: 'eve' }))
    .bundle() 

  , src = bundle + '\n;window.exportedEve = require("eve");'

  var ctx = { window: {}};
  vm.runInNewContext(src, ctx)
  t.equal(ctx.window.eve, 'loves adam', 'attaches it to window')
  t.equal(ctx.window.exportedEve, 'loves adam', 'exports it as well')
  t.end()
})
