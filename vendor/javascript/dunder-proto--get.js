// dunder-proto/get@1.0.0 downloaded from https://ga.jspm.io/npm:dunder-proto@1.0.0/get.js

import*as t from"call-bind-apply-helpers";import*as r from"gopd";var a=t;try{"default"in t&&(a=t.default)}catch(t){}var e=r;try{"default"in r&&(e=r.default)}catch(t){}var o={};var p=a;var f=e;var n=/** @type {{ __proto__?: typeof Array.prototype }} */[].__proto__===Array.prototype;var l=n&&f&&f(Object.prototype,/** @type {keyof typeof Object.prototype} */"__proto__");var u=Object;var c=u.getPrototypeOf;
/** @type {import('./get')} */o=l&&typeof l.get==="function"?p([l.get]):typeof c==="function"&&/** @type {import('./get')} */function getDunder(t){return c(t==null?t:u(t))};var v=o;export{v as default};

