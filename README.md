# browserify-shim [![build status](https://secure.travis-ci.org/thlorenz/browserify-shim.png)](http://travis-ci.org/thlorenz/browserify-shim)

Shims non commonJS modules so they can be browserified.

```js
var browserify = require('browserify')
  , shim = require('browserify-shim');

var bundled = browserify({ debug: true })
  .use(shim({ alias: 'jquery', path: './js/vendor/jquery.js', export: '$' }))
  .use(shim.addEntry('./js/entry.js'))
  .bundle();

fs.writeFileSync(builtFile, bundled);
```
## Install

    npm install browserify-shim

## Features

- allows **non commonJS** modules to be shimmed in order to be **browserified** by specifying an alias, the path to the file and
  the identifier under which the module attaches itself to the global window object
- **TODO**: allows commonJS modules that are not residing in your `node_modules` to be loaded from a specific path

## Limitations

- in order for browserify-shim to work correctly, you must not use browserify's built in `addEntry(..)`, but
  `use(shim.addEntry(..))` instead (see example)

## Examples

- [shim-jquery](https://github.com/thlorenz/browserify-shim/tree/master/examples/shim-jquery)
