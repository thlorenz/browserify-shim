'use strict';

module.exports = {
  'non-cjs': { exports : 'noncjs' },
  '../vendor/non-cjs-core.js': { exports : 'noncjscore' },
  'non-cjs-dep': { 
      exports: 'noncjsdep'
      // non-cjs-core is not exposed so we need to refer to it under its relative path
    , depends: { 'non-cjs': 'noncjs', '../vendor/non-cjs-core.js': 'core' } 
  }
};
