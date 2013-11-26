'use strict';

process.env.BROWSERIFYSHIM_DIAGNOSTICS = 1;

var request = require('request')
  , fs      = require('fs')
  , path = require('path')
  , browserify = require('browserify')
  ;

function bundle() {
  // This is function is the important part and should be similar to what you would use for your project
  var builtFile = path.join(__dirname, 'js', 'bundle.js');

  browserify()  
    // this resolves main file of our package
    .require(require.resolve('./'), { entry: true })
    .bundle({ debug: true })
    .on('end', function () {
      console.log('Build succeeded, open index.html to see the result.');
    })
    .on('error', console.error.bind(console)) 
    .pipe(fs.createWriteStream(builtFile, 'utf8'))
}

// Normally jquery.js would be in vendor folder already, but I wanted to avoid spreading jquerys all over github ;)
// So lets download jquery and then run the bundler.
request('http://code.jquery.com/jquery-1.8.3.min.js', function(err, resp, body) {
  var jqueryFile = path.join(__dirname, 'js/vendor/jquery.js');

  fs.writeFileSync(jqueryFile, body);

  bundle();
});
