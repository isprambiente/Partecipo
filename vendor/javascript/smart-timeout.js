// smart-timeout@2.7.1 downloaded from https://ga.jspm.io/npm:smart-timeout@2.7.1/index.js

var e={};var t=e&&e.__spreadArrays||function(){for(var e=0,t=0,i=arguments.length;t<i;t++)e+=arguments[t].length;var a=Array(e),u=0;for(t=0;t<i;t++)for(var r=arguments[t],o=0,n=r.length;o<n;o++,u++)a[u]=r[o];return a};Object.defineProperty(e,"__esModule",{value:true});var i=function(){function MetadataRecord(e,t,i,a){this.callback=e;this.key=t;this.ms=i;this.params=a;this.paused=false;this.startTime=(new Date).getTime();this.timeSpentWaiting=0}return MetadataRecord}();var a=function(){function Timeout(){}
/**
   * clear timeout and optionally erase all knowledge of its existence
   * @param key
   * @param erase
   */Timeout.clear=function(e,t){void 0===t&&(t=true);clearTimeout(Timeout.keyId[e]);delete Timeout.keyId[e];delete Timeout.keyCall[e];if(t){delete Timeout.metadata[e];delete Timeout.originalMs[e]}};Timeout.set=function(){var e=[];for(var t=0;t<arguments.length;t++)e[t]=arguments[t];var a;var u;var r;var o;if(0===e.length)throw Error("Timeout.set() requires at least one argument");if("function"===typeof e[1])a=e[0],o=e[1],u=e[2],r=e.slice(3);else{o=e[0],u=e[1],r=e.slice(2);a=o.toString()}if(!o)throw Error("Timeout.set() requires a callback parameter");Timeout.clear(a);var invoke=function(){Timeout.metadata[a].executedTime=(new Date).getTime();o.apply(void 0,r)};Timeout.keyId[a]=setTimeout(invoke,u||0);Timeout.keyCall[a]=function(){return o.apply(void 0,r)};Timeout.originalMs[a]=Timeout.originalMs[a]||u;Timeout.metadata[a]=new i(o,a,u,r);return function(){return Timeout.executed(a)}};Timeout.create=function(){var e=[];for(var t=0;t<arguments.length;t++)e[t]=arguments[t];if(0===e.length)throw Error("Timeout.create() requires at least one argument");var i;if("function"===typeof e[1])i=e[0];else{var a=e[0];i=a.toString()}return!Timeout.exists(i)&&Timeout.set.apply(Timeout,e)};
/**
   * elapsed time since the timeout was created
   * @param key
   */Timeout.elapsed=function(e){var t=Timeout.metadata[e];return t?Math.max(0,(new Date).getTime()-t.startTime):0};
/**
   * timeout has been created
   * @param key
   */Timeout.exists=function(e){return e in Timeout.keyId||void 0!==Timeout.metadata[e]};
/**
   * fire the callback on demand, without affecting the timeout or meta data (execution time)
   * @param key
   * @returns {(false|any)} false if timeout does not exist or the return value of the callback
   */Timeout.call=function(e){return Timeout.exists(e)&&Timeout.keyCall[e]()};
/**
   * test if a timeout has run
   * @param key
   */Timeout.executed=function(e){return Timeout.exists(e)&&!!Timeout.metadata[e].executedTime};
/**
   * when timeout was last executed
   * @param key
   */Timeout.lastExecuted=function(e){return Timeout.executed(e)?new Date(Timeout.metadata[e].executedTime):null};
/**
   * metadata about a timeout
   * @param key
   */Timeout.meta=function(e){return Timeout.metadata[e]};
/**
   * timeout does exist, but has not yet run
   * @param key
   */Timeout.pending=function(e){return Timeout.exists(e)&&!Timeout.executed(e)};
/**
   * timeout does exist, but will not execute because it is paused
   * @param key
   */Timeout.paused=function(e){return Timeout.exists(e)&&!Timeout.executed(e)&&Timeout.metadata[e].paused};
/**
   * remaining time until timeout will occur
   * @param key
   */Timeout.remaining=function(e){if(!Timeout.metadata[e])return 0;var t=Timeout.metadata[e];return Timeout.paused(e)?t.ms-t.timeSpentWaiting:Math.max(0,t.startTime+t.ms-(new Date).getTime())};
/**
   * set timeout anew, optionally with new time and params
   * @param key
   * @param ms new millisecs before execution
   * @param params new parameters to callback
   */Timeout.reset=function(e,i){var a=[];for(var u=2;u<arguments.length;u++)a[u-2]=arguments[u];var r=Timeout.metadata[e];if(!r)return false;Timeout.clear(e,false);r.paused&&(r.paused=false);return Timeout.set.apply(Timeout,t([e,r.callback,null!==i&&void 0!==i?i:Timeout.originalMs[e]],a||r.params))};
/**
   * restart timeout with original time
   * @param key
   * @param force restart even even if not yet executed
   */Timeout.restart=function(e,i){void 0===i&&(i=false);if(!Timeout.metadata[e]||!i&&Timeout.executed(e))return false;var a=Timeout.metadata[e];Timeout.clear(e,false);a.paused&&(a.paused=false);return Timeout.set.apply(Timeout,t([e,a.callback,Timeout.originalMs[e]],a.params))};
/**
   * pause our execution countdown until we're ready for it to resume
   * @param key
   */Timeout.pause=function(e){if(!Timeout.metadata[e]||Timeout.paused(e)||Timeout.executed(e))return false;Timeout.clear(e,false);var t=Timeout.metadata[e];t.paused=true;t.timeSpentWaiting=(new Date).getTime()-t.startTime;return t.timeSpentWaiting};
/**
   * resume paused Timeout with the remaining time
   * @param key
   */Timeout.resume=function(e){if(!Timeout.metadata[e]||Timeout.executed(e))return false;var i=Timeout.metadata[e];if(!i.paused)return false;var a=Timeout.originalMs[e];var u=i.ms-i.timeSpentWaiting;var r=Timeout.set.apply(Timeout,t([e,i.callback,u],i.params));Timeout.originalMs[e]=a;return r};Timeout.instantiate=function(){var e=[];for(var i=0;i<arguments.length;i++)e[i]=arguments[i];var a;var u;var r;var o;if(0===e.length)throw Error("Timeout.set() requires at least one argument");var n=1===e.length&&"function"!==typeof e[0];if(n){a=e[0];var m=Timeout.meta(a);if(!m)throw Error("Timeout.instantiate() attempted to link to nonexistent object by key");u=m.ms;r=m.params;o=m.callback}else if("function"===typeof e[1])a=e[0],o=e[1],u=e[2],r=e.slice(3);else{o=e[0],u=e[1],r=e.slice(2);a=(""+Math.random()+o).replace(/\s/g,"")}if(!o)throw Error("Timeout.instantiate() requires a function parameter");n||Timeout.set.apply(Timeout,t([a,o,u],r));return{call:function(){return Timeout.call(a)},clear:function(e){void 0===e&&(e=true);return Timeout.clear(a,e)},elapsed:function(){return Timeout.elapsed(a)},executed:function(){return Timeout.executed(a)},exists:function(){return Timeout.exists(a)},lastExecuted:function(){return Timeout.lastExecuted(a)},meta:function(){return Timeout.meta(a)},pause:function(){return Timeout.pause(a)},paused:function(){return Timeout.paused(a)},pending:function(){return Timeout.pending(a)},remaining:function(){return Timeout.remaining(a)},reset:function(e){var i=[];for(var u=1;u<arguments.length;u++)i[u-1]=arguments[u];return Timeout.reset.apply(Timeout,t([a,e],i))},restart:function(){return Timeout.restart(a)},resume:function(){return Timeout.resume(a)},set:function(e,i){void 0===i&&(i=0);var u=[];for(var r=2;r<arguments.length;r++)u[r-2]=arguments[r];return Timeout.set.apply(Timeout,t([a,e,i],u))}}};Timeout.keyId={};Timeout.keyCall={};Timeout.originalMs={};Timeout.metadata={};return Timeout}();e.Timeout=a;var u={};Object.defineProperty(u,"__esModule",{value:true});var r=e;u=r.Timeout;var o=u;const n=u.__esModule;export{n as __esModule,o as default};

