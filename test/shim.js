'use strict';
/*jshint asi: true */
var fs = require('fs')
  , path = require('path')
  , fixtures = path.join(__dirname, 'fixtures')
  , browserify = require('browserify')
  , shim = require('..')

function inspect(obj, depth) {
  console.log(require('util').inspect(obj, false, depth || 5, true));
}

var objectLiteral = require.resolve('./fixtures/shims/object-literal');
var jquery = require.resolve('./fixtures/shims/jquery');

function relativePathsGivenFullPaths () {
  var js = browserify({ debug: true })
    .use(shim({ path: objectLiteral, export: 'lib' }))
    .use(shim({ path: jquery, export: '$' }))
    .addEntry('./fixtures/entry-relative-paths.js')
    .bundle();

  fs.writeFileSync('./build/bundle.js', js, 'utf-8'); 
}

function globalAliasesGivenFullPaths () {
  var js = browserify({ debug: true })
    .use(shim({ alias: 'ol', path: objectLiteral, export: 'lib' }))
    .use(shim({ alias: 'jquery', path: jquery, export: '$' }))
    .addEntry('./fixtures/entry-global-aliases.js')
    .bundle();

  fs.writeFileSync('./build/bundle.js', js, 'utf-8'); 
}

function logger(bundle) {
  inspect(bundle);
  inspect(bundle.wrapEntry('test', 'module.exports = { foo: "bar" }'));
}


// Need to map jquery to the actual path when browserify is resolving it
var br = browserify({ debug: true })
  .use(shim({ alias: 'jquery', path: jquery, export: '$' }))
  .addEntry('./fixtures/entry-global-aliases.js');
