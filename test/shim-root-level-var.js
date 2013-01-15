'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , shim = require('..')

test('when I shim a module that declares its export as a var on the root level instead of attaching it to the window, in debug mode', function (t) {
    
  var src = browserify({ debug: true })
    .use(shim({ alias: 'rootvar', path: './fixtures/shims/root-level-var.js', exports: 'nineties' }))
    .addEntry(__dirname + '/fixtures/entry-requires-root-level-var.js')
    .bundle()
    .shim()

  var ctx = { window: {}, console: console };
  vm.runInNewContext(src, ctx);

  t.equal(
      ctx.window.require('/entry-requires-root-level-var').message
    , "I declare vars on the script level and expect them to get attached to the window because I'm doin' it 90s style baby!" 
    , 'requires crippled jquery and gets version'
  );
  t.end()
})

test('when I shim a module that declares its export as a var on the root level instead of attaching it to the window, in non debug mode', function (t) {
    
  var src = browserify({ debug: false })
    .use(shim({ alias: 'rootvar', path: './fixtures/shims/root-level-var.js', exports: 'nineties' }))
    .addEntry(__dirname + '/fixtures/entry-requires-root-level-var.js')
    .bundle()
    .shim()

  var ctx = { window: {}, console: console };
  vm.runInNewContext(src, ctx);

  t.equal(
      ctx.window.require('/entry-requires-root-level-var').message
    , "I declare vars on the script level and expect them to get attached to the window because I'm doin' it 90s style baby!" 
    , 'requires crippled jquery and gets version'
  );
  t.end()
})
