'use strict';

var path              =  require('path')
  , fs                =  require('fs')
  , format            =  require('util').format
  , getInjectPosition =  require('./lib/get-injectposition')
  , buildScriptDir    =  path.dirname(module.parent.filename)
  ;

module.exports = shim;

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
        : content
    , boundWindow = bindWindow(exported);

  return function (bundle) {
    bundle.include(config.path, config.alias, boundWindow);
  };
}
