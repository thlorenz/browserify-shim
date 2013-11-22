var rootvar = require('./shims/root-level-var');

// expose require to tests
window.require = require;

module.exports = rootvar;
