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
var jqueryCode = fs.readFileSync(jquery, 'utf-8');

function logger(bundle) {
  inspect(bundle);
  inspect(bundle.wrapEntry('test', 'module.exports = { foo: "bar" }'));
}

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
    .use(shim({ alias: 'jquery', path: './fixtures/shims/jquery', export: '$' }))
    .use(shim.addEntry('./fixtures/entry-global-aliases'))
    .bundle();

  fs.writeFileSync('./build/bundle.js', js, 'utf-8'); 
}

globalAliasesGivenFullPaths();
