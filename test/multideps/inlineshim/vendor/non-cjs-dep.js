'use strict';

// expecting noncjs and noncjscore to have been required before me and attached itself to the window
// it expectes non-cjs-core to be attached as 'core' instead of 'noncjscore' as which it attaches
// itself to the window
window.noncjsdep = { noncjs: window.noncjs, noncjscore : window.core };
