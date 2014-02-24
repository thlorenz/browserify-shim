'use strict';

var readdirp   = require('readdirp')
  , fs         = require('fs')
  , path       = require('path')
  , through    = require('through2')
  , mothership = require('mothership')
  , format     = require('util').format
  , exists     = fs.exists || path.exists
  ;

var fixed = {};

/**
 * Fixes the package by removing all dependencies and dev dependencies, since those are not valid unless the package.json
 * was implemented properly.
 *
 * Note: in the future this could be a bit smarter, i.e. trying to resolve packages are possibly inside node_modules 
 *       and leaving those as dependencies if found
 * 
 * @name fixPackage
 * @function
 * @param {string} packagePath full path to the package to fix
 * @param {function} cb called back when fixed and rewritten
 */
function fixPackage(packagePath, cb) {
  var pack = require(packagePath);
  delete pack.dependencies;
  delete pack.devDependencies;
  fs.writeFile(packagePath, JSON.stringify(pack, null, 2), 'utf8', cb);
}

/**
 * Removes all package.json files inside the given root recursively, ignoring node_modules, .git and .svn.
 * 
 * @name fixPackagesInside
 * @function
 * @param {string} root full path to root at which to start removing, is assumed to exist
 * @param {Array.<string} messages to which diagnostics are pushed
 * @param {function } cb called back with error if it failed or nothing if successful
 * @return 
 */
function fixPackagesInside(root, messages, cb) {
  if (fixed[root]) {
    messages.push('packages were fixed before, skipping');
    return cb();
  }
  readdirp(
      { root: root 
      , fileFilter: 'package.json'
      , directoryFilter: [ '!node_modules', '!.git', '!.svn' ]
      }
  )
  .on('error', cb)
  .on('end', cb)
  .pipe(through({objectMode: true }, function (entry, _, cb) {
    messages.push('fixing ' + entry.path);
    fixPackage(entry.fullPath, cb);
  }))
  .on('error', cb)
}

module.exports = 

function fixPackages(packageDir, pack, messages, cb) {
  var config = pack['browserify-shim'];
  
  var relPath = config['@fixPackages'];
  if (!relPath) return cb();

  delete config['@fixPackages'];

  var root = path.resolve(packageDir, relPath);

  exists(root, function (itdoes) {
    if (!itdoes) return cb(
      new Error(
        format('specified inside package.json as browserify-shim.@fixPackages %s resolves to %s which does not exist', relPath, root)
      )
    );
    messages.push(format('Applying @fixPackages: %s, resolved to %s', relPath, root));
    fixPackagesInside(root, messages, cb);
  });
}
