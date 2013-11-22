// expects browserify-shim to require and attach sub1noncjs and sub2noncjsdep
window.rootnoncjs = {
  sub1noncjs: window.sub1noncjs,
  sub2noncjsdep: window.sub2noncjsdep
};
