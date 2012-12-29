'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , shim = require('..')

  
var bundle = require('fs').readFileSync(__dirname + '/fixtures/bundle.js', 'utf-8')

var re = /^require\(".+"\);$/mg;
var position = -1;
for (var match = re.exec(bundle); match; match = re.exec(bundle)) position = match.index;

var output = [bundle.slice(0, position), , bundle.slice(position)].join('\n');

console.log(output);

return;
test('when I shim "jquery" to a crippled jquery file and require it inside the entry file', function (t) {
  
  var src = browserify({ debug: true })
    .use(shim({ alias: 'jquery', path: './fixtures/shims/crippled-jquery', export: '$' }))
    .use(shim.addEntry('./fixtures/entry-requires-jquery'))
    .addEntry(__dirname + '/fixtures/entry-requires-jquery.js')
    .bundle();

  require('fs').writeFileSync(__dirname + '/fixtures/bundle.js', src, 'utf-8')
  var ctx = { window: {}, console: console };
  vm.runInNewContext(src, ctx);

  t.equal(ctx.require('/entry-requires-jquery').getJqueryVersion(), '1.8.3', 'requires crippled jquery and gets version');
  t.end()
});
  
