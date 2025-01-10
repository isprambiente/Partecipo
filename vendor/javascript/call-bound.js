// call-bound@1.0.2 downloaded from https://ga.jspm.io/npm:call-bound@1.0.2/index.js

import*as t from"get-intrinsic";import*as r from"call-bind";var a=t;try{"default"in t&&(a=t.default)}catch(t){}var n=r;try{"default"in r&&(n=r.default)}catch(t){}var i={};var o=a;var e=n;var f=e(/** @type {typeof String.prototype.indexOf} */o("String.prototype.indexOf"));
/** @type {import('.')} */i=function callBoundIntrinsic(t,r){var a=/** @type {Parameters<typeof callBind>[0]} */o(t,!!r);return typeof a==="function"&&f(t,".prototype.")>-1?e(a):a};var c=i;export{c as default};

