'use strict';
/*jshint asi: true*/

var request = require('request')
  , fs      = require('fs')
  , path = require('path')
  , shim = require('..')
  , jsdom = require('jsdom').jsdom
  , test = require('tap').test
  , shimsdir = path.join(__dirname, 'fixtures', 'shims')
  , baseUrl = 'http://code.jquery.com/'

var html = 
    '<!DOCTYPE html>'
  + '<html>'
  + '    <head>'
  + '        <title>Some empty page</title>'
  + '    </head>'
  + '    <body>'
  + '    </body>'
  + '</html>'

function testLib(t, baseUrl, name, runTest) {
  request( baseUrl + name, function(err, resp, body) {
    var file = path.join(shimsdir, name);
    fs.writeFileSync(file, body);

    var src = require('browserify')({ debug: true })
      .use(shim({ alias: 'jquery', path: file, export: '$' }))
      .use(shim.addEntry('./fixtures/entry-requires-jquery'))
      .bundle();

    fs.unlinkSync(file);

    var ctx = { window: jsdom(html).createWindow(), console: console, setTimeout: function () {} }
    require('vm').runInNewContext(src, ctx);
    runTest(t, ctx);
  });
}

var jqs = [ 
    { name: 'jquery-1.6.4.min.js'
    , test: function (t, ctx) { t.equals(ctx.require('jquery')().jquery, '1.6.4', 'shims jquery 1.6.4') }
    }
  , { name: 'jquery-1.7.2.min.js'
    , test: function (t, ctx) { t.equals(ctx.require('jquery')().jquery, '1.7.2', 'shims jquery 1.7.2') }
    }
  , { name: 'jquery-1.8.3.min.js'
    , test: function (t, ctx) { t.equals(ctx.require('jquery')().jquery, '1.8.3', 'shims jquery 1.8.3') }
    }
  ]

test('jquery versions 1.6.4 - 1.8.3', function (t) {
  t.plan(jqs.length);

  jqs.forEach(function (jq) {
    testLib(t, baseUrl, jq.name, jq.test);
  });
});
