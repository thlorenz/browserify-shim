'use strict';
module.exports = function getInjectPosition (src) {
   /*
    * find 'require.define("__browserify_process"' position
    * As in:
    *   (function () {
    *    var require = function (file, cwd) { 
    *      [..]
    *    ---- inject position is here ----
    *   require.define("__browserify_process",Function(['require','module','exports','__dirname','__filename','process','global'],".."
    *   ));
    *      [..]
    *    require('/entry-file.js');
    *   })();
    */

  var re = /^[ ]*require\.define\(\"__browserify_process\", *Function\(\[/m
    , match = re.exec(src); 

  return match ? match.index : -1;
};
