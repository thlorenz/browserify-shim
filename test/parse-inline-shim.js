'use strict';
/*jshint asi: true */

var debug =  false;
var test  =  debug  ? function () {} : require('tap').test
var test_ =  !debug ? function () {} : require('tap').test

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

test('\nparsing shims with invalid depends', function (t) {
  function shouldFail(shims, msg) {
    try { 
      parse(shims); 
      t.fail('should have failed');
    } catch(e) { 
      t.similar(e.message, /Invalid depends specification/, msg);
    }
  }

  shouldFail({
        'non-cjs': 'noncjs',
        'non-cjs-dep': { exports: 'noncjsdep', depends: 'non-cjs:noncjs:jquery:$' },
      }
    , 'more than one depends in one declaration'
  )

  shouldFail({
        'non-cjs': 'noncjs',
        'non-cjs-dep': { exports: 'noncjsdep', depends: ':noncjs' },
      }
    , 'no export name'
  )

  t.end();
})

test('\nparsing shims with whitespaces', function (t) {
  var shims = {
    jquery: '$',
    'non-cjs'       : 'noncjs',
    'non-cjs-dep'   : { exports: 'noncjsdep  ', depends: 'non-cjs :noncjs' },
    'just-dep '     : { exports: '  justdep' , depends: [ ' non-cjs:noncjs', 'jquery:  $ ' ] },
  }
  var res = parse(shims);
  var jd = res['just-dep']
  t.equal(res['non-cjs-dep'].exports, 'noncjsdep', 'removes trailing space from export')
  t.equal(jd.exports, 'justdep', 'removes leading space from exports')
  t.equal(jd.depends.jquery, '$', 'removes spaces around depends export')

  t.end()
})
