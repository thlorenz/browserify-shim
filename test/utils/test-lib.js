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
  return ('module.exports = require("' + alias + '");\n')
}

module.exports = function testLib(t, opts) {
  var baseUrl    =  opts.baseUrl
    , name       =  opts.name
    , shimConfig =  opts.shimConfig
    , runTest    =  opts.test

  request( baseUrl + name, function(err, resp, body) {
    var file = path.join(shimsdir, name)
      , firstConfigKey = Object.keys(shimConfig)[0]
      , firstConfig = shimConfig[firstConfigKey]

    firstConfig.path = file;

    fs.writeFileSync(file, body);
    fs.writeFileSync(entryFile, generateEntry(firstConfigKey));

    var b = require('browserify')()
    shim(b, shimConfig)
    
    b.require(require.resolve('../fixtures/entry-straight-export.js'), { expose: 'entry' })
    b.bundle(function (err, src) {
      fs.unlinkSync(file);
      fs.unlinkSync(entryFile);

//      fs.writeFileSync(__dirname + '/../build/bundle-zepto.js', src, 'utf-8')
      if (err) { t.fail(err); return t.end() } 

      var sandbox = jsdom(html).createWindow();
      var require_ = require('vm').runInNewContext(src, sandbox);

      runTest(t, require_('entry'));
    });

  });
};
