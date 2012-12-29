'use strict';

var path = require('path')
  , fs = require('fs')
  , getInjectPosition = require('./lib/get-injectposition')
  , buildScriptDir = path.dirname(module.parent.filename)
  , shimmed = [] 
  ;

module.exports        =  shim;

// bad, bad, bad, but results in so much nicer API and since this will only run as part of the browserify bundle script it's ok, right?
String.prototype.shim = function () { return injectShimsInto(this); };

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
    bundle.ignore(config.alias); 
    shimmed.push(wrapped);
  };
}

function injectShimsInto(src) {
  if (!shimmed.length) throw new Error('unable to shims the bundle because no shims were registered via: bundle.use(shim(..))');

  var position = getInjectPosition(src);
  if (position < 0) throw new Error('unable to shim the given bundle because shim inject position could not be found');

  return [ src.slice(0, position), shimmed.join('\n') + '\n', src.slice(position) ].join('');
}
