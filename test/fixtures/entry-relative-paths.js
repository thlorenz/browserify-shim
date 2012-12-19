var lib = require('./shims/object-literal.js');
var $ = require('./shims/jquery');

console.log('hello world', lib);
console.log('jquery version', $().jquery);
