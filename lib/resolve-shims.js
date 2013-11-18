'use strict';

var path      =  require('path')
  , util      =  require('util')
  , parentDir =  require('find-parent-dir')

var shimsCache =  {}
  , byPath     =  {};

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

function updateCache(packageJson_dir, shims) {
  shimsCache[packageJson_dir] = shims;
  Object.keys(shims).forEach(function(k) {
    var shim = shims[k]; 
    validate(k, shim, packageJson_dir);
    byPath[shim.path] = shim;
  });
}

function resolvePaths (pack, shims) {
  return Object.keys(shims).reduce(function (acc, k) {
    var redirect = pack.browser && pack.browser[k];
    var shim = shims[k];
    if (redirect) {
      // TODO
    }

    var shimPath = shim.path || redirect || k;
     
    acc[shimPath] = { path: shimPath, exports: shim.exports, depends: shim.depends };
    return acc;
  }, {});
}

function insp(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

module.exports = function resolveShims (file, cb) {
  parentDir(file, 'package.json', function (err, dir) {
    if (err) return cb(err);
    if (shimsCache[dir]) return cb(null, shimsCache[dir]);

    var pack = require(path.join(dir, 'package.json'));

    // TODO: shimFile may be a config object instead of a string
    var shimFile = pack['browserify-shim'];
    if (!shimFile) return cb(); 

    try {
      var shims = require(path.join(dir, shimFile));
      var resolvedShims = resolvePaths(pack, shims);
      updateCache(dir, resolvedShims);
      cb(null, byPath[file]);
    } catch (err) {
      return cb(err);
    }
  });
}

