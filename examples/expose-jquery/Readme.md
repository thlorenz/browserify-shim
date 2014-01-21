# Browserify-Shim expose jquery

This example demonstrates expsing jquery by adding expose information to the `package.json`.

The following config included in the
[`package.json`](https://github.com/thlorenz/browserify-shim/blob/master/examples/expose-jquery/package.json) of this
example project is needed to ensure that browserify runs the `browerify-shim` transform when bundling this project.

```json
{ 
  "main": "./js/entry.js",
  "browserify-shim": {
    "jquery": "global:$"
  },
  "browserify": {
    "transform": [ "browserify-shim" ]
  }
}
```

**Note:** the `global:` prefix tells browserify-shim that it should expose the `$` attached to the `window` as `jquery`.

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

    npm run expose-jquery

Or to see diagnostic messages:

  
    npm run expose-jquery-diag
