// es-abstract/2024/Set@1.23.7 downloaded from https://ga.jspm.io/npm:es-abstract@1.23.7/2024/Set.js

import*as r from"es-errors/type";import{_ as t}from"../_/DMQuo6fQ.js";import e from"./SameValue.js";import{_ as a}from"../_/Bbrwb-Cx.js";import"math-intrinsics/isNaN";var o=r;try{"default"in r&&(o=r.default)}catch(r){}var n={};var s=o;var i=t;var f=e;var u=a;var m=function(){try{delete[].length;return true}catch(r){return false}}();n=function Set(r,t,e,a){if(!u(r))throw new s("Assertion failed: `O` must be an Object");if(!i(t))throw new s("Assertion failed: `P` must be a Property Key");if(typeof a!=="boolean")throw new s("Assertion failed: `Throw` must be a Boolean");if(a){r[t]=e;if(m&&!f(r[t],e))throw new s("Attempted to assign to readonly property.");return true}try{r[t]=e;return!m||f(r[t],e)}catch(r){return false}};var l=n;export{l as default};

