'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , proxyquire = require('proxyquire')

test('\n# when I shim "jquery"', function (t) {
  
  var entry = require.resolve('./fixtures/entry-requires-jquery.js');
  var jqueryFullPath = require.resolve('./fixtures/shims/crippled-jquery')

  function resolveShims (file_, msgs, cb) {
    var res = file_ === jqueryFullPath 
      ? { exports: '$' } 
      : null;
    
    setTimeout(cb.bind(null, null, { shim: res }), 0)
  }
  
  var shim = proxyquire('../../', {
    './lib/resolve-shims': resolveShims
  })

  var prebundle = browserify()

  
  t.equal(prebundle._mdeps.globalTransforms.length, 1, 'before bundling has one registered transform')
  // DEFER: pending is only for streams now in browserify; is this a bug on their end?
  // t.equal(prebundle._pending, 1, 'before bundling: has one pending')

  // DEFER: this is the cloest I could find, and it is not defined at this point
  // t.equal(Object.keys(prebundle._bpack.hasExports), undefined, 'before bundling: has no exports')
  // DEFER: no idea what this is testing for
  // t.equal(Object.keys(prebundle._mapped).length, 0, 'before bundling: has no mappings')
  t.equal(prebundle._mdeps.entries.length, 0, 'before bundling: has no files')

  prebundle.bundle(function (err, src) {
    t.equal(prebundle._pending, 0, 'after bundling: has zero pending')
    t.end() 
  })
});
