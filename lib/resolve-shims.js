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

function updateCache(packageJson_dir, resolvedShims) {
  shimsCache[packageJson_dir] = resolvedShims;
  Object.keys(resolvedShims).forEach(function(fullPath) {
    var shim = resolvedShims[fullPath]; 
    validate(fullPath, shim, packageJson_dir);
    byPath[fullPath] = shim;
  });
}

function resolvePaths (root, redirects, shims) {
  return Object.keys(shims).reduce(function (acc, k) {
    var shim = shims[k];
    var redirect = redirects[k];

    if (redirect) {
      // TODO
      debug('redirect', redirect);
    }

    var relPath = redirect || k
      , shimPath = path.resolve(root, relPath);

    acc[shimPath] = { exports: shim.exports, depends: shim.depends };
    return acc;
  }, {});
}

function insp(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var resolve = module.exports = function resolveShims (file, cb) {
  parentDir(file, 'package.json', function (err, dir) {
    if (err) return cb(err);
    if (shimsCache[dir]) return cb(null, shimsCache[dir]);

    var pack = require(path.join(dir, 'package.json'));

    var shimField = pack['browserify-shim'];
    if (!shimField) return cb(); 

    // TODO: shimFile may be a config object instead of a string pointing to a file
    //       in that case the root is the package.json dir
    var shimFile =  path.join(dir, shimField)
      , root     =  path.dirname(shimFile);

    try {
      var shims = require(shimFile);

      var resolvedShims = resolvePaths(root, pack.browser || {}, shims);
      updateCache(dir, resolvedShims);
      cb(null, byPath[file]);
    } catch (err) {
      return cb(err);
    }
  });
}

// Test
if (!module.parent && typeof window === 'undefined') {
  
  resolve(require.resolve('../test/nodeps/extshim/vendor/non-cjs'), function (err, res) {
    if (err) return console.error(err);
    debug.inspect(res);
  });
}
