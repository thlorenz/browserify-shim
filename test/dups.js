'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , shim = require('..')

test('when I shim "jquery" twice', function (t) {
  
  var src = browserify({ debug: true })
    .use(shim({ alias: 'jquery', path: './fixtures/shims/crippled-jquery', exports: '$' }))
    .use(shim({ alias: 'jquery', path: './fixtures/shims/crippled-jquery', exports: '$' }))
    .addEntry(__dirname + '/fixtures/entry-requires-jquery.js')
    .bundle()
    .shim()

  t.equals(shim.registeredAliases.length, 1, 'registers one shim')
  t.equals(shim.registeredAliases[0], 'jquery', 'which is jquery')

  t.end()
});
