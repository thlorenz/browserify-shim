# Browserify-Shim underscore Example

This example demonstrates using a shim fo underscore.

It is a bit contrived since an underscore npm module exists, but lets assume you converted a codebase to use
browserify, i.e. via [browserify-ftw](https://github.com/thlorenz/browserify-ftw) and just want to use the underscore
that is in the `js/vendor` directory already.

The main part where it all happens is this snippet:

```js
var bundled = browserify({ debug: true })
  // setting export: null to denote that underscore is a commonJS module and doesn't need 
  // window property to be exported
  .use(shim({ alias: 'underscore', path: './js/vendor/underscore-min.js', export: null }))
  .addEntry('./js/entry.js')
  .bundle()
  .shim();

fs.writeFileSync(builtFile, bundled);
```

To run this example:

    npm install browserify-shim
    npm explore browserify-shim

Then:

    npm run shim-underscore

Or if you enjoy typing a lot:

    cd examples/shim-underscore

    npm install
    node build.js
    open index.html
