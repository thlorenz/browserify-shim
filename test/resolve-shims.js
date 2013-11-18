'use strict';
/*jshint asi: true */

var test = require('tap').test
var resolve = require('../lib/resolve-shims');

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\n', function (t) {
  resolve(require.resolve('./nodeps-extshim/vendor/non-cjs'), function (err, res) {
    if (err) return t.fail(err);
    inspect(res);
    t.end();
  });
})
