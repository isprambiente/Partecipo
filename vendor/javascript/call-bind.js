// call-bind@1.0.8 downloaded from https://ga.jspm.io/npm:call-bind@1.0.8/index.js

import*as a from"set-function-length";import*as r from"es-define-property";import*as t from"call-bind-apply-helpers";import*as l from"call-bind-apply-helpers/applyBind";var e=a;try{"default"in a&&(e=a.default)}catch(a){}var p=r;try{"default"in r&&(p=r.default)}catch(a){}var n=t;try{"default"in t&&(n=t.default)}catch(a){}var f=l;try{"default"in l&&(f=l.default)}catch(a){}var i={};var c=e;var d=p;var u=n;var o=f;i=function callBind(a){var r=u(arguments);var t=a.length-(arguments.length-1);return c(r,1+(t>0?t:0),true)};d?d(i,"apply",{value:o}):i.apply=o;var v=i;const y=i.apply;export{y as apply,v as default};

