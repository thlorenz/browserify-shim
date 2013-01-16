'use strict';

var request = require('request')
  , fs      = require('fs')
  , path = require('path')
  , browserify = require('browserify')
  , shim = require('../../')
  ;

function bundle() {
  // This is function is the important part and should be similar to what you would use for your project
  var builtFile = path.join(__dirname, 'js/build/bundle.js');

  var bundled = browserify({ debug: true })
    // setting export: null to denote that underscore is a commonJS module and doesn't need 
    // window property to be exported
    .use(shim({ alias: 'underscore', path: './js/vendor/underscore-min.js', exports: null }))
    .addEntry('./js/entry.js')
    .bundle();

  fs.writeFileSync(builtFile, bundled);

  console.log('Build succeeded, open index.html to see the result.');
}

// Normally underscore-min.js would be in vendor folder already, but I wanted to avoid spreading underscores all over github ;)
// So lets download underscore and then run the bundler.
request('http://underscorejs.org/underscore-min.js', function(err, resp, body) {
  var underscoreFile = path.join(__dirname, 'js/vendor/underscore-min.js');

  fs.writeFileSync(underscoreFile, body);

  bundle();
});
