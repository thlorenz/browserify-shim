'use strict';
/*jshint asi: true */

var test = require('tap').test
var parse = require('../lib/parse-inline-shims')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\nparsing shims with pure string spec, single depends as string and multi-depends as array', function (t) {
  var shims = {
    jquery: '$',
    'non-cjs'       : 'noncjs',
    'non-cjs-dep'   : { exports: 'noncjsdep'    , depends: 'non-cjs:noncjs' },
    'noexport-dep'  : { exports: 'noexportdep'  , depends: 'non-cjs' },
    'just-dep'      : { exports: 'justdep'      , depends: [ 'non-cjs:noncjs', 'jquery:$' ] },
  }
  t.deepEqual(
      parse(shims)
    , { jquery        :  { exports :  '$'           ,  depends:  undefined },
        'non-cjs'     :  { exports :  'noncjs'      ,  depends:  undefined },
        'non-cjs-dep' :  { exports :  'noncjsdep'   ,  depends:  { 'non-cjs':  'noncjs' } },
        'noexport-dep':  { exports :  'noexportdep' ,  depends:  { 'non-cjs':  null } },
        'just-dep'    :  { exports :  'justdep'     ,  depends:  { 'non-cjs':  'noncjs',  jquery :  '$' } }
      } 
  )
  t.end()
})
