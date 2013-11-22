var eve = require('./shims/lib-with-exports-define-global-problem');

// expose require to tests
window.require = require;

exports.exportedEve = eve;
exports.attachedEve = window.eve;
