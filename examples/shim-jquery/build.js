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
    .use(shim({ alias: 'jquery', path: './js/vendor/jquery.js', export: '$' }))
    // Need to use shim.addEntry in order to work (instead of browserify's built in 'addEntry')
    .use(shim.addEntry('./js/entry.js'))
    .bundle();

  fs.writeFileSync(builtFile, bundled);

  console.log('Build succeeded, open index.html to see the result.');
}

// Normally jquery.js would be in vendor folder already, but I wanted to avoid spreading jquerys all over github ;)
// So lets download jquery and then run the bundler.
request('http://code.jquery.com/jquery-1.8.3.min.js', function(err, resp, body) {
  var jqueryFile = path.join(__dirname, 'js/vendor/jquery.js');

  fs.writeFileSync(jqueryFile, body);

  bundle();
});
