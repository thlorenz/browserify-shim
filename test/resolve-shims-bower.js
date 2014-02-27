'use strict';
/*jshint asi: true */

var test = require('tap').test
var path = require('path')

var resolve = require('../lib/resolve-shims');

var msgs = [];

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\nresolving a bower component that is shimmed', function (t) {
  resolve(require.resolve('./bower/components/jquery-ui/ui/jquery.ui.position.js'), msgs, function (err, res) {

    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.shim, { exports: null, depends: { jquery: 'jQuery' } }, 'resolves shim correctly')
    t.end();
  })
})
