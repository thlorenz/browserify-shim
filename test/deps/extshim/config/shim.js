'use strict';

module.exports = {
  'non-cjs': { exports : 'noncjs' },
  'non-cjs-dep': { exports: 'noncjsdep', depends: { 'non-cjs': 'noncjs' } }
};
