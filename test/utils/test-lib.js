'use strict';
/*jshint asi: true*/

var request = require('request')
  , fs      = require('fs')
  , path = require('path')
  , shim = require('../..')
  , jsdom = require('jsdom').jsdom
  , shimsdir = path.join(__dirname, '..', 'fixtures', 'shims')
  , entryFile = path.join(__dirname, '..', 'fixtures', 'entry-straight-export.js')

var html = 
    '<!DOCTYPE html>'
  + '<html>'
  + '    <head>'
  + '        <title>Some empty page</title>'
  + '    </head>'
  + '    <body>'
  + '    </body>'
  + '</html>'

function generateEntry(alias) {
  // just pass in exported shim in order to ensure it can be required
  return (
      // expose require in order to support testing
        'window.require = require;\n'
      + 'module.exports = require("' + alias + '");\n')
}

module.exports = function testLib(t, opts) {
  var baseUrl    =  opts.baseUrl
    , name       =  opts.name
    , shimConfig =  opts.shimConfig
    , runTest    =  opts.test

  request( baseUrl + name, function(err, resp, body) {
    var file = path.join(shimsdir, name);
    shimConfig.path = file;

    fs.writeFileSync(file, body);
    fs.writeFileSync(entryFile, generateEntry(shimConfig.alias));

    var src = require('browserify')({ debug: true })
      .use(shim(shimConfig))
      .addEntry(__dirname + '/../fixtures/entry-straight-export.js')
      .bundle()
      .shim()

    fs.unlinkSync(file);
    fs.unlinkSync(entryFile);

    var ctx = jsdom(html).createWindow();
    require('vm').runInNewContext(src, ctx);

    runTest(t, ctx.window.require('/entry-straight-export'));
  });
};
