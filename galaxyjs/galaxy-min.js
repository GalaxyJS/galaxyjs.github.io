!function(e){"use strict";function t(e){if("string"!=typeof e&&(e=String(e)),/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(e))throw new TypeError("Invalid character in header field name");return e.toLowerCase()}function r(e){return"string"!=typeof e&&(e=String(e)),e}function n(e){var t={next:function(){var t=e.shift();return{done:void 0===t,value:t}}};return v.iterable&&(t[Symbol.iterator]=function(){return t}),t}function o(e){this.map={},e instanceof o?e.forEach(function(e,t){this.append(t,e)},this):Array.isArray(e)?e.forEach(function(e){this.append(e[0],e[1])},this):e&&Object.getOwnPropertyNames(e).forEach(function(t){this.append(t,e[t])},this)}function i(e){return e.bodyUsed?Promise.reject(new TypeError("Already read")):void(e.bodyUsed=!0)}function a(e){return new Promise(function(t,r){e.onload=function(){t(e.result)},e.onerror=function(){r(e.error)}})}function s(e){var t=new FileReader,r=a(t);return t.readAsArrayBuffer(e),r}function u(e){var t=new FileReader,r=a(t);return t.readAsText(e),r}function d(e){for(var t=new Uint8Array(e),r=new Array(t.length),n=0;n<t.length;n++)r[n]=String.fromCharCode(t[n]);return r.join("")}function l(e){if(e.slice)return e.slice(0);var t=new Uint8Array(e.byteLength);return t.set(new Uint8Array(e)),t.buffer}function p(){return this.bodyUsed=!1,this._initBody=function(e){if(this._bodyInit=e,e)if("string"==typeof e)this._bodyText=e;else if(v.blob&&Blob.prototype.isPrototypeOf(e))this._bodyBlob=e;else if(v.formData&&FormData.prototype.isPrototypeOf(e))this._bodyFormData=e;else if(v.searchParams&&URLSearchParams.prototype.isPrototypeOf(e))this._bodyText=e.toString();else if(v.arrayBuffer&&v.blob&&w(e))this._bodyArrayBuffer=l(e.buffer),this._bodyInit=new Blob([this._bodyArrayBuffer]);else{if(!v.arrayBuffer||!ArrayBuffer.prototype.isPrototypeOf(e)&&!_(e))throw new Error("unsupported BodyInit type");this._bodyArrayBuffer=l(e)}else this._bodyText="";this.headers.get("content-type")||("string"==typeof e?this.headers.set("content-type","text/plain;charset=UTF-8"):this._bodyBlob&&this._bodyBlob.type?this.headers.set("content-type",this._bodyBlob.type):v.searchParams&&URLSearchParams.prototype.isPrototypeOf(e)&&this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8"))},v.blob&&(this.blob=function(){var e=i(this);if(e)return e;if(this._bodyBlob)return Promise.resolve(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(new Blob([this._bodyArrayBuffer]));if(this._bodyFormData)throw new Error("could not read FormData body as blob");return Promise.resolve(new Blob([this._bodyText]))},this.arrayBuffer=function(){return this._bodyArrayBuffer?i(this)||Promise.resolve(this._bodyArrayBuffer):this.blob().then(s)}),this.text=function(){var e=i(this);if(e)return e;if(this._bodyBlob)return u(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(d(this._bodyArrayBuffer));if(this._bodyFormData)throw new Error("could not read FormData body as text");return Promise.resolve(this._bodyText)},v.formData&&(this.formData=function(){return this.text().then(h)}),this.json=function(){return this.text().then(JSON.parse)},this}function f(e){var t=e.toUpperCase();return x.indexOf(t)>-1?t:e}function c(e,t){t=t||{};var r=t.body;if(e instanceof c){if(e.bodyUsed)throw new TypeError("Already read");this.url=e.url,this.credentials=e.credentials,t.headers||(this.headers=new o(e.headers)),this.method=e.method,this.mode=e.mode,r||null==e._bodyInit||(r=e._bodyInit,e.bodyUsed=!0)}else this.url=String(e);if(this.credentials=t.credentials||this.credentials||"omit",!t.headers&&this.headers||(this.headers=new o(t.headers)),this.method=f(t.method||this.method||"GET"),this.mode=t.mode||this.mode||null,this.referrer=null,("GET"===this.method||"HEAD"===this.method)&&r)throw new TypeError("Body not allowed for GET or HEAD requests");this._initBody(r)}function h(e){var t=new FormData;return e.trim().split("&").forEach(function(e){if(e){var r=e.split("="),n=r.shift().replace(/\+/g," "),o=r.join("=").replace(/\+/g," ");t.append(decodeURIComponent(n),decodeURIComponent(o))}}),t}function y(e){var t=new o,r=e.replace(/\r?\n[\t ]+/," ");return r.split(/\r?\n/).forEach(function(e){var r=e.split(":"),n=r.shift().trim();if(n){var o=r.join(":").trim();t.append(n,o)}}),t}function m(e,t){t||(t={}),this.type="default",this.status="status"in t?t.status:200,this.ok=this.status>=200&&this.status<300,this.statusText="statusText"in t?t.statusText:"OK",this.headers=new o(t.headers),this.url=t.url||"",this._initBody(e)}if(!e.fetch){var v={searchParams:"URLSearchParams"in e,iterable:"Symbol"in e&&"iterator"in Symbol,blob:"FileReader"in e&&"Blob"in e&&function(){try{return new Blob,!0}catch(e){return!1}}(),formData:"FormData"in e,arrayBuffer:"ArrayBuffer"in e};if(v.arrayBuffer)var b=["[object Int8Array]","[object Uint8Array]","[object Uint8ClampedArray]","[object Int16Array]","[object Uint16Array]","[object Int32Array]","[object Uint32Array]","[object Float32Array]","[object Float64Array]"],w=function(e){return e&&DataView.prototype.isPrototypeOf(e)},_=ArrayBuffer.isView||function(e){return e&&b.indexOf(Object.prototype.toString.call(e))>-1};o.prototype.append=function(e,n){e=t(e),n=r(n);var o=this.map[e];this.map[e]=o?o+","+n:n},o.prototype.delete=function(e){delete this.map[t(e)]},o.prototype.get=function(e){return e=t(e),this.has(e)?this.map[e]:null},o.prototype.has=function(e){return this.map.hasOwnProperty(t(e))},o.prototype.set=function(e,n){this.map[t(e)]=r(n)},o.prototype.forEach=function(e,t){for(var r in this.map)this.map.hasOwnProperty(r)&&e.call(t,this.map[r],r,this)},o.prototype.keys=function(){var e=[];return this.forEach(function(t,r){e.push(r)}),n(e)},o.prototype.values=function(){var e=[];return this.forEach(function(t){e.push(t)}),n(e)},o.prototype.entries=function(){var e=[];return this.forEach(function(t,r){e.push([r,t])}),n(e)},v.iterable&&(o.prototype[Symbol.iterator]=o.prototype.entries);var x=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];c.prototype.clone=function(){return new c(this,{body:this._bodyInit})},p.call(c.prototype),p.call(m.prototype),m.prototype.clone=function(){return new m(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new o(this.headers),url:this.url})},m.error=function(){var e=new m(null,{status:0,statusText:""});return e.type="error",e};var g=[301,302,303,307,308];m.redirect=function(e,t){if(g.indexOf(t)===-1)throw new RangeError("Invalid status code");return new m(null,{status:t,headers:{location:e}})},e.Headers=o,e.Request=c,e.Response=m,e.fetch=function(e,t){return new Promise(function(r,n){var o=new c(e,t),i=new XMLHttpRequest;i.onload=function(){var e={status:i.status,statusText:i.statusText,headers:y(i.getAllResponseHeaders()||"")};e.url="responseURL"in i?i.responseURL:e.headers.get("X-Request-URL");var t="response"in i?i.response:i.responseText;r(new m(t,e))},i.onerror=function(){n(new TypeError("Network request failed"))},i.ontimeout=function(){n(new TypeError("Network request failed"))},i.open(o.method,o.url,!0),"include"===o.credentials&&(i.withCredentials=!0),"responseType"in i&&v.blob&&(i.responseType="blob"),o.headers.forEach(function(e,t){i.setRequestHeader(t,e)}),i.send("undefined"==typeof o._bodyInit?null:o._bodyInit)})},e.fetch.polyfill=!0}}("undefined"!=typeof self?self:this),"function"!=typeof Object.assign&&(Object.assign=function(e,t){"use strict";if(null==e)throw new TypeError("Cannot convert undefined or null to object");for(var r=Object(e),n=1;n<arguments.length;n++){var o=arguments[n];if(null!=o)for(var i in o)Object.prototype.hasOwnProperty.call(o,i)&&(r[i]=o[i])}return r}),function(e){function t(){}function r(e,t){return function(){e.apply(t,arguments)}}function n(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],d(e,this)}function o(e,t){for(;3===e._state;)e=e._value;return 0===e._state?void e._deferreds.push(t):(e._handled=!0,void n._immediateFn(function(){var r=1===e._state?t.onFulfilled:t.onRejected;if(null===r)return void(1===e._state?i:a)(t.promise,e._value);var n;try{n=r(e._value)}catch(e){return void a(t.promise,e)}i(t.promise,n)}))}function i(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var o=t.then;if(t instanceof n)return e._state=3,e._value=t,void s(e);if("function"==typeof o)return void d(r(o,t),e)}e._state=1,e._value=t,s(e)}catch(t){a(e,t)}}function a(e,t){e._state=2,e._value=t,s(e)}function s(e){2===e._state&&0===e._deferreds.length&&n._immediateFn(function(){e._handled||n._unhandledRejectionFn(e._value)});for(var t=0,r=e._deferreds.length;t<r;t++)o(e,e._deferreds[t]);e._deferreds=null}function u(e,t,r){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=r}function d(e,t){var r=!1;try{e(function(e){r||(r=!0,i(t,e))},function(e){r||(r=!0,a(t,e))})}catch(e){if(r)return;r=!0,a(t,e)}}var l=setTimeout;n.prototype.catch=function(e){return this.then(null,e)},n.prototype.then=function(e,r){var n=new this.constructor(t);return o(this,new u(e,r,n)),n},n.all=function(e){var t=Array.prototype.slice.call(e);return new n(function(e,r){function n(i,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var s=a.then;if("function"==typeof s)return void s.call(a,function(e){n(i,e)},r)}t[i]=a,0===--o&&e(t)}catch(e){r(e)}}if(0===t.length)return e([]);for(var o=t.length,i=0;i<t.length;i++)n(i,t[i])})},n.resolve=function(e){return e&&"object"==typeof e&&e.constructor===n?e:new n(function(t){t(e)})},n.reject=function(e){return new n(function(t,r){r(e)})},n.race=function(e){return new n(function(t,r){for(var n=0,o=e.length;n<o;n++)e[n].then(t,r)})},n._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){l(e,0)},n._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)},n._setImmediateFn=function(e){n._immediateFn=e},n._setUnhandledRejectionFn=function(e){n._unhandledRejectionFn=e},"undefined"!=typeof module&&module.exports?module.exports=n:e.Promise||(e.Promise=n)}(this),function(e){function t(){this.bootModule=null,this.modules={},this.onLoadQueue=[],this.onModuleLoaded={},this.addOnProviders=[],this.app=null,this.rootElement=null}e.Galaxy=e.Galaxy||new t,Galaxy.GalaxyCore=t;var r={};t.prototype.extend=function(e){for(var t,r=e||{},n=1;n<arguments.length;n++)if(t=arguments[n])for(var o in t)t.hasOwnProperty(o)&&(t[o]instanceof Array?r[o]=this.extend(r[o]||[],t[o]):"object"==typeof t[o]&&null!==t[o]?r[o]=this.extend(r[o]||{},t[o]):r[o]=t[o]);return r},t.prototype.boot=function(e,t){var r=this;r.rootElement=t,e.domain=this,e.id="system";var n=new Promise(function(t,n){r.load(e).then(function(e){r.bootModule=e,t(e)})});return n},t.prototype.convertToURIString=function(e,t){var r,n=this,o=[];for(r in e)if(e.hasOwnProperty(r)){var i=t?t+"["+r+"]":r,a=e[r];o.push(null!==a&&"object"==typeof a?n.convertToURIString(a,i):encodeURIComponent(i)+"="+encodeURIComponent(a))}return o.join("&")},t.prototype.load=function(t){var r=this,n=new Promise(function(n,o){t.id=t.id||"noid-"+(new Date).valueOf()+"-"+Math.round(performance.now()),t.systemId=t.parentScope?t.parentScope.systemId+"/"+t.id:t.id,e.Galaxy.onModuleLoaded[t.systemId]=n;var i=Galaxy.modules[t.systemId],a=[t.url];if(t.invokers){if(t.invokers.indexOf(t.url)!==-1)throw new Error("circular dependencies: \n"+t.invokers.join("\n")+"\nwanna load: "+t.url);a=t.invokers,a.push(t.url)}if(i){var s=Galaxy.onModuleLoaded[t.systemId];return void("function"==typeof s&&(s(i),delete Galaxy.onModuleLoaded[t.systemId]))}Galaxy.onLoadQueue[t.systemId]||(Galaxy.onLoadQueue[t.systemId]=!0,fetch(t.url+"?"+r.convertToURIString(t.params||{})).then(function(e){e.text().then(function(e){r.compileModuleContent(t,e,a).then(function(e){r.executeCompiledModule(e)})})}))});return n},t.prototype.compileModuleContent=function(e,t,n){var o=this,i=new Promise(function(a,s){var u=function(e,t){t.splice(t.indexOf(e.url)-1,1),0===t.length&&a(e)},d=[],l=t.replace(/\/\*[\s\S]*?\*\n?\/|([^:]|^)\n?\/\/.*\n?$/gm,"");t=l.replace(/Scope\.import\(['|"](.*)['|"]\)\;/gm,function(e,t){var r=t.match(/([\S]+)/gm);return d.push({url:r[r.length-1],fresh:r.indexOf("new")!==-1}),"Scope.imports['"+r[r.length-1]+"']"});var p=new Galaxy.GalaxyScope(e,e.parentScope?e.parentScope.element||o.rootElement:o.rootElement),f=new Galaxy.GalaxyView(p),c=new Galaxy.GalaxyModule(e,t,p,f);if(Galaxy.modules[c.systemId]=c,d.length){var h=d.slice(0);return d.forEach(function(e){var t=Galaxy.getModuleAddOnProvider(e.url);if(t){var o=t.handler.call(null,p,c),i=o.pre();r[e.url]={name:e.url,module:i},c.registerAddOn(e.url,i),c.addOnProviders.push(o),u(c,h)}else r[e.url]&&!e.fresh?u(c,h):Galaxy.load({name:e.name,url:e.url,fresh:e.fresh,parentScope:p,invokers:n,temporary:!0}).then(function(){u(c,h)})}),i}a(c)});return i},t.prototype.executeCompiledModule=function(e){for(var t in r)if(r.hasOwnProperty(t)){var n=r[t];n.module&&(e.scope.imports[n.name]=n.module)}var o=new Function("Scope","View",e.source);o.call(null,e.scope,e.view),delete e.source,e.addOnProviders.forEach(function(e){e.post()}),delete e.addOnProviders,r[e.url]?e.fresh?r[e.url].module=e.scope.export:e.scope.imports[e.name]=r[e.url].module:r[e.url]={name:e.name||e.url,module:e.scope.export};var i=Galaxy.modules[e.systemId];(e.temporary||e.scope._doNotRegister)&&(delete e.scope._doNotRegister,i={id:e.id,scope:e.scope}),"function"==typeof Galaxy.onModuleLoaded[e.systemId]&&(Galaxy.onModuleLoaded[e.systemId](i),delete Galaxy.onModuleLoaded[e.systemId]),delete Galaxy.onLoadQueue[e.systemId]},t.prototype.getModuleAddOnProvider=function(e){return this.addOnProviders.filter(function(t){return t.name===e})[0]},t.prototype.getModulesByAddOnId=function(e){var t,r=[];for(var n in this.modules)t=this.modules[n],this.modules.hasOwnProperty(n)&&t.addOns.hasOwnProperty(e)&&r.push({addOn:t.addOns[e],module:t});return r},t.prototype.registerAddOnProvider=function(e,t){if("function"!=typeof t)throw"Addon provider should be a function";this.addOnProviders.push({name:e,handler:t})}}(this),function(e,t){function r(e,t,r,n){this.id=e.id,this.systemId=e.systemId,this.source=t,this.url=e.url||null,this.addOns=e.addOns||{},this.domain=e.domain,this.addOnProviders=[],this.scope=r,this.view=n}e.Galaxy=t,t.GalaxyModule=r,r.prototype.init=function(){for(var e in this.addOns){var t=this.addOns[e];"function"==typeof t.onModuleInit&&t.onModuleInit()}},r.prototype.start=function(){for(var e in this.addOns){var t=this.addOns[e];"function"==typeof t.onModuleStart&&t.onModuleStart()}},r.prototype.registerAddOn=function(e,t){this.addOns[e]=t}}(this,Galaxy||{}),function(e,t){function r(e,t){this.systemId=e.systemId,this.parentScope=e.parentScope||null,this.element=t||null,this.imports={};var r=document.createElement("a");r.href=e.url;var n=/([^\t\n]+)\//g,o=n.exec(r.pathname);this.path=o[0],this.parsedURL=r.href}e.Galaxy=t,t.GalaxyScope=r,r.prototype.load=function(e,r){e.parentScope=this,e.domain=e.domain||Galaxy,t.load(e,r)},r.prototype.loadModuleInto=function(e,r){0===e.url.indexOf("./")&&(e.url=this.path+e.url.substr(2)),this.load(e,function(e){t.ui.setContent(r,e.scope.html),e.start()})}}(this,Galaxy||{}),function(e,t){function r(e){this.scope=e,this.element=e.element}var n=Object.defineProperty;e.Galaxy=t,t.GalaxyView=r,r.REACTIVE_BEHAVIORS={},r.NODE_SCHEMA_PROPERTY_MAP={id:{type:"attr"},class:{type:"attr",parser:function(e){return e instanceof Array?e.join(" "):e||""}},title:{type:"attr"},for:{type:"attr"},href:{type:"attr"},src:{type:"attr"},alt:{type:"attr"},style:{type:"attr"},html:{type:"prop",name:"innerHTML"},text:{type:"prop",name:"textContent"},value:{type:"prop",name:"value"},reactive_for:{type:"reactive",name:"for"},reactive_if:{type:"reactive",name:"if"}},r.prototype.init=function(e){this.append(e,this.scope,this.element)},r.prototype.append=function(e,t,n,o){var i=this;if(e instanceof Array)e.forEach(function(e){i.append(e,t,n)});else if(null!==e&&"object"==typeof e){var a=new r.ViewNode(i,e);n.insertBefore(a.placeholder,o);var s=t;e.mutator&&(a.mutator=e.mutator),e.reactive&&(s=i.addReactiveBehaviors(a,e,t,e.reactive)),a.data=s;var u,d,l;for(var p in e)"reactive"!==p&&(u=e[p],d=null,l=typeof u,d="string"===l?u.match(/^\[\s*([^\[\]]*)\s*\]$/):"function"===l?[0,u]:null,d?i.makeBinding(a,t,p,d[1]):r.NODE_SCHEMA_PROPERTY_MAP[p]&&i.setPropertyForNode(a,p,u));return a.template||(i.append(e.children,s,a.node),a.inDOM&&a.setInDOM(!0)),a}},r.prototype.addReactiveBehaviors=function(e,t,n,o){var i=Object.assign({},n);for(var a in o){var s=r.REACTIVE_BEHAVIORS[a],u=o[a];if(s&&u){var d=s.regex?u.match(s.regex):u;e.reactive[a]=function(e,t,r){var n={};return e.getCache&&(n=e.getCache(t,r)),function(o,i){return e.onApply(n,o,i,t,r)}}(s,d,i),s.bind(e,n,d)}}return i},r.prototype.setPropertyForNode=function(e,t,n){var o=r.NODE_SCHEMA_PROPERTY_MAP[t],i=o.parser?o.parser(n):n;switch(o.type){case"attr":e.node.setAttribute(t,i);break;case"prop":e.node[o.name]=i;break;case"reactive":e.reactive[o.name](e,i)}},r.prototype.getPropertySetter=function(e,t){var n=r.NODE_SCHEMA_PROPERTY_MAP[t];if(!n)return null;switch(n.type){case"attr":return function(r){var o=n.parser?n.parser(r):r;e.node.setAttribute(t,o)};case"prop":return function(t){var r=n.parser?n.parser(t):t;e.node[n.name]=r};case"reactive":return function(t){var r=n.parser?n.parser(t):t;e.reactive[n.name](e,r)}}},r.prototype.makeBinding=function(e,t,o,i){var a=this;if("object"==typeof t){var s=i,u=null;if("function"==typeof i)return s="[mutator]",t[s]=t[s]||[],void t[s].push({for:o,action:i});var d=i.split(".");d.length>1&&(s=d.shift(),u=d.join("."));var l="["+s+"]",p=t[l];"undefined"==typeof p&&(p=new r.BoundProperty(s),n(t,l,{enumerable:!1,configurable:!1,value:p}));var f=t[s],c=!0;"length"===s&&t instanceof Array&&(s="_length",c=!1),n(t,s,{get:function(){return p.value},set:function(e){p.value!==e&&p.setValue(o,e)},enumerable:c,configurable:!0}),p&&(p.value=f,u||p.addNode(e,o)),u?a.makeBinding(e,t[s]||{},o,u):"object"==typeof t&&a.setInitValue(p,o,f)}},r.prototype.setInitValue=function(e,t,r){r instanceof Array?this.setArrayValue(e,t,r):this.setSingleValue(e,t,r)},r.prototype.setSingleValue=function(e,t,r){e.nodes.forEach(function(n){n.values[t]!==r&&e.setValueFor(n,t,r)})},r.prototype.setArrayValue=function(e,t,r){var n,o=Array.prototype,i=["push","pop","shift","unshift","splice","sort","reverse"],a={original:r,type:"push",params:r},s=r,u=0;i.forEach(function(i){var d=o[i];Object.defineProperty(r,i,{value:function(){for(u=arguments.length,n=new Array(u);u--;)n[u]=arguments[u];var r=d.apply(this,n);return"undefined"!=typeof s._length&&(s._length=s.length),a.type=i,a.params=n,e.updateValue(t,a),r},writable:!0,configurable:!0})}),e.nodes.forEach(function(n){n.values[t]!==r&&(n.values[t]=r,e.value=r,e.updateValue(t,a))})}}(this,Galaxy||{}),function(e){function t(e){this.name=e,this.value=null,this.nodes=[]}e.BoundProperty=t,t.prototype.addNode=function(e,t){this.nodes.indexOf(e)===-1&&(e.addProperty(this,t),this.nodes.push(e))},t.prototype.setValue=function(e,t){this.value=t;for(var r=0,n=this.nodes.length;r<n;r++)this.setValueFor(this.nodes[r],e,t)},t.prototype.updateValue=function(e,t){for(var r=0,n=this.nodes.length;r<n;r++)this.setUpdateFor(this.nodes[r],e,t)},t.prototype.setValueFor=function(e,t,r){var n=e.mutator[t],o=r;n&&(o=n.call(e,r,e.values[t])),e.values[t]=o,e.setters[t](o)},t.prototype.setUpdateFor=function(e,t,r){e.setters[t](r)}}(Galaxy.GalaxyView),function(e){function t(e,t){this.root=e,this.node=document.createElement(t.t||"div"),this.nodeSchema=t,this.data={},this.mutator={},this.template=!1,this.placeholder=document.createComment(this.node.tagName),this.properties={},this.values={},this.inDOM="undefined"==typeof t.inDOM||t.inDOM,this.setters={},this.reactive={}}e.ViewNode=t,t.prototype.cloneSchema=function(){return Galaxy.extend({mother:this},this.nodeSchema)},t.prototype.toTemplate=function(){this.placeholder.nodeValue=JSON.stringify(this.nodeSchema,null,2),this.template=!0},t.prototype.setInDOM=function(e){this.inDOM=e,!e||this.node.parentNode||this.template?!e&&this.node.parentNode&&(this.node.parentNode.insertBefore(this.placeholder,this.node),this.node.parentNode.removeChild(this.node)):(this.placeholder.parentNode.insertBefore(this.node,this.placeholder.nextSibling),this.placeholder.parentNode.removeChild(this.placeholder))},t.prototype.addProperty=function(e,t){this.properties[e.name]=e,this.setters[t]=this.root.getPropertySetter(this,t)},t.prototype.destroy=function(){var e=this;e.inDOM?(e.node.parentNode.removeChild(e.placeholder),e.node.parentNode.removeChild(e.node)):e.placeholder.parentNode.removeChild(e.placeholder);var t,r;for(var n in e.properties)r=e.properties[n],t=r.nodes.indexOf(e),t!==-1&&r.nodes.splice(t,1);e.properties={}}}(Galaxy.GalaxyView),function(e){e.REACTIVE_BEHAVIORS.for={regex:/^([\w]*)\s+in\s+([^\s\n]+)$/,bind:function(e,t,r){e.toTemplate(),e.root.makeBinding(e,t,"reactive_for",r[2])},getCache:function(e){return{propName:e[1],clonedNodeSchema:null,nodes:[]}},onApply:function(e,t,r,n,o){e.clonedNodeSchema=e.clonedNodeSchema||t.cloneSchema(),e.clonedNodeSchema.reactive.for=null;var i=t.placeholder.parentNode,a=null,s=[],u=Array.prototype.push;if("push"===r.type)s=r.params;else if("unshift"===r.type)a=e.nodes[0]?e.nodes[0].node:null,s=r.params,u=Array.prototype.unshift;else if("splice"===r.type){var d=Array.prototype.splice.apply(e.nodes,r.params.slice(0,2));s=r.params.slice(2),d.forEach(function(e){e.destroy()})}else"pop"===r.type?e.nodes.pop().destroy():"shift"===r.type?e.nodes.shift().destroy():"sort"!==r.type&&"reverse"!==r.type||(e.nodes.forEach(function(e){e.destroy()}),e.nodes=[],s=r.original);var l;if(s instanceof Array)for(var p=0,f=s.length;p<f;p++){l=s[p];var c=Object.assign({},o);c[e.propName]=l,u.call(e.nodes,t.root.append(e.clonedNodeSchema,c,i,a))}}}}(Galaxy.GalaxyView),function(e){e.REACTIVE_BEHAVIORS.if={regex:null,bind:function(e,t,r){e.root.makeBinding(e,t,"reactive_if",r)},onApply:function(e,t){t?e.setInDOM(!0):e.setInDOM(!1)}}}(Galaxy.GalaxyView);