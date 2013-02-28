'use strict';
var browserify = require('browserify')
  , through = require('through')
  , shim = require('..');

var b = browserify();

shim(b, { 
  jquery: { 
      path: '../test/fixtures/shims/crippled-jquery' 
    , exports: '$'
  }
});

b.add(require.resolve('../test/fixtures/shims/commonjs-module'));
b.bundle({}, function (err, src) {
  console.log(src);
});
