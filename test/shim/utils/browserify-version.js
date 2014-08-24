'use strict';

var path = require('path');

module.exports = parseInt(require(path.join(path.dirname(require.resolve('browserify')), 'package.json')).version.slice(0, 1));
