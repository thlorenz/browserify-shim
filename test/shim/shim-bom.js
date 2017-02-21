'use strict';

var browserify = require('browserify')
  , proxyquire = require('proxyquire')
  , test = require('tap').test


test('\n# when I shim a package with a Byte Order Mark' , function(t){

   var shim = require.resolve('./fixtures/bom.js');

   browserify()
     .transform(shim)
     .bundle(function(err, src){
        var containsBOM = /\uFEFF/g.test(src);
        t.equal(false, containsBOM, 'It removes BOM characters');
        t.end()
     })

});


