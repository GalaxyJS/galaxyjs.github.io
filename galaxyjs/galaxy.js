/* eslint-disable */
/**
 * @link https://github.github.io/fetch/
 */

(function (self) {
  'use strict';

  if (self.fetch) {
    return;
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function () {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isDataView = function (obj) {
      return obj && DataView.prototype.isPrototypeOf(obj);
    };

    var isArrayBufferView = ArrayBuffer.isView || function (obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
    };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name');
    }
    return name.toLowerCase();
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value;
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function () {
        var value = items.shift();
        return {done: value === undefined, value: value};
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function () {
        return iterator;
      };
    }

    return iterator;
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function (value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function (header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function (name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function (name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ',' + value : value;
  };

  Headers.prototype['delete'] = function (name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function (name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null;
  };

  Headers.prototype.has = function (name) {
    return this.map.hasOwnProperty(normalizeName(name));
  };

  Headers.prototype.set = function (name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function (callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push(name);
    });
    return iteratorFor(items);
  };

  Headers.prototype.values = function () {
    var items = [];
    this.forEach(function (value) {
      items.push(value);
    });
    return iteratorFor(items);
  };

  Headers.prototype.entries = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items);
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'));
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
    });
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise;
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise;
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('');
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0);
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer;
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function (body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        throw new Error('unsupported BodyInit type');
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function () {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob);
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]));
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob');
        } else {
          return Promise.resolve(new Blob([this._bodyText]));
        }
      };

      this.arrayBuffer = function () {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer);
        } else {
          return this.blob().then(readBlobAsArrayBuffer);
        }
      };
    }

    this.text = function () {
      var rejected = consumed(this);
      if (rejected) {
        return rejected;
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob);
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text');
      } else {
        return Promise.resolve(this._bodyText);
      }
    };

    if (support.formData) {
      this.formData = function () {
        return this.text().then(decode);
      };
    }

    this.json = function () {
      return this.text().then(JSON.parse);
    };

    return this;
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return (methods.indexOf(upcased) > -1) ? upcased : method;
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read');
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'omit';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }
    this._initBody(body);
  }

  Request.prototype.clone = function () {
    return new Request(this, {body: this._bodyInit});
  };

  function decode(body) {
    var form = new FormData();
    body.trim().split('&').forEach(function (bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form;
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers;
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = 'status' in options ? options.status : 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function () {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  };

  Response.error = function () {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response;
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function (url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code');
    }

    return new Response(null, {status: status, headers: {location: url}});
  };

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function (input, init) {
    return new Promise(function (resolve, reject) {
      var request = new Request(input, init);
      var xhr = new XMLHttpRequest();

      xhr.onload = function () {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function (value, name) {
        xhr.setRequestHeader(name, value);
      });

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    });
  };
  self.fetch.polyfill = true;
})(typeof self !== 'undefined' ? self : this);

if (typeof Object.assign != 'function') {
  Object.assign = function (target, varArgs) { // .length of function is 2
    'use strict';
    if (target == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) { // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

/* eslint-disable */
/**
 * @link https://github.com/taylorhakes/promise-polyfill
 */


(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}

  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

/* global Galaxy, Promise */

(function (root) {
  root.Galaxy = root.Galaxy || new Core();

  /** The main class of the GalaxyJS. window.galaxy is an instance of this class.
   *
   * @returns {Galaxy.GalaxySystem}
   */
  Galaxy.GalaxyCore = Core;

  var importedLibraries = {};

  function Core() {
    this.bootModule = null;
    this.modules = {};
    this.onLoadQueue = [];
    this.onModuleLoaded = {};
    this.addOnProviders = [];
    this.app = null;
    this.rootElement = null;
  }

  Core.prototype.extend = function (out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];

      if (!obj)
        continue;

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] instanceof Array)
            out[key] = this.extend(out[key] || [], obj[key]);
          else if (typeof obj[key] === 'object' && obj[key] !== null)
            out[key] = this.extend(out[key] || {}, obj[key]);
          else
            out[key] = obj[key];
        }
      }
    }

    return out;
  };

  Core.prototype.boot = function (bootModule, rootElement) {
    var _this = this;
    _this.rootElement = rootElement;

    bootModule.domain = this;
    bootModule.id = 'system';

    var promise = new Promise(function (resolve, reject) {
      _this.load(bootModule).then(function (module) {
        // Replace galaxy temporary  bootModule with user specified bootModule
        _this.bootModule = module;
        resolve(module);
      });
    });

    return promise;
  };

  Core.prototype.convertToURIString = function (obj, prefix) {
    var _this = this;
    var str = [], p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + '[' + p + ']' : p, v = obj[p];
        str.push((v !== null && typeof v === 'object') ?
          _this.convertToURIString(v, k) :
          encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
    }

    return str.join('&');
  };

  Core.prototype.load = function (module) {
    var _this = this;
    var promise = new Promise(function (resolve, reject) {
      module.id = module.id || 'noid-' + (new Date()).valueOf() + '-' + Math.round(performance.now());
      module.systemId = module.parentScope ? module.parentScope.systemId + '/' + module.id : module.id;

      root.Galaxy.onModuleLoaded[module.systemId] = resolve;
      var moduleExist = Galaxy.modules[module.systemId];

      var invokers = [module.url];
      if (module.invokers) {
        if (module.invokers.indexOf(module.url) !== -1) {
          throw new Error('circular dependencies: \n' + module.invokers.join('\n') + '\nwanna load: ' + module.url);
        }

        invokers = module.invokers;
        invokers.push(module.url);
      }

      if (moduleExist) {
        var ol = Galaxy.onModuleLoaded[module.systemId];
        if ('function' === typeof (ol)) {
          ol(moduleExist);
          delete Galaxy.onModuleLoaded[module.systemId];
        }

        return;
      }

      if (Galaxy.onLoadQueue[module.systemId]) {
        return;
      }

      Galaxy.onLoadQueue[module.systemId] = true;

      fetch(module.url + '?' + _this.convertToURIString(module.params || {})).then(function (response) {
        // var contentType = response.headers.get('content-type').split(';')[ 0 ] || 'text/html';
        response.text().then(function (moduleContent) {
          _this.compileModuleContent(module, moduleContent, invokers).then(function (module) {
            _this.executeCompiledModule(module);
          });
        });
      });
    });

    return promise;
  };

  Core.prototype.compileModuleContent = function (moduleMetaData, moduleContent, invokers) {
    var _this = this;
    var promise = new Promise(function (resolve, reject) {
      var doneImporting = function (module, imports) {
        imports.splice(imports.indexOf(module.url) - 1, 1);

        if (imports.length === 0) {
          // This will load the original initilizer
          resolve(module);
        }
      };

      var imports = [];
      // extract imports from the source code
      var moduleContentWithoutComments = moduleContent.replace(/\/\*[\s\S]*?\*\n?\/|([^:]|^)\n?\/\/.*\n?$/gm, '');
      moduleContent = moduleContentWithoutComments.replace(/Scope\.import\(['|"](.*)['|"]\)\;/gm, function (match, path) {
        var query = path.match(/([\S]+)/gm);
        imports.push({
          url: query[query.length - 1],
          fresh: query.indexOf('new') !== -1
        });

        return 'Scope.imports[\'' + query[query.length - 1] + '\']';
      });

      var scope = new Galaxy.GalaxyScope(moduleMetaData,
        moduleMetaData.parentScope ? moduleMetaData.parentScope.element || _this.rootElement : _this.rootElement);
      var view = new Galaxy.GalaxyView(scope);
      // Create module from moduleMetaData
      var module = new Galaxy.GalaxyModule(moduleMetaData, moduleContent, scope, view);
      Galaxy.modules[module.systemId] = module;

      if (imports.length) {
        var importsCopy = imports.slice(0);
        imports.forEach(function (item) {
          var moduleAddOnProvider = Galaxy.getModuleAddOnProvider(item.url);
          if (moduleAddOnProvider) {
            var providerStages = moduleAddOnProvider.handler.call(null, scope, module);
            var addOnInstance = providerStages.pre();
            importedLibraries[item.url] = {
              name: item.url,
              module: addOnInstance
            };

            module.registerAddOn(item.url, addOnInstance);
            module.addOnProviders.push(providerStages);

            doneImporting(module, importsCopy);
          } else if (importedLibraries[item.url] && !item.fresh) {
            doneImporting(module, importsCopy);
          } else {
            Galaxy.load({
              name: item.name,
              url: item.url,
              fresh: item.fresh,
              parentScope: scope,
              invokers: invokers,
              temporary: true
            }).then(function () {
              doneImporting(module, importsCopy);
            });
          }
        });

        return promise;
      }

      resolve(module);
    });

    return promise;
  };

  Core.prototype.executeCompiledModule = function (module) {
    for (var item in importedLibraries) {
      if (importedLibraries.hasOwnProperty(item)) {
        var asset = importedLibraries[item];
        if (asset.module) {
          module.scope.imports[asset.name] = asset.module;
        }
      }
    }

    var moduleSource = new Function('Scope', 'View', module.source);
    moduleSource.call(null, module.scope, module.view);

    delete module.source;

    module.addOnProviders.forEach(function (item) {
      item.post();
    });

    delete module.addOnProviders;

    if (!importedLibraries[module.url]) {
      importedLibraries[module.url] = {
        name: module.name || module.url,
        module: module.scope.export
      };
    } else if (module.fresh) {
      importedLibraries[module.url].module = module.scope.export;
    } else {
      module.scope.imports[module.name] = importedLibraries[module.url].module;
    }

    var currentModule = Galaxy.modules[module.systemId];
    if (module.temporary || module.scope._doNotRegister) {
      delete module.scope._doNotRegister;
      currentModule = {
        id: module.id,
        scope: module.scope
      };
    }

    if ('function' === typeof (Galaxy.onModuleLoaded[module.systemId])) {
      Galaxy.onModuleLoaded[module.systemId](currentModule);
      delete Galaxy.onModuleLoaded[module.systemId];
    }

    delete Galaxy.onLoadQueue[module.systemId];
  };

  Core.prototype.getModuleAddOnProvider = function (name) {
    return this.addOnProviders.filter(function (service) {
      return service.name === name;
    })[0];
  };

  Core.prototype.getModulesByAddOnId = function (addOnId) {
    var modules = [];
    var module;

    for (var moduleId in this.modules) {
      module = this.modules[moduleId];
      if (this.modules.hasOwnProperty(moduleId) && module.addOns.hasOwnProperty(addOnId)) {
        modules.push({
          addOn: module.addOns[addOnId],
          module: module
        });
      }
    }

    return modules;
  };

  Core.prototype.registerAddOnProvider = function (name, handler) {
    if (typeof handler !== 'function') {
      throw 'Addon provider should be a function';
    }

    this.addOnProviders.push({
      name: name,
      handler: handler
    });
  };

}(this));

