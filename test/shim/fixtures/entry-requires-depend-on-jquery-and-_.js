'use strict';

var $ = require('./shims/lib-depending-on-jquery-and-_')

// expose require in order to support testing
window.require = require;

// depended on libs are exposed as dep inside lib-depending-on-jquery
module.exports = window.dep;
