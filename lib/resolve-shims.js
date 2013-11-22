'use strict';

var path             =  require('path')
  , util             =  require('util')
  , parentDir        =  require('find-parent-dir')
  , parseInlineShims =  require('./parse-inline-shims')

var shimsCache =  {}
  , byPath     =  {};

function inspect(obj, depth) {
  return util.inspect(obj, false, depth || 5, true);
}

function isPath(s) {
  return (/^[.]{0,2}[/\\]/).test(s);
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

function resolveDependsRelativeTo(dir, browser, depends) {
  if (!depends) return undefined;
  return Object.keys(depends).reduce(function (acc, k) {
    if (browser[k]){
      // exposed -- lets keep referring to it under its alias
      acc[k] = depends[k];
    } else if (!isPath(k)) {
      // if it's not a path it refers to a module that is exposed in another package
      acc[k] = depends[k];
    } else {
      // otherwise resolve the path
      acc[path.resolve(dir, k)] = depends[k];
    }

    return acc;
  }, {})
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
      var depends = resolveDependsRelativeTo(shimFileDir || packageDir, browser, shim.depends);

      acc[shimPath] = { exports: shim.exports, depends: depends };
      return acc;
    }, {});
}

function resolveFromShimFile(packageDir, pack, shimField) {
  var shimFile =  path.join(packageDir, shimField)
    , shimFileDir = path.dirname(shimFile);

  var shims = require(shimFile);

  return resolvePaths(packageDir, shimFileDir, pack.browser || {}, shims);
}

function resolveInlineShims(packageDir, pack, shimField) {
  var shims = parseInlineShims(shimField);

  // shimFile is our package.json in this case
  return resolvePaths(packageDir, null, pack.browser || {}, shims);
}

var resolve = module.exports = function resolveShims (file, cb) {
  parentDir(file, 'package.json', function (err, packageDir) {
    if (err) return cb(err);
    // we cached this before which means it was also grouped by file
    if (shimsCache[packageDir]) return cb(null, byPath[file]);

    var pack = require(path.join(packageDir, 'package.json'));

    var shimField = pack['browserify-shim'];
    if (!shimField) return cb(); 

    try {
      var resolvedShims = typeof shimField === 'string'
        ? resolveFromShimFile(packageDir, pack, shimField)
        : resolveInlineShims(packageDir, pack, shimField);

      updateCache(packageDir, resolvedShims);
      cb(null, byPath[file]);
    } catch (err) {
      return cb(err);
    }
  });
}
