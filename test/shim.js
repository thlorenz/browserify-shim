'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , shim = require('..')

test('when I shim "jquery" to a crippled jquery file in debug mode and require it inside the entry file', function (t) {
  
  var b = browserify()
  shim(b, { jquery: { path: './fixtures/shims/crippled-jquery', exports: '$' } })
  b.add(__dirname + '/fixtures/entry-requires-jquery.js')

  b.bundle({}, function (err, src) {
    if (err) {
      console.error(err);
      t.end()
    } 
    require('fs').writeFileSync('./bundle.js', src, 'utf-8')
    
    var ctx = { window: {}, console: console };
    vm.runInNewContext(src, ctx);
    //Object.keys(ctx.window).forEach(function (k) { console.log(k) })

    t.equal(ctx.window.require('/entry-requires-jquery').getJqueryVersion(), '1.8.3', 'requires crippled jquery and gets version');
    t.end()
  })
});
  
/*test('when I shim "jquery" to a crippled jquery file in non debug mode and require it inside the entry file', function (t) {
  
  var src = browserify({ debug: false })
    .use(shim({ alias: 'jquery', path: './fixtures/shims/crippled-jquery', exports: '$' }))
    .addEntry(__dirname + '/fixtures/entry-requires-jquery.js')
    .bundle()

  console.log(src);
  var ctx = { window: {}, console: console };
  vm.runInNewContext(src, ctx);

  t.equal(ctx.window.require('/entry-requires-jquery').getJqueryVersion(), '1.8.3', 'requires crippled jquery and gets version');
  t.end()
});*/
