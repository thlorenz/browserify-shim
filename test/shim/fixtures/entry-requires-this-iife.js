var respond = require('./shims/this-iife');

// expose require to tests
window.require = require;

module.exports = respond;
