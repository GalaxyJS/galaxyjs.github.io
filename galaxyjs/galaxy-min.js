!function(e){"use strict";function t(e){if("string"!=typeof e&&(e=String(e)),/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(e))throw new TypeError("Invalid character in header field name");return e.toLowerCase()}function n(e){return"string"!=typeof e&&(e=String(e)),e}function r(e){var t={next:function(){var t=e.shift();return{done:void 0===t,value:t}}};return v.iterable&&(t[Symbol.iterator]=function(){return t}),t}function o(e){this.map={},e instanceof o?e.forEach(function(e,t){this.append(t,e)},this):Array.isArray(e)?e.forEach(function(e){this.append(e[0],e[1])},this):e&&Object.getOwnPropertyNames(e).forEach(function(t){this.append(t,e[t])},this)}function i(e){return e.bodyUsed?Promise.reject(new TypeError("Already read")):void(e.bodyUsed=!0)}function a(e){return new Promise(function(t,n){e.onload=function(){t(e.result)},e.onerror=function(){n(e.error)}})}function s(e){var t=new FileReader,n=a(t);return t.readAsArrayBuffer(e),n}function u(e){var t=new FileReader,n=a(t);return t.readAsText(e),n}function l(e){for(var t=new Uint8Array(e),n=new Array(t.length),r=0;r<t.length;r++)n[r]=String.fromCharCode(t[r]);return n.join("")}function c(e){if(e.slice)return e.slice(0);var t=new Uint8Array(e.byteLength);return t.set(new Uint8Array(e)),t.buffer}function p(){return this.bodyUsed=!1,this._initBody=function(e){if(this._bodyInit=e,e)if("string"==typeof e)this._bodyText=e;else if(v.blob&&Blob.prototype.isPrototypeOf(e))this._bodyBlob=e;else if(v.formData&&FormData.prototype.isPrototypeOf(e))this._bodyFormData=e;else if(v.searchParams&&URLSearchParams.prototype.isPrototypeOf(e))this._bodyText=e.toString();else if(v.arrayBuffer&&v.blob&&b(e))this._bodyArrayBuffer=c(e.buffer),this._bodyInit=new Blob([this._bodyArrayBuffer]);else{if(!v.arrayBuffer||!ArrayBuffer.prototype.isPrototypeOf(e)&&!w(e))throw new Error("unsupported BodyInit type");this._bodyArrayBuffer=c(e)}else this._bodyText="";this.headers.get("content-type")||("string"==typeof e?this.headers.set("content-type","text/plain;charset=UTF-8"):this._bodyBlob&&this._bodyBlob.type?this.headers.set("content-type",this._bodyBlob.type):v.searchParams&&URLSearchParams.prototype.isPrototypeOf(e)&&this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8"))},v.blob&&(this.blob=function(){var e=i(this);if(e)return e;if(this._bodyBlob)return Promise.resolve(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(new Blob([this._bodyArrayBuffer]));if(this._bodyFormData)throw new Error("could not read FormData body as blob");return Promise.resolve(new Blob([this._bodyText]))},this.arrayBuffer=function(){return this._bodyArrayBuffer?i(this)||Promise.resolve(this._bodyArrayBuffer):this.blob().then(s)}),this.text=function(){var e=i(this);if(e)return e;if(this._bodyBlob)return u(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(l(this._bodyArrayBuffer));if(this._bodyFormData)throw new Error("could not read FormData body as text");return Promise.resolve(this._bodyText)},v.formData&&(this.formData=function(){return this.text().then(h)}),this.json=function(){return this.text().then(JSON.parse)},this}function d(e){var t=e.toUpperCase();return O.indexOf(t)>-1?t:e}function f(e,t){t=t||{};var n=t.body;if(e instanceof f){if(e.bodyUsed)throw new TypeError("Already read");this.url=e.url,this.credentials=e.credentials,t.headers||(this.headers=new o(e.headers)),this.method=e.method,this.mode=e.mode,n||null==e._bodyInit||(n=e._bodyInit,e.bodyUsed=!0)}else this.url=String(e);if(this.credentials=t.credentials||this.credentials||"omit",!t.headers&&this.headers||(this.headers=new o(t.headers)),this.method=d(t.method||this.method||"GET"),this.mode=t.mode||this.mode||null,this.referrer=null,("GET"===this.method||"HEAD"===this.method)&&n)throw new TypeError("Body not allowed for GET or HEAD requests");this._initBody(n)}function h(e){var t=new FormData;return e.trim().split("&").forEach(function(e){if(e){var n=e.split("="),r=n.shift().replace(/\+/g," "),o=n.join("=").replace(/\+/g," ");t.append(decodeURIComponent(r),decodeURIComponent(o))}}),t}function y(e){var t=new o,n=e.replace(/\r?\n[\t ]+/," ");return n.split(/\r?\n/).forEach(function(e){var n=e.split(":"),r=n.shift().trim();if(r){var o=n.join(":").trim();t.append(r,o)}}),t}function m(e,t){t||(t={}),this.type="default",this.status="status"in t?t.status:200,this.ok=this.status>=200&&this.status<300,this.statusText="statusText"in t?t.statusText:"OK",this.headers=new o(t.headers),this.url=t.url||"",this._initBody(e)}if(!e.fetch){var v={searchParams:"URLSearchParams"in e,iterable:"Symbol"in e&&"iterator"in Symbol,blob:"FileReader"in e&&"Blob"in e&&function(){try{return new Blob,!0}catch(e){return!1}}(),formData:"FormData"in e,arrayBuffer:"ArrayBuffer"in e};if(v.arrayBuffer)var _=["[object Int8Array]","[object Uint8Array]","[object Uint8ClampedArray]","[object Int16Array]","[object Uint16Array]","[object Int32Array]","[object Uint32Array]","[object Float32Array]","[object Float64Array]"],b=function(e){return e&&DataView.prototype.isPrototypeOf(e)},w=ArrayBuffer.isView||function(e){return e&&_.indexOf(Object.prototype.toString.call(e))>-1};o.prototype.append=function(e,r){e=t(e),r=n(r);var o=this.map[e];this.map[e]=o?o+","+r:r},o.prototype.delete=function(e){delete this.map[t(e)]},o.prototype.get=function(e){return e=t(e),this.has(e)?this.map[e]:null},o.prototype.has=function(e){return this.map.hasOwnProperty(t(e))},o.prototype.set=function(e,r){this.map[t(e)]=n(r)},o.prototype.forEach=function(e,t){for(var n in this.map)this.map.hasOwnProperty(n)&&e.call(t,this.map[n],n,this)},o.prototype.keys=function(){var e=[];return this.forEach(function(t,n){e.push(n)}),r(e)},o.prototype.values=function(){var e=[];return this.forEach(function(t){e.push(t)}),r(e)},o.prototype.entries=function(){var e=[];return this.forEach(function(t,n){e.push([n,t])}),r(e)},v.iterable&&(o.prototype[Symbol.iterator]=o.prototype.entries);var O=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];f.prototype.clone=function(){return new f(this,{body:this._bodyInit})},p.call(f.prototype),p.call(m.prototype),m.prototype.clone=function(){return new m(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new o(this.headers),url:this.url})},m.error=function(){var e=new m(null,{status:0,statusText:""});return e.type="error",e};var g=[301,302,303,307,308];m.redirect=function(e,t){if(g.indexOf(t)===-1)throw new RangeError("Invalid status code");return new m(null,{status:t,headers:{location:e}})},e.Headers=o,e.Request=f,e.Response=m,e.fetch=function(e,t){return new Promise(function(n,r){var o=new f(e,t),i=new XMLHttpRequest;i.onload=function(){var e={status:i.status,statusText:i.statusText,headers:y(i.getAllResponseHeaders()||"")};e.url="responseURL"in i?i.responseURL:e.headers.get("X-Request-URL");var t="response"in i?i.response:i.responseText;n(new m(t,e))},i.onerror=function(){r(new TypeError("Network request failed"))},i.ontimeout=function(){r(new TypeError("Network request failed"))},i.open(o.method,o.url,!0),"include"===o.credentials&&(i.withCredentials=!0),"responseType"in i&&v.blob&&(i.responseType="blob"),o.headers.forEach(function(e,t){i.setRequestHeader(t,e)}),i.send("undefined"==typeof o._bodyInit?null:o._bodyInit)})},e.fetch.polyfill=!0}}("undefined"!=typeof self?self:this),"function"!=typeof Object.assign&&(Object.assign=function(e,t){"use strict";if(null==e)throw new TypeError("Cannot convert undefined or null to object");for(var n=Object(e),r=1;r<arguments.length;r++){var o=arguments[r];if(null!=o)for(var i in o)Object.prototype.hasOwnProperty.call(o,i)&&(n[i]=o[i])}return n}),function(e){function t(){}function n(e,t){return function(){e.apply(t,arguments)}}function r(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],l(e,this)}function o(e,t){for(;3===e._state;)e=e._value;return 0===e._state?void e._deferreds.push(t):(e._handled=!0,void r._immediateFn(function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null===n)return void(1===e._state?i:a)(t.promise,e._value);var r;try{r=n(e._value)}catch(e){return void a(t.promise,e)}i(t.promise,r)}))}function i(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var o=t.then;if(t instanceof r)return e._state=3,e._value=t,void s(e);if("function"==typeof o)return void l(n(o,t),e)}e._state=1,e._value=t,s(e)}catch(t){a(e,t)}}function a(e,t){e._state=2,e._value=t,s(e)}function s(e){2===e._state&&0===e._deferreds.length&&r._immediateFn(function(){e._handled||r._unhandledRejectionFn(e._value)});for(var t=0,n=e._deferreds.length;t<n;t++)o(e,e._deferreds[t]);e._deferreds=null}function u(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n}function l(e,t){var n=!1;try{e(function(e){n||(n=!0,i(t,e))},function(e){n||(n=!0,a(t,e))})}catch(e){if(n)return;n=!0,a(t,e)}}var c=setTimeout;r.prototype.catch=function(e){return this.then(null,e)},r.prototype.then=function(e,n){var r=new this.constructor(t);return o(this,new u(e,n,r)),r},r.all=function(e){var t=Array.prototype.slice.call(e);return new r(function(e,n){function r(i,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var s=a.then;if("function"==typeof s)return void s.call(a,function(e){r(i,e)},n)}t[i]=a,0===--o&&e(t)}catch(e){n(e)}}if(0===t.length)return e([]);for(var o=t.length,i=0;i<t.length;i++)r(i,t[i])})},r.resolve=function(e){return e&&"object"==typeof e&&e.constructor===r?e:new r(function(t){t(e)})},r.reject=function(e){return new r(function(t,n){n(e)})},r.race=function(e){return new r(function(t,n){for(var r=0,o=e.length;r<o;r++)e[r].then(t,n)})},r._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){c(e,0)},r._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)},r._setImmediateFn=function(e){r._immediateFn=e},r._setUnhandledRejectionFn=function(e){r._unhandledRejectionFn=e},"undefined"!=typeof module&&module.exports?module.exports=r:e.Promise||(e.Promise=r)}(this),function(e){function t(){this.bootModule=null,this.modules={},this.onLoadQueue=[],this.moduleContents={},this.addOnProviders=[],this.app=null,this.rootElement=null}Array.prototype.unique=function(){for(var e=this.concat(),t=0;t<e.length;++t)for(var n=t+1;n<e.length;++n)e[t]===e[n]&&e.splice(n--,1);return e},e.Galaxy=e.Galaxy||new t,Galaxy.GalaxyCore=t;var n={};t.prototype.extend=function(e){for(var t,n=e||{},r=1;r<arguments.length;r++)if(t=arguments[r])for(var o in t)t.hasOwnProperty(o)&&(t[o]instanceof Array?n[o]=this.extend(n[o]||[],t[o]):"object"==typeof t[o]&&null!==t[o]?n[o]=this.extend(n[o]||{},t[o]):n[o]=t[o]);return n},t.prototype.resetObjectTo=function(e,t){if(null!==t&&"object"!=typeof t)return t;if(null===t){for(var n in e)"object"==typeof e[n]?e[n]=this.resetObjectTo(e[n],null):e[n]=null;return e}for(var r=Object.keys(e),o=r.concat(Object.keys(t)).unique(),i=0,a=o.length;i<a;i++){var s=o[i];t.hasOwnProperty(s)?e[s]=this.resetObjectTo(e[s],t[s]):"object"==typeof e[s]?this.resetObjectTo(e[s],null):e[s]=null}return e},t.prototype.boot=function(e){var t=this;if(t.rootElement=e.element,e.domain=this,e.id="system",!e.element)throw new Error("element property is mandatory");var n=new Promise(function(n,r){t.load(e).then(function(e){t.bootModule=e,n(e)})});return n},t.prototype.convertToURIString=function(e,t){var n,r=this,o=[];for(n in e)if(e.hasOwnProperty(n)){var i=t?t+"["+n+"]":n,a=e[n];o.push(null!==a&&"object"==typeof a?r.convertToURIString(a,i):encodeURIComponent(i)+"="+encodeURIComponent(a))}return o.join("&")},t.prototype.load=function(t){var n=this,r=new Promise(function(r,o){t.id=t.id||"noid-"+(new Date).valueOf()+"-"+Math.round(performance.now()),t.systemId=t.parentScope?t.parentScope.systemId+"/"+t.id:t.id;var i=[t.url];if(t.invokers){if(t.invokers.indexOf(t.url)!==-1)throw new Error("circular dependencies: \n"+t.invokers.join("\n")+"\nwanna load: "+t.url);i=t.invokers,i.push(t.url)}Galaxy.onLoadQueue[t.systemId]=!0;var a=t.url+"?"+n.convertToURIString(t.params||{}),s=e.Galaxy.moduleContents[a];s&&!t.fresh||(e.Galaxy.moduleContents[a]=s=fetch(a).then(function(e){return 200!==e.status?(o(e),""):e.text()}).catch(o)),s.then(function(e){return n.moduleContents[t.systemId]=e,n.compileModuleContent(t,e,i).then(function(e){return n.executeCompiledModule(e).then(r)}),e}).catch(o)});return r},t.prototype.compileModuleContent=function(e,t,r){var o=this,i=new Promise(function(a,s){var u=function(e,t){t.splice(t.indexOf(e.url)-1,1),0===t.length&&a(e)},l=[],c=t.replace(/\/\*[\s\S]*?\*\n?\/|([^:;]|^)\n?\/\/.*\n?$/gm,"");t=c.replace(/Scope\.import\(['|"](.*)['|"]\)\;/gm,function(e,t){var n=t.match(/([\S]+)/gm);return l.push({url:n[n.length-1],fresh:n.indexOf("new")!==-1}),"Scope.imports['"+n[n.length-1]+"']"});var p=new Galaxy.GalaxyScope(e,e.element||o.rootElement),d=new Galaxy.GalaxyModule(e,t,p);if(Galaxy.modules[d.systemId]=d,l.length){var f=l.slice(0);return l.forEach(function(e){var t=Galaxy.getModuleAddOnProvider(e.url);if(t){var o=t.handler.call(null,p,d),i=o.create();d.registerAddOn(e.url,i),d.addOnProviders.push(o),u(d,f)}else n[e.url]&&!e.fresh?u(d,f):Galaxy.load({name:e.name,url:e.url,fresh:e.fresh,parentScope:p,invokers:r,temporary:!0}).then(function(){u(d,f)})}),i}a(d)});return i},t.prototype.executeCompiledModule=function(e){var t=new Promise(function(t,r){for(var o in e.addOns)e.scope.imports[o]=e.addOns[o];for(o in n)if(n.hasOwnProperty(o)){var i=n[o];i.module&&(e.scope.imports[i.name]=i.module)}var a=new Function("Scope",e.source);a.call(null,e.scope),delete e.source,e.addOnProviders.forEach(function(e){e.finalize()}),delete e.addOnProviders,n[e.url]?e.fresh&&(n[e.url].module=e.scope.export):n[e.url]={name:e.name||e.url,module:e.scope.export};var s=Galaxy.modules[e.systemId];(e.temporary||e.scope._doNotRegister)&&(delete e.scope._doNotRegister,s={id:e.id,scope:e.scope}),t(s),delete Galaxy.onLoadQueue[e.systemId]});return t},t.prototype.getModuleAddOnProvider=function(e){return this.addOnProviders.filter(function(t){return t.name===e})[0]},t.prototype.getModulesByAddOnId=function(e){var t,n=[];for(var r in this.modules)t=this.modules[r],this.modules.hasOwnProperty(r)&&t.addOns.hasOwnProperty(e)&&n.push({addOn:t.addOns[e],module:t});return n},t.prototype.registerAddOnProvider=function(e,t){if("function"!=typeof t)throw"Addon provider should be a function";this.addOnProviders.push({name:e,handler:t})}}(this),function(e,t){function n(e,t,n){this.id=e.id,this.systemId=e.systemId,this.source=t,this.url=e.url||null,this.addOns=e.addOns||{},this.domain=e.domain,this.addOnProviders=[],this.scope=n}e.Galaxy=t,t.GalaxyModule=n,n.prototype.init=function(){for(var e in this.addOns){var t=this.addOns[e];"function"==typeof t.onModuleInit&&t.onModuleInit()}},n.prototype.start=function(){for(var e in this.addOns){var t=this.addOns[e];"function"==typeof t.onModuleStart&&t.onModuleStart()}},n.prototype.registerAddOn=function(e,t){this.addOns[e]=t}}(this,Galaxy||{}),function(e,t){function n(e,t){this.systemId=e.systemId,this.parentScope=e.parentScope||null,this.element=t||null,this.imports={};var n=document.createElement("a");n.href=e.url;var r=/([^\t\n]+)\//g,o=r.exec(n.pathname);this.path=o?o[0]:"/",this.parsedURL=n.href}e.Galaxy=t,t.GalaxyScope=n,n.prototype.load=function(e,n){var r=Object.assign({},e,n||{});return 0===r.url.indexOf("./")&&(r.url=this.path+e.url.substr(2)),r.parentScope=this,r.domain=r.domain||Galaxy,t.load(r)},n.prototype.loadModuleInto=function(e,t){return this.load(e,{element:t}).then(function(e){return e.start(),e})}}(this,Galaxy||{}),function(e,t){function n(e){this.scope=e,this.dataRepos={};var t;t=e.element instanceof n.ViewNode?e.element:new n.ViewNode(this,{tag:e.element.tagName,node:e.element}),this.container=t}var r=Object.defineProperty,o={configurable:!0,enumerable:!1,set:null,get:null},i={configurable:!1,enumerable:!1,value:null},a=Element.prototype.setAttribute,s=function(){function e(){r=!1;var e=n.slice(0);n.length=0;for(var t=0;t<e.length;t++)e[t]()}var t,n=[],r=!1,o=Promise.resolve(),i=function(e){console.error(e)};return t=function(){o.then(e).catch(i)},function(e,o){var i;if(n.push(function(){if(e)try{e.call(o)}catch(e){console.error(e,o,"nextTick")}else i&&i(o)}),r||(r=!0,t()),!e&&"undefined"!=typeof Promise)return new Promise(function(e,t){i=e})}}();e.Galaxy=t,t.GalaxyView=n,n.nextTick=s,n.cleanProperty=function(e,t){delete e[t]},n.createMirror=function(e){var t={};return r(t,"__parent__",{enumerable:!1,value:e}),t},n.createClone=function(e){var t=Object.assign({},e);for(var n in e)e.hasOwnProperty("["+n+"]")&&(i.value=e["["+n+"]"],r(t,"["+n+"]",i),r(t,n,Object.getOwnPropertyDescriptor(e,n)));return t},n.REACTIVE_BEHAVIORS={},n.NODE_SCHEMA_PROPERTY_MAP={tag:{type:"none"},children:{type:"none"},content:{type:"none"},id:{type:"attr"},class:{type:"attr",parser:function(e){return e instanceof Array?e.join(" "):e||""}},title:{type:"attr"},for:{type:"attr"},href:{type:"attr"},src:{type:"attr"},alt:{type:"attr"},style:{type:"prop"},css:{type:"attr",name:"style"},html:{type:"prop",name:"innerHTML"},text:{type:"prop",name:"textContent"},checked:{type:"prop"},click:{type:"event",name:"click"}},n.prototype.setupRepos=function(e){this.dataRepos=e},n.prototype.init=function(e){this.append(e,this.scope,this.container)},n.prototype.append=function(e,t,r,o){var i=this,a=0,s=0;if(e instanceof Array)for(a=0,s=e.length;a<s;a++)i.append(e[a],t,r);else if(null!==e&&"object"==typeof e){var u=new n.ViewNode(i,e);r.append(u,o),e.mutator&&(u.mutator=e.mutator);var l,c,p,d,f=Object.keys(e);for(a=0,s=f.length;a<s;a++)d=f[a],l=e[d],n.REACTIVE_BEHAVIORS[d]&&i.addReactiveBehavior(u,e,t,d),c=null,p=typeof l,"string"===p?c=l.match(/^\[\s*([^\[\]]*)\s*\]$/):"function"===p||(c=null),c?i.makeBinding(u,t,d,c[1]):i.setPropertyForNode(u,d,l,t);return u.template||(i.append(e.children,t,u),u.inDOM&&u.setInDOM(!0)),u}},n.prototype.addReactiveBehavior=function(e,t,r,o){var i=n.REACTIVE_BEHAVIORS[o],a=t[o];if(i){var s=i.regex?a.match(i.regex):a;e.properties.__reactive__[o]=function(t,n,r){var o={};return t.getCache&&(o=t.getCache(e,n,r)),function(e,i){return t.onApply(o,e,i,n,r)}}(i,s,r),i.bind(e,r,s)}},n.prototype.setPropertyForNode=function(e,t,r,o){var i=n.NODE_SCHEMA_PROPERTY_MAP[t]||{type:"attr"},a=r;switch(i.type){case"attr":a=i.parser?i.parser(r):r,e.node.setAttribute(t,a);break;case"prop":a=i.parser?i.parser(r):r,e.node[i.name]=a;break;case"reactive":e.properties.__reactive__[i.name](e,a);break;case"event":e.node.addEventListener(t,r.bind(e),!1);break;case"custom":i.handler(e,t,r,o)}},n.prototype.getPropertySetter=function(e,t){var r=n.NODE_SCHEMA_PROPERTY_MAP[t];if(!r)return function(n){a.call(e.node,t,n)};var o=r.parser;switch(r.type){case"attr":return function(n){var r=o?o(n):n;a.call(e.node,t,r)};case"prop":return function(t){var n=o?o(t):t;e.node[r.name]=n};case"reactive":var i=e.properties.__reactive__[r.name];return function(t){i(e,t)};case"custom":return function(n,o){r.handler(e,t,n,o)};default:return function(n){var r=o?o(n):n;a.call(e.node,t,r)}}},n.prototype.makeBinding=function(e,t,a,s){var u=this,l=t;if("object"==typeof l){var c=s,p=null;if("function"==typeof s)return c="[mutator]",l[c]=l[c]||[],void l[c].push({for:a,action:s});var d=s.split(".");if(d.length>1&&(c=d.shift(),p=d.join(".")),!l.hasOwnProperty(c))for(var f=l;f.__parent__;){if(f.__parent__.hasOwnProperty(c)){l=f.__parent__;break}f=l.__parent__}var h=l[c],y=!0;"length"===c&&l instanceof Array&&(c="_length",y=!1);var m="["+c+"]",v=l[m];"undefined"==typeof v&&(v=new n.BoundProperty(c,h),i.value=v,r(l,m,i),o.enumerable=y,o.get=function(){return v.value},p?o.set=function(e){if(v.value!==e){if(null!==e&&"object"==typeof v.value){var t=Object.getOwnPropertyNames(v.value),n=Object.keys(v.value),o=Object.keys(e),i={},a=t.filter(function(e){return i[e]=Object.getOwnPropertyDescriptor(v.value||{},e),n.indexOf(e)===-1});o.forEach(function(t){a.indexOf("["+t+"]")!==-1&&(i["["+t+"]"].value.setValue(e[t]),r(e,"["+t+"]",i["["+t+"]"]),r(e,t,i[t]))})}v.setValue(e)}}:o.set=function(e){v.setValue(e)},r(l,c,o)),e instanceof Galaxy.GalaxyView.ViewNode||p||e.hasOwnProperty("["+a+"]")||(i.value=v,r(e,"["+a+"]",i),o.enumerable=y,o.get=function(){return v.value},o.set=function(e){v.setValue(e)},r(e,a,o)),!p&&e instanceof Galaxy.GalaxyView.ViewNode&&v.addNode(e,a),p?u.makeBinding(e,l[c]||{},a,p):"object"==typeof l&&v.initValueFor(e,a,h,t)}},n.createActiveArray=function(e,t){var n={original:e,type:"push",params:e};if(e.hasOwnProperty("[live]"))return n;var o,a=Array.prototype,s=["push","pop","shift","unshift","splice","sort","reverse"],u=e,l=0;return i.value=!0,r(e,"[live]",i),s.forEach(function(r){var i=a[r];Object.defineProperty(e,r,{value:function(){for(l=arguments.length,o=new Array(l);l--;)o[l]=arguments[l];var e=i.apply(this,o);return"undefined"!=typeof u._length&&(u._length=u.length),n.type=r,n.params=o,t(n),e},writable:!1,configurable:!0})}),n}}(this,Galaxy||{}),function(e){function t(e,t){this.name=e,this.value=t,this.props=[],this.nodes=[]}e.BoundProperty=t,t.prototype.addNode=function(e,t){this.nodes.indexOf(e)===-1&&(e instanceof Galaxy.GalaxyView.ViewNode&&e.addProperty(this,t),this.props.push(t),this.nodes.push(e))},t.prototype.initValueFor=function(t,n,r,o){if(this.value=r,r instanceof Array){var i=e.createActiveArray(r,this.updateValue.bind(this));t instanceof e.ViewNode&&(t.values[n]=r,this.setUpdateFor(t,n,i))}else this.setValueFor(t,n,r,o)},t.prototype.setValue=function(t){if(t!==this.value)if(this.value=t,t instanceof Array)e.createActiveArray(t,this.updateValue.bind(this)),this.updateValue({type:"reset",params:t,original:t},t);else for(var n=0,r=this.nodes.length;n<r;n++)this.setValueFor(this.nodes[n],this.props[n],t)},t.prototype.updateValue=function(e,t){for(var n=0,r=this.nodes.length;n<r;n++)this.nodes[n].value=t,this.setUpdateFor(this.nodes[n],this.props[n],e)},t.prototype.setValueFor=function(e,t,n,r){var o=n;if(e instanceof Galaxy.GalaxyView.ViewNode){var i=e.mutator[t];i&&(o=i.call(e,n,e.values[t])),e.values[t]=o,e.setters[t]||console.info(e,t,o),e.setters[t](o,r)}else e[t]=o},t.prototype.setUpdateFor=function(e,t,n){e.setters[t](n)}}(Galaxy.GalaxyView),function(e){function t(e){return document.createElement(e)}function n(e){return a.cloneNode(e)}function r(e,t,n){e.insertBefore(t,n)}function o(e,t){e.removeChild(t)}function i(e,r){this.root=e,this.node=r.node||t(r.tag||"div"),this.schema=r,this.data={},this.mutator={},this.template=!1,this.placeholder=n(r.tag||"div"),this.properties={},Object.defineProperty(this.properties,"__reactive__",{value:{},enumerable:!1,writable:!1}),this.values={},this.inDOM="undefined"==typeof r.inDOM||r.inDOM,this.setters={},this.parent=null,this.schema.node=this.node}var a=document.createComment("");e.ViewNode=i,e.NODE_SCHEMA_PROPERTY_MAP.node={type:"none"},i.prototype.cloneSchema=function(){var e=Object.assign({},this.schema);return s(e),e.node=this.node.cloneNode(),Object.defineProperty(e,"mother",{value:this.schema,writable:!1,enumerable:!1,configurable:!1}),e},i.prototype.toTemplate=function(){this.placeholder.nodeValue=JSON.stringify(this.schema,null,2),this.template=!0},i.prototype.setInDOM=function(e){this.inDOM=e,!e||this.node.parentNode||this.template?!e&&this.node.parentNode&&o(this.node.parentNode,this.node):r(this.placeholder.parentNode,this.node,this.placeholder.nextSibling)},i.prototype.append=function(e,t){e.parent=this,this.node.insertBefore(e.placeholder,t)},i.prototype.addProperty=function(e,t){if(this.properties[e.name]=e,this.setters[t]=this.root.getPropertySetter(this,t),!this.setters[t]){var n=this;this.setters[t]=function(){console.error("No setter for property :",t,"\nNode:",n)}}},i.prototype.destroy=function(){var e=this;e.inDOM?(o(e.node.parentNode,e.placeholder),o(e.node.parentNode,e.node)):o(e.placeholder.parentNode,e.placeholder);var t,n;for(var r in e.properties)n=e.properties[r],t=n.nodes.indexOf(e),t!==-1&&n.nodes.splice(t,1);e.inDOM=!1,e.properties={}};var s=function(e){e instanceof Array?e.forEach(function(e){s(e)}):e&&(e.node=null,s(e.children))};i.prototype.empty=function(){this.node.innerHTML=""},i.prototype.getPlaceholder=function(){return this.inDOM?this.node:this.placeholder}}(Galaxy.GalaxyView),function(e){e.GalaxyView.NODE_SCHEMA_PROPERTY_MAP.inputs={type:"custom",name:"inputs",handler:function(t,n,r,o){if(!t.template){if("object"!=typeof r||null===r)throw new Error("Inputs must be an object");for(var i,a,s,u=Object.keys(r),l=null,c=e.GalaxyView.createClone(r),p=0,d=u.length;p<d;p++)i=u[p],a=r[i],l=null,s=typeof a,"string"===s?l=a.match(/^\[\s*([^\[\]]*)\s*\]$/):"function"===s||(l=null),l&&t.root.makeBinding(c,o,i,l[1]);t.hasOwnProperty("__inputs__")&&c!==t.__inputs__?Galaxy.resetObjectTo(t.__inputs__,c):t.hasOwnProperty("__inputs__")||Object.defineProperty(t,"__inputs__",{value:c,enumerable:!1})}}},e.registerAddOnProvider("galaxy/inputs",function(e){return{create:function(){return e.inputs=e.element.__inputs__,e.inputs},finalize:function(){}}})}(Galaxy),function(e){e.registerAddOnProvider("galaxy/view",function(e){return{create:function(){var t=new Galaxy.GalaxyView(e);return t},finalize:function(){}}})}(Galaxy),function(e){e.NODE_SCHEMA_PROPERTY_MAP.content={type:"reactive",name:"content"},e.REACTIVE_BEHAVIORS.content={regex:null,bind:function(e){e.toTemplate()},getCache:function(e){return{module:null,scope:e.root.scope}},onApply:function(e,t,n,r,o){if(o.element.schema.children&&o.element.schema.hasOwnProperty("module")){var i=o.element.schema.children,a=t.parent.node;i.forEach(function(e){"*"!==n&&n.toLowerCase()!==e.node.tagName.toLowerCase()||a.insertBefore(e.node,t.placeholder)})}}}}(Galaxy.GalaxyView),function(e){e.NODE_SCHEMA_PROPERTY_MAP.$for={type:"reactive",name:"$for"},e.REACTIVE_BEHAVIORS.$for={regex:/^([\w]*)\s+in\s+([^\s\n]+)$/,bind:function(e,t,n){e.toTemplate(),e.root.makeBinding(e,t,"$for",n[2])},getCache:function(e,t){return{propName:t[1],nodes:[]}},onApply:function(t,n,r,o,i){var a=n.parent,s=null,u=[],l=Array.prototype.push;if("reset"===r.type&&(t.nodes.forEach(function(e){e.destroy()}),t.nodes=[],r=Object.assign({},r),r.type="push"),"push"===r.type){var c=t.nodes.length;s=c?t.nodes[c-1].getPlaceholder().nextSibling:n.placeholder.nextSibling,u=r.params}else if("unshift"===r.type)s=t.nodes[0]?t.nodes[0].placeholder:null,u=r.params,l=Array.prototype.unshift;else if("splice"===r.type){var p=Array.prototype.splice.apply(t.nodes,r.params.slice(0,2));u=r.params.slice(2),p.forEach(function(e){e.destroy()})}else"pop"===r.type?t.nodes.pop().destroy():"shift"===r.type?t.nodes.shift().destroy():"sort"!==r.type&&"reverse"!==r.type||(t.nodes.forEach(function(e){e.destroy()}),t.nodes=[],u=r.original);var d,f,h=i,y=t.propName,m=t.nodes,v=n.root;if(u instanceof Array)for(var _=0,b=u.length;_<b;_++){d=u[_],h=e.createMirror(i),h[y]=d,f=n.cloneSchema(),delete f.$for;var w=v.append(f,h,a,s);w.data[y]=d,l.call(m,w)}}}}(Galaxy.GalaxyView),function(e){e.NODE_SCHEMA_PROPERTY_MAP.$if={type:"reactive",name:"$if"},e.REACTIVE_BEHAVIORS.$if={regex:null,bind:function(e,t,n){},onApply:function(e,t,n){n?t.setInDOM(!0):t.setInDOM(!1)}}}(Galaxy.GalaxyView),function(e){e.NODE_SCHEMA_PROPERTY_MAP.module={type:"reactive",name:"module"},e.REACTIVE_BEHAVIORS.module={regex:null,bind:function(e,t,n){},getCache:function(e){return{module:null,scope:e.root.scope}},onApply:function(e,t,n,r,o){!t.template&&n&&n.url&&n!==e.module?(t.empty(),e.scope.load(n,{element:t}).then(function(e){t.node.setAttribute("module",e.systemId),e.start()}).catch(function(e){console.error(e)})):n||t.empty(),e.module=n}}}(Galaxy.GalaxyView),function(e){e.NODE_SCHEMA_PROPERTY_MAP.value={type:"reactive",name:"value"},e.REACTIVE_BEHAVIORS.value={regex:/^\[\s*([^\[\]]*)\s*\]$/,bind:function(e,t,n){var r=n[1].split("."),o=new Function("data, value","data."+n[1]+" = value;");e.node.addEventListener("keyup",function(){t.hasOwnProperty(r[0])?o.call(null,t,e.node.value):t.hasOwnProperty("__parent__")&&o.call(null,t.__parent__,e.node.value)})},onApply:function(e,t,n){document.activeElement===t.node&&t.node.value===n||(t.node.value=n||"")}}}(Galaxy.GalaxyView);