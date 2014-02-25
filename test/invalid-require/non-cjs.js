// Some modules require other modules that they haven't even installed (trying to be commonJS compliant the wrong way)
// A more detailed case can be found inside bower-ember

var jQuery;

// we will need to reassign the require (after we did our require calls to get depends)
// therefore we'll add `require = undefined` above the code of this module
if (!jQuery && typeof require === 'function') {
  // browserify will try to find 'jQuery' now, so we have to derequire it
  jQuery = require('jquery');
}
window.Ember = 'I survived the horror of humans messing with my brain';
