var path = require('path');
module.exports = function shim(mdl, exportKey) {
  return function (bundle) {
    bundle.register('.js', function (body, file) {
      if (path.basename(file) === mdl + '.js') return body + '\nmodule.exports = window.' + exportKey + ';';
      return body;
    });
  };
};

