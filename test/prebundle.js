'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , shim = require('..')

test('\n# when I shim "jquery" in debug mode', function (t) {
  
  var prebundle = browserify({ debug: true })
    .use(shim({ alias: 'jquery', path: './fixtures/shims/crippled-jquery', exports: '$' }))
    .use(shim({ alias: 'jquery', path: './fixtures/shims/crippled-jquery', exports: '$' }))

    .addEntry(__dirname + '/fixtures/entry-requires-jquery.js')
  var bundle = prebundle.bundle()

  var jqueryFile = prebundle.files['./fixtures/shims/crippled-jquery'];

  t.ok(jqueryFile, 'the prebundle includes jquery file under the given path')
  t.equals(jqueryFile.target, 'jquery', 'its target is the alias jquery')
  t.ok(jqueryFile.body.length, 'includes its code in the body')
  t.ok(/require\.define\(.jquery/.test(bundle), 'final bundle includes defined jquery')
  t.ok(/\/\/@ sourceURL=jquery/.test(bundle), 'points its sourceURL to jquery')

  t.end()
});
