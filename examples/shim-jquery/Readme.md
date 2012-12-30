# Browserify-Shim jquery Example

This example demonstrates using a shim fo jquery.

The main part where it all happens is this snippet:

```js
var bundled = browserify({ debug: true })
  .use(shim({ alias: 'jquery', path: './js/vendor/jquery.js', exports: '$' }))
  .addEntry('./js/entry.js')
  .bundle()
  .shim();

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
