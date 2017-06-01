!function(e){"use strict";function t(e){if("string"!=typeof e&&(e=String(e)),/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(e))throw new TypeError("Invalid character in header field name");return e.toLowerCase()}function n(e){return"string"!=typeof e&&(e=String(e)),e}function r(e){var t={next:function(){var t=e.shift();return{done:void 0===t,value:t}}};return v.iterable&&(t[Symbol.iterator]=function(){return t}),t}function o(e){this.map={},e instanceof o?e.forEach(function(e,t){this.append(t,e)},this):Array.isArray(e)?e.forEach(function(e){this.append(e[0],e[1])},this):e&&Object.getOwnPropertyNames(e).forEach(function(t){this.append(t,e[t])},this)}function i(e){return e.bodyUsed?Promise.reject(new TypeError("Already read")):void(e.bodyUsed=!0)}function a(e){return new Promise(function(t,n){e.onload=function(){t(e.result)},e.onerror=function(){n(e.error)}})}function s(e){var t=new FileReader,n=a(t);return t.readAsArrayBuffer(e),n}function u(e){var t=new FileReader,n=a(t);return t.readAsText(e),n}function l(e){for(var t=new Uint8Array(e),n=new Array(t.length),r=0;r<t.length;r++)n[r]=String.fromCharCode(t[r]);return n.join("")}function d(e){if(e.slice)return e.slice(0);var t=new Uint8Array(e.byteLength);return t.set(new Uint8Array(e)),t.buffer}function c(){return this.bodyUsed=!1,this._initBody=function(e){if(this._bodyInit=e,e)if("string"==typeof e)this._bodyText=e;else if(v.blob&&Blob.prototype.isPrototypeOf(e))this._bodyBlob=e;else if(v.formData&&FormData.prototype.isPrototypeOf(e))this._bodyFormData=e;else if(v.searchParams&&URLSearchParams.prototype.isPrototypeOf(e))this._bodyText=e.toString();else if(v.arrayBuffer&&v.blob&&w(e))this._bodyArrayBuffer=d(e.buffer),this._bodyInit=new Blob([this._bodyArrayBuffer]);else{if(!v.arrayBuffer||!ArrayBuffer.prototype.isPrototypeOf(e)&&!g(e))throw new Error("unsupported BodyInit type");this._bodyArrayBuffer=d(e)}else this._bodyText="";this.headers.get("content-type")||("string"==typeof e?this.headers.set("content-type","text/plain;charset=UTF-8"):this._bodyBlob&&this._bodyBlob.type?this.headers.set("content-type",this._bodyBlob.type):v.searchParams&&URLSearchParams.prototype.isPrototypeOf(e)&&this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8"))},v.blob&&(this.blob=function(){var e=i(this);if(e)return e;if(this._bodyBlob)return Promise.resolve(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(new Blob([this._bodyArrayBuffer]));if(this._bodyFormData)throw new Error("could not read FormData body as blob");return Promise.resolve(new Blob([this._bodyText]))},this.arrayBuffer=function(){return this._bodyArrayBuffer?i(this)||Promise.resolve(this._bodyArrayBuffer):this.blob().then(s)}),this.text=function(){var e=i(this);if(e)return e;if(this._bodyBlob)return u(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(l(this._bodyArrayBuffer));if(this._bodyFormData)throw new Error("could not read FormData body as text");return Promise.resolve(this._bodyText)},v.formData&&(this.formData=function(){return this.text().then(h)}),this.json=function(){return this.text().then(JSON.parse)},this}function f(e){var t=e.toUpperCase();return x.indexOf(t)>-1?t:e}function p(e,t){t=t||{};var n=t.body;if(e instanceof p){if(e.bodyUsed)throw new TypeError("Already read");this.url=e.url,this.credentials=e.credentials,t.headers||(this.headers=new o(e.headers)),this.method=e.method,this.mode=e.mode,n||null==e._bodyInit||(n=e._bodyInit,e.bodyUsed=!0)}else this.url=String(e);if(this.credentials=t.credentials||this.credentials||"omit",!t.headers&&this.headers||(this.headers=new o(t.headers)),this.method=f(t.method||this.method||"GET"),this.mode=t.mode||this.mode||null,this.referrer=null,("GET"===this.method||"HEAD"===this.method)&&n)throw new TypeError("Body not allowed for GET or HEAD requests");this._initBody(n)}function h(e){var t=new FormData;return e.trim().split("&").forEach(function(e){if(e){var n=e.split("="),r=n.shift().replace(/\+/g," "),o=n.join("=").replace(/\+/g," ");t.append(decodeURIComponent(r),decodeURIComponent(o))}}),t}function y(e){var t=new o,n=e.replace(/\r?\n[\t ]+/," ");return n.split(/\r?\n/).forEach(function(e){var n=e.split(":"),r=n.shift().trim();if(r){var o=n.join(":").trim();t.append(r,o)}}),t}function m(e,t){t||(t={}),this.type="default",this.status="status"in t?t.status:200,this.ok=this.status>=200&&this.status<300,this.statusText="statusText"in t?t.statusText:"OK",this.headers=new o(t.headers),this.url=t.url||"",this._initBody(e)}if(!e.fetch){var v={searchParams:"URLSearchParams"in e,iterable:"Symbol"in e&&"iterator"in Symbol,blob:"FileReader"in e&&"Blob"in e&&function(){try{return new Blob,!0}catch(e){return!1}}(),formData:"FormData"in e,arrayBuffer:"ArrayBuffer"in e};if(v.arrayBuffer)var b=["[object Int8Array]","[object Uint8Array]","[object Uint8ClampedArray]","[object Int16Array]","[object Uint16Array]","[object Int32Array]","[object Uint32Array]","[object Float32Array]","[object Float64Array]"],w=function(e){return e&&DataView.prototype.isPrototypeOf(e)},g=ArrayBuffer.isView||function(e){return e&&b.indexOf(Object.prototype.toString.call(e))>-1};o.prototype.append=function(e,r){e=t(e),r=n(r);var o=this.map[e];this.map[e]=o?o+","+r:r},o.prototype.delete=function(e){delete this.map[t(e)]},o.prototype.get=function(e){return e=t(e),this.has(e)?this.map[e]:null},o.prototype.has=function(e){return this.map.hasOwnProperty(t(e))},o.prototype.set=function(e,r){this.map[t(e)]=n(r)},o.prototype.forEach=function(e,t){for(var n in this.map)this.map.hasOwnProperty(n)&&e.call(t,this.map[n],n,this)},o.prototype.keys=function(){var e=[];return this.forEach(function(t,n){e.push(n)}),r(e)},o.prototype.values=function(){var e=[];return this.forEach(function(t){e.push(t)}),r(e)},o.prototype.entries=function(){var e=[];return this.forEach(function(t,n){e.push([n,t])}),r(e)},v.iterable&&(o.prototype[Symbol.iterator]=o.prototype.entries);var x=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];p.prototype.clone=function(){return new p(this,{body:this._bodyInit})},c.call(p.prototype),c.call(m.prototype),m.prototype.clone=function(){return new m(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new o(this.headers),url:this.url})},m.error=function(){var e=new m(null,{status:0,statusText:""});return e.type="error",e};var _=[301,302,303,307,308];m.redirect=function(e,t){if(_.indexOf(t)===-1)throw new RangeError("Invalid status code");return new m(null,{status:t,headers:{location:e}})},e.Headers=o,e.Request=p,e.Response=m,e.fetch=function(e,t){return new Promise(function(n,r){var o=new p(e,t),i=new XMLHttpRequest;i.onload=function(){var e={status:i.status,statusText:i.statusText,headers:y(i.getAllResponseHeaders()||"")};e.url="responseURL"in i?i.responseURL:e.headers.get("X-Request-URL");var t="response"in i?i.response:i.responseText;n(new m(t,e))},i.onerror=function(){r(new TypeError("Network request failed"))},i.ontimeout=function(){r(new TypeError("Network request failed"))},i.open(o.method,o.url,!0),"include"===o.credentials&&(i.withCredentials=!0),"responseType"in i&&v.blob&&(i.responseType="blob"),o.headers.forEach(function(e,t){i.setRequestHeader(t,e)}),i.send("undefined"==typeof o._bodyInit?null:o._bodyInit)})},e.fetch.polyfill=!0}}("undefined"!=typeof self?self:this),"function"!=typeof Object.assign&&(Object.assign=function(e,t){"use strict";if(null==e)throw new TypeError("Cannot convert undefined or null to object");for(var n=Object(e),r=1;r<arguments.length;r++){var o=arguments[r];if(null!=o)for(var i in o)Object.prototype.hasOwnProperty.call(o,i)&&(n[i]=o[i])}return n}),function(e){function t(){}function n(e,t){return function(){e.apply(t,arguments)}}function r(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],l(e,this)}function o(e,t){for(;3===e._state;)e=e._value;return 0===e._state?void e._deferreds.push(t):(e._handled=!0,void r._immediateFn(function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null===n)return void(1===e._state?i:a)(t.promise,e._value);var r;try{r=n(e._value)}catch(e){return void a(t.promise,e)}i(t.promise,r)}))}function i(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var o=t.then;if(t instanceof r)return e._state=3,e._value=t,void s(e);if("function"==typeof o)return void l(n(o,t),e)}e._state=1,e._value=t,s(e)}catch(t){a(e,t)}}function a(e,t){e._state=2,e._value=t,s(e)}function s(e){2===e._state&&0===e._deferreds.length&&r._immediateFn(function(){e._handled||r._unhandledRejectionFn(e._value)});for(var t=0,n=e._deferreds.length;t<n;t++)o(e,e._deferreds[t]);e._deferreds=null}function u(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n}function l(e,t){var n=!1;try{e(function(e){n||(n=!0,i(t,e))},function(e){n||(n=!0,a(t,e))})}catch(e){if(n)return;n=!0,a(t,e)}}var d=setTimeout;r.prototype.catch=function(e){return this.then(null,e)},r.prototype.then=function(e,n){var r=new this.constructor(t);return o(this,new u(e,n,r)),r},r.all=function(e){var t=Array.prototype.slice.call(e);return new r(function(e,n){function r(i,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var s=a.then;if("function"==typeof s)return void s.call(a,function(e){r(i,e)},n)}t[i]=a,0===--o&&e(t)}catch(e){n(e)}}if(0===t.length)return e([]);for(var o=t.length,i=0;i<t.length;i++)r(i,t[i])})},r.resolve=function(e){return e&&"object"==typeof e&&e.constructor===r?e:new r(function(t){t(e)})},r.reject=function(e){return new r(function(t,n){n(e)})},r.race=function(e){return new r(function(t,n){for(var r=0,o=e.length;r<o;r++)e[r].then(t,n)})},r._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){d(e,0)},r._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)},r._setImmediateFn=function(e){r._immediateFn=e},r._setUnhandledRejectionFn=function(e){r._unhandledRejectionFn=e},"undefined"!=typeof module&&module.exports?module.exports=r:e.Promise||(e.Promise=r)}(this),function(e){function t(){this.bootModule=null,this.modules={},this.onLoadQueue=[],this.onModuleLoaded={},this.addOnProviders=[],this.app=null,this.rootElement=null}e.Galaxy=e.Galaxy||new t,Galaxy.GalaxyCore=t;var n={};t.prototype.extend=function(e){for(var t,n=e||{},r=1;r<arguments.length;r++)if(t=arguments[r])for(var o in t)t.hasOwnProperty(o)&&(t[o]instanceof Array?n[o]=this.extend(n[o]||[],t[o]):"object"==typeof t[o]&&null!==t[o]?n[o]=this.extend(n[o]||{},t[o]):n[o]=t[o]);return n},t.prototype.boot=function(e,t){var n=this;if(n.rootElement=t,e.domain=this,e.id="system",!t)throw new Error("Second argument is mandatory");var r=new Promise(function(t,r){n.load(e).then(function(e){n.bootModule=e,t(e)})});return r},t.prototype.convertToURIString=function(e,t){var n,r=this,o=[];for(n in e)if(e.hasOwnProperty(n)){var i=t?t+"["+n+"]":n,a=e[n];o.push(null!==a&&"object"==typeof a?r.convertToURIString(a,i):encodeURIComponent(i)+"="+encodeURIComponent(a))}return o.join("&")},t.prototype.load=function(t){var n=this,r=new Promise(function(r,o){t.id=t.id||"noid-"+(new Date).valueOf()+"-"+Math.round(performance.now()),t.systemId=t.parentScope?t.parentScope.systemId+"/"+t.id:t.id,e.Galaxy.onModuleLoaded[t.systemId]=r;var i=Galaxy.modules[t.systemId],a=[t.url];if(t.invokers){if(t.invokers.indexOf(t.url)!==-1)throw new Error("circular dependencies: \n"+t.invokers.join("\n")+"\nwanna load: "+t.url);a=t.invokers,a.push(t.url)}if(i){var s=Galaxy.onModuleLoaded[t.systemId];return void("function"==typeof s&&(s(i),delete Galaxy.onModuleLoaded[t.systemId]))}Galaxy.onLoadQueue[t.systemId]||(Galaxy.onLoadQueue[t.systemId]=!0,fetch(t.url+"?"+n.convertToURIString(t.params||{})).then(function(e){e.text().then(function(e){n.compileModuleContent(t,e,a).then(function(e){n.executeCompiledModule(e)})})}))});return r},t.prototype.compileModuleContent=function(e,t,r){var o=this,i=new Promise(function(a,s){var u=function(e,t){t.splice(t.indexOf(e.url)-1,1),0===t.length&&a(e)},l=[],d=t.replace(/\/\*[\s\S]*?\*\n?\/|([^:]|^)\n?\/\/.*\n?$/gm,"");t=d.replace(/Scope\.import\(['|"](.*)['|"]\)\;/gm,function(e,t){var n=t.match(/([\S]+)/gm);return l.push({url:n[n.length-1],fresh:n.indexOf("new")!==-1}),"Scope.imports['"+n[n.length-1]+"']"});var c=new Galaxy.GalaxyScope(e,e.parentScope?e.parentScope.element||o.rootElement:o.rootElement),f=new Galaxy.GalaxyView(c),p=new Galaxy.GalaxyModule(e,t,c,f);if(Galaxy.modules[p.systemId]=p,l.length){var h=l.slice(0);return l.forEach(function(e){var t=Galaxy.getModuleAddOnProvider(e.url);if(t){var o=t.handler.call(null,c,p),i=o.pre();n[e.url]={name:e.url,module:i},p.registerAddOn(e.url,i),p.addOnProviders.push(o),u(p,h)}else n[e.url]&&!e.fresh?u(p,h):Galaxy.load({name:e.name,url:e.url,fresh:e.fresh,parentScope:c,invokers:r,temporary:!0}).then(function(){u(p,h)})}),i}a(p)});return i},t.prototype.executeCompiledModule=function(e){for(var t in n)if(n.hasOwnProperty(t)){var r=n[t];r.module&&(e.scope.imports[r.name]=r.module)}var o=new Function("Scope","View",e.source);o.call(null,e.scope,e.view),delete e.source,e.addOnProviders.forEach(function(e){e.post()}),delete e.addOnProviders,n[e.url]?e.fresh?n[e.url].module=e.scope.export:e.scope.imports[e.name]=n[e.url].module:n[e.url]={name:e.name||e.url,module:e.scope.export};var i=Galaxy.modules[e.systemId];(e.temporary||e.scope._doNotRegister)&&(delete e.scope._doNotRegister,i={id:e.id,scope:e.scope}),"function"==typeof Galaxy.onModuleLoaded[e.systemId]&&(Galaxy.onModuleLoaded[e.systemId](i),delete Galaxy.onModuleLoaded[e.systemId]),delete Galaxy.onLoadQueue[e.systemId]},t.prototype.getModuleAddOnProvider=function(e){return this.addOnProviders.filter(function(t){return t.name===e})[0]},t.prototype.getModulesByAddOnId=function(e){var t,n=[];for(var r in this.modules)t=this.modules[r],this.modules.hasOwnProperty(r)&&t.addOns.hasOwnProperty(e)&&n.push({addOn:t.addOns[e],module:t});return n},t.prototype.registerAddOnProvider=function(e,t){if("function"!=typeof t)throw"Addon provider should be a function";this.addOnProviders.push({name:e,handler:t})}}(this),function(e,t){function n(e,t,n,r){this.id=e.id,this.systemId=e.systemId,this.source=t,this.url=e.url||null,this.addOns=e.addOns||{},this.domain=e.domain,this.addOnProviders=[],this.scope=n,this.view=r}e.Galaxy=t,t.GalaxyModule=n,n.prototype.init=function(){for(var e in this.addOns){var t=this.addOns[e];"function"==typeof t.onModuleInit&&t.onModuleInit()}},n.prototype.start=function(){for(var e in this.addOns){var t=this.addOns[e];"function"==typeof t.onModuleStart&&t.onModuleStart()}},n.prototype.registerAddOn=function(e,t){this.addOns[e]=t}}(this,Galaxy||{}),function(e,t){function n(e,t){this.systemId=e.systemId,this.parentScope=e.parentScope||null,this.element=t||null,this.imports={};var n=document.createElement("a");n.href=e.url;var r=/([^\t\n]+)\//g,o=r.exec(n.pathname);this.path=o?o[0]:"/",this.parsedURL=n.href}e.Galaxy=t,t.GalaxyScope=n,n.prototype.load=function(e,n){e.parentScope=this,e.domain=e.domain||Galaxy,t.load(e,n)},n.prototype.loadModuleInto=function(e,n){0===e.url.indexOf("./")&&(e.url=this.path+e.url.substr(2)),this.load(e,function(e){t.ui.setContent(n,e.scope.html),e.start()})}}(this,Galaxy||{}),function(e,t){function n(e){this.scope=e,this.element=e.element}var r=Object.defineProperty,o={configurable:!0,enumerable:!1,set:null,get:null},i={configurable:!1,enumerable:!1,value:null},a=Element.prototype.setAttribute,s=function(){function e(){r=!1;var e=n.slice(0);n.length=0;for(var t=0;t<e.length;t++)e[t]()}var t,n=[],r=!1,o=Promise.resolve(),i=function(e){console.error(e)};return t=function(){o.then(e).catch(i)},function(e,o){var i;if(n.push(function(){if(e)try{e.call(o)}catch(e){console.error(e,o,"nextTick")}else i&&i(o)}),r||(r=!0,t()),!e&&"undefined"!=typeof Promise)return new Promise(function(e,t){i=e})}}();e.Galaxy=t,t.GalaxyView=n,n.nextTick=s,n.REACTIVE_BEHAVIORS={},n.NODE_SCHEMA_PROPERTY_MAP={tag:{type:"none"},children:{type:"none"},id:{type:"attr"},module:{type:"reactive",name:"module"},class:{type:"attr",parser:function(e){return e instanceof Array?e.join(" "):e||""}},title:{type:"attr"},for:{type:"attr"},href:{type:"attr"},src:{type:"attr"},alt:{type:"attr"},style:{type:"attr"},html:{type:"prop",name:"innerHTML"},text:{type:"prop",name:"textContent"},value:{type:"prop",name:"value"},$for:{type:"reactive",name:"$for"},$if:{type:"reactive",name:"$if"}},n.prototype.init=function(e){this.append(e,this.scope,this.element)},n.prototype.append=function(e,t,r,o){var i=this,a=0,s=0;if(e instanceof Array)for(a=0,s=e.length;a<s;a++)i.append(e[a],t,r);else if(null!==e&&"object"==typeof e){var u=new n.ViewNode(i,e);r.insertBefore(u.placeholder,o),e.mutator&&(u.mutator=e.mutator);var l,d,c,f,p=Object.keys(e);for(a=0,s=p.length;a<s;a++)f=p[a],l=e[f],n.REACTIVE_BEHAVIORS[f]&&i.addReactiveBehavior(u,e,t,f),d=null,c=typeof l,d="string"===c?l.match(/^\[\s*([^\[\]]*)\s*\]$/):"function"===c?[0,l]:null,d?i.makeBinding(u,t,f,d[1]):i.setPropertyForNode(u,f,l);return u.template||(i.append(e.children,t,u.node),u.inDOM&&u.setInDOM(!0)),u}},n.prototype.addReactiveBehavior=function(e,t,r,o){var i=n.REACTIVE_BEHAVIORS[o],a=t[o];if(i){var s=i.regex?a.match(i.regex):a;e.reactive[o]=function(e,t,n){var r={};return e.getCache&&(r=e.getCache(t,n)),function(o,i){return e.onApply(r,o,i,t,n)}}(i,s,r),i.bind(e,r,s)}},n.prototype.addReactiveBehaviors=function(e,t,r,o){for(var i=Object.assign({},r),a=0,s=o.length;a<s;a++){var u=o[a],l=n.REACTIVE_BEHAVIORS[u],d=t[u];if(l&&d){var c=l.regex?d.match(l.regex):d;e.reactive[u]=function(e,t,n){var r={};return e.getCache&&(r=e.getCache(t,n)),function(o,i){return e.onApply(r,o,i,t,n)}}(l,c,i),l.bind(e,r,c)}}return i},n.prototype.setPropertyForNode=function(e,t,r){var o=n.NODE_SCHEMA_PROPERTY_MAP[t],i=o.parser?o.parser(r):r;switch(o.type){case"attr":e.node.setAttribute(t,i);break;case"prop":e.node[o.name]=i;break;case"reactive":e.reactive[o.name](e,i)}},n.prototype.getPropertySetter=function(e,t){var r=n.NODE_SCHEMA_PROPERTY_MAP[t];if(!r)return null;var o=r.parser;switch(r.type){case"attr":return function(n){var r=o?o(n):n;a.call(e.node,t,r)};case"prop":return function(t){var n=o?o(t):t;e.node[r.name]=n};case"reactive":var i=e.reactive[r.name];return function(t){i(e,t)};default:return function(n){var r=o?o(n):n;a.call(e.node,t,r)}}},n.prototype.makeBinding=function(e,t,a,s){var u=this;if("object"==typeof t){var l=s,d=null;if("function"==typeof s)return l="[mutator]",t[l]=t[l]||[],void t[l].push({for:a,action:s});var c=s.split(".");c.length>1&&(l=c.shift(),d=c.join("."));var f=t[l],p=!0;"length"===l&&t instanceof Array&&(l="_length",p=!1);var h="["+l+"]",y=t[h];"undefined"==typeof y&&(y=new n.BoundProperty(l),i.value=y,r(t,h,i),o.enumerable=p,o.get=function(){return y.value},o.set=function(e){y.value!==e&&y.setValue(a,e)},r(t,l,o)),y&&(y.value=f,d||y.addNode(e,a)),d?u.makeBinding(e,t[l]||{},a,d):"object"==typeof t&&u.setInitValue(y,a,f)}},n.prototype.setInitValue=function(e,t,n){n instanceof Array?this.setArrayValue(e,t,n):this.setSingleValue(e,t,n)},n.prototype.setSingleValue=function(e,t,n){for(var r,o=0,i=e.nodes.length;o<i;o++)r=e.nodes[o],r.values[t]!==n&&e.setValueFor(r,t,n)},n.prototype.setArrayValue=function(e,t,n){var r,o=Array.prototype,i=["push","pop","shift","unshift","splice","sort","reverse"],a={original:n,type:"push",params:n},s=n,u=0,l=function(t,n){e.updateValue(t,n)};i.forEach(function(e){var i=o[e];Object.defineProperty(n,e,{value:function(){for(u=arguments.length,r=new Array(u);u--;)r[u]=arguments[u];var n=i.apply(this,r);return"undefined"!=typeof s._length&&(s._length=s.length),a.type=e,a.params=r,l(t,a),n},writable:!0,configurable:!0})}),e.nodes.forEach(function(r){r.values[t]!==n&&(r.values[t]=n,e.value=n,e.setUpdateFor(r,t,a))})}}(this,Galaxy||{}),function(e){function t(e){this.name=e,this.value=null,this.nodes=[]}e.BoundProperty=t,t.prototype.addNode=function(e,t){this.nodes.indexOf(e)===-1&&(e.addProperty(this,t),this.nodes.push(e))},t.prototype.setValue=function(e,t){this.value=t;for(var n=0,r=this.nodes.length;n<r;n++)this.setValueFor(this.nodes[n],e,t)},t.prototype.updateValue=function(e,t){for(var n=0,r=this.nodes.length;n<r;n++)this.setUpdateFor(this.nodes[n],e,t)},t.prototype.setValueFor=function(e,t,n){var r=e.mutator[t],o=n;r&&(o=r.call(e,n,e.values[t])),e.values[t]=o,e.setters[t](o)},t.prototype.setUpdateFor=function(e,t,n){e.setters[t](n)}}(Galaxy.GalaxyView),function(e){function t(e){return document.createElement(e)}function n(e){return a.cloneNode()}function r(e,t,n){e.insertBefore(t,n)}function o(e,t){e.removeChild(t)}function i(e,r){this.root=e,this.node=t(r.tag||"div"),this.nodeSchema=r,this.data={},this.mutator={},this.template=!1,this.placeholder=n(r.tag||"div"),this.properties={},this.values={},this.inDOM="undefined"==typeof r.inDOM||r.inDOM,this.setters={},this.reactive={}}var a=document.createComment("");e.ViewNode=i,i.prototype.cloneSchema=function(){var e=Object.assign({},this.nodeSchema);return Object.defineProperty(e,"mother",{value:this.nodeSchema,writable:!1,enumerable:!1,configurable:!1}),e},i.prototype.toTemplate=function(){this.placeholder.nodeValue=JSON.stringify(this.nodeSchema,null,2),this.template=!0},i.prototype.setInDOM=function(e){this.inDOM=e,!e||this.node.parentNode||this.template?!e&&this.node.parentNode&&(r(this.node.parentNode,this.placeholder,this.node),o(this.node.parentNode,this.node)):(r(this.placeholder.parentNode,this.node,this.placeholder.nextSibling),o(this.placeholder.parentNode,this.placeholder))},i.prototype.addProperty=function(e,t){if(this.properties[e.name]=e,this.setters[t]=this.root.getPropertySetter(this,t),!this.setters[t]){var n=this;this.setters[t]=function(){console.error("No setter for property :",t,"\nNode:",n)}}},i.prototype.destroy=function(){var e=this;e.inDOM?(o(e.node.parentNode,e.placeholder),o(e.node.parentNode,e.node)):o(e.placeholder.parentNode,e.placeholder);var t,n;for(var r in e.properties)n=e.properties[r],t=n.nodes.indexOf(e),t!==-1&&n.nodes.splice(t,1);e.properties={}}}(Galaxy.GalaxyView),function(e){e.REACTIVE_BEHAVIORS.$for={regex:/^([\w]*)\s+in\s+([^\s\n]+)$/,bind:function(e,t,n){e.toTemplate(),e.root.makeBinding(e,t,"$for",n[2])},getCache:function(e){return{propName:e[1],clonedNodeSchema:null,nodes:[]}},onApply:function(e,t,n,r,o){e.clonedNodeSchema=e.clonedNodeSchema||t.cloneSchema(),delete e.clonedNodeSchema.$for;var i=t.placeholder.parentNode,a=null,s=[],u=Array.prototype.push;if("push"===n.type)s=n.params;else if("unshift"===n.type)a=e.nodes[0]?e.nodes[0].node:null,s=n.params,u=Array.prototype.unshift;else if("splice"===n.type){var l=Array.prototype.splice.apply(e.nodes,n.params.slice(0,2));s=n.params.slice(2),l.forEach(function(e){e.destroy()})}else"pop"===n.type?e.nodes.pop().destroy():"shift"===n.type?e.nodes.shift().destroy():"sort"!==n.type&&"reverse"!==n.type||(e.nodes.forEach(function(e){e.destroy()}),e.nodes=[],s=n.original);var d,c=o,f=e.propName,p=e.nodes,h=t.root,y=e.clonedNodeSchema;if(s instanceof Array)for(var m=0,v=s.length;m<v;m++)d=s[m],c[f]=d,u.call(p,h.append(y,c,i,a))}}}(Galaxy.GalaxyView),function(e){e.REACTIVE_BEHAVIORS.$if={regex:null,bind:function(e,t,n){},onApply:function(e,t,n){n?t.setInDOM(!0):t.setInDOM(!1)}}}(Galaxy.GalaxyView),function(e){e.REACTIVE_BEHAVIORS.module={regex:null,bind:function(e,t,n){},onApply:function(e,t,n){}}}(Galaxy.GalaxyView);