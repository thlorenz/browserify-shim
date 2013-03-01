'use strict';
/*jshint asi: true*/

//var testLib = require('./utils/test-lib')
var test = require('tap').test
  , baseUrl = 'https://github.com/bartaz/impress.js/raw/'

/*test('impressjs 0.5.3', function (t) {
  var shimConfig = { alias: 'impressjs', exports: 'impress' }
  t.plan(1)
  testLib(t, { 
      name: 'impress.js'
    , test: function (t, resolved) { t.equals(typeof resolved().init, 'function', 'shims impressjs 0.5.3') }
    , shimConfig: shimConfig
    , baseUrl: baseUrl + '0.5.3/js/'
  })
});*/



var shim = require('..')
  , browserify = require('browserify')
  , jsdom = require('jsdom').jsdom

var html = 
    '<!DOCTYPE html>'
  + '<html>'
  + '    <head>'
  + '        <title>Some empty page</title>'
  + '    </head>'
  + '    <body>'
  + '    </body>'
  + '</html>'
test('impressjs 0.5.3', function (t) {
  shim(browserify(), { 
    impressjs: { path: 'fixtures/shims/impress.js', exports: 'impress' }
  })
  .require(require.resolve('./fixtures/entry-straight-export.js'), { expose: 'entry' })
  .bundle(function (err, src) {
    if (err) return t.fail(err)

      // todo: write src and figure out why window is not defined
    var sandbox = jsdom(html).createWindow();
    var require_ = require('vm').runInNewContext(src, sandbox);
    require_('entry')

    t.end()
  });
})
