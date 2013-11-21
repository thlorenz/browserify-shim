'use strict';

var noncjs = require('./vendor/non-cjs');

var go = module.exports = function () {
  console.log('main', noncjs.main);  
  console.log('version', noncjs.version);  
  return noncjs;
};