/* global Galaxy */

(function (root, G) {

  root.Galaxy = G;
  /**
   *
   * @returns {Galaxy.GalaxyModule}
   */
  G.GalaxyModule = GalaxyModule;

  /**
   *
   * @param {Object} module
   * @param {Galaxy.GalaxyScope} scope
   * @constructor
   */
  function GalaxyModule(module, source, scope, view) {
    this.id = module.id;
    this.systemId = module.systemId;
    this.source = source;
    this.url = module.url || null;
    this.addOns = module.addOns || {};
    this.domain = module.domain;
    this.addOnProviders = [];

    this.scope = scope;
    this.view = view;
  }

  GalaxyModule.prototype.init = function () {
    for (var key in this.addOns) {
      var addOn = this.addOns[ key ];
      if (typeof addOn.onModuleInit === 'function') {
        addOn.onModuleInit();
      }
    }
  };

  GalaxyModule.prototype.start = function () {
    for (var key in this.addOns) {
      var addOn = this.addOns[ key ];
      if (typeof addOn.onModuleStart === 'function') {
        addOn.onModuleStart();
      }
    }
  };

  GalaxyModule.prototype.registerAddOn = function (id, object) {
    this.addOns[ id ] = object;
  };
}(this, Galaxy || {}));

/* global Galaxy */

