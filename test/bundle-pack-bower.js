'use strict';
/*jshint asi: true */

var browserify = require('browserify')
  , test = require('tap').test
  , path = require('path')
  , vm = require('vm')
  , ncp = require('ncp')
  , rmrf = require('rimraf')

function bundleNcheck(relPath, t) {
  // the @fixPackages feature actually removes package.json files from the file system, so we need to make a copy for this test
  var relPathCpy = relPath + '-copy';
  ncp(path.join(__dirname, relPath), path.join(__dirname, relPathCpy), function (err) {
    if (err) { t.fail(err); return t.end(); }
    
    browserify( { ignoreGlobals: true })
      .require(require.resolve(relPath))
      .bundle(function (err, src) {
        rmrf.sync(path.join(__dirname, relPathCpy));

        if (err) { t.fail(err); return t.end(); }

        var ctx = { window: {}, console: console };
        ctx.self = ctx.window;
        var require_ = vm.runInNewContext(src, ctx);
        
        var main = require_(require.resolve(relPath));

        t.deepEqual(
            main
          , { root: '$.position', fn: '$.fn.position', ui: '$.ui.position' }
          , 'shims it correctly including requiring its dependends'
        );
        t.end()
      });
  });
}


test('\nbundling pack that has shimmed bower component dependency'
    , bundleNcheck.bind(null, './bower'))
