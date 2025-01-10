// call-bind-apply-helpers@1.0.1 downloaded from https://ga.jspm.io/npm:call-bind-apply-helpers@1.0.1/index.js

import*as r from"function-bind";import*as t from"es-errors/type";import a from"./functionCall.js";import i from"./actualApply.js";import"./functionApply.js";import"./reflectApply.js";var o=r;try{"default"in r&&(o=r.default)}catch(r){}var n=t;try{"default"in t&&(n=t.default)}catch(r){}var f={};var e=o;var l=n;var p=a;var c=i;
/** @type {import('.')} */f=function callBindBasic(r){if(r.length<1||typeof r[0]!=="function")throw new l("a function is required");return c(e,p,r)};var u=f;export{u as default};