(function (root, G) {
  root.Galaxy = G;
  /**
   *
   * @returns {Galaxy.GalaxyScope}
   */
  G.GalaxyScope = GalaxyScope;

  function GalaxyScope(module, element) {
    this.systemId = module.systemId;
    this.parentScope = module.parentScope || null;
    this.element = element || null;
    this.imports = {};

    var urlParser = document.createElement('a');
    urlParser.href = module.url;
    var myRegexp = /([^\t\n]+)\//g;
    var match = myRegexp.exec(urlParser.pathname);
    this.path = match[ 0 ];
    this.parsedURL = urlParser.href;
  }

  GalaxyScope.prototype.load = function (module, onDone) {
    module.parentScope = this;
    module.domain = module.domain || Galaxy;
    G.load(module, onDone);
  };

  GalaxyScope.prototype.loadModuleInto = function (module, view) {
    if (module.url.indexOf('./') === 0) {
      module.url = this.path + module.url.substr(2);
    }

    this.load(module, function (module) {
      G.ui.setContent(view, module.scope.html);

      module.start();
    });
  };

}(this, Galaxy || {}));

/* global Galaxy */

(function (root, G) {
  root.Galaxy = G;
  /**
   *
   * @returns {Galaxy.GalaxyView}
   */
  G.GalaxyView = GalaxyView;

  /**
   *
   * @param {Galaxy.GalaxyScope} scope
   * @constructor
   */
  function GalaxyView(scope) {
    this.scope = scope;
    this.element = scope.element;
  }

  GalaxyView.REACTIVE_BEHAVIORS = {};

  GalaxyView.NODE_SCHEMA_PROPERTY_MAP = {
    id: {
      type: 'attr'
    },
    class: {
      type: 'attr',
      parser: function (value) {
        if (value instanceof Array) {
          return value.join(' ');
        }

        return value || '';
      }
    },
    title: {
      type: 'attr'
    },
    for: {
      type: 'attr'
    },
    href: {
      type: 'attr'
    },
    src: {
      type: 'attr'
    },
    alt: {
      type: 'attr'
    },
    style: {
      type: 'attr'
    },
    html: {
      type: 'prop',
      name: 'innerHTML'
    },
    text: {
      type: 'prop',
      name: 'innerText'
    },
    value: {
      type: 'prop',
      name: 'value'
    },
    reactive_for: {
      type: 'reactive',
      name: 'for'
    },
    reactive_if: {
      type: 'reactive',
      name: 'if'
    }
  };

  GalaxyView.prototype.init = function (schema) {
    this.append(schema, this.scope, this.element);
  };

  /**
   *
   * @param {Object} nodeSchema
   * @param {Object} nodeScopeData
   * @param {Element} parentNode
   */
  GalaxyView.prototype.append = function (nodeSchema, nodeScopeData, parentNode, position) {
    var _this = this;
    if (nodeSchema instanceof Array) {
      nodeSchema.forEach(function (nodeSchema) {
        _this.append(nodeSchema, nodeScopeData, parentNode);
      });
    } else if (nodeSchema !== null && typeof(nodeSchema) === 'object') {
      var viewNode = new GalaxyView.ViewNode(_this, nodeSchema);

      parentNode.insertBefore(viewNode.placeholder, position);

      if (typeof viewNode.reactive === 'undefined') {
        Object.defineProperty(viewNode, 'reactive', {
          enumerable: true,
          configurable: false,
          value: {}
        });
      }

      var parentScopeData = nodeScopeData;

      if (nodeSchema['mutator']) {
        viewNode.mutator = nodeSchema['mutator'];
      }

      if (nodeSchema['reactive']) {
        parentScopeData = _this.addReactiveBehaviors(viewNode, nodeSchema, nodeScopeData, nodeSchema['reactive']);
      }

      viewNode.data = parentScopeData;
      var attributeValue, bind, type;

      for (var attributeName in nodeSchema) {
        if (attributeName === 'reactive') {
          continue;
        }

        attributeValue = nodeSchema[attributeName];
        bind = null;
        type = typeof(attributeValue);

        if (type === 'string') {
          bind = attributeValue.match(/^\[\s*([^\[\]]*)\s*\]$/);
        } else if (type === 'function') {
          bind = [0, attributeValue];
        } else {
          bind = null;
        }

        if (bind) {
          _this.makeBinding(viewNode, nodeScopeData, attributeName, bind[1]);
        } else {
          _this.setPropertyForNode(viewNode, attributeName, attributeValue);
        }
      }

      if (!viewNode.template) {
        _this.append(nodeSchema.children, parentScopeData, viewNode.node);

        if (viewNode.inDOM) {
          parentNode.insertBefore(viewNode.node, position);
        }
      }

      return viewNode;
    }
  };

  GalaxyView.prototype.addReactiveBehaviors = function (viewNode, nodeSchema, nodeScopeData, behaviors) {
    var allScopeData = Object.assign({}, nodeScopeData);

    for (var key in behaviors) {
      var behavior = GalaxyView.REACTIVE_BEHAVIORS[key];
      var value = behaviors[key];

      if (behavior && value) {
        var matches = behavior.regex ? value.match(behavior.regex) : value;

        viewNode.reactive[key] = (function (BEHAVIOR, MATCHES, BEHAVIOR_SCOPE_DATA) {
          return function (_viewNode, _value) {
            return BEHAVIOR.onApply.call(this, _viewNode, _value, MATCHES, BEHAVIOR_SCOPE_DATA);
          };
        })(behavior, matches, allScopeData);

        behavior.bind.call(this, viewNode, nodeScopeData, matches);
      }
    }

    return allScopeData;
  };

  GalaxyView.prototype.setPropertyForNode = function (viewNode, attributeName, value) {
    // if (attributeName.indexOf('reactive_') === 0) {
    //   var reactiveBehaviorName = attributeName.substring(9);
    //   if (viewNode.reactive[reactiveBehaviorName]) {
    //     viewNode.reactive[reactiveBehaviorName].call(this, viewNode, value);
    //   }
    //
    //   return;
    // }

    var property = GalaxyView.NODE_SCHEMA_PROPERTY_MAP[attributeName];
    if (!property) {
      return;
    }

    value = property.parser ? property.parser(value) : value;

    switch (property.type) {
      case 'attr':
        viewNode.node.setAttribute(attributeName, value);
        break;

      case 'prop':
        viewNode.node[property.name] = value;
        break;

      case 'reactive':
        if (viewNode.reactive[property.name]) {
          viewNode.reactive[property.name].call(this, viewNode, value);
        }
        break;
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} viewNode
   * @param {Object} dataHostObject
   * @param {String} attributeName
   * @param propertyValue
   */
  GalaxyView.prototype.makeBinding = function (viewNode, dataHostObject, attributeName, propertyValue) {
    var _this = this;
    // var t = performance.now();

    if (typeof dataHostObject !== 'object') {
      return;
    }

    var propertyName = propertyValue;
    var childProperty = null;

    if (typeof propertyValue === 'function') {
      propertyName = '[mutator]';
      dataHostObject[propertyName] = dataHostObject[propertyName] || [];
      dataHostObject[propertyName].push({
        for: attributeName,
        action: propertyValue
      });
      return;
    } else {
      var items = propertyValue.split('.');
      if (items.length > 1) {
        propertyName = items.shift();
        childProperty = items.join('.');
      }
    }

    if (typeof dataHostObject.__schemas__ === 'undefined') {
      Object.defineProperty(dataHostObject, '__schemas__', {
        enumerable: false,
        configurable: false,
        value: []
      });
    }

    var referenceName = '[' + propertyName + ']';
    var boundProperty = dataHostObject[referenceName];
    if (typeof dataHostObject[referenceName] === 'undefined') {
      boundProperty = new GalaxyView.BoundProperty(propertyName);

      Object.defineProperty(dataHostObject, referenceName, {
        enumerable: false,
        configurable: false,
        value: boundProperty
      });
    }

    var initValue = dataHostObject[propertyName];

    var enumerable = true;

    if (propertyName === 'length' && dataHostObject instanceof Array) {
      propertyName = '_length';
      enumerable = false;
    }

    Object.defineProperty(dataHostObject, propertyName, {
      get: function () {
        return boundProperty.value;
      },
      set: function (newValue) {
        if (boundProperty.value !== newValue) {
          boundProperty.setValue(attributeName, newValue);
        }
      },
      enumerable: enumerable,
      configurable: true
    });


    if (boundProperty) {
      boundProperty.value = initValue;
      if (!childProperty) {
        boundProperty.addNode(viewNode);
        viewNode.addProperty(boundProperty);

        if (viewNode.nodeSchema.mother && dataHostObject.__schemas__.indexOf(viewNode.nodeSchema.mother) === -1) {
          dataHostObject.__schemas__.push(viewNode.nodeSchema.mother);
        }
      }
    }

    if (childProperty) {
      _this.makeBinding(viewNode, dataHostObject[propertyName] || {}, attributeName, childProperty);
    } else if (typeof dataHostObject === 'object') {
      _this.setInitValue(boundProperty, attributeName, initValue);
    }
  };

  GalaxyView.prototype.setInitValue = function (boundProperty, attributeName, value) {
    if (value instanceof Array) {
      this.setArrayValue(boundProperty, attributeName, value);
    } else {
      this.setSingleValue(boundProperty, attributeName, value);
    }
  };

  GalaxyView.prototype.setSingleValue = function (boundProperty, attributeName, value) {
    boundProperty.nodes.forEach(function (node) {
      if (node.values[attributeName] !== value) {
        boundProperty.setValueFor(node, attributeName, value);
      }
    });
  };

  GalaxyView.prototype.setArrayValue = function (boundProperty, attributeName, value) {
    var arrayProto = Array.prototype;
    var methods = [
      'push',
      'pop',
      'shift',
      'unshift',
      'splice',
      'sort',
      'reverse'
    ];

    var changes = {
      original: value,
      type: 'push',
      params: value
    };

    methods.forEach(function (method) {
      var original = arrayProto[method];
      Object.defineProperty(value, method, {
        value: function () {
          var arr = this;
          var i = arguments.length;
          var args = new Array(i);
          while (i--) {
            args[i] = arguments[i];
          }

          var result = original.apply(this, args);

          if (typeof arr._length !== 'undefined') {
            arr._length = arr.length;
          }

          changes.type = method;
          changes.params = args;

          boundProperty.updateValue(attributeName, changes);

          return result;
        },
        writable: true,
        configurable: true
      });
    });

    boundProperty.nodes.forEach(function (node) {
      if (node.values[attributeName] !== value) {
        boundProperty.value = value;
        boundProperty.updateValue(attributeName, changes);
      }
    });
  };

}(this, Galaxy || {}));

/* global Galaxy */

(function (GV) {

  /**
   *
   * @returns {Galaxy.GalaxyView.BoundProperty}
   */
  GV.BoundProperty = BoundProperty;

  /**
   *
   * @param {String} name
   * @constructor
   */
  function BoundProperty(name) {
    /**
     * @public
     * @type {String} Name of the property
     */
    this.name = name;
    this.value = null;
    this.nodes = [];
  }

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @public
   */
  BoundProperty.prototype.addNode = function (node) {
    if (this.nodes.indexOf(node) === -1) {
      this.nodes.push(node);
    }
  };

  BoundProperty.prototype.setValue = function (attributeName, value) {
    this.value = value;
    var i = 0, len = 0;
    for (i = 0, len = this.nodes.length; i < len; i++) {
      this.setValueFor(this.nodes[i], attributeName, value);
    }
  };

  BoundProperty.prototype.updateValue = function (attributeName, value) {
    var i = 0, len = 0;
    for (i = 0, len = this.nodes.length; i < len; i++) {
      this.setUpdateFor(this.nodes[i], attributeName, value);
    }
  };

  BoundProperty.prototype.setValueFor = function (node, attributeName, value) {
    var mutator = node.mutator[attributeName];
    var newValue = value;

    if (mutator) {
      newValue = mutator.call(node, value, node.values[attributeName]);
    }

    node.values[attributeName] = newValue;
    node.root.setPropertyForNode(node, attributeName, newValue);
  };

  BoundProperty.prototype.setUpdateFor = function (node, attributeName, value) {
    node.root.setPropertyForNode(node, attributeName, value);
  };

})(Galaxy.GalaxyView);

/* global Galaxy */
(function (GV) {
  /**
   *
   * @returns {Galaxy.GalaxyView.ViewNode}
   */
  GV.ViewNode = ViewNode;

  /**
   *
   * @param {Galaxy.GalaxyView} root
   * @param node
   * @param nodeSchema
   * @constructor
   */
  function ViewNode(root, nodeSchema) {
    /**
     *
     * @public
     * @type {Galaxy.GalaxyView}
     */
    this.root = root;
    this.node = document.createElement(nodeSchema.t || 'div');
    this.nodeSchema = nodeSchema;
    this.data = {};
    this.mutator = {};
    this.template = false;
    this.placeholder = document.createComment(this.node.tagName);
    this.properties = {};
    this.values = {};
    this.inDOM = typeof nodeSchema.inDOM === 'undefined' ? true : nodeSchema.inDOM;
    this.cache = {};
    this.node.__galaxyView__ = this;
  }

  ViewNode.prototype.cloneSchema = function () {
    return Galaxy.extend({
      mother: this
    }, this.nodeSchema);
  };

  ViewNode.prototype.toTemplate = function () {
    this.placeholder.nodeValue = JSON.stringify(this.nodeSchema, null, 2);
    this.template = true;
  };

  ViewNode.prototype.setInDOM = function (flag) {
    this.inDOM = flag;
    if (flag && !this.node.parentNode && !this.template) {
      this.placeholder.parentNode.insertBefore(this.node, this.placeholder.nextSibling);
    } else if (!flag && this.node.parentNode) {
      this.node.parentNode.removeChild(this.node);
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.BoundProperty} property
   */
  ViewNode.prototype.addProperty = function (property) {
    // if (this.properties.indexOf(item) === -1) {
    //   this.properties.push(item);
    // }

    // if (this.properties[property.name] !== property) {
    this.properties[property.name] = property;
    // }
  };

  ViewNode.prototype.destroy = function () {
    var _this = this;

    if (_this.inDOM) {
      _this.node.parentNode.removeChild(_this.placeholder);
      _this.node.parentNode.removeChild(_this.node);
    } else {
      _this.placeholder.parentNode.removeChild(_this.placeholder);
    }

    var nodeIndexInTheHost, property;

    for (var propertyName in _this.properties) {
      property = _this.properties[propertyName];
      nodeIndexInTheHost = property.nodes.indexOf(_this);
      if (nodeIndexInTheHost !== -1) {
        property.nodes.splice(nodeIndexInTheHost, 1);
      }
    }

    _this.properties = [];
  };

})(Galaxy.GalaxyView);

/* global Galaxy */

(function (GV) {
  GV.REACTIVE_BEHAVIORS['for'] = {
    regex: /^([\w]*)\s+in\s+([^\s\n]+)$/,
    bind: function (viewNode, nodeScopeData, matches) {
      viewNode.toTemplate();
      this.makeBinding(viewNode, nodeScopeData, 'reactive_for', matches[2]);
    },
    onApply: function (viewNode, changes, matches, nodeScopeData) {
      var _this = this;
      var propName = matches[1];
      var newNodeSchema = viewNode.cloneSchema();
      newNodeSchema.reactive.for = null;
      var parentNode = viewNode.placeholder.parentNode;
      var position = null;
      var newItems = [];
      var forCachedItems = [];

      if (!viewNode.cache.for) {
        viewNode.cache.for = forCachedItems;
      } else {
        forCachedItems = viewNode.cache.for;
      }

      var action = forCachedItems.push;

      if (changes.type === 'push') {
        newItems = changes.params;
      } else if (changes.type === 'unshift') {
        position = forCachedItems[0] ? forCachedItems[0].node : null;
        newItems = changes.params;
        action = forCachedItems.unshift;
      } else if (changes.type === 'splice') {
        var removedItems = Array.prototype.splice.apply(forCachedItems, changes.params.slice(0, 2));
        newItems = changes.params.slice(2);
        removedItems.forEach(function (viewNode) {
          viewNode.destroy();
        });
      } else if (changes.type === 'pop') {
        forCachedItems.pop().destroy();
      } else if (changes.type === 'shift') {
        forCachedItems.shift().destroy();
      } else if (changes.type === 'sort' || changes.type === 'reverse') {
        forCachedItems.forEach(function (viewNode) {
          viewNode.destroy();
        });

        forCachedItems = [];
        newItems = changes.original;
      }

      var valueEntity;
      if (newItems instanceof Array) {
        for (var i = 0, len = newItems.length; i < len; i++) {
          valueEntity = newItems[i];

          var itemDataScope = Object.assign({}, nodeScopeData);
          itemDataScope[propName] = valueEntity;

          action.call(forCachedItems, _this.append(newNodeSchema, itemDataScope, parentNode, position));
        }
      } else {
        // for (var index in value) {
        //   valueEntity = value[index];
        //   if (valueEntity.__schemas__ && valueEntity.__schemas__.length/* && valueEntity.__schemas__.filter(filter).length*/) {
        //     continue;
        //   }
        //
        //   itemDataScope = nodeScopeData;
        //   itemDataScope[propName] = valueEntity;
        //   this.append(newNodeSchema, itemDataScope, parentNode);
        // }
      }
    }
  };
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  GV.REACTIVE_BEHAVIORS[ 'if' ] = {
    regex: null,
    bind: function (viewNode, nodeScopeData, matches) {
      this.makeBinding(viewNode, nodeScopeData, 'reactive_if', matches);
    },
    onApply: function (viewNode, value) {
      if (value) {
        viewNode.setInDOM(true);
      } else {
        viewNode.setInDOM(false);
      }
    }
  };
})(Galaxy.GalaxyView);

