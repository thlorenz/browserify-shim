'use strict';
/*jshint asi: true */
var fs = require('fs')
  , path = require('path')
  , fixtures = path.join(__dirname, 'fixtures')
  , browserify = require('browserify')


var objectLiteral = fs.readFileSync(path.join(fixtures, 'object-literal.js'), 'utf-8')

function exportify(mdl, exportKey) {
  return function (bundle) {
    bundle.register('.js', function (body, file) {
      if (path.basename(file) === mdl + '.js') return body + '\nmodule.exports = window.' + exportKey + ';';
      return body;
    });
  }
}

var js = browserify({ debug: true })
  .use(exportify('object-literal', 'lib'))
  .use(exportify('jquery', '$'))
  .addEntry('index.js')
  .bundle();

fs.writeFileSync('./bundle.js', js, 'utf-8'); 
