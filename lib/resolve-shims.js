'use strict';

var path             =  require('path')
  , util             =  require('util')
  , parentDir        =  require('find-parent-dir')
  , parseInlineShims =  require('./parse-inline-shims')
  , format           =  require('util').format

var shimsCache =  {}
  , shimsByPath     =  {};

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

function updateCache(packageDir, pack, resolvedShims, exposeGlobals) {
  shimsCache[packageDir] = { pack: pack, shims: resolvedShims, exposeGlobals: exposeGlobals };
  Object.keys(resolvedShims).forEach(function(fullPath) {
    var shim = resolvedShims[fullPath]; 
    validate(fullPath, shim, packageDir);
    shimsByPath[fullPath] = shim;
  });
}

function resolveDependsRelativeTo(dir, browser, depends, packDeps, messages) {
  var resolved;

  if (!depends) return undefined;

  return Object.keys(depends).reduce(function (acc, k) {
    if (browser[k]){
      acc[k] = depends[k];
      messages.push(format('Found depends "%s" exposed in browser field', k));
    } else if (!isPath(k)) {
      acc[k] = depends[k];
      if (packDeps[k]) {
        messages.push(format('Found depends "%s" as an installed dependency of the package', k));
      } else {
        messages.push(format('WARNING, depends "%s" is not a path, nor is it exposed in the browser field, nor was it found in package dependencies.', k));
      }
    } else {
      // otherwise resolve the path
      resolved = path.resolve(dir, k);
      acc[resolved] = depends[k];
      messages.push(format('Depends "%s" was resolved to be at [%s]', k, resolved));
    }

    return acc;
  }, {})
}

function resolvePaths (packageDir, shimFileDir, browser, shims, packDeps, messages) {
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
        messages.push(format('Found "%s" in browser field referencing "%s" and resolved it to "%s"', relPath, exposed, shimPath));
      } else if (shimFileDir) {
        // specified via relative path to shim file inside shim file
        // i.e. './vendor/non-cjs': { exports: .. } 
        shimPath = path.resolve(shimFileDir, relPath);
        messages.push(format('Resolved "%s" found in shim file to "%s"', relPath, shimPath));
      } else {
        // specified via relative path in package.json browserify-shim config
        // i.e. 'browserify-shim': { './vendor/non-cjs': 'noncjs' }
        shimPath = path.resolve(packageDir, relPath);
        messages.push(format('Resolved "%s" found in package.json to "%s"', relPath, shimPath));
      }
      var depends = resolveDependsRelativeTo(shimFileDir || packageDir, browser, shim.depends, packDeps, messages);

      acc[shimPath] = { exports: shim.exports, depends: depends };
      return acc;
    }, {});
}

function mapifyExposeGlobals(exposeGlobals) {
  return Object.keys(exposeGlobals)
    .reduce(function (acc, k) {

      var val = exposeGlobals[k];
      var parts = val.split(':');

      if (parts.length < 2 || !parts[1].length) { 
        throw new Error(
            'Expose Globals need to have the format "global:expression.\n"'
          + inspect({ key: k, value: val }) + 'does not.'
        );
      }

      // this also handle unlikely cases of 'global:_.someFunc(':')' with a `:` in the actual global expression
      parts.shift();
      acc[k] = parts.join(':');

      return acc;
    }, {});
}

function separateExposeGlobals(shims) {
  var onlyShims = {}
    , exposeGlobals = {};

  Object.keys(shims).forEach(function (k) {
    var val = shims[k]
      , exp = val && val.exports;

    if (exp && /^global\:/.test(exp)) {
      exposeGlobals[k] = exp;
    } else {
      onlyShims[k] = val;
    }
  });

  return { shims: onlyShims, exposeGlobals: mapifyExposeGlobals(exposeGlobals) };
}

function resolveFromShimFile(packageDir, pack, shimField, messages) {
  var shimFile =  path.join(packageDir, shimField)
    , shimFileDir = path.dirname(shimFile);

  var allShims = require(shimFile);
  var separated = separateExposeGlobals(allShims);

  var resolvedShims = resolvePaths(packageDir, shimFileDir, pack.browser || {}, separated.shims, pack.dependencies || {}, messages);
  return { shims: resolvedShims, exposeGlobals: separated.exposeGlobals };
}

function resolveInlineShims(packageDir, pack, shimField, messages) {
  var allShims = parseInlineShims(shimField);
  var separated = separateExposeGlobals(allShims);

  var resolvedShims = resolvePaths(packageDir, null, pack.browser || {}, separated.shims, pack.dependencies || {}, messages);
  return { shims: resolvedShims, exposeGlobals: separated.exposeGlobals };
}

var resolve = module.exports = function resolveShims (file, messages, cb) {
  (function resolve(rootdir, lookedUp) {
    parentDir(rootdir, 'package.json', function (err, packageDir) {
      if (err) return cb(err);

      var pack;

      var packFile = path.join(packageDir, 'package.json');
      // we cached this before which means it was also grouped by file
      var cached = shimsCache[packageDir];
      if (cached) { 
        pack = cached.pack;
        return cb(null, { 
            package_json       :  packFile
          , packageDir         :  packageDir
          , resolvedPreviously :  true
          , shim               :  shimsByPath[file]
          , exposeGlobals      :  cached.exposeGlobals
          , browser            :  pack.browser
          , 'browserify-shim'  :  pack['browserify-shim']
          , dependencies       :  pack.dependencies
          , lookedUp           :  lookedUp
        });
      }

      try {
        pack = require(packFile);

        var shimField = pack['browserify-shim'];

        if (!shimField) { 
          if (lookedUp) return cb(null, { package_json: packFile, shim: undefined }); 

          // some files are inside invalid packages, i.e. bower components
          // in this case the package.json we find first is not the one that has the shims definitions
          // therefore we'll give it one more chance and look inside the package.json one level higher
          var root = path.resolve(packageDir, '..');
          return resolve(root, true);
        }

        var resolved = typeof shimField === 'string'
          ? resolveFromShimFile(packageDir, pack, shimField, messages)
          : resolveInlineShims(packageDir, pack, shimField, messages);

        messages.push({ resolved: resolved.shims });
        updateCache(packageDir, pack, resolved.shims, resolved.exposeGlobals);

        cb(null, { 
            package_json      :  packFile
          , packageDir        :  packageDir 
          , shim              :  shimsByPath[file]
          , exposeGlobals     :  resolved.exposeGlobals
          , browser           :  pack.browser
          , 'browserify-shim' :  pack['browserify-shim']
          , dependencies      :  pack.dependencies
          , lookedUp          :  lookedUp
        });

      } catch (err) {
        console.trace();
        return cb(err);
      }
    });
  })(path.dirname(file), false);
}
