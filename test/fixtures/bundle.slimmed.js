(function(){
  var require = function (file, cwd) {
    var res = {}; 
    return res;
  };

  require._core = { };

  require.resolve = (function () { })();

  require.alias = function (from, to) { };

  (function setupRequire() { })();


  require("/entry-requires-jquery.js");
})();
