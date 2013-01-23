'use strict';

var path              =  require('path')
  , fs                =  require('fs')
  , format            =  require('util').format
  , buildScriptDir    =  path.dirname(module.parent.filename)
  ;

module.exports = shim;

function inspect(obj, depth) {
  return require('util').inspect(obj, false, depth || 5, true);
}

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

function requireDependencies(depends) {
  if (!depends) return '';
  //validateDepends(depends);

  return Object.keys(depends)
    .map(function (k) { return { alias: k, exports: depends[k] || null }; })
    //.forEach(function (x) { console.log(x); })
    .reduce(
      function (acc, dep) {
        return dep.exports 
          ? acc + 'global.' + dep.exports + ' = require("' + dep.alias + '");\n'
          : acc + 'require("' + dep.alias + '");\n';
      }
    , '\n; '
  );
}

function bindWindowWithExports(s, dependencies) {
  // purposely make module and define be 'undefined',
  // but pass a function that allows exporting our dependency from the window or the context
  
  return '(function browserifyShim(module, define, browserify_shim__define__module__export__) {\n'
      + dependencies 
      + s
      + '\n}).call(global, undefined, undefined, function defineExport(ex) { module.exports = ex; });\n';
}

function bindWindowWithoutExports(s, dependencies) {
  // if a module doesn't need anything to be exported, it is likely, that it exports itself properly
  // therefore it is not a good idea to override the module here

  return '(function browserifyShim(module, define) {\n'
      + dependencies 
      + s
      + '\n}).call(global, module, undefined);\n';
}

function moduleExport(exp) {
  return format('\n; browserify_shim__define__module__export__(typeof %s != "undefined" ? %s : window.%s);\n', exp, exp, exp);
}

function shim(config) {
  validate(config);

  var resolvedPath = require.resolve(path.resolve(buildScriptDir, config.path))
    , content = fs.readFileSync(resolvedPath, 'utf-8')
    , exported = config.exports
        ? content + moduleExport(config.exports)
        : content
    , dependencies = requireDependencies(config.depends)
    , boundWindow = config.exports
        ? bindWindowWithExports(exported, dependencies)
        : bindWindowWithoutExports(exported, dependencies);

  return function (bundle) {
    bundle.include(config.path, config.alias, boundWindow);
  };
}
