#browserify-shim [![build status](https://secure.travis-ci.org/thlorenz/browserify-shim.png?branch=master)](http://travis-ci.org/thlorenz/browserify-shim)

[![NPM](https://nodei.co/npm/browserify-shim.png?downloads=true&stars=true)](https://nodei.co/npm/browserify-shim/)

### Make CommonJS-Incompatible Files Browserifyable

#### package.json

```json
{
  "main": "./js/entry.js",
  "browser": {
    "jquery": "./js/vendor/jquery.js"
  },
  "browserify-shim": {
    "jquery": "$"
  },
  "browserify": {
    "transform": [ "browserify-shim" ]
  },
  "dependencies": {
    "browserify-shim": "~3.0.0"
  }
}
```

    browserify . -d -o bundle.js


**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [Installation](#installation)
- [Features](#features)
- [API](#api)
  - [You Will Always](#you-will-always)
      - [1. Install browserify-shim dependency](#1-install-browserify-shim-dependency)
      - [2. Register browserify-shim as a transform with browserify](#2-register-browserify-shim-as-a-transform-with-browserify)
      - [3. Provide browserify-shim config](#3-provide-browserify-shim-config)
          - [Short Form vs. Long Form config](#short-form-vs-long-form-config)
  - [You will sometimes](#you-will-sometimes)
      - [Use aliases](#use-aliases)
      - [Provide an external shim config](#provide-an-external-shim-config)
      - [Diagnose what browserify-shim is doing](#diagnose-what-browserify-shim-is-doing)
- [Multi Shim Example including dependencies](#multi-shim-example-including-dependencies)
  - [a) Config inside `package.json` without aliases](#a-config-inside-packagejson-without-aliases)
  - [b) Config inside `package.json` with aliases](#b-config-inside-packagejson-with-aliases)
  - [c) Config inside `./config/shim.js` without aliases](#c-config-inside-configshimjs-without-aliases)
      - [`package.json`](#packagejson)
      - [`shim.js`](#shimjs)
- [More Examples](#more-examples)

## Installation

    npm install browserify-shim

*For a version compatible with browserify@1.x run `npm install browserify-shim@1.x` instead.*

*For a version compatible with the [v2 API](https://github.com/thlorenz/browserify-shim/tree/v2#api) `npm install browserify-shim@2.x` instead.*

## Features

The core features of browserify-shim are:

- Shims **non-CommonJS** modules in order for them to be **browserified** by specifying an alias, the path to the file,
  and the identifier under which the module attaches itself to the global `window` object.
- Includes `depends` for  shimming libraries that depend on other libraries being in the global namespace.
- applies shims configured inside the dependencies of your package

Additionally, it handles the following real-world edge cases:

- Modules that just declare a `var foo = ...` on the script level and assume it gets attached to the `window` object.
  Since the only way they will ever be run is in the global context — "ahem, … NO?!"
- Makes `define` and also `module` be `undefined`, in order to fix [improperly-authored
  libraries](https://github.com/mhemesath/r2d3/blob/918bd076e4f980722438b2594d1eba53a522ce75/r2d3.v2.js#L222) that need
  shimming but try anyway to use AMD or CommonJS. For more info read the comment inside [this
  fixture](https://github.com/thlorenz/browserify-shim/blob/master/test/fixtures/shims/lib-with-exports-define-global-problem.js)


Since `browserify-shim` is a proper `browserify` transform you can publish packages with files that need to be shimmed,
granted that you specify the shim config inside the `package.json`.

When `browserify` resolves your package it will run the `browserify-shim` transform and thus shim what's necessary
when generating the bundle.

## API

### You Will Always

#### 1. Install browserify-shim dependency

In most cases you want to install it as a [devDependency](https://npmjs.org/doc/json.html#devDependencies) via:

    npm install -D browserify-shim

#### 2. Register browserify-shim as a transform with browserify

Inside `package.json` add:

```json
{ 
  "browserify": {
    "transform": [ "browserify-shim" ]
  }
}
```

#### 3. Provide browserify-shim config

Inside `package.json` add:

```json
{
  "browserify-shim": {
    "./js/vendor/jquery.js": "$"
  }
}
```

The above includes `./js/vendor/jquery.js` (relative to the `package.json`) in the bundle and exports `window.$`.

##### Short Form vs. Long Form config

Since `jquery` does not depend on other shimmed modules and thus has no `depends` field, we used the short form to
specify its exports, however the example above is equivalent to:

```json
{
  "browserify-shim": {
    "./js/vendor/jquery.js": { "exports": "$" }
  }
}
```

### You will sometimes

#### Use aliases

You may expose files under a different name via the [`browser` field](https://gist.github.com/defunctzombie/4339901#replace-specific-files---advanced) and refer to them under that alias in the shim config:

```json
{
  "browser": {
    "jquery": "./js/vendor/jquery.js"
  },
  "browserify-shim": {
    "jquery": "$"
  }
}
```

This also allows you to require this module under the alias, i.e.: `var $ = require('jquery')`.

#### Provide an external shim config

```json
{
  "browserify-shim": "./config/shim.js"
}
```

The external shim format is very similar to the way in which the shim is specified inside the `package.json`. See
[below](#c-config-inside-configshimjs-without-aliases) for more details.

#### Diagnose what browserify-shim is doing

You may encounter problems when your shim config isn't properly setup. In that case you can diagnose them via the
`BROWSERIFYSHIM_DIAGNOSTICS` flag.

Simply set the flag when building your bundle, i.e.: 

    BROWSERIFYSHIM_DIAGNOSTICS=1 browserify -d . -o js/bundle.js

or in a `build.js` script add: `process.env.BROWSERIFYSHIM_DIAGNOSTICS=1` to the top.

## Multi Shim Example including dependencies

Some libraries depend on other libraries to have attached their exports to the window for historical reasons :(.
(Hopefully soon we can truly say that this bad design is history.)

In this contrived example we are shimming four libraries since none of them are commonJS compatible:

- **x** exports **window.$**
- **x-ui** exports nothing since it just **attaches itself to x**. Therefore x-ui depends on x.
- **y** exports **window.Y** and also **depends on x** expecting to find it on the window as $.
- **z** exports **window.zorro** and **depends on x and y**. It expects to find x on the window as $, but y on the window as YNOT, 
which is actually different than the name under which y exports itself.

We will be using the `depends` field in order to ensure that a dependency is included and initialized before a library
that depends on it is initialized.

Below are three examples, each showing a way to properly shim the above mentioned modules.

### a) Config inside `package.json` without aliases

```json
{
  "browserify": {
    "transform": [ "browserify-shim" ]
  },
  "browserify-shim": {
    "./vendor/x.js"    :  "$",
    "./vendor/x-ui.js" :  { "exports": null, "depends": [ "./vendor/x.js" ] },
    "./vendor/y.js"    :  { "exports": "Y", "depends": [ "./vendor/x.js:$" ] },
    "./vendor/z.js"    :  { "exports": "zorro", "depends": [ "./vendor/x.js:$", "./vendor/y.js:YNOT" ] }
  }
}
```

**Note:** the `depends` array consists of entries of the format `path-to-file:export`

### b) Config inside `package.json` with aliases

```json
{
  "browserify": {
    "transform": [ "browserify-shim" ]
  },
  "browser": {
    "x"    :  "./vendor/x.js",
    "x-ui" :  "./vendor/x-ui.js",
    "y"    :  "./vendor/y.js",
    "z"    :  "./vendor/z.js"
  },
   "browserify-shim": {
    "x"    :  "$",
    "x-ui" :  { "exports": null, depends": [ "x" ] },
    "y"    :  { "exports": "Y", "depends": [ "x:$" ] },
    "z"    :  { "exports": "zorro", "depends": [ "x:$", "y:YNOT" ] }
  }
}
```

**Note:** the `depends` entries make use of the aliases as well `alias:export`

### c) Config inside `./config/shim.js` without aliases

#### `package.json`

```json
{
  "browserify": {
    "transform": [ "browserify-shim" ]
  },
  "browserify-shim": "./config/shim.js"
}
```

#### `shim.js`

```js
module.exports = {
  '../vendor/x.js'    :  '$',
  '../vendor/x-ui.js' :  { 'exports': null, 'depends': { '../vendor/x.js': null } },
  '../vendor/y.js'    :  { 'exports': 'Y', 'depends': { '../vendor/x.js': '$' } },
  '../vendor/z.js'    :  { 'exports': 'zorro', 'depends': { '../vendor/x.js': '$', '../vendor/y.js': 'YNOT' } }
}
```

**Note:** all paths are relative to `./config/shim.js` instead of the `package.json`.

The main difference to `a)` is the `depends` field specification. Instead it being an array of strings it expresses its dependencies as a hashmap:

- **key:** `path-to-file` 
- **value:**  the name under which it is expected to be attached on the window

## More Examples

- [shim-jquery](https://github.com/thlorenz/browserify-shim/tree/master/examples/shim-jquery)
- [shim-jquery-external](https://github.com/thlorenz/browserify-shim/tree/master/examples/shim-jquery-external)
- the [tests](https://github.com/thlorenz/browserify-shim/tree/master/test) are a great resource to investigate the
  different ways to configure shims and to understand how shims are applied to packages found inside the `node_modules`
  of your package


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/thlorenz/browserify-shim/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

