'use strict';
/*jshint asi: true */

var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function bundleNcheck(relPath, t) {
  browserify( { ignoreGlobals: true })
    .require(require.resolve(relPath))
    .bundle(function (err, src) {
      if (err) { t.fail(err); return t.end(); }

      var ctx = { window: {}, console: console };
      ctx.self = ctx.window;
      var require_ = vm.runInNewContext(src, ctx);
       
      var main = require_(require.resolve(relPath));

      t.deepEqual(
          main()
        , { sub1:
              { name: 'sub1noncjsdep',
                sub1noncjs: { name: 'sub1-non-cjs', version: 0.1 } },
            sub1noncjsdep:
              { name: 'sub1noncjsdep',
                sub1noncjs: { name: 'sub1-non-cjs', version: 0.1 } },
            sub2:
              { name: 'sub2noncjsdep',
                sub2noncjs: { name: 'sub2-non-cjs', version: 0.2 } },
            sub2noncjsdep:
              { name: 'sub2noncjsdep',
                sub2noncjs: { name: 'sub2-non-cjs', version: 0.2 } } 
            }
        , 'shims all non-cjs modules, attaches them to the window and allows pulling them all together'
      );
      t.end()
    });
}

test('\nshimming pack with sub1 and sub2 dependency'
    , bundleNcheck.bind(null, './packs/main'))
