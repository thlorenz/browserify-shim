'use strict';
/*jshint asi: true */
var fs = require('fs')
  , path = require('path')
  , fixtures = path.join(__dirname, 'fixtures')
  , browserify = require('browserify')
  , shim = require('..')


var objectLiteral = fs.readFileSync(path.join(fixtures, 'object-literal.js'), 'utf-8')

var js = browserify({ debug: true })
  .use(shim('object-literal', 'lib'))
  .use(shim('jquery', '$'))
  .addEntry('index.js')
  .bundle();

fs.writeFileSync('./bundle.js', js, 'utf-8'); 
