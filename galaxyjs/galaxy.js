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
  Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j])
          a.splice(j--, 1);
      }
    }

    return a;
  };

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
    this.moduleContents = {};
    this.addOnProviders = [];
    this.app = null;
    this.rootElement = null;
  }

  Core.prototype.extend = function (out) {
    var result = out || {}, obj;
    for (var i = 1; i < arguments.length; i++) {
      obj = arguments[i];

      if (!obj)
        continue;

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] instanceof Array)
            result[key] = this.extend(result[key] || [], obj[key]);
          else if (typeof obj[key] === 'object' && obj[key] !== null)
            result[key] = this.extend(result[key] || {}, obj[key]);
          else
            result[key] = obj[key];
        }
      }
    }

    return result;
  };

  Core.prototype.resetObjectTo = function (out, value) {
    if (value !== null && typeof value !== 'object') {
      return value;
    }

    if (value === null) {
      for (var k in out) {
        if (typeof out[k] === 'object') {
          out[k] = this.resetObjectTo(out[k], null);
        }
        else {
          out[k] = null;
        }
      }

      return out;
    }

    var outKeys = Object.keys(out);
    var keys = outKeys.concat(Object.keys(value)).unique();
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i];
      if (value.hasOwnProperty(key)) {
        out[key] = this.resetObjectTo(out[key], value[key]);
      }
      else if (typeof out[key] === 'object') {
        this.resetObjectTo(out[key], null);
      }
      else {
        out[key] = null;
      }
    }

    return out;
  };

  /**
   *
   * @param bootModule
   * @param {Element} rootElement
   */
  Core.prototype.boot = function (bootModule) {
    var _this = this;
    _this.rootElement = bootModule.element;

    bootModule.domain = this;
    bootModule.id = 'system';

    if (!bootModule.element) {
      throw new Error('element property is mandatory');
    }

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

      // root.Galaxy.onModuleLoaded[module.systemId] = resolve;
      // var moduleExist = Galaxy.modules[module.systemId];

      var invokers = [module.url];
      if (module.invokers) {
        if (module.invokers.indexOf(module.url) !== -1) {
          throw new Error('circular dependencies: \n' + module.invokers.join('\n') + '\nwanna load: ' + module.url);
        }

        invokers = module.invokers;
        invokers.push(module.url);
      }

      Galaxy.onLoadQueue[module.systemId] = true;
      var url = module.url + '?' + _this.convertToURIString(module.params || {});
      // var fetcher = root.Galaxy.onModuleLoaded[url];
      var fetcherContent = root.Galaxy.moduleContents[url];

      if (!fetcherContent || module.fresh) {
        root.Galaxy.moduleContents[url] = fetcherContent = fetch(url).then(function (response) {
          if (response.status !== 200) {
            reject(response);
            return '';
          }

          return response.text();
        }).catch(reject);
      }

      // fetcherContent.then(resolve);
      fetcherContent.then(function (moduleContent) {
        _this.moduleContents[module.systemId] = moduleContent;
        _this.compileModuleContent(module, moduleContent, invokers).then(function (module) {
          return _this.executeCompiledModule(module).then(resolve);
        });

        return moduleContent;
      }).catch(reject);
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
      var moduleContentWithoutComments = moduleContent.replace(/\/\*[\s\S]*?\*\n?\/|([^:;]|^)\n?\/\/.*\n?$/gm, '');
      moduleContent = moduleContentWithoutComments.replace(/Scope\.import\(['|"](.*)['|"]\)\;/gm, function (match, path) {
        var query = path.match(/([\S]+)/gm);
        imports.push({
          url: query[query.length - 1],
          fresh: query.indexOf('new') !== -1
        });

        return 'Scope.imports[\'' + query[query.length - 1] + '\']';
      });

      var scope = new Galaxy.GalaxyScope(moduleMetaData, moduleMetaData.element || _this.rootElement);
      // var view = new Galaxy.GalaxyView(scope);
      // Create module from moduleMetaData
      var module = new Galaxy.GalaxyModule(moduleMetaData, moduleContent, scope);
      Galaxy.modules[module.systemId] = module;

      if (imports.length) {

        var importsCopy = imports.slice(0);
        imports.forEach(function (item) {
          var moduleAddOnProvider = Galaxy.getModuleAddOnProvider(item.url);
          if (moduleAddOnProvider) {
            var providerStages = moduleAddOnProvider.handler.call(null, scope, module);
            var addOnInstance = providerStages.create();
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

  /**
   *
   * @param {Galaxy.GalaxyModule}  module
   */
  Core.prototype.executeCompiledModule = function (module) {
    var promise = new Promise(function (resolve, reject) {
      for (var item in module.addOns) {
        module.scope.imports[item] = module.addOns[item];
      }

      for (item in importedLibraries) {
        if (importedLibraries.hasOwnProperty(item)) {
          var asset = importedLibraries[item];
          if (asset.module) {
            module.scope.imports[asset.name] = asset.module;
          }
        }
      }

      var moduleSource = new Function('Scope', module.source);
      moduleSource.call(null, module.scope);

      delete module.source;

      module.addOnProviders.forEach(function (item) {
        item.finalize();
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
        // module.scope.imports[module.url] = importedLibraries[module.url].module;
      }

      var currentModule = Galaxy.modules[module.systemId];
      if (module.temporary || module.scope._doNotRegister) {
        delete module.scope._doNotRegister;
        currentModule = {
          id: module.id,
          scope: module.scope
        };
      }

      currentModule.init();

      resolve(currentModule);

      delete Galaxy.onLoadQueue[module.systemId];
    });

    return promise;
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
  function GalaxyModule(module, source, scope) {
    this.id = module.id;
    this.systemId = module.systemId;
    this.source = source;
    this.url = module.url || null;
    this.addOns = module.addOns || {};
    this.domain = module.domain;
    this.addOnProviders = [];
    this.scope = scope;
  }

  GalaxyModule.prototype.init = function () {
    this.scope.trigger('module.init');
  };

  GalaxyModule.prototype.start = function () {
    this.scope.trigger('module.start');
  };

  GalaxyModule.prototype.destroy = function () {
    this.scope.trigger('module.destroy');
  };

  GalaxyModule.prototype.registerAddOn = function (id, object) {
    this.addOns[id] = object;
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
    this.uri = new GalaxyURI(module.url);
    this.eventHandlers = {};
  }

  GalaxyScope.prototype.load = function (moduleMeta, config) {
    var newModuleMetaData = Object.assign({}, moduleMeta, config || {});
    if (newModuleMetaData.url.indexOf('./') === 0) {
      newModuleMetaData.url = this.path + moduleMeta.url.substr(2);
    }

    newModuleMetaData.parentScope = this;
    newModuleMetaData.domain = newModuleMetaData.domain || Galaxy;
    return G.load(newModuleMetaData);
  };

  GalaxyScope.prototype.loadModuleInto = function (moduleMetaData, viewNode) {
    return this.load(moduleMetaData, {
      element: viewNode
    }).then(function (module) {
      module.start();
      return module;
    });
  };

  GalaxyScope.prototype.watch = function () {

  };

  /**
   *
   * @param {string} event
   */
  GalaxyScope.prototype.on = function (event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }

    if (this.eventHandlers[event].indexOf(handler) === -1) {
      this.eventHandlers[event].push(handler);
    }
  };

  GalaxyScope.prototype.trigger = function (event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(function (handler) {
        handler.call(null, data);
      });
    }
  };

  /**
   *
   * @returns {Galaxy.GalaxyURI}
   */
  G.GalaxyURI = GalaxyURI;

  function GalaxyURI(url) {
    var urlParser = document.createElement('a');
    urlParser.href = url;
    var myRegexp = /([^\t\n]+)\//g;
    var match = myRegexp.exec(urlParser.pathname);


    this.paresdURL = urlParser.href;
    this.path = match ? match[0] : '/';
  }

}(this, Galaxy || {}));

/* global Galaxy, Promise */

(function (G) {
  /**
   *
   * @returns {Galaxy.GalaxyScope}
   */
  G.GalaxySequence = GalaxySequence;

  function GalaxySequence() {
    this.line = null;
    this.firstStepResolve = null;
    this.started = false;
    this.reset();
  }

  GalaxySequence.prototype.start = function () {
    if(this.started) return this;

    this.firstStepResolve();
    this.started = true;
    return this;
  };

  GalaxySequence.prototype.reset = function () {
    var _this = this;

    _this.line = new Promise(function (resolve) {
      _this.firstStepResolve = resolve;
    });

    this.started = false;
    return _this;
  };

  GalaxySequence.prototype.next = function (action) {
    var thunk;
    var promise = new Promise(function (resolve, reject) {
      thunk = function () {
        action(resolve, reject);
      };
    });

    this.line.then(thunk).catch(thunk);
    this.line = promise;

    return promise;
  };

  GalaxySequence.prototype.finish = function (action) {
    this.line.then(action);
  };


})(Galaxy);

/* global Galaxy, Promise */

(function (root, G) {
  var defineProp = Object.defineProperty;
  var setterAndGetter = {
    configurable: true,
    enumerable: false,
    set: null,
    get: null
  };
  var boundPropertyReference = {
    configurable: false,
    enumerable: false,
    value: null
  };
  var setAttr = Element.prototype.setAttribute;
  var nextTick = (function () {
    var callbacks = [];
    var pending = false;
    var timerFunc;

    function nextTickHandler() {
      pending = false;
      var copies = callbacks.slice(0);
      callbacks.length = 0;
      for (var i = 0; i < copies.length; i++) {
        copies[i]();
      }
    }

    var p = Promise.resolve();
    var logError = function (err) {
      console.error(err);
    };
    timerFunc = function () {
      p.then(nextTickHandler).catch(logError);
    };

    return function queueNextTick(cb, ctx) {
      var _resolve;
      callbacks.push(function () {
        if (cb) {
          try {
            cb.call(ctx);
          } catch (e) {
            console.error(e, ctx, 'nextTick');
          }
        } else if (_resolve) {
          _resolve(ctx);
        }
      });
      if (!pending) {
        pending = true;
        timerFunc();
      }
      if (!cb && typeof Promise !== 'undefined') {
        return new Promise(function (resolve, reject) {
          _resolve = resolve;
        });
      }
    };
  })();

  root.Galaxy = G;

  /**
   *
   * @returns {Galaxy.GalaxyView}
   */
  G.GalaxyView = GalaxyView;

  GalaxyView.nextTick = nextTick;

  GalaxyView.defineProp = defineProp;

  GalaxyView.setAttr = function (viewNode, name, value, oldValue) {
    viewNode.callWatchers(name, value);
    setAttr.call(viewNode.node, name, value, oldValue);
  };

  GalaxyView.cleanProperty = function (obj, key) {
    delete obj[key];
  };

  GalaxyView.createMirror = function (obj) {
    var result = {};

    defineProp(result, '__parent__', {
      enumerable: false,
      value: obj
    });

    return result;
  };

  GalaxyView.createClone = function (source) {
    var cloned = Object.assign({}, source);

    GalaxyView.link(source, cloned);

    return cloned;
  };

  GalaxyView.link = function (from, to) {
    for (var key in from) {
      if (from.hasOwnProperty('[' + key + ']')) {
        boundPropertyReference.value = from['[' + key + ']'];
        defineProp(to, '[' + key + ']', boundPropertyReference);
        defineProp(to, key, Object.getOwnPropertyDescriptor(from, key));
      }
    }
  };

  GalaxyView.getPropertyContainer = function (data, propertyName) {
    var container = data;
    var tempData = data.hasOwnProperty(propertyName);

    while (tempData.__parent__) {
      if (tempData.__parent__.hasOwnProperty(propertyName)) {
        container = tempData.__parent__;
        break;
      }

      tempData = data.__parent__;
    }

    return container;
  };

  GalaxyView.getAllViewNodes = function (node) {
    var item, viewNodes = [];

    for (var i = 0, len = node.childNodes.length; i < len; i++) {
      item = node.childNodes[i];

      if (item.hasOwnProperty('__viewNode__')) {
        viewNodes.push(item.__viewNode__);
      }

      viewNodes = viewNodes.concat(GalaxyView.getAllViewNodes(item));
    }

    return viewNodes.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
  };

  GalaxyView.getBoundProperties = function (host) {
    var all = Object.getOwnPropertyNames(host);
    var visible = Object.keys(host);
    var properties = [];

    all.forEach(function (key) {
      if (host[key] instanceof GalaxyView.BoundProperty && visible.indexOf(key) === -1) {
        properties.push(host[key]);
      }
    });

    return properties;
  };

  GalaxyView.getBindings = function (value) {
    var variableNamePaths = null;
    var isExpression = false;
    var type = typeof(value);

    if (type === 'string') {
      variableNamePaths = value.match(/^\[\s*([^\[\]]*)\s*\]$/);
      variableNamePaths = variableNamePaths ? variableNamePaths[1] : null;
    }
    else if (value instanceof Array && typeof value[value.length - 1] === 'function') {
      variableNamePaths = value;
      isExpression = true;
    } else {
      variableNamePaths = null;
    }

    return {
      variableNamePaths: variableNamePaths,
      isExpression: isExpression
    };
  };

  GalaxyView.REACTIVE_BEHAVIORS = {};

  GalaxyView.NODE_SCHEMA_PROPERTY_MAP = {
    tag: {
      type: 'none'
    },
    children: {
      type: 'none'
    },
    content: {
      type: 'none'
    },
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
      type: 'prop'
    },
    css: {
      type: 'attr',
      name: 'style'
    },
    html: {
      type: 'prop',
      name: 'innerHTML'
    },
    text: {
      type: 'custom',
      handler: function (viewNode, attr, value) {
        var textNode = viewNode.node['[text]'];
        var textValue = typeof value === 'undefined' ? '' : value;
        if (textNode) {
          textNode.textContent = textValue;
        } else {
          viewNode.node['[text]'] = document.createTextNode(textValue);
          viewNode.node.insertBefore(viewNode.node['[text]'], viewNode.node.firstChild);
        }
      }
    },
    checked: {
      type: 'prop'
    },
    click: {
      type: 'event',
      name: 'click'
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyScope} scope
   * @constructor
   */
  function GalaxyView(scope) {
    this.scope = scope;
    this.dataRepos = {};
    var rootElement;

    if (scope.element instanceof GalaxyView.ViewNode) {
      rootElement = scope.element;
    } else {
      scope.element.innerHTML = '';
      rootElement = new GalaxyView.ViewNode(this, {
        tag: scope.element.tagName
      }, scope.element);
    }

    this.container = rootElement;
  }

  GalaxyView.prototype.setupRepos = function (repos) {
    this.dataRepos = repos;
  };

  GalaxyView.prototype.init = function (schema) {
    this.append(schema, this.scope, this.container);
  };

  /**
   *
   * @param {Object} nodeSchema
   * @param {Object} nodeScopeData
   * @param {GalaxyView.ViewNode} parentViewNode
   */
  GalaxyView.prototype.append = function (nodeSchema, parentScopeData, parentViewNode, position) {
    var _this = this;
    var i = 0, len = 0;
    if (nodeSchema instanceof Array) {
      for (i = 0, len = nodeSchema.length; i < len; i++) {
        _this.append(nodeSchema[i], parentScopeData, parentViewNode);
      }
    } else if (nodeSchema !== null && typeof(nodeSchema) === 'object') {
      var viewNode = new GalaxyView.ViewNode(_this, nodeSchema);
      parentViewNode.append(viewNode, position);

      if (nodeSchema['mutator']) {
        viewNode.mutator = nodeSchema['mutator'];
      }

      var keys = Object.keys(nodeSchema);
      var attributeValue, attributeName;
      for (i = 0, len = keys.length; i < len; i++) {
        attributeName = keys[i];
        attributeValue = nodeSchema[attributeName];

        if (GalaxyView.REACTIVE_BEHAVIORS[attributeName]) {
          _this.addReactiveBehavior(viewNode, nodeSchema, parentScopeData, attributeName);
        }

        var bindings = GalaxyView.getBindings(attributeValue);

        if (bindings.variableNamePaths) {
          _this.makeBinding(viewNode, parentScopeData, attributeName, bindings.variableNamePaths, bindings.isExpression);
        } else {
          _this.setPropertyForNode(viewNode, attributeName, attributeValue, parentScopeData);
        }
      }

      if (!viewNode.virtual) {
        if (viewNode.inDOM) {
          viewNode.setInDOM(true);
        }

        _this.append(nodeSchema.children, parentScopeData, viewNode);
      }

      // viewNode.onReady promise will be resolved after all the dom manipulations are done
      // this make sure that the viewNode and its children elements are rendered
      viewNode.domManipulationSequence.next(function (done) {
        viewNode.ready();
        done();
      });
      return viewNode;
    }
  };

  GalaxyView.prototype.addReactiveBehavior = function (viewNode, nodeSchema, nodeScopeData, key) {
    var behavior = GalaxyView.REACTIVE_BEHAVIORS[key];
    var bindTo = nodeSchema[key];

    if (behavior) {
      var matches = behavior.regex ? (typeof(bindTo) === 'string' ? bindTo.match(behavior.regex) : bindTo) : bindTo;

      viewNode.properties.__behaviors__[key] = (function (BEHAVIOR, MATCHES, BEHAVIOR_SCOPE_DATA) {
        var CACHE = {};
        if (BEHAVIOR.getCache) {
          CACHE = BEHAVIOR.getCache(viewNode, MATCHES, BEHAVIOR_SCOPE_DATA);
        }

        return function (vn, value, oldValue) {
          return BEHAVIOR.onApply(CACHE, vn, value, oldValue, MATCHES, BEHAVIOR_SCOPE_DATA);
        };
      })(behavior, matches, nodeScopeData);

      behavior.bind(viewNode, nodeScopeData, matches);
    }
  };

  GalaxyView.prototype.setPropertyForNode = function (viewNode, attributeName, value, scopeData) {
    var property = GalaxyView.NODE_SCHEMA_PROPERTY_MAP[attributeName] || {type: 'attr'};
    var newValue = value;

    switch (property.type) {
      case 'attr':
        newValue = property.parser ? property.parser(value) : value;
        GalaxyView.setAttr(viewNode, attributeName, newValue, null);
        break;

      case 'prop':
        newValue = property.parser ? property.parser(value) : value;
        viewNode.callWatchers(property.name, value, null);
        viewNode.node[property.name] = newValue;
        break;

      case 'reactive':
        viewNode.properties.__behaviors__[property.name](viewNode, newValue, null);
        break;

      case 'event':
        viewNode.node.addEventListener(attributeName, value.bind(viewNode), false);
        break;

      case 'custom':
        property.handler(viewNode, attributeName, value, null, scopeData);
        break;
    }
  };

  GalaxyView.prototype.getPropertySetter = function (viewNode, attributeName, expression) {
    var property = GalaxyView.NODE_SCHEMA_PROPERTY_MAP[attributeName];

    if (!property) {
      return function (value) {
        setAttr.call(viewNode.node, attributeName, value);
      };
    }

    var parser = property.parser;

    switch (property.type) {
      case 'prop':
        if (expression) {
          return function (none, oldValue) {
            var value = expression(none);
            var newValue = parser ? parser(value) : value;
            viewNode.node[property.name] = newValue;
            viewNode.callWatchers(property.name, newValue, oldValue);
          };
        }

        return function (value, oldValue) {
          var newValue = parser ? parser(value) : value;
          viewNode.node[property.name] = newValue;
          viewNode.callWatchers(property.name, newValue, oldValue);
        };

      case 'reactive':
        var reactiveFunction = viewNode.properties.__behaviors__[property.name];

        if (!reactiveFunction) {
          console.error('Reactive handler not found for: ' + property.name);
        }

        return function (value, oldValue) {
          reactiveFunction(viewNode, value, oldValue);
        };

      case 'custom':
        if (expression) {
          return function (none, oldValue, scopeData) {
            property.handler(viewNode, attributeName, expression(none), oldValue, scopeData);
          };
        }

        return function (value, oldValue, scopeData) {
          property.handler(viewNode, attributeName, value, oldValue, scopeData);
        };

      default:
        if (expression) {
          return function (none, oldValue) {
            var value = expression(none);
            var newValue = parser ? parser(value) : value;
            GalaxyView.setAttr(viewNode, attributeName, newValue, oldValue);
          };
        }

        return function (value, oldValue) {
          var newValue = parser ? parser(value) : value;
          GalaxyView.setAttr(viewNode, attributeName, newValue, oldValue);
        };
    }
  };

  GalaxyView.prototype.createBoundProperty = function (dataObject, propertyName, referenceName, enumerable, childProperty, initValue) {
    var boundProperty = new GalaxyView.BoundProperty(propertyName, initValue);
    boundPropertyReference.value = boundProperty;
    defineProp(dataObject, referenceName, boundPropertyReference);

    setterAndGetter.enumerable = enumerable;
    setterAndGetter.get = (function (bp) {
      return function () {
        return bp.value;
      };
    })(boundProperty);

    if (childProperty) {
      setterAndGetter.set = function (newValue) {
        if (boundProperty.value !== newValue) {
          if (newValue !== null && typeof boundProperty.value === 'object') {
            var all = Object.getOwnPropertyNames(boundProperty.value);
            var visible = Object.keys(boundProperty.value);
            var newVisible = Object.keys(newValue);
            var descriptors = {};
            var hidden = all.filter(function (key) {
              descriptors[key] = Object.getOwnPropertyDescriptor(boundProperty.value || {}, key);
              return visible.indexOf(key) === -1;
            });

            newVisible.forEach(function (key) {
              if (hidden.indexOf('[' + key + ']') !== -1) {
                descriptors['[' + key + ']'].value.setValue(newValue[key], dataObject);

                defineProp(newValue, '[' + key + ']', descriptors['[' + key + ']']);
                defineProp(newValue, key, descriptors[key]);
              }
            });
          }

          boundProperty.setValue(newValue, dataObject);
        }
      };
    } else {
      setterAndGetter.set = function (value) {
        boundProperty.setValue(value, dataObject);
      };
    }

    defineProp(dataObject, propertyName, setterAndGetter);

    return boundProperty;
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode | Object} target
   * @param {Object} dataHostObject
   * @param {String} targetKeyName
   * @param {string|Array<string>} variableNamePaths
   */
  GalaxyView.prototype.makeBinding = function (target, data, targetKeyName, variableNamePaths, expression) {
    var _this = this;
    var dataObject = data;
    if (typeof dataObject !== 'object') {
      return;
    }

    var variables = variableNamePaths instanceof Array ? variableNamePaths : [variableNamePaths];

    // expression === true means that a expression function is available and should be extracted
    if (expression === true) {
      var handler = variables[variables.length - 1];
      variables = variables.slice(0, variables.length - 1);
      var functionContent = 'this;return [';
      functionContent += variables.map(function (path) {
        return 'scope.' + path;
      }).join(',');
      functionContent += ']';

      // Generate expression arguments
      var getExpressionArguments = new Function('scope', functionContent);
      expression = (function (scope) {
        return function () {
          var args = getExpressionArguments.call(target, scope);
          return handler.apply(target, args);
        };
      })(dataObject);
    }

    var variableNamePath;
    var propertyName = null;
    var childProperty = null;
    var initValue = null;

    for (var i = 0, len = variables.length; i < len; i++) {
      variableNamePath = variables[i];
      propertyName = variableNamePath;

      var variableName = variableNamePath.split('.');
      if (variableName.length > 1) {
        propertyName = variableName.shift();
        childProperty = variableName.join('.');
      }

      if (!dataObject.hasOwnProperty(propertyName)) {
        var tempData = dataObject;

        while (tempData.__parent__) {
          if (tempData.__parent__.hasOwnProperty(propertyName)) {
            dataObject = tempData.__parent__;
            break;
          }

          tempData = dataObject.__parent__;
        }
      }

      initValue = dataObject[propertyName];

      var enumerable = true;
      if (propertyName === 'length' && dataObject instanceof Array) {
        propertyName = '_length';
        enumerable = false;
      }

      var referenceName = '[' + propertyName + ']';
      var boundProperty = dataObject[referenceName];

      if (typeof boundProperty === 'undefined') {
        boundProperty = this.createBoundProperty(dataObject, propertyName, referenceName, enumerable, childProperty, initValue);
      }

      if (!(target instanceof Galaxy.GalaxyView.ViewNode) && !childProperty && !target.hasOwnProperty('[' + targetKeyName + ']')) {
        boundPropertyReference.value = boundProperty;
        defineProp(target, '[' + targetKeyName + ']', boundPropertyReference);

        setterAndGetter.enumerable = enumerable;
        setterAndGetter.get = (function (BOUND_PROPERTY) {
          return function () {
            return BOUND_PROPERTY.value;
          };
        })(boundProperty);

        setterAndGetter.set = (function (BOUND_PROPERTY, DATA) {
          return function (value) {
            BOUND_PROPERTY.setValue(value, DATA);
          };
        })(boundProperty, dataObject);

        defineProp(target, targetKeyName, setterAndGetter);
      }

      if (!childProperty) {
        boundProperty.addNode(target, targetKeyName,  expression);
      }

      if (childProperty) {
        _this.makeBinding(target, dataObject[propertyName] || {}, targetKeyName, childProperty, expression);
      } else if (typeof dataObject === 'object') {
        boundProperty.initValueFor(target, targetKeyName, initValue, dataObject);
      }
    }
  };

  GalaxyView.createActiveArray = function (value, onUpdate) {
    var changes = {
      original: value,
      type: 'push',
      params: value
    };

    var oldChanges = Object.assign({}, changes);

    if (value.hasOwnProperty('[live]')) {
      return changes;
    }

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
    var arr = value;
    var i = 0;
    var args;

    boundPropertyReference.value = true;
    defineProp(value, '[live]', boundPropertyReference);

    methods.forEach(function (method) {
      var original = arrayProto[method];
      Object.defineProperty(value, method, {
        value: function () {
          i = arguments.length;
          args = new Array(i);
          while (i--) {
            args[i] = arguments[i];
          }

          var result = original.apply(this, args);

          if (typeof arr._length !== 'undefined') {
            arr._length = arr.length;
          }

          changes.type = method;
          changes.params = args;

          onUpdate(changes, oldChanges);
          oldChanges = Object.assign({}, changes);

          return result;
        },
        writable: false,
        configurable: true
      });
    });


    return changes;
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
  function BoundProperty(name, value) {
    /**
     * @public
     * @type {String} Name of the property
     */
    this.name = name;
    this.value = value;
    this.props = [];
    this.nodes = [];
  }

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param {String} attributeName
   * @param {Function} expression
   * @public
   */
  BoundProperty.prototype.addNode = function (node, attributeName, expression) {
    if (this.nodes.indexOf(node) === -1) {
      if (node instanceof Galaxy.GalaxyView.ViewNode) {
        node.installPropertySetter(this, attributeName, expression);
      } else {
        var onChange = (function () {
          var whens = {};
          var on = function (key, value, oldValue, context) {
            if (whens.hasOwnProperty(key)) {
              whens[key].call(context, value, oldValue);
            }
          };

          function f(key, value, oldValue, context) {
            on.call(this, key, value, oldValue, context);
          }

          f.when = function (key, action) {
            whens[key] = action;
          };

          return f;
        })();

        var handler = {
          value: onChange,
          writable: true,
          configurable: true
        };

        GV.defineProp(node, '__onChange__', handler);
      }

      this.props.push(attributeName);
      this.nodes.push(node);
    }
  };

  BoundProperty.prototype.removeNode = function (node) {
    var nodeIndexInTheHost = this.nodes.indexOf(node);
    if (nodeIndexInTheHost !== -1) {
      this.nodes.splice(nodeIndexInTheHost, 1);
      this.props.splice(nodeIndexInTheHost, 1);
    }
  };

  BoundProperty.prototype.initValueFor = function (target, key, value, scopeData) {
    var oldValue = this.value;
    this.value = value;
    if (value instanceof Array) {
      var init = GV.createActiveArray(value, this.updateValue.bind(this));
      if (target instanceof GV.ViewNode) {
        target.values[key] = value;
        this.setUpdateFor(target, key, init);
      }
    } else {
      this.setValueFor(target, key, value, oldValue, scopeData);
    }
  };

  BoundProperty.prototype.setValue = function (value, scopeData) {
    if (value !== this.value) {
      var oldValue = this.value;
      this.value = value;
      if (value instanceof Array) {
        var oldChanges = GV.createActiveArray(value, this.updateValue.bind(this));
        this.updateValue({type: 'reset', params: value, original: value}, oldChanges);
      } else {
        for (var i = 0, len = this.nodes.length; i < len; i++) {
          this.setValueFor(this.nodes[i], this.props[i], value, oldValue, scopeData);
        }
      }
    }
  };

  BoundProperty.prototype.updateValue = function (changes, oldChanges) {
    for (var i = 0, len = this.nodes.length; i < len; i++) {
      this.nodes[i].value = changes.original;
      this.setUpdateFor(this.nodes[i], this.props[i], changes, oldChanges);
    }
  };

  BoundProperty.prototype.setValueFor = function (host, attributeName, value, oldValue, scopeData) {
    if (host instanceof Galaxy.GalaxyView.ViewNode) {
      host.values[attributeName] = value;
      if (!host.setters[attributeName]) {
        console.info(host, attributeName, value);
      }

      host.setters[attributeName](value, oldValue, scopeData);
    } else {
      host[attributeName] = value;
      host.__onChange__(attributeName, value, oldValue, host);
    }
  };

  BoundProperty.prototype.setUpdateFor = function (host, attributeName, changes, oldChanges) {
    if (host instanceof Galaxy.GalaxyView.ViewNode) {
      host.setters[attributeName](changes);
    } else {
      host.__onChange__(attributeName, changes, oldChanges, host);
    }
  };

})(Galaxy.GalaxyView);

/* global Galaxy, Promise */
(function (GV) {

  function createElem(t) {
    return document.createElement(t);
  }

  var commentNode = document.createComment('');

  function createComment(t) {
    return commentNode.cloneNode(t);
  }

  function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild(node, child) {
    node.removeChild(child);
  }

  /**
   *
   * @returns {Galaxy.GalaxyView.ViewNode}
   */
  GV.ViewNode = ViewNode;

  GV.NODE_SCHEMA_PROPERTY_MAP['node'] = {
    type: 'none'
  };


  var referenceToThis = {
    value: this,
    configurable: false,
    enumerable: false
  };

  var __node__ = {
    value: null,
    configurable: false,
    enumerable: false
  };

  var __behaviors__ = {
    value: {},
    enumerable: false,
    writable: false
  };

  /**
   *
   * @param {Galaxy.GalaxyView} root
   * @param node
   * @param schema
   * @constructor
   */
  function ViewNode(root, schema, node) {
    this.root = root;
    this.node = node || createElem(schema.tag || 'div');
    this.schema = schema;
    this.data = {};
    // this.mutator = {};
    this.virtual = false;
    this.placeholder = createComment(schema.tag || 'div');
    this.properties = {};
    this.values = {};
    this.inDOM = typeof schema.inDOM === 'undefined' ? true : schema.inDOM;
    this.setters = {};
    this.watchers = {};
    this.parent = null;
    this.dependedObjects = [];
    this.domManipulationSequence = new Galaxy.GalaxySequence().start();
    this.sequences = {};

    var _this = this;
    this.rendered = new Promise(function (ready) {
      _this.ready = ready;
    });

    this.createSequence(':enter', true);
    this.createSequence(':leave', false);
    this.createSequence(':destroy', false);
    this.createSequence(':class', true);

    __node__.value = this.node;
    GV.defineProp(this.schema, '__node__', __node__);

    __behaviors__.value = {};
    GV.defineProp(this.properties, '__behaviors__', __behaviors__);

    referenceToThis.value = this;
    GV.defineProp(this.node, '__viewNode__', referenceToThis);
    GV.defineProp(this.placeholder, '__viewNode__', referenceToThis);
  }

  ViewNode.prototype.cloneSchema = function () {
    var clone = Object.assign({}, this.schema);
    empty(clone);

    GV.defineProp(clone, 'mother', {
      value: this.schema,
      writable: false,
      enumerable: false,
      configurable: false
    });

    return clone;
  };

  /**
   *
   * @param name
   * @param start
   * @returns {Galaxy.GalaxySequence}
   */
  ViewNode.prototype.createSequence = function (name, start) {
    if (!this.sequences[name]) {
      this.sequences[name] = new Galaxy.GalaxySequence();

      if (start) {
        this.sequences[name].start();
      }
    }

    return this.sequences[name];
  };

  ViewNode.prototype.toTemplate = function () {
    this.placeholder.nodeValue = JSON.stringify(this.schema, null, 2);
    this.virtual = true;
    this.setInDOM(false);
  };

  ViewNode.prototype.setInDOM = function (flag) {
    var _this = this;
    _this.inDOM = flag;
    if (flag /*&& !_this.node.parentNode*/ && !_this.virtual) {
      _this.domManipulationSequence.next(function (done) {
        insertBefore(_this.placeholder.parentNode, _this.node, _this.placeholder.nextSibling);
        removeChild(_this.placeholder.parentNode, _this.placeholder);
        _this.sequences[':enter'].finish(done);
      });
    } else if (!flag && _this.node.parentNode) {
      _this.domManipulationSequence.next(function (done) {
        _this.sequences[':leave'].start().finish(function () {
          insertBefore(_this.node.parentNode, _this.placeholder, _this.node);
          removeChild(_this.node.parentNode, _this.node);
          done();
          _this.sequences[':leave'].reset();
        });
      });
    }
  };

  ViewNode.prototype.append = function (viewNode, position) {
    var _this = this;
    viewNode.parent = _this;
    _this.node.insertBefore(viewNode.placeholder, position);
  };

  /**
   *
   * @param {Galaxy.GalaxyView.BoundProperty} boundProperty
   * @param {string} propertyName
   * @param {Function} expression
   */
  ViewNode.prototype.installPropertySetter = function (boundProperty, propertyName, expression) {
    this.properties[boundProperty.name] = boundProperty;
    this.setters[propertyName] = this.root.getPropertySetter(this, propertyName, this.virtual ? null : expression);
    if (!this.setters[propertyName]) {
      var _this = this;
      this.setters[propertyName] = function () {
        console.error('No setter for property :', propertyName, '\nNode:', _this);
      };
    }
  };

  ViewNode.prototype.destroy = function (sequence, source) {
    var _this = this;

    if (!source) {
      if (_this.inDOM) {
        _this.domManipulationSequence.next(function (done) {
          _this.empty(_this.sequences[':destroy'], true);
          _this.sequences[':destroy'].start().finish(function () {
            _this.sequences[':leave'].start().finish(function () {
              removeChild(_this.node.parentNode, _this.node);
              _this.sequences[':leave'].reset();
            });

            done();
            _this.sequences[':destroy'].reset();
          });
        });
      }
    } else if (source) {
      if (_this.inDOM) {
        sequence.next(function (done) {
          _this.sequences[':leave'].start().finish(function () {
            _this.sequences[':leave'].reset();
          });

          done();
        });
      }

      _this.empty(sequence, true);
    } else {
      if (_this.inDOM) {
        _this.domManipulationSequence.next(function (done) {
          _this.sequences[':leave'].start().finish(function () {
            removeChild(_this.node.parentNode, _this.node);
            done();
            _this.sequences[':leave'].reset();
          });
        });
      }
      _this.empty(sequence, true);
    }

    _this.domManipulationSequence.next(function (done) {
      _this.placeholder.parentNode && removeChild(_this.placeholder.parentNode, _this.placeholder);
      done();
    });


    var property, properties = _this.properties;

    for (var propertyName in properties) {
      property = properties[propertyName];
      property.removeNode(_this);
    }

    _this.inDOM = false;
    _this.dependedObjects.forEach(function (item) {
      var temp = GV.getBoundProperties(item);
      temp.forEach(function (property) {
        property.removeNode(item);
      });
    });
  };

  ViewNode.prototype.addDependedObject = function (item) {
    if (this.dependedObjects.indexOf(item) === -1) {
      this.dependedObjects.push(item);
    }
  };

  ViewNode.prototype.refreshBinds = function (data) {
    var property;
    for (var propertyName in this.properties) {
      property = this.properties[propertyName];
      if (property.nodes.indexOf(this) === -1) {
        property.nodes.push(this);
        property.props.push(propertyName);
      }
    }
  };

  var empty = function (nodes) {
    if (nodes instanceof Array) {
      nodes.forEach(function (node) {
        empty(node);
      });
    } else if (nodes) {
      nodes.__node__ = null;
      empty(nodes.children);
    }
  };

  ViewNode.prototype.empty = function (sequence, source) {
    var toBeRemoved = [], node;
    for (var i = this.node.childNodes.length - 1, till = 0; i >= till; i--) {
      node = this.node.childNodes[i];

      if (node.hasOwnProperty('__viewNode__')) {
        toBeRemoved.push(node.__viewNode__);
      }
    }

    var domManipulationSequence;

    toBeRemoved.forEach(function (viewNode) {
      viewNode.destroy(sequence, source);
      domManipulationSequence = viewNode.domManipulationSequence;
    });


    return domManipulationSequence || this.domManipulationSequence;
  };

  ViewNode.prototype.getPlaceholder = function () {
    if (this.inDOM) {
      return this.node;
    }

    return this.placeholder;
  };

  ViewNode.prototype.watch = function (name, callback) {
    this.watchers[name] = callback.bind(this);
  };

  ViewNode.prototype.callWatchers = function (name, value, oldValue) {
    if (this.watchers.hasOwnProperty(name)) {
      this.watchers[name](value, oldValue);
    }
  };

})(Galaxy.GalaxyView);

/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['inputs'] = {
    type: 'reactive',
    name: 'inputs'
  };

  GV.REACTIVE_BEHAVIORS['inputs'] = {
    regex: null,
    /**
     *
     * @param {Galaxy.GalaxyView.ViewNode} viewNode
     * @param scopeData
     * @param value
     */
    bind: function (viewNode, scopeData, value) {
      if (value !== null && typeof  value !== 'object') {
        throw console.error('inputs property should be an object with explicits keys:\n', JSON.stringify(viewNode.schema, null, '  '));
      }


    },
    onApply: function (cache, viewNode, value, oldValue, matches, context) {
      if (viewNode.virtual) return;

      var keys = Object.keys(value);
      var attributeName;
      var attributeValue;
      var clone = GV.createClone(value);

      for (var i = 0, len = keys.length; i < len; i++) {
        attributeName = keys[i];
        attributeValue = value[attributeName];

        var bindings = GV.getBindings(attributeValue);

        if (bindings.variableNamePaths) {
          viewNode.root.makeBinding(clone, context, attributeName, bindings.variableNamePaths, bindings.isExpression);
        }
      }

      if (viewNode.hasOwnProperty('[addon/inputs]') && clone !== viewNode['[addon/inputs]'].clone) {
        Galaxy.resetObjectTo(viewNode['[addon/inputs]'], {
          clone: clone,
          original: value
        });
      } else if (!viewNode.hasOwnProperty('[addon/inputs]')) {
        Object.defineProperty(viewNode, '[addon/inputs]', {
          value: {
            clone: clone,
            original: value
          },
          enumerable: false
        });
      }

      viewNode.addDependedObject(clone);
    }
  };

  Galaxy.registerAddOnProvider('galaxy/inputs', function (scope) {
    return {
      create: function () {
        scope.inputs = scope.element['[addon/inputs]'].clone;

        return scope.inputs;
      },
      finalize: function () {
        GV.link(scope.element['[addon/inputs]'].clone, scope.element['[addon/inputs]'].original);
      }
    };
  });
})(Galaxy.GalaxyView);

/* global Galaxy */

(function (G) {
  G.registerAddOnProvider('galaxy/view', function (scope) {
    return {
      create: function () {
        var view = new Galaxy.GalaxyView(scope);

        return view;
      },
      finalize: function () {

      }
    };
  });
})(Galaxy);

/* global Galaxy, TweenLite, TimelineLite */

(function (G) {
  G.GalaxyView.NODE_SCHEMA_PROPERTY_MAP['animation'] = {
    type: 'custom',
    name: 'animation',
    /**
     *
     * @param {Galaxy.GalaxyView.ViewNode} viewNode
     * @param attr
     * @param config
     * @param scopeData
     */
    handler: function (viewNode, attr, config, oldConfig, scopeData) {
      viewNode.rendered.then(function () {
        if (!viewNode.virtual) {
          var enterAnimationConfig = config[':enter'];
          if (enterAnimationConfig) {
            viewNode.sequences[':enter'].next(function (done) {
              if (enterAnimationConfig.sequence) {
                var animationMeta = AnimationMeta.GET(enterAnimationConfig.sequence);

                if (enterAnimationConfig.group) {
                  animationMeta = animationMeta.getGroup(enterAnimationConfig.group);
                }

                var lastStep = enterAnimationConfig.to || enterAnimationConfig.from;
                lastStep.clearProps = 'all';
                animationMeta.add(viewNode.node, enterAnimationConfig, done);
              } else {
                AnimationMeta.CREATE_TWEEN(viewNode.node, enterAnimationConfig, done);
              }
            });
          }

          var leaveAnimationConfig = config[':leave'];
          if (leaveAnimationConfig) {
            viewNode.sequences[':destroy'].next(function (done) {
              viewNode._destroyed = true;
              done();
            });

            viewNode.sequences[':leave'].next(function (done) {
              if (leaveAnimationConfig.sequence) {
                var animationMeta = AnimationMeta.GET(leaveAnimationConfig.sequence);

                // if the animation has order it will be added to the queue according to its order.
                // No order means lowest order
                if (typeof leaveAnimationConfig.order === 'number') {
                  animationMeta.addToQueue(leaveAnimationConfig.order, viewNode.node, function () {
                    if (leaveAnimationConfig.group) {
                      animationMeta = animationMeta.getGroup(leaveAnimationConfig.group);
                    }

                    animationMeta.add(viewNode.node, leaveAnimationConfig, done);
                  });

                  // When viewNode is the one which is destroyed, then run the queue
                  // The queue will never run if the destroyed viewNode has the lowest order
                  if (viewNode._destroyed) {
                    var finishImmediately = false;
                    for (var key in animationMeta.queue) {
                      var item;
                      for (var i = 0, len = animationMeta.queue[key].length; i < len; i++) {
                        item = animationMeta.queue[key][i];
                        item.operation();

                        // If the the current queue item.node is the destroyed node, then all the animations in
                        // queue should be ignored
                        if (item.node === viewNode.node) {
                          finishImmediately = true;
                          break;
                        }
                      }

                      if (finishImmediately) break;
                    }

                    animationMeta.queue = {};
                    delete viewNode._destroyed;
                  }

                  return;
                }

                if (leaveAnimationConfig.group) {
                  animationMeta = animationMeta.getGroup(leaveAnimationConfig.group);
                }

                animationMeta.add(viewNode.node, leaveAnimationConfig, done);
              } else {
                AnimationMeta.CREATE_TWEEN(viewNode.node, leaveAnimationConfig, done);
              }
            });
          }

          viewNode.watch('class', function (value, oldValue) {
            value.forEach(function (item) {
              if (oldValue.indexOf(item) === -1) {
                var _config = config['.' + item];
                if (_config) {
                  viewNode.sequences[':class'].next(function (done) {
                    var classAnimationConfig = _config;
                    classAnimationConfig.to = {className: '+=' + item || ''};

                    if (classAnimationConfig.sequence) {
                      var animationMeta = AnimationMeta.GET(classAnimationConfig.sequence);

                      if (classAnimationConfig.group) {
                        animationMeta = animationMeta.getGroup(classAnimationConfig.group);
                      }

                      animationMeta.add(viewNode.node, classAnimationConfig, done);
                    } else {
                      AnimationMeta.CREATE_TWEEN(viewNode.node, classAnimationConfig, done);
                    }
                  });
                }
              }
            });

            oldValue.forEach(function (item) {
              if (value.indexOf(item) === -1) {
                var _config = config['.' + item];
                if (_config) {
                  viewNode.sequences[':class'].next(function (done) {
                    var classAnimationConfig = _config;
                    classAnimationConfig.to = {className: '-=' + item || ''};

                    if (classAnimationConfig.sequence) {
                      var animationMeta = AnimationMeta.GET(classAnimationConfig.sequence);

                      if (classAnimationConfig.group) {
                        animationMeta = animationMeta.getGroup(classAnimationConfig.group);
                      }

                      animationMeta.add(viewNode.node, classAnimationConfig, done);
                    } else {
                      AnimationMeta.CREATE_TWEEN(viewNode.node, classAnimationConfig, done);
                    }
                  });
                }
              }
            });
          });
        }
      });
    }
  };

  function AnimationMeta() {
    this.timeline = new TimelineLite({
      autoRemoveChildren: true
    });
    this.groups = {};
    this.queue = {};
  }

  AnimationMeta.ANIMATIONS = {};

  AnimationMeta.GET = function (name) {
    if (!AnimationMeta.ANIMATIONS[name]) {
      AnimationMeta.ANIMATIONS[name] = new AnimationMeta();
    }

    return AnimationMeta.ANIMATIONS[name];
  };

  AnimationMeta.CREATE_TWEEN = function (node, config, onComplete) {
    var to = Object.assign({}, config.to || {});
    to.onComplete = onComplete;
    var tween = null;

    if (config.from && config.to) {
      tween = TweenLite.fromTo(node,
        config.duration || 0,
        config.from || {},
        to);
    } else if (config.from) {
      var from = Object.assign({}, config.from || {});
      from.onComplete = onComplete;
      tween = TweenLite.from(node,
        config.duration || 0,
        from || {});
    } else {
      tween = TweenLite.to(node,
        config.duration || 0,
        to || {});
    }

    return tween;
  };

  AnimationMeta.prototype.getGroup = function (name) {
    if (!this.groups[name]) {
      this.groups[name] = new AnimationMeta();
    }

    if (this.timeline.getChildren().indexOf(this.groups[name].timelin) === -1) {
      this.timeline.add(this.groups[name].timeline);
    }

    return this.groups[name];
  };

  AnimationMeta.prototype.add = function (node, config, onComplete) {
    var to = Object.assign({}, config.to || {});

    var tween = null;
    // var onStart = function () {
    //   console.info(node.offsetParent);
    //   if (node.offsetParent === null) {
    //     tween.progress(1);
    //   }
    // };

    to.onComplete = onComplete;

    if (config.from && config.to) {
      tween = TweenLite.fromTo(node,
        config.duration || 0,
        config.from || {},
        to);
    } else if (config.from) {
      var from = Object.assign({}, config.from || {});
      from.onComplete = onComplete;
      tween = TweenLite.from(node,
        config.duration || 0,
        from || {});
    } else {
      tween = TweenLite.to(node,
        config.duration || 0,
        to || {});
    }

    if (this.timeline.getChildren().length > 0) {
      this.timeline.add(tween, config.position || null);
    } else {
      this.timeline.add(tween, null);
    }
  };

  /**
   *
   * @param {number} order
   * @param {callback} operation
   */
  AnimationMeta.prototype.addToQueue = function (order, node, operation) {
    if (!this.queue[order]) {
      this.queue[order] = [];
    }

    this.queue[order].push({node: node, operation: operation});
  };
})(Galaxy);

/* global Galaxy */

(function (G) {
  G.GalaxyView.NODE_SCHEMA_PROPERTY_MAP['on'] = {
    type: 'custom',
    name: 'on',
    handler: function (viewNode, attr, events, oldEvents, scopeData) {
      if (events !== null && typeof events === 'object') {
        for (var name in events) {
          if (events.hasOwnProperty(name)) {
            viewNode.node.addEventListener(name, events[name].bind(viewNode), false);
          }
        }
      }
    }
  };
})(Galaxy);

/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['checked'] = {
    type: 'reactive',
    name: 'checked'
  };

  GV.REACTIVE_BEHAVIORS['checked'] = {
    regex: /^\[\s*([^\[\]]*)\s*\]$/,
    bind: function (viewNode, nodeScopeData, matches) {
      var parts = matches[1].split('.');
      var setter = new Function('data, value', 'data.' + matches[1] + ' = value;');
      viewNode.node.addEventListener('change', function () {
        setter.call(null, GV.getPropertyContainer(nodeScopeData, parts[0]), viewNode.node.checked);
      });
    },
    onApply: function (cache, viewNode, value) {
      if (viewNode.node.checked === value) {
        return;
      }

      viewNode.node.checked = value || false;
    }
  };
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['class'] = {
    type: 'reactive',
    name: 'class'
  };

  GV.REACTIVE_BEHAVIORS['class'] = {
    regex: /^\[\s*([^\[\]]*)\s*\]$/,
    /**
     *
     * @param {Galaxy.GalaxyView.ViewNode} viewNode
     * @param scopeData
     * @param matches
     */
    bind: function (viewNode, scopeData, matches) {

    },
    onApply: function (cache, viewNode, value, oldValue, matches, scopeData) {
      if (viewNode.virtual) {
        return;
      }

      if (typeof value !== 'object' || value === null) {
        return viewNode.node.setAttribute('class', value);
      }

      var keys = Object.keys(value);
      var attributeName;
      var attributeValue;
      var clone = GV.createClone(value);

      for (var i = 0, len = keys.length; i < len; i++) {
        attributeName = keys[i];
        attributeValue = value[attributeName];

        var bindings = GV.getBindings(attributeValue);

        if (bindings.variableNamePaths) {
          viewNode.root.makeBinding(clone, scopeData, attributeName, bindings.variableNamePaths, bindings.isExpression);
        }
      }

      if (viewNode.hasOwnProperty('[reactive/class]') && clone !== viewNode['[reactive/class]']) {
        Galaxy.resetObjectTo(viewNode['[reactive/class]'], clone);
      } else if (!viewNode.hasOwnProperty('[reactive/class]')) {
        Object.defineProperty(viewNode, '[reactive/class]', {
          value: clone,
          enumerable: false
        });
      }

      viewNode.node.setAttribute('class', getClasses(clone).join(' '));
      clone.__onChange__ = toggles.bind(viewNode);
      toggles.call(viewNode, null, true, false, clone);
      viewNode.addDependedObject(clone);
    }
  };

  function toggles(key, value, oldValue, classes) {
    if (oldValue === value) return;
    var oldClasses = this.node.getAttribute('class');
    oldClasses = oldClasses ? oldClasses.split(' ') : [];
    var newClasses = getClasses(classes);
    var _this = this;

    _this.callWatchers('class', newClasses, oldClasses);
    _this.sequences[':class'].start().finish(function () {
      _this.node.setAttribute('class', newClasses.join(' '));
      _this.sequences[':class'].reset();
    });

  }

  function getClasses(obj) {
    if (typeof classes === 'string') {
      return [obj];
    } else if (obj instanceof Array) {
      return obj;
    } else if (obj !== null && typeof obj === 'object') {
      var newClasses = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key]) newClasses.push(key);
      }

      return newClasses;
    }
  }
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['content'] = {
    type: 'reactive',
    name: 'content'
  };

  GV.REACTIVE_BEHAVIORS['content'] = {
    regex: null,
    bind: function (viewNode) {
      viewNode.toTemplate();
    },
    getCache: function (viewNode) {
      return {
        module: null,
        scope: viewNode.root.scope
      };
    },
    onApply: function (cache, viewNode, selector, oldSelector, matches, scopeData) {
      if (scopeData.element.schema.children && scopeData.element.schema.hasOwnProperty('module')) {
        viewNode.domManipulationSequence.next(function (done) {
          var allContent = scopeData.element.schema.children;
          var parentViewNode = viewNode.parent;
          allContent.forEach(function (content) {
            if (selector === '*' || selector.toLowerCase() === content.node.tagName.toLowerCase()) {
              content.__node__.__viewNode__.refreshBinds(scopeData);
              parentViewNode.append(content.__node__.__viewNode__, viewNode.placeholder);
              content.__node__.__viewNode__.setInDOM(true);
            }
          });

          done();
        });
      }
    }
  };
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['$for'] = {
    type: 'reactive',
    name: '$for'
  };

  GV.REACTIVE_BEHAVIORS['$for'] = {
    regex: /^([\w]*)\s+in\s+([^\s\n]+)$/,
    bind: function (viewNode, nodeScopeData, matches) {
      viewNode.toTemplate();
      viewNode.root.makeBinding(viewNode, nodeScopeData, '$for', matches[2]);
    },
    getCache: function (viewNode, matches) {
      return {
        propName: matches[1],
        nodes: []
      };
    },
    /**
     *
     * @param cache
     * @param {Galaxy.GalaxyView.ViewNode} viewNode
     * @param changes
     * @param matches
     * @param nodeScopeData
     */
    onApply: function (cache, viewNode, changes, oldChanges, matches, nodeScopeData) {
      var parentNode = viewNode.parent;
      var position = null;
      var newItems = [];
      var action = Array.prototype.push;

      if (!changes) {
        return;
      }

      if (changes.type === 'reset') {
        cache.nodes.forEach(function (viewNode) {
          viewNode.destroy();
        });

        cache.nodes = [];
        changes = Object.assign({}, changes);
        changes.type = 'push';
      }

      if (changes.type === 'push') {
        var length = cache.nodes.length;
        if (length) {
          position = cache.nodes[length - 1].getPlaceholder().nextSibling;
        } else {
          position = viewNode.placeholder.nextSibling;
        }

        newItems = changes.params;
      } else if (changes.type === 'unshift') {
        position = cache.nodes[0] ? cache.nodes[0].placeholder : null;
        newItems = changes.params;
        action = Array.prototype.unshift;
      } else if (changes.type === 'splice') {
        var removedItems = Array.prototype.splice.apply(cache.nodes, changes.params.slice(0, 2));
        newItems = changes.params.slice(2);
        removedItems.forEach(function (node) {
          node.destroy();
        });
      } else if (changes.type === 'pop') {
        cache.nodes.pop().destroy();
      } else if (changes.type === 'shift') {
        cache.nodes.shift().destroy();
      } else if (changes.type === 'sort' || changes.type === 'reverse') {
        cache.nodes.forEach(function (viewNode) {
          viewNode.destroy();
        });

        cache.nodes = [];
        newItems = changes.original;
      }

      var valueEntity, itemDataScope = nodeScopeData;
      var p = cache.propName, n = cache.nodes, root = viewNode.root, cns;

      if (newItems instanceof Array) {
        for (var i = 0, len = newItems.length; i < len; i++) {
          valueEntity = newItems[i];
          itemDataScope = GV.createMirror(nodeScopeData);
          itemDataScope[p] = valueEntity;
          cns = viewNode.cloneSchema();
          delete cns.$for;
          var vn = root.append(cns, itemDataScope, parentNode, position);
          vn.data[p] = valueEntity;
          action.call(n, vn);
        }
      }
    }
  };
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['$if'] = {
    type: 'reactive',
    name: '$if'
  };

  GV.REACTIVE_BEHAVIORS['$if'] = {
    regex: null,
    bind: function (viewNode, nodeScopeData, matches) {
      // debugger;
    },
    onApply: function (cache, viewNode, value) {
      // console.info('apply $if', value);
      if (value) {
        viewNode.setInDOM(true);
      } else {
        viewNode.setInDOM(false);
      }
    }
  };
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['module'] = {
    type: 'reactive',
    name: 'module'
  };

  GV.REACTIVE_BEHAVIORS['module'] = {
    regex: null,
    bind: function (viewNode, nodeScopeData, matches) {
    },
    getCache: function (viewNode) {
      return {
        module: null,
        moduleMeta: null,
        scope: viewNode.root.scope
      };
    },
    onApply: function (cache, viewNode, moduleMeta) {
      if (!viewNode.virtual && moduleMeta && moduleMeta.url && moduleMeta !== cache.moduleMeta) {
        viewNode.rendered.then(function () {
          viewNode.empty().next(function (done) {
            if(cache.module) {
              cache.module.destroy();
            }

            done();

            // Check for circular module loading
            var tempURI = new Galaxy.GalaxyURI(moduleMeta.url);
            var root = viewNode.root;
            while (root.scope) {
              if (tempURI.parsedURL === root.scope.uri.paresdURL) {
                return console.error('Circular module loading detected and stopped. \n' + cache.scope.uri.paresdURL + ' tries to load itself.');
              }

              root = root.container;
            }

            cache.scope.load(moduleMeta, {
              element: viewNode
            }).then(function (module) {
              cache.module = module;
              viewNode.node.setAttribute('module', module.systemId);
              module.start();
            }).catch(function (response) {
              console.error(response);
            });
          });
        });
      } else if (!moduleMeta) {
        viewNode.empty();
      }

      cache.moduleMeta = moduleMeta;
    }
  };
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['value'] = {
    type: 'reactive',
    name: 'value'
  };

  GV.REACTIVE_BEHAVIORS['value'] = {
    regex: /^\[\s*([^\[\]]*)\s*\]$/,
    bind: function (viewNode, nodeScopeData, matches) {
      if (viewNode.node.type === 'text') {
        var parts = matches[1].split('.');
        var setter = new Function('data, value', 'data.' + matches[1] + ' = value;');
        viewNode.node.addEventListener('keyup', function () {
          setter.call(null, GV.getPropertyContainer(nodeScopeData, parts[0]), viewNode.node.value);
        });
      }
    },
    onApply: function (cache, viewNode, value) {
      if (document.activeElement === viewNode.node && viewNode.node.value === value) {
        return;
      }

      viewNode.node.value = value || '';
    }
  };
})(Galaxy.GalaxyView);

