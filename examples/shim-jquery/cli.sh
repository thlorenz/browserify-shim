#!/usr/bin/env bash

../../node_modules/.bin/browserify -d . > js/bundle.js

open index.html
