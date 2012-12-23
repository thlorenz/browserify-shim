# Browserify-Shim underscore Example

This example demonstrates using a shim fo underscore.

The main part where it all happens is this snippet:

```js
var bundled = browserify({ debug: true })
  .use(shim({ alias: 'underscore', path: './js/vendor/underscore-min.js', export: null }))
  .use(shim.addEntry('./js/entry.js'))
  .bundle();

fs.writeFileSync(builtFile, bundled);
```

To run this example:

    npm install browserify-shim
    npm explore browserify-shim

Then:

    npm run shim-jquery

Or if you enjoy typing a lot:

    cd examples/shim-jquery

    npm install
    node build.js
    open index.html
