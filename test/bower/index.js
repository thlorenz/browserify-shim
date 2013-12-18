require('ui-position');

// at this point the global $ was loaded since jquery has been automatically required
module.exports = {
    root: window.$.position()
  , fn: window.$.fn.position()
  , ui: window.$.ui.position()
};
