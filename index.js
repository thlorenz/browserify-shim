'use strict';

var path           =  require('path')
  , fs             =  require('fs')
  , util           =  require('util')
  , format         =  require('util').format
  , through        =  require('through')
  , parentDir      =  require('find-parent-dir')
  ;

function inspect(obj, depth) {
  return util.inspect(obj, false, depth || 5, true);
}

function validate(key, config, dir) {
  console.log(config);
  var msg
    , details = 'When evaluating shim "' + key + '": ' + inspect(config) + '\ninside ' + dir + '\n';

  if (!config.hasOwnProperty('path')) {
    msg = 'browserify-shim needs at least a path and exports to do its job, you are missing the path.';
    throw new Error(details + msg);
  }
  if (!config.hasOwnProperty('exports')) {
    msg = 'browserify-shim needs at least a path and exports to do its job, you are missing the exports. ' +
          '\nIf this module has no exports, specify exports as null.'
    throw new Error(details + msg);
  }
}

function requireDependencies(depends) {
  if (!depends) return '';

  return Object.keys(depends)
    .map(function (k) { return { alias: k, exports: depends[k] || null }; })
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
  
  return '(function browserifyShim(module, exports, define, browserify_shim__define__module__export__) {\n'
      + dependencies 
      + s
      + '\n}).call(global, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });\n';
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

function wrap(content, config) {
  var exported = config.exports
      ? content + moduleExport(config.exports)
      : content
  , dependencies = requireDependencies(config.depends)
  , boundWindow = config.exports
      ? bindWindowWithExports(exported, dependencies)
      : bindWindowWithoutExports(exported, dependencies);

  return boundWindow;
}

var shimsCache = {}
  , byPath = {};

function updateCache(packageJson_dir, shims) {
  shimsCache[packageJson_dir] = shims;
  Object.keys(shims).forEach(function(k) {
    var shim = shims[k]; 
    validate(k, shim, packageJson_dir);
    byPath[shim.path] = shim;
  });
}

function resolveShims (file, cb) {
  parentDir(file, 'package.json', function (err, dir) {
    if (err) return cb(err);
    if (shimsCache[dir]) return cb(null, shimsCache[dir]);

    var pack = require(path.join(dir, 'package.json'));

    var shimFile = pack.browserify && pack.browserify.shim;
    if (!shimFile) return cb(); 

    try {
      var mod = require(path.join(dir, shimFile));
      updateCache(dir, mod);
      cb();
    } catch (err) {
      return cb(err);
    }
  });
}

module.exports = function (file) {
  var content = '';
  var stream = through(write, end);
  return stream;

  function write(buf) { content += buf; }
  function end() {
    resolveShims(file, function (err) {
      if (err) return console.error(err);
      
      var config = byPath[file] 
        , transformed = config ? wrap(content, config) : content;

      stream.queue(transformed);
      stream.queue(null);
    });
  }
}
