# browserify-shim [![build status](https://secure.travis-ci.org/thlorenz/browserify-shim.png)](http://travis-ci.org/thlorenz/browserify-shim)

Shims modules that aren't installed as `npm` modules so they can be browserified even if they aren't commonJS
compatible.

```js
var browserify = require('browserify')
  , shim = require('browserify-shim');

var bundled = browserify({ debug: true })

    // jquery attaches itself to the window as '$' so we assign the exports accordingly
  .use(shim({ alias: 'jquery', path: './js/vendor/jquery.js', exports: '$' }))

    // underscore is commonJS compliant, so no further export is needed which we specify by assigning exports 'null'
  .use(shim({ alias: 'underscore', path: './js/vendor/underscore.js', exports: null }))

  .addEntry('./js/entry.js')
  .bundle()

  // it is important to call shim after bundle in order to inject shims registered via .use(shim(..)) 
  .shim();

fs.writeFileSync(builtFile, bundled);
```

## Install

    npm install browserify-shim

## Features

- shims **non commonJS** modules in order for them to be **browserified** by specifying an alias, the path to the file and
  the identifier under which the module attaches itself to the global `window` object
- handles even those modules out there that just declare a `var foo = ...` on the script level and assume it gets attached to the
  `window` object since the only way they will ever be run is in the global context - "ahem, ... NO?!"
- loads commonJS modules that are not residing in your `node_modules` from a specific path

## Examples

- [shim-jquery](https://github.com/thlorenz/browserify-shim/tree/master/examples/shim-jquery)
- [shim-underscore](https://github.com/thlorenz/browserify-shim/tree/master/examples/shim-underscore)
