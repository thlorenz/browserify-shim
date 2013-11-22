'use strict';

var sub1 = require('sub1');
var sub2 = require('sub2');

var go = module.exports = function () {
  return {
    sub1: sub1(),
    // since sub1 main requires this module it will be attached to the window
    sub1noncjsdep: window.sub1noncjsdep,

    sub2: sub2(),
    // since sub2 main requires this module it will be attached to the window
    sub2noncjsdep: window.sub2noncjsdep
  }
  return require('root-non-cjs');  
};
