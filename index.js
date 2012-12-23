'use strict';

var path = require('path')
  , fs = require('fs')
  , buildScriptDir = path.dirname(module.parent.filename);

module.exports = shim;
module.exports.addEntry = shimAddEntry;

function validate(config) {
  if (!config) 
    throw new Error('browserify-shim needs at least an alias, a path and an export to do its job, you are missing the entire config.');
  if (!config.hasOwnProperty('alias'))
    throw new Error('browserify-shim needs at least an alias, a path and an export to do its job, you are missing the alias.');
  if (!config.hasOwnProperty('path'))
    throw new Error('browserify-shim needs at least an path, a path and an export to do its job, you are missing the path.');
  if (!config.hasOwnProperty('export'))
    throw new Error('browserify-shim needs at least an export, a path and an export to do its job, you are missing the export.');
}

function shim(config) {
  validate(config);

  var resolvedPath = require.resolve(path.resolve(buildScriptDir, config.path))
    , content = fs.readFileSync(resolvedPath, 'utf-8')
    , exported = config.export 
        ? content + ';\nmodule.exports = window.' + config.export + ';' 
        : content;

  return function (bundle) {
    var wrapped = bundle.wrap(config.alias, exported);
    bundle.ignore(config.alias).append(wrapped);
  };
}

function shimAddEntry(file) {
  var resolvedPath = require.resolve(path.resolve(buildScriptDir, file))
    , content = fs.readFileSync(resolvedPath, 'utf-8')
    , alias = '/' + path.basename(resolvedPath);

  return function (bundle) {
    var entry = bundle.wrapEntry(alias, content);
    bundle.append(entry);
  };
}

