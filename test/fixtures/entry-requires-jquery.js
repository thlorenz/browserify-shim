var $ = require('jquery')
  , foo = require('./foo');

require('../../index');

module.exports = {
    getJqueryVersion: function () { return $().jquery; }
  , foo: foo()
};
