'use strict';

var path              =  require('path')
  , fs                =  require('fs')
  , format            =  require('util').format
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

function validateDepends(depends) {
  depends.forEach(function (dep) {
    if (!dep.alias)
        throw new Error('when a dependency is declared, an alias property needs to be included, [' + dep + '] is missing one');
    if (!dep.exports)
        throw new Error('when a dependency is declared, an exports property needs to be included, [' + dep + '] is missing one');
  });
}

function requireDependencies(depends) {
  if (!depends) return '';
  depends = Array.isArray(depends) ? depends : [ depends ];
  validateDepends(depends);

  return depends.reduce(
      function (acc, dep) {
        return acc + 'global.' + dep.exports + ' = require("' + dep.alias + '");\n';
      }
    , '\n; '
  );
}

function bindWindow(s, dependencies) {
  return '(function browserifyShim() {\n'
      + dependencies 
      + s
      + '\n}).call(global);\n';
}

function moduleExport(exp) {
  return format('\n; module.exports = typeof %s != "undefined" ? %s : window.%s;\n', exp, exp, exp);
}

function shim(config) {
  validate(config);

  var resolvedPath = require.resolve(path.resolve(buildScriptDir, config.path))
    , content = fs.readFileSync(resolvedPath, 'utf-8')
    , exported = config.exports
        ? content + moduleExport(config.exports)
        : content
    , dependencies = requireDependencies(config.depends)
    , boundWindow = bindWindow(exported, dependencies);

  return function (bundle) {
    bundle.include(config.path, config.alias, boundWindow);
  };
}
