#!/usr/bin/env bash

BROWSERIFYSHIM_DIAGNOSTICS=1 ../../node_modules/.bin/browserify -d . > js/bundle.js

open index.html
