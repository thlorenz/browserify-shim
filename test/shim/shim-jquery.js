'use strict';
/*jshint asi: true*/

var testLib = require('./utils/test-lib')
  , test = require('tap').test
  , baseUrl = 'http://code.jquery.com/'
  , shimConfig = { exports: '$' }

test('jquery version 1.6.4', function (t) {
  var jq = { 
      name: 'jquery-1.6.4.min.js'
    , test: function (t, resolved) { t.equals(resolved().jquery, '1.6.4', 'shims jquery 1.6.4') }
    , asserts: 1
    , shimConfig: shimConfig
    , baseUrl: baseUrl
    }

  testLib(t, jq);
})

test('jquery version 1.7.2', function (t) {
  var jq = { 
      name: 'jquery-1.7.2.min.js'
    , test: function (t, resolved) { t.equals(resolved().jquery, '1.7.2', 'shims jquery 1.7.2') }
    , asserts: 1
    , shimConfig: shimConfig
    , baseUrl: baseUrl
    }

  testLib(t, jq);
})

test('jquery version 1.8.3', function (t) {
  var jq = { 
      name: 'jquery-1.8.3.min.js'
    , test: function (t, resolved) { t.equals(resolved().jquery, '1.8.3', 'shims jquery 1.8.3') }
    , asserts: 1
    , shimConfig: shimConfig
    , baseUrl: baseUrl
    }

  testLib(t, jq);
})

test('jquery version 2.0.3', function (t) {
  var jq = { 
      name: 'jquery-2.0.3.min.js'
    , test: function (t, resolved) { t.equals(resolved().jquery, '2.0.3', 'shims jquery 2.0.3') }
    , asserts: 1
    , shimConfig: shimConfig
    , baseUrl: baseUrl
    }

  testLib(t, jq);
})
