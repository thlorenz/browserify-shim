# Browserify-Shim jquery with external shim file

This example demonstrates shimming jquery by adding the shim information to an external `shim.js`.

The following config included in the
[`package.json`](https://github.com/thlorenz/browserify-shim/blob/master/examples/shim-jquery-external/package.json) of this
example project is needed to ensure that browserify runs the `browerify-shim` transform when bundling this project,
however in this case it **does not include the shim config**:

```json
{
  "main": "./js/entry.js",
  "browserify-shim": "./config/shim.js",
  "browserify": {
    "transform": [
      "browserify-shim"
    ]
  }
}
```

As you can see the `browserify-shim` field points to the [external shim file](https://github.com/thlorenz/browserify-shim/blob/master/examples/shim-jquery-external/config/shim.js):

```js
module.exports = {
  '../js/vendor/jquery.js': { exports: '$' }
}
```

**Note**: we didn't expose `./js/vendor/jquery.js` as `jquery` like we did in the [other jquery
example](https://github.com/thlorenz/browserify-shim/tree/master/examples/shim-jquery). Instead our config spells out the
path to `./js/vendor/jquery.js` relative to the `shim.js` file.

As a result we also cannot just `require('jquery')` in our [entry.js](https://github.com/thlorenz/browserify-shim/blob/master/examples/shim-jquery-external/js/entry.js#L1), but have to spell out the relative path here as well, i.e. 
`var $ = require('./vendor/jquery')`.

### Bundling

As explained in the [shim-jquery example](https://github.com/thlorenz/browserify-shim/tree/master/examples/shim-jquery)
there are multiple ways to produce the bundle.

    browserify -d . > js/bundle.js

Or with diagnostics:

    BROWSERIFYSHIM_DIAGNOSTICS=1 browserify -d . > js/bundle.js

Alternatively you can write a short `build.js` to perform the bundling step:

```js
  browserify()  
    .require(require.resolve('./'), { entry: true })
    .bundle({ debug: true })
    .on('error', console.error.bind(console)) 
    .pipe(fs.createWriteStream(path.join(__dirname, 'js', 'bundle.js'), 'utf8'))
```
