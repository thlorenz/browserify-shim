var lib = require('./fixtures/object-literal.js');
var $ = require('./fixtures/jquery');

console.log('hello world', lib);
console.log('jquery version', $().jquery);
