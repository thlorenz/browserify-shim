'use strict';
/*jshint asi: true */
var browserify = require('browserify')
  , test = require('tap').test
  , vm = require('vm')
  , shim = require('..')

var jquery = { alias: 'jquery', path: './fixtures/shims/crippled-jquery', exports: '$' };
var under = { alias: 'under', path: './fixtures/shims/lib-attaching-_', exports: '_' };
var dependent = { 
    alias: 'dependent'
  , path: './fixtures/shims/lib-depending-on-global-jquery'
  , exports: 'dep' 
  , depends: jquery
};
var multidependent = { 
    alias: 'multidependent'
  , path: './fixtures/shims/lib-depending-on-global-jquery-and-_'
  , exports: 'dep' 
  , depends: [ jquery, under ]
};

test('\nwhen I shim "jquery" in debug mode and shim a lib that depends on it', function (t) {
  
  var src = browserify({ debug: true, exports: 'require' })
    .use(shim(jquery))
    .use(shim(dependent))
    .bundle()

  src += '\nrequire("dependent")';

  var ctx = { window: {}, console: console };
  vm.runInNewContext(src, ctx);

  t.equal(ctx.window.dep.jqVersion, '1.8.3', 'when dependent gets required, $ is attached to the window');
  t.end()
});

test('\nwhen I shim "jquery" in non debug mode and shim a lib that depends on it', function (t) {
  
  var src = browserify({ debug: false, exports: 'require' })
    .use(shim(jquery))
    .use(shim(dependent))
    .bundle()

  src += '\nrequire("dependent")';

  var ctx = { window: {}, console: console };
  vm.runInNewContext(src, ctx);

  t.equal(ctx.window.dep.jqVersion, '1.8.3', 'when multidependent gets required, $ is attached to the window');
  t.end()
});

test('\nwhen I shim "jquery" and _ lib in debug mode and shim a lib that depends on both', function (t) {
  
  var src = browserify({ debug: true, exports: 'require' })
    .use(shim(jquery))
    .use(shim(under))
    .use(shim(multidependent))
    .bundle()

  src += '\nrequire("multidependent")';

  var ctx = { window: {}, console: console };
  vm.runInNewContext(src, ctx);

  t.equal(ctx.window.dep.jqVersion, '1.8.3', 'when multidependent gets required, $ is attached to the window');
  t.equal(ctx.window.dep._(), 'super underscore', 'and _ is attached to the window');
  t.end()
});

test('\nwhen I shim "jquery" and _ lib in debug mode and shim a lib that depends on both, shimming dependent first', function (t) {
  
  var src = browserify({ debug: true, exports: 'require' })
    .use(shim(multidependent))
    .use(shim(jquery))
    .use(shim(under))
    .bundle()

  src += '\nrequire("multidependent")';

  var ctx = { window: {}, console: console };
  vm.runInNewContext(src, ctx);

  t.equal(ctx.window.dep.jqVersion, '1.8.3', 'when multidependent gets required, $ is attached to the window');
  t.equal(ctx.window.dep._(), 'super underscore', 'and _ is attached to the window');
  t.end()
});
