'use strict';

var path              =  require('path')
  , fs                =  require('fs')
  , format            =  require('util').format
  , getInjectPosition =  require('./lib/get-injectposition')
  , buildScriptDir    =  path.dirname(module.parent.filename)
  , registeredShims   =  {}
  ;

module.exports = shim;

shim.__defineGetter__(
    'registeredAliases'
  , function () { return Object.keys(registeredShims); }
);

// bad, bad, bad, but results in so much nicer API and since this will only run as part of the browserify bundle script it's ok, right?
String.prototype.shim = function () { return injectShimsInto(this); };

function validate(config) {
  if (!config) 
    throw new Error('browserify-shim needs at least an alias, a path and an exports to do its job, you are missing the entire config.');
  if (!config.hasOwnProperty('alias'))
    throw new Error('browserify-shim needs at least an alias, a path and an exports to do its job, you are missing the alias.');
  if (!config.hasOwnProperty('path'))
    throw new Error('browserify-shim needs at least an path, a path and an exports to do its job, you are missing the path.');
  if (!config.hasOwnProperty('exports'))
    throw new Error('browserify-shim needs at least an exports, a path and an exports to do its job, you are missing the exports.');
}

function bindWindow(s) {
  return '(function browserifyShim() {\n' + s + '\n}).call(global);\n';
}

function moduleExport(exp) {
  return format(';\nmodule.exports = typeof %s != "undefined" ? %s : window.%s;\n', exp, exp, exp);
}

function shim(config) {
  validate(config);

  var resolvedPath = require.resolve(path.resolve(buildScriptDir, config.path))
    , content = fs.readFileSync(resolvedPath, 'utf-8')
    , exported = config.exports
        ? content + moduleExport(config.exports)
        : content;

  return function (bundle) {
    var wrapped = bundle.wrap(config.alias, bindWindow(exported));
    bundle.ignore(config.alias); 
    registeredShims[config.alias] = wrapped;
  };
}

function injectShimsInto(src) {
  if (!shim.registeredAliases.length) throw new Error('unable to shims the bundle because no shims were registered via: bundle.use(shim(..))');

  var position = getInjectPosition(src);
  if (position < 0) throw new Error('unable to shim the given bundle because shim inject position could not be found');

  var wrappers = Object.keys(registeredShims).map(function (k) { return registeredShims[k]; });

  return [ src.slice(0, position), wrappers.join('\n') + '\n', src.slice(position) ].join('');
}
