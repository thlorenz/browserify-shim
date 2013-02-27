# browserify-shim [![build status](https://secure.travis-ci.org/thlorenz/browserify-shim.png)](http://travis-ci.org/thlorenz/browserify-shim)

Shims modules that aren't installed as `npm` modules so they can be browserified even if they aren't commonJS
compatible.

**NOTE:** Only works with versions 1.x of browserify currently, but a version that supports 2.x will be forthcoming as soon as that is possible
(i.e. when browserify supports plugins).
```js
var browserify = require('browserify')
  , shim = require('browserify-shim');

var bundled = browserify({ debug: true })

    // jquery attaches itself to the window as '$' so we assign the exports accordingly
  .use(shim({ alias: 'jquery', path: './js/vendor/jquery.js', exports: '$' }))

    // underscore is commonJS compliant, so no further export is needed which we specify by assigning exports 'null'
  .use(shim({ alias: 'underscore', path: './js/vendor/underscore.js', exports: null }))

  .addEntry('./js/entry.js')
  .bundle();

fs.writeFileSync(builtFile, bundled);
```

## Installation

    npm install browserify-shim

## Features

- shims **non commonJS** modules in order for them to be **browserified** by specifying an alias, the path to the file and
  the identifier under which the module attaches itself to the global `window` object
- handles even those modules out there that just declare a `var foo = ...` on the script level and assume it gets attached to the
  `window` object since the only way they will ever be run is in the global context - "ahem, ... NO?!"
- loads commonJS modules that are not residing in your `node_modules` from a specific path
- includes `depends` to support shimming libraries that depend on other libraries to be in the global namespace
- makes `define` and **if an export is specified** also `module` be `undefined` in order to prevent improper authored
  libs from attaching their export to the `window` because they think they are being required via `commonJS`. This can cause problems,
  e.g., when libraries are improperly concatenated like
  [here](https://github.com/mhemesath/r2d3/blob/918bd076e4f980722438b2594d1eba53a522ce75/r2d3.v2.js#L222). For more info
  read comment inside [this
  fixture](https://github.com/thlorenz/browserify-shim/blob/master/test/fixtures/shims/lib-with-exports-define-global-problem.js)

## Dependents

Some libraries depend on other libraries to have attached their exports to the window for historical reasons :(.
(hopefully soon we can truly say that this bad design is history)

As an example [backbone.stickit](http://nytimes.github.com/backbone.stickit/) depends on Backbone, underscore.js,
and jQuery or Zepto.

We would properly declare its dependents when shimming it as follows:

```js
var bundled = browserify()
  .use(shim({ alias: 'jquery'     , path: './js/vendor/jquery.js'    ,  exports: '$' }))
  .use(shim({ alias: 'underscore' , path: './js/vendor/underscore.js',  exports: null }))
  .use(shim({ alias: 'backbone'   , path: './js/vendor/backbone.js'  ,  exports: null }))
  .use(shim({
      alias: 'backbone.stickit'
    , path: './js/vendor/backbone.stickit.js'
    , exports: null
      // Below we are declaring the dependencies and under what name/symbol 
      // they are expected to be attached to the window.
    , depends: { jquery: '$', underscore: '_', backbone: 'Backbone' }  
    })
  )
  .addEntry('./js/entry.js')
  .bundle();
```

**Note:** the order of shim declarations doesn't matter, i.e. we could have shimmed `backbone.stickit` at the very top
(before the libraries it depends on).

## Examples

- [shim-jquery](https://github.com/thlorenz/browserify-shim/tree/master/examples/shim-jquery)
- [shim-underscore](https://github.com/thlorenz/browserify-shim/tree/master/examples/shim-underscore)
