'use strict';

var path      =  require('path')
  , util      =  require('util')
  , parentDir =  require('find-parent-dir')
  , debug     =  require('./debug');

var shimsCache =  {}
  , byPath     =  {};

function inspect(obj, depth) {
  return util.inspect(obj, false, depth || 5, true);
}

function validate(key, config, dir) {
  var msg
    , details = 'When evaluating shim "' + key + '": ' + inspect(config) + '\ninside ' + dir + '\n';

  if (!config.hasOwnProperty('exports')) {
    msg = 'browserify-shim needs at least a path and exports to do its job, you are missing the exports. ' +
          '\nIf this module has no exports, specify exports as null.'
    throw new Error(details + msg);
  }
}

function updateCache(packageDir, resolvedShims) {
  shimsCache[packageDir] = resolvedShims;
  Object.keys(resolvedShims).forEach(function(fullPath) {
    var shim = resolvedShims[fullPath]; 
    validate(fullPath, shim, packageDir);
    byPath[fullPath] = shim;
  });
}

function resolvePaths (packageDir, shimFileDir, browser, shims) {
  return Object.keys(shims)
    .reduce(function (acc, relPath) {
      var shim = shims[relPath];
      var exposed = browser[relPath];
      var shimPath;

      if (exposed) {
        // lib exposed under different name/path in package.json's browser field
        // and it is referred to by this alias in the shims (either external or in package.json)
        // i.e.: 'non-cjs': { ... } -> browser: { 'non-cjs': './vendor/non-cjs.js }
        shimPath = path.resolve(packageDir, exposed);
      } else if (shimFileDir) {
        // specified via relative path to shim file inside shim file
        // i.e. './vendor/non-cjs': { exports: .. } 
        shimPath = path.resolve(shimFileDir, relPath);
      } else {
        // specified via relative path in package.json browserify-shim config
        // i.e. 'browserify-shim': { './vendor/non-cjs': 'noncjs' }
        shimPath = path.resolve(packageDir, relPath);
      }

      acc[shimPath] = { exports: shim.exports, depends: shim.depends };
      return acc;
    }, {});
}

function insp(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var resolve = module.exports = function resolveShims (file, cb) {
  parentDir(file, 'package.json', function (err, packageDir) {
    if (err) return cb(err);
    if (shimsCache[packageDir]) return cb(null, shimsCache[packageDir]);

    var pack = require(path.join(packageDir, 'package.json'));

    var shimField = pack['browserify-shim'];
    if (!shimField) return cb(); 

    // TODO: shimFile may be a config object instead of a string pointing to a file
    //       in that case the root is the package.json dir
    var shimFile =  path.join(packageDir, shimField)
      , shimFileDir = path.dirname(shimFile);

    try {
      var shims = require(shimFile);

      var resolvedShims = resolvePaths(packageDir, shimFileDir, pack.browser || {}, shims);

      updateCache(packageDir, resolvedShims);
      cb(null, byPath[file]);
    } catch (err) {
      return cb(err);
    }
  });
}

// Test
if (!module.parent && typeof window === 'undefined') {
  
  resolve(require.resolve('../test/nodeps/extshim-exposed/vendor/non-cjs'), function (err, res) {
    if (err) return console.error(err);
    debug.inspect(res);
  });
}
