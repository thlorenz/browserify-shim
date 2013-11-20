'use strict';

// TODO: handle depends
var go = module.exports = function (config) {
  return Object.keys(config)
    .reduce(function (acc, field) {
      acc[field] = { exports: config[field] };
      return acc;
    }, {});
}

// Test
if (!module.parent) {
  var config = {
    jquery: '$',
    'non-cjs': 'noncjs'
  }
  var res = go(config);
  console.log(res);
}
