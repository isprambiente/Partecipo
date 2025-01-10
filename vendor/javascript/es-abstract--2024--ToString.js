// es-abstract/2024/ToString@1.23.7 downloaded from https://ga.jspm.io/npm:es-abstract@1.23.7/2024/ToString.js

import*as r from"get-intrinsic";import*as t from"es-errors/type";var a=r;try{"default"in r&&(a=r.default)}catch(r){}var e=t;try{"default"in t&&(e=t.default)}catch(r){}var o={};var n=a;var i=n("%String%");var f=e;o=function ToString(r){if(typeof r==="symbol")throw new f("Cannot convert a Symbol value to a string");return i(r)};var v=o;export{v as default};

