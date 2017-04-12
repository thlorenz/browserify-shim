'use strict';
/*jshint asi: true*/

var testLib = require('./utils/test-lib')
  , test = require('tap').test
  , baseUrl = 'https://raw.github.com/documentcloud/underscore/master/'

// Demonstrates shimming a module as a string literal
test('config exports a string', function (t) {
  var shimConfig = { exports: "'underscore'" }
  testLib(t, { 
      name: 'underscore.js'
    , test: function (t, resolved) { t.equals(resolved, 'underscore', 'require resolves to the string') }
    , asserts: 1
    , shimConfig: shimConfig
    , baseUrl: baseUrl
  })
});
