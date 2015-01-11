'use strict';

var path       = require('path')
  , fs         = require('fs')
  , browserify = require('browserify')
  ;

(function bundle() {
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
})();
