// available-typed-arrays@1.0.7 downloaded from https://ga.jspm.io/npm:available-typed-arrays@1.0.7/index.js

import*as a from"possible-typed-array-names";var e=a;try{"default"in a&&(e=a.default)}catch(a){}var l=typeof globalThis!=="undefined"?globalThis:typeof self!=="undefined"?self:global;var r={};var t=e;var f=typeof globalThis==="undefined"?l:globalThis;
/** @type {import('.')} */r=function availableTypedArrays(){var/** @type {ReturnType<typeof availableTypedArrays>} */a=[];for(var e=0;e<t.length;e++)typeof f[t[e]]==="function"&&(a[a.length]=t[e]);return a};var o=r;export{o as default};

