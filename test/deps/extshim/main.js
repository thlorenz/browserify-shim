'use strict';

var noncjsdep = require('non-cjs-dep');

var go = module.exports = function () {
  console.log('main', noncjsdep.noncjs.main);  
  console.log('version', noncjsdep.noncjs.version);  
  return noncjsdep;
};
