'use strict';

var path = require('path')
  , fs = require('fs')
  , buildScriptDir = path.dirname(module.parent.filename);


module.exports = function shim(config) {
  if (!config || !config.alias || !config.path || !config.export) 
    throw new Error('browserify-shim needs at least an alias, a path and an export to do its job');


  var resolvedPath = require.resolve(path.resolve(buildScriptDir, config.path))
    , content = fs.readFileSync(resolvedPath, 'utf-8')
    , exported = content + ';\nmodule.exports = window.' + config.export + ';';

  return function (bundle) {
    var wrapped = bundle.wrap(config.alias, exported);
    bundle.ignore(config.alias).append(wrapped);
  };
};

module.exports.addEntry = function shimAddEntry(file) {
  var resolvedPath = require.resolve(path.resolve(buildScriptDir, file))
    , content = fs.readFileSync(resolvedPath, 'utf-8')
    , alias = '/' + path.basename(resolvedPath);

  return function (bundle) {
    var entry = bundle.wrapEntry(alias, content);
    bundle.append(entry);
  };
};

