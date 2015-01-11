# Browserify-Shim 

This example demonstrates how to create a browserify-aware dependency with a dependency on a global.

The important part is in `node_modules/my-3d-library/package.json`:

```json
  "browserify-shim": {
    "three": "global:THREE"
  },
  "browserify": {
    "transform": [
      "browserify-shim"
    ]
  }
```

### Bundling via the command line

Given this config you can build the bundle via: 

    browserify -d . > js/bundle.js

demonstrated [here](https://github.com/thlorenz/browserify-shim/blob/master/examples/expose-jquery/cli.sh).

If you want to turn on browserify shim diagnostics messages set the `BROWSERIFYSHIM_DIAGNOSTICS` environment variable
when bundling i.e.:

    BROWSERIFYSHIM_DIAGNOSTICS=1 browserify -d . > js/bundle.js

demonstrated [here](https://github.com/thlorenz/browserify-shim/blob/master/examples/expose-jquery/cli-diag.sh).

**Note** that in both cases the `-d` flag is added as well in order to turn on browserify sourcemaps.  

**Note** `.` tells browserify to use the current dir as the root of the bundling chain. As a result it finds `"main":
"./js/entry.js"` in the `package.json` and thus uses that as the entry point.

### Bundling via a `.js` script

Alternatively you can write a short `build.js` to perform the bundling step:

```js
  browserify()  
    .require(require.resolve('./'), { entry: true })
    .bundle({ debug: true })
    .on('error', console.error.bind(console)) 
    .pipe(fs.createWriteStream(path.join(__dirname, 'js', 'bundle.js'), 'utf8'))
```

demonstrated [here](https://github.com/thlorenz/browserify-shim/blob/master/examples/expose-jquery/build.js).

To run this example:

    npm install browserify-shim
    npm explore browserify-shim

Then:

    npm run dependency-with-global

Or to see diagnostic messages:

    npm run dependency-with-global-diag
