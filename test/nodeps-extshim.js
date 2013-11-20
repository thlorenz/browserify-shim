'use strict';
/*jshint asi: true */

var browserify = require('browserify');

browserify( { ignoreGlobals: true })
  .require(require.resolve('./nodeps/extshim/main'))
  .bundle()
  .pipe(process.stdout);
