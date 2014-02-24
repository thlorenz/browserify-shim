'use strict';
/*jshint asi: true */

var test = require('tap').test
var path = require('path');
var resolve = require('../lib/resolve-shims');
var msgs = [];

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

// TODO: may not be needed since bundle test proves that it works and the @fixPackage feature gets activated once
//       for browserify-shim itself, so package.json files would be removed at this point
/*test('\nresolving a bower component that is shimmed', function (t) {
  resolve(require.resolve('./bower/components/jquery-ui/ui/jquery.ui.position.js'), msgs, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.shim, { exports: null, depends: { jquery: 'jQuery' } }, 'resolves shim correctly')
    t.end();
  });
})*/
