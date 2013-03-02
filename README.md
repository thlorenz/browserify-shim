# browserify-shim [![build status](https://secure.travis-ci.org/thlorenz/browserify-shim.png)](http://travis-ci.org/thlorenz/browserify-shim)

Shims commonJS incompatible modules so they can be browserified.

```js
var browserify = require('browserify')
  , shim = require('browserify-shim');

shim(browserify(), {
  // jquery attaches itself to the window as '$' so we assign the exports accordingly
  jquery:     { path: './js/vendor/jquery.js', exports: '$' }
})
.require(require.resolve('./js/entry.js'), { entry: true })
.bundle(function (err, src) {
  if (err) return console.error(err);

  fs.writeFileSync(builtFile, src);
});
```

## Installation

    npm install browserify-shim

For a version compatible with browserify@1.x run `npm install browserify-shim@1.x` instead.

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
shim(browserify(), {
    jquery: { path: './js/vendor/jquery.js',  exports: '$' }
  , 'backbone.stickit': {
      , path: './js/vendor/backbone.stickit.js'
      , exports: null
        // Below we are declaring the dependencies and under what name/symbol 
        // they are expected to be attached to the window.
      , depends: { jquery: '$', underscore: '_', backbone: 'Backbone' }  
    }
  })

  // underscore and backbone are commonJS compatible, so a simple require with an expose option works
  .require(require.resolve('./js/vendor/underscore.js'), { expose: 'underscore' })
  .require(require.resolve('./js/vendor/backbone.js'), { expose: 'backbone' })

  .require(require.resolve('./js/entry.js'), { entry: true })
  .bundle(function (err, src) {
    if (err) return console.error(err);

    fs.writeFileSync(builtFile, src);
  });
```

Given this configuration browserify-shim will attach `$`, `_` and `Backbone` to the window after requiring it, so that
`backbone.stickit` can find it there.

**Note:** the order of shim declarations doesn't matter, i.e. we could have shimmed `backbone.stickit` at the very top
(before the libraries it depends on).

## Examples
The underscore example is only included for completeness. Since browserify v2.0 commonJS compatible modules don't need shimming anymore
even if they reside in a folder other than `node_modules`.

- [shim-jquery](https://github.com/thlorenz/browserify-shim/tree/master/examples/shim-jquery)
- [shim-underscore](https://github.com/thlorenz/browserify-shim/tree/master/examples/shim-underscore)

