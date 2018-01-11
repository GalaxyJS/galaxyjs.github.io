(function () {

  if (typeof window.CustomEvent === 'function') return false;

  function CustomEvent(event, params) {
    params = params || {bubbles: false, cancelable: false, detail: undefined};
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

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
'use strict';

/**
 * @exports Galaxy
 */
(function (root) {
  Array.prototype.unique = function () {
    let a = this.concat();
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j])
          a.splice(j--, 1);
      }
    }

    return a;
  };

  root.Reflect = root.Reflect || {
    deleteProperty: function (target, propertyKey) {
      delete target[propertyKey];
    }
  };

  /**
   *
   * @namespace
   */
  const Galaxy = root.Galaxy || new GalaxyCore();
  root.Galaxy = Galaxy;
  /** The main class of the GalaxyJS. window.Galaxy is an instance of this class.
   *
   * @type {GalaxyCore}
   */
  Galaxy.GalaxyCore = GalaxyCore;

  /**
   * @type Function
   */
  Galaxy.defineProp = Object.defineProperty;

  Galaxy.clone = function (obj) {
    let clone = obj instanceof Array ? [] : {};
    for (let i in obj) {
      if (typeof(obj[i]) === 'object' && obj[i] !== null)
        clone[i] = Galaxy.clone(obj[i]);
      else
        clone[i] = obj[i];
    }
    return clone;
  };

  let importedLibraries = {};

  /**
   *
   * @constructor
   */
  function GalaxyCore() {
    this.bootModule = null;
    this.modules = {};
    // this.onLoadQueue = [];
    this.moduleContents = {};
    this.addOnProviders = [];
    this.app = null;
    this.rootElement = null;
  }

  /**
   *
   * @param {Object} out
   * @returns {*|{}}
   */
  GalaxyCore.prototype.extend = function (out) {
    let result = out || {}, obj;
    for (let i = 1; i < arguments.length; i++) {
      obj = arguments[i];

      if (!obj)
        continue;

      for (let key in obj) {
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

  GalaxyCore.prototype.resetObjectTo = function (out, value) {
    if (value !== null && typeof value !== 'object') {
      return value;
    }

    if (value === null) {
      for (let k in out) {
        if (typeof out[k] === 'object') {
          out[k] = this.resetObjectTo(out[k], null);
        }
        else {
          out[k] = null;
        }
      }

      return out;
    }

    let outKeys = Object.keys(out);
    let keys = outKeys.concat(Object.keys(value)).unique();
    for (let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i];
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
   * @param {Object} bootModule
   * @param {Element} rootElement
   */
  GalaxyCore.prototype.boot = function (bootModule) {
    const _this = this;
    _this.rootElement = bootModule.element;

    bootModule.domain = this;
    bootModule.id = 'system';

    if (!bootModule.element) {
      throw new Error('element property is mandatory');
    }

    const promise = new Promise(function (resolve, reject) {
      _this.load(bootModule).then(function (module) {
        // Replace galaxy temporary  bootModule with user specified bootModule
        _this.bootModule = module;
        resolve(module);
      }).catch(function (error) {
        console.error('Something went wrong', error);
        reject();
      });
    });

    return promise;
  };

  GalaxyCore.prototype.convertToURIString = function (obj, prefix) {
    let _this = this;
    let str = [], p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        let k = prefix ? prefix + '[' + p + ']' : p, v = obj[p];
        str.push((v !== null && typeof v === 'object') ?
          _this.convertToURIString(v, k) :
          encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
    }

    return str.join('&');
  };

  GalaxyCore.prototype.load = function (module) {
    let _this = this;
    let promise = new Promise(function (resolve, reject) {
      module.id = module.id || 'noid-' + (new Date()).valueOf() + '-' + Math.round(performance.now());
      module.systemId = module.parentScope ? module.parentScope.systemId + '/' + module.id : module.id;

      // root.Galaxy.onModuleLoaded[module.systemId] = resolve;
      // var moduleExist = Galaxy.modules[module.systemId];

      let invokers = [module.url];
      if (module.invokers) {
        if (module.invokers.indexOf(module.url) !== -1) {
          throw new Error('circular dependencies: \n' + module.invokers.join('\n') + '\nwanna load: ' + module.url);
        }

        invokers = module.invokers;
        invokers.push(module.url);
      }

      // Galaxy.onLoadQueue[module.systemId] = true;
      let url = module.url + '?' + _this.convertToURIString(module.params || {});
      // var fetcher = root.Galaxy.onModuleLoaded[url];

      // fetcherContent makes sure that any module gets loaded from network only once unless fresh property is present
      let fetcherContent = Galaxy.moduleContents[url];

      if (!fetcherContent || module.fresh) {
        Galaxy.moduleContents[url] = fetcherContent = fetch(url).then(function (response) {
          if (response.status !== 200) {
            reject(response);
            return '';
          }

          return response.text();
        }).catch(reject);
      }

      // fetcherContent.then(resolve);
      fetcherContent.then(function (moduleContent) {
        // _this.moduleContents[module.systemId] = moduleContent;
        _this.compileModuleContent(module, moduleContent, invokers).then(function (compiledModule) {
          return _this.executeCompiledModule(compiledModule).then(resolve);
        });

        return moduleContent;
      }).catch(reject);
    });

    return promise;
  };
  /**
   *
   * @param {Object} moduleMetaData
   * @param moduleContent
   * @param invokers
   * @returns {Promise<Galaxy.GalaxyModule>}
   */
  GalaxyCore.prototype.compileModuleContent = function (moduleMetaData, moduleContent, invokers) {
    let _this = this;
    let promise = new Promise(function (resolve, reject) {
      let doneImporting = function (module, imports) {
        imports.splice(imports.indexOf(module.importId || module.url) - 1, 1);

        if (imports.length === 0) {
          // This will load the original initilizer
          resolve(module);
        }
      };

      let imports = [];
      // extract imports from the source code
      // removing comments cause an bug
      // let moduleContentWithoutComments = moduleContent.replace(/\/\*[\s\S]*?\*\n?\/|([^:;]|^)\n?\/\/.*\n?$/gm, '');
      moduleContent = moduleContent.replace(/Scope\.import\(['|"](.*)['|"]\)\;/gm, function (match, path) {
        let query = path.match(/([\S]+)/gm);
        imports.push({
          url: query[query.length - 1],
          fresh: query.indexOf('new') !== -1
        });

        return 'Scope.imports[\'' + query[query.length - 1] + '\']';
      });

      let scope = new Galaxy.GalaxyScope(moduleMetaData, moduleMetaData.element || _this.rootElement);
      // var view = new Galaxy.GalaxyView(scope);
      // Create module from moduleMetaData
      let module = new Galaxy.GalaxyModule(moduleMetaData, moduleContent, scope);
      Galaxy.modules[module.systemId] = module;

      if (imports.length) {
        let importsCopy = imports.slice(0);
        imports.forEach(function (item) {
          let moduleAddOnProvider = Galaxy.getModuleAddOnProvider(item.url);
          if (moduleAddOnProvider) {
            let providerStages = moduleAddOnProvider.handler.call(null, scope, module);
            let addOnInstance = providerStages.create();
            module.registerAddOn(item.url, addOnInstance);
            module.addOnProviders.push(providerStages);

            doneImporting(module, importsCopy);
          } else if (importedLibraries[item.url] && !item.fresh) {
            doneImporting(module, importsCopy);
          } else {
            const importId = item.url;
            if (item.url.indexOf('./') === 0) {
              item.url = scope.uri.path + item.url.substr(2);
            }

            Galaxy.load({
              importId: importId,
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

        return;
      }

      resolve(module);
    });

    return promise;
  };

  /**
   *
   * @param {Galaxy.GalaxyModule}  module
   */
  GalaxyCore.prototype.executeCompiledModule = function (module) {
    let promise = new Promise(function (resolve, reject) {
      for (let item in module.addOns) {
        module.scope.imports[item] = module.addOns[item];
      }

      for (let item in importedLibraries) {
        if (importedLibraries.hasOwnProperty(item)) {
          let asset = importedLibraries[item];
          if (asset.module) {
            module.scope.imports[asset.name] = asset.module;
          }
        }
      }

      let moduleSource = new Function('Scope', module.source);
      moduleSource.call(null, module.scope);

      Reflect.deleteProperty(module, 'source');

      module.addOnProviders.forEach(function (item) {
        item.finalize();
      });

      Reflect.deleteProperty(module, 'addOnProviders');

      const mId = module.importId || module.url;
      if (!importedLibraries[mId]) {
        importedLibraries[mId] = {
          name: module.name || mId,
          module: module.scope.export
        };
      } else if (module.fresh) {
        importedLibraries[mId].module = module.scope.export;
      } else {
        // module.scope.imports[module.url] = importedLibraries[module.url].module;
      }

      let currentModule = Galaxy.modules[module.systemId];
      if (module.temporary || module.scope._doNotRegister) {
        Reflect.deleteProperty(module, 'scope._doNotRegister');
        currentModule = {
          id: module.id,
          scope: module.scope
        };
      }

      currentModule.init();

      resolve(currentModule);

      // Reflect.deleteProperty(Galaxy.onLoadQueue, module.systemId);
    });

    return promise;
  };

  GalaxyCore.prototype.getModuleAddOnProvider = function (name) {
    return this.addOnProviders.filter(function (service) {
      return service.name === name;
    })[0];
  };

  GalaxyCore.prototype.getModulesByAddOnId = function (addOnId) {
    let modules = [];
    let module;

    for (let moduleId in this.modules) {
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

  GalaxyCore.prototype.registerAddOnProvider = function (name, handler) {
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
'use strict';

(function (G) {

  /**
   *
   * @type {Galaxy.GalaxyModule}
   */
  G.GalaxyModule = GalaxyModule;

  /**
   *
   * @param {Object} module
   * @param {Galaxy.GalaxyScope} scope
   * @constructor
   * @memberOf Galaxy
   */
  function GalaxyModule(module, source, scope) {
    this.id = module.id;
    this.systemId = module.systemId;
    this.source = source;
    this.url = module.url || null;
    this.importId = module.importId || module.url;
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
}(Galaxy || {}));

/* global Galaxy */
'use strict';

Galaxy.GalaxyObserver = /** @class */ (function () {
  const G = Galaxy;

  GalaxyObserver.notify = function (obj, key, value, oldValue) {
    const observers = obj.__observers__;
    const parents = obj.__parents__;

    if (observers !== undefined) {
      observers.forEach(function (observer) {
        observer.notify(key, value, oldValue);
      });
    }

    if (parents !== undefined) {
      parents.forEach(function (bp) {
        GalaxyObserver.notify(bp.host[bp.name], key, value, oldValue);
      });
    }
  };

  /**
   *
   * @param {Object} context
   * @constructor
   * @memberOf Galaxy
   */
  function GalaxyObserver(context) {
    this.context = context;
    this.subjectsActions = {};
    this.allSubjectAction = [];

    if (!this.context.hasOwnProperty('__observers__')) {
      G.defineProp(context, '__observers__', {
        value: [],
        writable: true,
        configurable: true
      });
    }

    this.context.__observers__.push(this);
  }

  GalaxyObserver.prototype.remove = function () {
    let index = this.context.__observers__.indexOf(this);
    if (index !== -1) {
      this.context.__observers__.splice(index, 1);
    }
  };

  GalaxyObserver.prototype.notify = function (key, value, oldValue) {
    const _this = this;

    if (_this.subjectsActions.hasOwnProperty(key)) {
      _this.subjectsActions[key].call(_this.context, value, oldValue);
    }

    _this.allSubjectAction.forEach(function (action) {
      action.call(_this.context, key, value, oldValue);
    });
  };

  GalaxyObserver.prototype.on = function (subject, action) {
    this.subjectsActions[subject] = action;
  };

  GalaxyObserver.prototype.onAll = function (action) {
    if (this.allSubjectAction.indexOf(action) === -1) {
      this.allSubjectAction.push(action);
    }
  };

  return GalaxyObserver;
})();

/* global Galaxy */
'use strict';

Galaxy.GalaxyURI = /**@class*/(function () {
  /**
   *
   * @param url
   * @constructor
   */
  function GalaxyURI(url) {
    let urlParser = document.createElement('a');
    urlParser.href = url;
    let myRegexp = /([^\t\n]+)\//g;
    let match = myRegexp.exec(urlParser.pathname);

    this.paresdURL = urlParser.href;
    this.path = match ? match[0] : '/';
  }

  return GalaxyURI;
})();

Galaxy.GalaxyScope = /** @class*/(function () {
  /**
   *
   * @param {Object} module
   * @param element
   * @constructor
   * @memberOf Galaxy
   */
  function GalaxyScope(module, element) {
    this.systemId = module.systemId;
    this.parentScope = module.parentScope || null;
    this.element = element || null;
    this.imports = {};
    this.uri = new Galaxy.GalaxyURI(module.url);
    this.eventHandlers = {};
    this.observers = [];
    this.on('module.destroy', this.destroy.bind(this));
  }

  GalaxyScope.prototype.destroy = function () {
    this.observers.forEach(function (observer) {
      observer.remove();
    });
  };

  GalaxyScope.prototype.load = function (moduleMeta, config) {
    let newModuleMetaData = Object.assign({}, moduleMeta, config || {});
    if (newModuleMetaData.url.indexOf('./') === 0) {
      newModuleMetaData.url = this.path + moduleMeta.url.substr(2);
    }

    newModuleMetaData.parentScope = this;
    newModuleMetaData.domain = newModuleMetaData.domain || Galaxy;
    return Galaxy.load(newModuleMetaData);
  };

  GalaxyScope.prototype.loadModuleInto = function (moduleMetaData, viewNode) {
    return this.load(moduleMetaData, {
      element: viewNode
    }).then(function (module) {
      module.start();
      return module;
    });
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

  GalaxyScope.prototype.observe = function (object) {
    let observer = new Galaxy.GalaxyObserver(object);

    this.observers.push(observer);

    return observer;
  };

  return GalaxyScope;
})();

/* global Galaxy, Promise */
'use strict';

Galaxy.GalaxySequence = /** @class */ (function () {
  const disabledProcess = function () {

  };

  /**
   *
   * @constructor
   * @memberOf Galaxy
   */
  function GalaxySequence(continues) {
    const _this = this;
    // _this.continues = continues || false;
    // _this.truncated = false;
    _this.truncateHandlers = [];
    // _this.line = null;
    // _this.firstStepResolve = null;
    _this.activeStateResolve = null;
    _this.isFinished = false;
    // _this.started = false;
    _this.processing = false;
    /** activeState is a promise that will resolve when all the sequence activities has been resolved
     *
     * @type {Promise}
     */
    _this.activeState = Promise.resolve('sequence-constructor');
    // _this.children = [];
    _this.actions = [];
    _this.resolver = Promise.resolve();

    this.reset();
  }

  GalaxySequence.prototype.start = function () {
    // if (this.started) return this;
    //
    // this.firstStepResolve('sequence-start');
    // this.started = true;
    return this;
  };

  GalaxySequence.prototype.reset = function () {
    const _this = this;
    _this.actions = [];
    _this.isFinished = false;
    _this.processing = false;
    // _this.children = [];
    //
    // _this.line = new Promise(function (resolve) {
    //   _this.firstStepResolve = resolve;
    // });
    // this.startP = _this.line;
    // this.started = false;

    this.activeState = new Promise(function (resolve) {
      _this.activeStateResolve = function () {
        _this.isFinished = true;
        _this.processing = false;
        resolve();
      };
    });

    return _this;
  };

  GalaxySequence.prototype.next = function (action) {
    const _this = this;

    // if sequence was finished, then reset the sequence
    if (_this.isFinished) {
      _this.reset();
    }

    // _this.truncated = false;
    // let promise = new Promise(function (resolve, reject) {
    //   thunk = function () {
    //     if (_this.truncated) {
    //       return reject('sequence-rejected ' + _this.actions.indexOf(promise));
    //     }
    //
    //     action.call(null, resolve, reject);
    //   };
    // });
    // let done;
    // let promise = new Promise(function (resolve, reject) {
    //   done = resolve;
    // });
    // we create an act object in order to be able to change the process on the fly
    // when this sequence is truncated, then the process of any active action should be disabled
    const act = {
      // promise: promise,
      // done: done,
      process: this.proceed,
      run: function run() {
        const local = this;
        action.call(null, function () {
          local.process.call(_this);
          // done();
        }, function (e) {
          console.error(e);
        });
      }
    };

    // const actionWrapper = o;

    // actionWrapper.proceed = this.proceed;
    // });

    // if (!this.continues) {
    //   this.children.push(promise);
    // }
    // this.actions.push(promise);

    // if (!this.continues) {
    //   this.children.push(promise);
    // }
    this.actions.push(act);

    if (!_this.processing) {
      _this.processing = true;
      _this.resolver.then(act.run.bind(act));
      // requestAnimationFrame(act.run.bind(act));
      // setTimeout(act.run.bind(act));
      // act.run();
    }

    // this.line.then(function () {
    //   if (_this.truncated) return Promise.reject();
    //   thunk();
    // }).catch(function (e) {
    //   console.error(e);
    // });
    // this.line = promise;

    // promise.then(function () {
    //   thunk();
    //   _this.actions.shift();
    //   _this.proceed();
    // }).catch(function (e) {
    //   console.error(e);
    // });

    return _this;
  };

  GalaxySequence.prototype.proceed = function (p) {
    const _this = this;
    const oldAction = _this.actions.shift();
    const firstAction = _this.actions[0];
    if (firstAction) {
      // oldAction.promise.then(function () {
      //   firstAction.run();
      // });
      _this.resolver.then(firstAction.run.bind(firstAction));
      // requestAnimationFrame(firstAction.run.bind(firstAction));
      // setTimeout(firstAction.run.bind(firstAction));
      // firstAction.run();
    } else if (oldAction) {
      // oldAction.promise.then(function () {
      //   _this.activeStateResolve();
      // });
      _this.resolver.then(_this.activeStateResolve.bind(_this));
      // _this.activeStateResolve();
      // setTimeout(_this.activeStateResolve.bind(_this));
    }
  };

  GalaxySequence.prototype.onTruncate = function (act) {
    if (this.truncateHandlers.indexOf(act) === -1) {
      this.truncateHandlers.push(act);
    }
  };

  GalaxySequence.prototype.truncate = function () {
    const _this = this;

    _this.actions.forEach(function (item) {
      item.process = disabledProcess;
    });

    let i = 0, len = this.truncateHandlers.length;
    for (; i < len; i++) {
      this.truncateHandlers[i].call(this);
    }

    this.truncateHandlers = [];
    _this.isFinished = true;
    _this.processing = false;

    return _this;
  };

  GalaxySequence.prototype.nextAction = function (action) {
    this.next(function (done) {
      action.call();
      done('sequence-action');
    });
  };

  return GalaxySequence;
})();

/* global Galaxy, Promise */
'use strict';

Galaxy.GalaxyView = /** @class */(function (G) {
  const defineProp = Object.defineProperty;
  const setAttr = Element.prototype.setAttribute;
  const removeAttr = Element.prototype.removeAttribute;
  // const worker = new Worker('galaxyjs/galaxy-web-worker.js');

  let setterAndGetter = {
    configurable: true,
    enumerable: false,
    set: null,
    get: null
  };
  let boundPropertyReference = {
    configurable: false,
    enumerable: false,
    value: null
  };

  GalaxyView.BINDING_SYNTAX_REGEX = new RegExp('^<>\\s*([^\\[\\]]*)\\s*$');
  GalaxyView.BINDING_EXPRESSION_REGEX = new RegExp('(?:["\'][\w\s]*[\'"])|([^\d\s=+\-|&%{}()<>!/]+)', 'g');

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
        const textNode = viewNode.node['[text]'];
        const textValue = typeof value === 'undefined' ? '' : value;
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
    disabled: {
      type: 'attr'
    }
  };

  GalaxyView.defineProp = defineProp;

  GalaxyView.setAttr = function (viewNode, name, value, oldValue) {
    viewNode.notifyObserver(name, value, oldValue);
    if (value) {
      setAttr.call(viewNode.node, name, value, oldValue);
    } else {
      removeAttr.call(viewNode.node, name);
    }
  };

  GalaxyView.cleanProperty = function (obj, key) {
    delete obj[key];
  };

  GalaxyView.createMirror = function (obj, newProp) {
    let result = {};

    defineProp(result, '__parent__', {
      enumerable: false,
      value: obj
    });

    return result;
  };

  GalaxyView.createClone = function (source) {
    let cloned = Object.assign({}, source);

    GalaxyView.link(source, cloned);

    return cloned;
  };

  GalaxyView.link = function (from, to) {
    for (let key in from) {
      if (from.hasOwnProperty('<>' + key)) {
        boundPropertyReference.value = from['<>' + key];
        defineProp(to, '<>' + key, boundPropertyReference);
        defineProp(to, key, Object.getOwnPropertyDescriptor(from, key));
      }
    }
  };

  GalaxyView.getPropertyContainer = function (data, propertyName) {
    let container = data;
    let tempData = data.hasOwnProperty(propertyName);

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
    let item, viewNodes = [];

    const childNodes = Array.prototype.slice(node.childNodes, 0);
    for (let i = 0, len = childNodes.length; i < len; i++) {
      item = node.childNodes[i];

      if (item['__viewNode__'] !== undefined) {
        viewNodes.push(item.__viewNode__);
      }

      viewNodes = viewNodes.concat(GalaxyView.getAllViewNodes(item));
    }

    return viewNodes.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
  };

  GalaxyView.getBoundProperties = function (host) {
    let all = Object.getOwnPropertyNames(host);
    let visible = Object.keys(host);
    let properties = [];

    all.forEach(function (key) {
      if (host[key] instanceof GalaxyView.BoundProperty && visible.indexOf(key) === -1) {
        properties.push(host[key]);
      }
    });

    return properties;
  };

  GalaxyView.getBindings = function (value) {
    let variableNamePaths = null;
    let isExpression = false;
    let type = typeof(value);

    if (type === 'string') {
      variableNamePaths = value.match(GalaxyView.BINDING_SYNTAX_REGEX);
      variableNamePaths = variableNamePaths ? variableNamePaths[1] : null;

      if (/^\s*{\s*(.*)\s*}\s*/g.test(value)) {
        variableNamePaths = [];

        let match = null;
        const args = [];
        let functionBody = value.match(/\s*{\s*(.*)\s*}\s*/)[1];
        value = value.replace(/["'](.*["'])/g, '');
        while ((match = GalaxyView.BINDING_EXPRESSION_REGEX.exec(value)) !== null) {
          variableNamePaths.push(match[1]);
          args.push(match[1].replace(/\./g, '_'));
        }

        functionBody = functionBody.replace(variableNamePaths, args);

        isExpression = true;
        variableNamePaths.push(new Function(args.join(','), 'return ' + functionBody + ';'));
      }
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

  GalaxyView.propertyLookup = function (data, property) {
    property = property.split('.')[0];
    let original = data;
    let target = data;
    let temp = data;
    // var nestingLevel = 0;
    if (data[property] === undefined) {
      while (temp.__parent__) {
        if (temp.__parent__.hasOwnProperty(property)) {
          target = temp.__parent__;
          break;
        }

        // if (nestingLevel++ >= 1000) {
        //   throw console.error('Maximum nested property lookup has reached `' + property + '`', data);
        // }

        temp = temp.__parent__;
      }

      // if the property is not found in the parents then return the original object as the context
      if (target[property] === undefined) {
        return original;
      }
    }

    return target;
  };

  GalaxyView.exactPropertyLookup = function (data, property) {
    const properties = property.split('.');
    let target = data;
    properties.forEach(function (p) {
      target = GalaxyView.propertyLookup(target, p)[p];
    });

    return target;
  };

  /**
   *
   * @param dataObject
   * @param {string} propertyName
   * @param {string} referenceName
   * @param {boolean} enumerable
   * @param childProperty
   * @param initValue
   * @param {boolean} useLocalScope
   * @returns {Galaxy.GalaxyView.BoundProperty}
   */
  GalaxyView.createBoundProperty = function (dataObject, propertyName, useLocalScope, referenceName, enumerable, childProperty, initValue) {
    let boundProperty = new GalaxyView.BoundProperty(dataObject, useLocalScope ? 'this.' + propertyName : propertyName, initValue);
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
          if (newValue && typeof boundProperty.value === 'object') {
            let all = Object.getOwnPropertyNames(boundProperty.value);
            let visible = Object.keys(boundProperty.value);
            let newVisible = Object.keys(newValue);
            let descriptors = {};
            let hidden = all.filter(function (key) {
              descriptors[key] = Object.getOwnPropertyDescriptor(boundProperty.value || {}, key);
              return visible.indexOf(key) === -1;
            });

            newVisible.forEach(function (key) {
              if (hidden.indexOf('<>' + key) !== -1) {
                descriptors['<>' + key].value.setValue(newValue[key], dataObject);

                defineProp(newValue, '<>' + key, descriptors['<>' + key]);
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

  GalaxyView.EXPRESSION_ARGS_FUNC_CACHE = {};

  GalaxyView.createExpressionArgumentsProvider = function (variables) {
    const id = variables.join();

    if (GalaxyView.EXPRESSION_ARGS_FUNC_CACHE[id]) {
      return GalaxyView.EXPRESSION_ARGS_FUNC_CACHE[id];
    }

    let functionContent = 'return [';

    let middle = '';
    for (let i = 0, len = variables.length; i < len; i++) {
      middle += 'prop(scope, "' + variables[i] + '").' + variables[i] + ',';
    }

    // Take care of variables that contain square brackets like '[variable_name]'
    // for the convenience of the programmer

    // middle = middle.substring(0, middle.length - 1).replace(/<>/g, '');
    functionContent += middle.substring(0, middle.length - 1) + ']';

    const func = new Function('prop, scope', functionContent);
    GalaxyView.EXPRESSION_ARGS_FUNC_CACHE[id] = func;

    return func;
  };

  GalaxyView.createExpressionFunction = function (host, handler, variables, scope, on) {
    let getExpressionArguments = Galaxy.GalaxyView.createExpressionArgumentsProvider(variables);

    return function () {
      let args = getExpressionArguments.call(host, Galaxy.GalaxyView.propertyLookup, scope);
      return handler.apply(host, args);
    };
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode | Object} target
   * @param {Object} dataHostObject
   * @param {String} targetKeyName
   * @param {string|Array<string>} variableNamePaths
   */
  GalaxyView.makeBinding = function (target, data, targetKeyName, variableNamePaths, expression, expressionArgumentsCount) {
    if (typeof data !== 'object') {
      return;
    }

    let dataObject = data;
    let variables = variableNamePaths instanceof Array ? variableNamePaths : [variableNamePaths];

    // expression === true means that a expression function is available and should be extracted
    if (expression === true) {
      let handler = variables[variables.length - 1];
      variables = variables.slice(0, variables.length - 1);
      expressionArgumentsCount = variables.length;
      variables = variables.map(function (name) {
        return name.replace(/<>/g, '');
      });

      // \{\s*(.*)\s*\}
      // ((\w+)[\w\.]*)

      // Generate expression arguments
      try {
        expression = Galaxy.GalaxyView.createExpressionFunction(target, handler, variables, dataObject, targetKeyName);
      }
      catch (exception) {
        throw console.error(exception.message + '\n', variables);
      }
    } else if (!expression) {
      expressionArgumentsCount = 1;
    }

    let variableNamePath = null;
    let propertyName = null;
    let childProperty = null;
    let initValue = null;
    let useLocalScope = false;

    for (let i = 0, len = variables.length; i < len; i++) {
      variableNamePath = variables[i];
      propertyName = variableNamePath;
      childProperty = null;
      useLocalScope = false;

      let variableName = variableNamePath.split('.');
      if (variableName.length > 1) {
        propertyName = variableName.shift();
        childProperty = variableName.join('.');
      }

      if (i === 0 && propertyName === 'this') {
        i++;
        propertyName = variableName.shift();
        childProperty = null;
        useLocalScope = true;
        dataObject = GalaxyView.propertyLookup(target.data, propertyName);
      } else {
        dataObject = GalaxyView.propertyLookup(data, propertyName);
      }

      initValue = dataObject[propertyName];

      let enumerable = true;
      if (propertyName === 'length' && dataObject instanceof Array) {
        propertyName = '_length';
        enumerable = false;
      }

      const referenceName = '<>' + propertyName;
      let boundProperty = dataObject[referenceName];

      if (typeof boundProperty === 'undefined') {
        boundProperty = GalaxyView.createBoundProperty(dataObject, propertyName, useLocalScope, referenceName, enumerable, childProperty, initValue);
      }

      // if (dataObject['__lists__'] !== undefined) {
      //   boundProperty.lists = dataObject['__lists__'];
      // }
      // When target is not a ViewNode, then add target['[targetKeyName]']
      if (!(target instanceof Galaxy.GalaxyView.ViewNode) && !childProperty && !target.hasOwnProperty('<>' + targetKeyName)) {
        boundPropertyReference.value = boundProperty;
        // Create a BoundProperty for targetKeyName if the value is an expression
        // the expression it self will be treated as a BoundProperty
        if (expression) {
          boundPropertyReference.value = GalaxyView.createBoundProperty({}, targetKeyName, false, '<>' + targetKeyName, false, null, null);
        }
        // console.info(boundPropertyReference.value,referenceName );
        // Otherwise the data is going to be bound through alias.
        // In other word, [targetKeyName] will refer to original BoundProperty.
        // This will make sure that there is always one BoundProperty for each data entry
        defineProp(target, '<>' + targetKeyName, boundPropertyReference);

        setterAndGetter.enumerable = enumerable;
        setterAndGetter.get = (function (_boundProperty, _expression) {
          // If there is an expression for the property, then apply it on get because target is not ViewNode
          // and can not have any setter for its properties
          if (_expression) {
            return function () {
              return _expression();
            };
          }

          return function () {
            return _boundProperty.value;
          };
        })(boundPropertyReference.value, expression);

        setterAndGetter.set = (function (BOUND_PROPERTY, DATA) {
          return function (value) {
            BOUND_PROPERTY.setValue(value, DATA);
          };
        })(boundPropertyReference.value, dataObject);

        defineProp(target, targetKeyName, setterAndGetter);
      }

      if (!childProperty) {
        boundProperty.addNode(target, targetKeyName, expression);
      }

      if (childProperty !== null) {
        GalaxyView.makeBinding(target, dataObject[propertyName] || {}, targetKeyName, childProperty, expression, expressionArgumentsCount);
      }
      // Call init value only on the last variable binding,
      // so the expression with multiple arguments get called only once
      else if (typeof dataObject === 'object' && expressionArgumentsCount === 1) {
        boundProperty.initValueFor(target, targetKeyName, initValue, dataObject);
      }
      expressionArgumentsCount--;
    }
  };

  /**
   *
   * @param subjects
   * @param data
   * @param cloneSubject
   * @returns {*}
   */
  GalaxyView.bindSubjectsToData = function (subjects, data, cloneSubject) {
    let keys = Object.keys(subjects);
    let attributeName;
    let attributeValue;
    let subjectsClone = cloneSubject ? GalaxyView.createClone(subjects) : subjects;

    for (let i = 0, len = keys.length; i < len; i++) {
      attributeName = keys[i];
      attributeValue = subjects[attributeName];

      let bindings = GalaxyView.getBindings(attributeValue);

      if (bindings.variableNamePaths) {
        GalaxyView.makeBinding(subjectsClone, data, attributeName, bindings.variableNamePaths, bindings.isExpression);
      }

      if (attributeValue && typeof attributeValue === 'object' && !(attributeValue instanceof Array)) {
        GalaxyView.bindSubjectsToData(attributeValue, data);
      }
    }

    return subjectsClone;
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param property
   * @returns {Function}
   */
  GalaxyView.createPropertySetter = function (node, property) {
    return function (value, oldValue) {
      if (value instanceof Promise) {
        let asyncCall = function (asyncValue) {
          let newValue = property.parser ? property.parser(asyncValue) : asyncValue;
          node.node[property.name] = newValue;
          node.notifyObserver(property.name, newValue, oldValue);
        };
        value.then(asyncCall).catch(asyncCall);
      } else {
        const newValue = property.parser ? property.parser(value) : value;
        node.node[property.name] = newValue;
        node.notifyObserver(property.name, newValue, oldValue);
      }
    };
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param {string} attributeName
   * @param property
   * @returns {Function}
   */
  GalaxyView.createCustomSetter = function (node, attributeName, property) {
    return function (value, oldValue, scopeData) {
      if (value instanceof Promise) {
        let asyncCall = function (asyncValue) {
          property.handler(node, attributeName, asyncValue, oldValue, scopeData);
        };
        value.then(asyncCall).catch(asyncCall);
      } else {
        property.handler(node, attributeName, value, oldValue, scopeData);
      }
    };
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param {string} attributeName
   * @param {Function} parser
   * @returns {Function}
   */
  GalaxyView.createDefaultSetter = function (node, attributeName, parser) {
    return function (value, oldValue) {
      // console.info(value, oldValue);
      if (value instanceof Promise) {
        const asyncCall = function (asyncValue) {
          const newValue = parser ? parser(asyncValue) : asyncValue;
          // node.data['_' + attributeName] = newValue;
          GalaxyView.setAttr(node, attributeName, newValue, oldValue);
        };
        value.then(asyncCall).catch(asyncCall);
      } else {
        const newValue = parser ? parser(value) : value;
        // node.data['_' + attributeName] = newValue;
        GalaxyView.setAttr(node, attributeName, newValue, oldValue);
      }
    };
  };

  /**
   *
   * @param {Array} value
   * @param {Function} onUpdate
   * @returns {{original: *, type: string, params: *}}
   */
  GalaxyView.createActiveArray = function (value, onUpdate) {
    let changes = {
      original: value,
      type: 'push',
      params: value
    };

    let oldChanges = Object.assign({}, changes);

    if (value['live']) {
      return changes;
    }

    let arrayProto = Array.prototype;
    let methods = [
      'push',
      'pop',
      'shift',
      'unshift',
      'splice',
      'sort',
      'reverse'
    ];
    let arr = value;
    let i = 0;
    let args;

    boundPropertyReference.value = true;
    defineProp(value, 'live', boundPropertyReference);

    methods.forEach(function (method) {
      let original = arrayProto[method];
      Object.defineProperty(value, method, {
        value: function () {
          i = arguments.length;
          args = new Array(i);
          while (i--) {
            args[i] = arguments[i];
          }

          let result = original.apply(this, args);

          if (typeof arr._length !== 'undefined') {
            arr._length = arr.length;
          }

          changes.type = method;
          changes.params = args;
          changes.result = result;

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

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param {string} key
   * @param scopeData
   */
  GalaxyView.addReactiveBehavior = function (node, key, scopeData) {
    let behavior = GalaxyView.REACTIVE_BEHAVIORS[key];
    let bindTo = node.schema[key];

    if (behavior) {
      let matches = behavior.regex ? (typeof(bindTo) === 'string' ? bindTo.match(behavior.regex) : bindTo) : bindTo;

      node.behaviors[key] = (function (_behavior, _matches, _scopeData) {
        let _cache = {};
        if (_behavior.getCache) {
          _cache = _behavior.getCache.call(node, _matches, _scopeData);
        }

        return function (vn, value, oldValue, expression) {
          return _behavior.onApply.call(vn, _cache, value, oldValue, _scopeData, expression);
        };
      })(behavior, matches, scopeData);

      behavior.bind.call(node, scopeData, matches);
    }
  };

  GalaxyView.PROPERTY_SETTERS = {
    'prop': function (viewNode, property, expression) {
      const setter = GalaxyView.createPropertySetter(viewNode, property);

      if (expression) {
        return function (none, oldValue) {
          let expressionValue = expression(none);
          setter(expressionValue, oldValue);
        };
      }

      return setter;
    },
    'reactive': function (viewNode, property, expression) {
      const reactiveFunction = viewNode.behaviors[property.name];

      if (!reactiveFunction) {
        console.error('Reactive handler not found for: ' + property.name);
      }

      return function (value, oldValue) {
        reactiveFunction(viewNode, value, oldValue, expression);
      };
    },
    'custom': function (viewNode, property, expression, attributeName) {
      const setter = GalaxyView.createCustomSetter(viewNode, attributeName, property);

      if (expression) {
        return function (none, oldValue, scopeData) {
          let expressionValue = expression(none);
          setter(expressionValue, oldValue, scopeData);
        };
      }

      return setter;
    },
    'attr': function (viewNode, property, expression, attributeName) {
      let parser = property.parser;
      const setter = GalaxyView.createDefaultSetter(viewNode, attributeName, parser);
      if (expression) {
        return function (none, oldValue) {
          let expressionValue = expression(none);
          setter(expressionValue, oldValue);
        };
      }

      return setter;
    }
  };

  GalaxyView.getPropertySetter = function (viewNode, attributeName, expression) {
    let property = GalaxyView.NODE_SCHEMA_PROPERTY_MAP[attributeName];

    if (!property) {
      // return function (value) {
      //   setAttr.call(viewNode.node, attributeName, value);
      // };
      property = {
        type: 'attr'
      };
    }

    // expressing for reactive property should be handled by that property handler
    // if viewNode is virtual, then the expression should be ignored
    if (property.type !== 'reactive' && viewNode.virtual) {
      // return console.info('virtual node, attr: ', attributeName, property.name);
      return function () {

      };
    }

    return GalaxyView.PROPERTY_SETTERS[property.type](viewNode, property, expression, attributeName);
  };

  GalaxyView.setPropertyForNode = function (viewNode, attributeName, value, scopeData) {
    const property = GalaxyView.NODE_SCHEMA_PROPERTY_MAP[attributeName] || {type: 'attr'};
    // let newValue = value;
    let parser = property.parser;
    // worker.postMessage({viewNode: viewNode});

    switch (property.type) {
      case 'attr':
        // GalaxyView.createDefaultSetter(viewNode, attributeName, property.parser)(newValue, null);
        if (value instanceof Promise) {
          const asyncCall = function (asyncValue) {
            const newValue = parser ? parser(asyncValue) : asyncValue;
            GalaxyView.setAttr(viewNode, attributeName, newValue, null);
          };
          value.then(asyncCall).catch(asyncCall);
        } else {
          const newValue = parser ? parser(value) : value;
          GalaxyView.setAttr(viewNode, attributeName, newValue, null);
        }
        break;

      case 'prop':
        GalaxyView.createPropertySetter(viewNode, property)(value, null);
        break;

      case 'reactive':
        viewNode.behaviors[property.name](viewNode, value, null);
        break;

      case 'event':
        viewNode.node.addEventListener(attributeName, value.bind(viewNode), false);
        break;

      case 'custom':
        GalaxyView.createCustomSetter(viewNode, attributeName, property)(value, null, scopeData);
        break;
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} parent
   * @param {Object} scopeData
   * @param {Object} nodeSchema
   * @param position
   * @param {Array} domManipulationBus
   * @param {null|Object} localScope
   */
  GalaxyView.createNode = function (parent, scopeData, nodeSchema, position, localScope) {
    let i = 0, len = 0;

    if (nodeSchema instanceof Array) {
      for (i = 0, len = nodeSchema.length; i < len; i++) {
        GalaxyView.createNode(parent, scopeData, nodeSchema[i], null);
      }
    } else if (nodeSchema !== null && typeof(nodeSchema) === 'object') {
      let viewNode = new GalaxyView.ViewNode(null, nodeSchema, null, localScope);
      // viewNode.domManipulationBus = parent.domManipulationBus;
      parent.registerChild(viewNode, position);

      if (nodeSchema['mutator']) {
        viewNode.mutator = nodeSchema['mutator'];
      }

      let keys = Object.keys(nodeSchema);
      let attributeValue, attributeName;

      // Definition stage
      for (i = 0, len = keys.length; i < len; i++) {
        attributeName = keys[i];
        if (GalaxyView.REACTIVE_BEHAVIORS[attributeName]) {
          GalaxyView.addReactiveBehavior(viewNode, attributeName, scopeData);
        }
      }

      // Value assignment stage
      for (i = 0, len = keys.length; i < len; i++) {
        attributeName = keys[i];
        attributeValue = nodeSchema[attributeName];

        let bindings = GalaxyView.getBindings(attributeValue);

        if (bindings.variableNamePaths) {
          GalaxyView.makeBinding(viewNode, scopeData, attributeName, bindings.variableNamePaths, bindings.isExpression);
        } else {
          GalaxyView.setPropertyForNode(viewNode, attributeName, attributeValue, scopeData);
        }
      }

      if (!viewNode.virtual) {
        GalaxyView.createNode(viewNode, scopeData, nodeSchema.children, null);
        viewNode.callLifecycleEvent('postInit');

        if (viewNode.inDOM) {
          viewNode.setInDOM(true);
        }
      } else {
        viewNode.callLifecycleEvent('postInit');
      }

      // viewNode.onReady promise will be resolved after all the dom manipulations are done
      // this make sure that the viewNode and its child elements are rendered
      // setTimeout(function () {
      viewNode.sequences.enter.nextAction(function () {
        // viewNode.domBus = [];
        viewNode.ready();
      });
      // });

      // viewNode.domManipulationBus.push(viewNode.domManipulationSequence.line);
      // parent.addToDOMBus(viewNode.domManipulationSequence.activeState);

      return viewNode;
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyScope} scope
   * @constructor
   * @memberOf Galaxy
   */
  function GalaxyView(scope) {
    const _this = this;
    _this.scope = scope;
    _this.dataRepos = {};

    if (scope.element instanceof GalaxyView.ViewNode) {
      _this.container = scope.element;
    } else {
      scope.element.innerHTML = '';
      _this.container = new GalaxyView.ViewNode(null, {
        tag: scope.element.tagName
      }, scope.element);

      // _this.container.domManipulationSequence.nextAction(function () {
      //   _this.container.ready();
      // });

      _this.container.sequences.enter.nextAction(function () {
        _this.container.ready();
      });
    }

    _this.renderingFlow = this.container.renderingFlow;
    // _this.domManipulationSequence = this.container.domManipulationSequence;
  }

  GalaxyView.prototype.setupRepos = function (repos) {
    this.dataRepos = repos;
  };

  GalaxyView.prototype.init = function (schema) {
    const _this = this;

    _this.container.renderingFlow.next(function (next) {
      GalaxyView.createNode(_this.container, _this.scope, schema, null);

      _this.container.sequences.enter.nextAction(function () {
        // debugger;
        next();
      });
      // setTimeout(function () {
      //   Promise.all(_this.container.domBus).then(function () {
      //     _this.container.domBus = [];
      //     next();
      //   });
      // });
    });
  };

  return GalaxyView;
}(Galaxy || {}));

/* global Galaxy */

Galaxy.GalaxyView.BoundProperty = /** @class */ (function () {
  const GV = Galaxy.GalaxyView;
  /**
   *
   * @param {Array} parent
   * @param {Galaxy.GalaxyView.BoundProperty} bp
   */
  BoundProperty.installParentFor = function (parent, bp) {
    let i = 0, len = parent.length, item, itemParent;
    for (; i < len; i++) {
      item = parent[i];
      itemParent = item['__parents__'];

      if (itemParent === undefined) {
        GV.defineProp(item, '__parents__', {
          configurable: false,
          enumerable: false,
          value: [bp]
        });
      } else if (itemParent.indexOf(bp) === -1) {
        itemParent.push(bp);
      }
    }
  };

  /**
   *
   * @param {Array} list
   * @param {Galaxy.GalaxyView.BoundProperty} bp
   */
  BoundProperty.uninstallParentFor = function (list, bp) {
    list.forEach(function (item) {
      if (item['__parents__'] !== undefined) {
        let i = item['__parents__'].indexOf(bp);
        if (i !== -1) {
          item['__parents__'].splice(i, 1);
        }
      }
    });
  };

  /**
   *
   * @param {Object} host
   * @param {string} name
   * @param {*} value
   * @constructor
   * @memberOf Galaxy.GalaxyView
   */
  function BoundProperty(host, name, value) {
    this.host = host;
    this.name = name;
    this.value = value;
    this.props = [];
    /**
     *
     * @type {Array<Galaxy.GalaxyView.ViewNode|Object>}
     */
    this.nodes = [];
  }

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param {string} attributeName
   * @param {Function} expression
   * @public
   */
  BoundProperty.prototype.addNode = function (node, attributeName, expression) {
    let index = this.nodes.indexOf(node);
    // Check if the node with the same property already exist
    // Insure that same node with different property bind can exist
    if (index === -1 || this.props[index] !== attributeName) {
      if (node instanceof Galaxy.GalaxyView.ViewNode) {
        node.installPropertySetter(this, attributeName, expression);
      }

      this.props.push(attributeName);
      this.nodes.push(node);
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   */
  BoundProperty.prototype.removeNode = function (node) {
    let nodeIndexInTheHost;
    while ((nodeIndexInTheHost = this.nodes.indexOf(node)) !== -1) {
      this.nodes.splice(nodeIndexInTheHost, 1);
      this.props.splice(nodeIndexInTheHost, 1);
    }
  };

  BoundProperty.prototype.initValueFor = function (target, key, value, scopeData) {
    const _this = this;
    let oldValue = _this.value;
    _this.value = value;
    if (value instanceof Array) {
      BoundProperty.installParentFor(value, _this);
      let init = GV.createActiveArray(value, this.updateValue.bind(this));

      if (target instanceof GV.ViewNode) {
        _this.setUpdateFor(target, key, init);
      }
    } else {
      _this.setValueFor(target, key, value, oldValue, scopeData);
    }
  };

  BoundProperty.prototype.setValue = function (value, scopeData) {
    if (value === this.value) {
      return;
    }

    let oldValue = this.value;
    this.value = value;
    if (value instanceof Array) {
      let change = GV.createActiveArray(value, this.updateValue.bind(this));
      change.type = 'reset';
      change.result = oldValue;
      this.updateValue(change, {original: oldValue});
      Galaxy.GalaxyObserver.notify(this.host, this.name, change, oldValue);
    } else {
      for (let i = 0, len = this.nodes.length; i < len; i++) {
        this.setValueFor(this.nodes[i], this.props[i], value, oldValue, scopeData);
      }
      Galaxy.GalaxyObserver.notify(this.host, this.name, value, oldValue);

      if (this.host['__parents__'] !== undefined) {
        this.host['__parents__'].forEach(function (con) {
          con.updateValue();
        });
      }
    }

  };

  BoundProperty.prototype.updateValue = function (changes, oldChanges) {
    if (changes) {
      if (changes.type === 'push' || changes.type === 'reset' || changes.type === 'unshift') {
        BoundProperty.installParentFor(changes.params, this);
      } else if (changes.type === 'shift' || changes.type === 'pop') {
        BoundProperty.uninstallParentFor([changes.result], this);
      } else if (changes.type === 'splice' || changes.type === 'reset') {
        BoundProperty.uninstallParentFor(changes.result, this);
      }
    }

    for (let i = 0, len = this.nodes.length; i < len; i++) {
      this.setUpdateFor(this.nodes[i], this.props[i], changes, oldChanges);
    }
  };

  /**
   *
   * @param {(Galaxy.GalaxyView.ViewNode|Object)} host
   * @param {string} attributeName
   * @param value
   * @param oldValue
   * @param scopeData
   */
  BoundProperty.prototype.setValueFor = function (host, attributeName, value, oldValue, scopeData) {
    if (host instanceof Galaxy.GalaxyView.ViewNode) {
      if (!host.setters[attributeName]) {
        return console.info(host, attributeName, value);
      }

      host.setters[attributeName](value, oldValue, scopeData);
    } else {
      host[attributeName] = value;
      Galaxy.GalaxyObserver.notify(host, attributeName, value, oldValue);
    }
  };

  /**
   *
   * @param {(Galaxy.GalaxyView.ViewNode|Object)} host
   * @param {string} attributeName
   * @param {*} changes
   * @param {*} oldChanges
   */
  BoundProperty.prototype.setUpdateFor = function (host, attributeName, changes, oldChanges) {
    if (host instanceof Galaxy.GalaxyView.ViewNode) {
      host.setters[attributeName](changes);
    } else {
      Galaxy.GalaxyObserver.notify(host, attributeName, changes, oldChanges);
    }
  };

  return BoundProperty;

})();

/* global Galaxy, Promise */
'use strict';

Galaxy.GalaxyView.ViewNode = /** @class */ (function (GV) {
  function createElem(t) {
    return document.createElement(t);
  }

  let commentNode = document.createComment('');

  function createComment(t) {
    return commentNode.cloneNode(t);
  }

  function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild(node, child) {
    node.removeChild(child);
  }

  let referenceToThis = {
    value: this,
    configurable: false,
    enumerable: false
  };

  let __node__ = {
    value: null,
    configurable: false,
    enumerable: false
  };

  GV.NODE_SCHEMA_PROPERTY_MAP['node'] = {
    type: 'attr'
  };

  GV.NODE_SCHEMA_PROPERTY_MAP['lifecycle'] = {
    type: 'prop',
    name: 'lifecycle'
  };

  GV.NODE_SCHEMA_PROPERTY_MAP['renderConfig'] = {
    type: 'prop',
    name: 'renderConfig'
  };

  ViewNode.cleanReferenceNode = function (schemas) {
    if (schemas instanceof Array) {
      schemas.forEach(function (node) {
        ViewNode.cleanReferenceNode(node);
      });
    } else if (schemas) {
      schemas.__node__ = null;
      ViewNode.cleanReferenceNode(schemas.children);
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param {Array} toBeRemoved
   * @param {Galaxy.GalaxySequence} sequence
   * @memberOf Galaxy.GalaxyView.ViewNode
   * @static
   */
  ViewNode.destroyNodes = function (node, toBeRemoved, sequence) {
    // node.domBus = node.parent.domBus;
    let remove = null;

    for (let i = 0, len = toBeRemoved.length; i < len; i++) {
      remove = toBeRemoved[i];
      // remove.domManipulationSequence.truncate();
      remove.renderingFlow.truncate();
      remove.destroy(sequence);
      // console.info(remove.node);
      // node.addToDOMBus(remove.domManipulationSequence.activeState);
    }

    // setTimeout(function () {
    //   Promise.all(node.parent.domBus).then(function () {
    //     node.parent.domBus = [];
    //     node.domBus = [];
    //   });
    // });
  };

  /**
   *
   * @param {Galaxy.GalaxyView} root
   * @param {Node|Element} node
   * @param schema
   * @param {null|Object} localScope
   * @constructor
   * @memberOf Galaxy.GalaxyView
   */
  function ViewNode(root, schema, node) {
    // this.root = root;
    this.node = node || createElem(schema.tag || 'div');
    this.schema = schema;
    this.data = {};
    this.addons = {};
    this.inputs = {};
    // this.localScope = {};
    this.virtual = false;
    this.placeholder = createComment(schema.tag || 'div');
    this.properties = {};
    this.behaviors = {};
    this.inDOM = typeof schema.inDOM === 'undefined' ? true : schema.inDOM;
    this.setters = {};
    this.parent = null;
    this.dependedObjects = [];
    // this.domBus = [];
    this.renderingFlow = new Galaxy.GalaxySequence();
    // this.domManipulationSequence = new Galaxy.GalaxySequence();
    this.sequences = {
      enter: new Galaxy.GalaxySequence(),
      leave: new Galaxy.GalaxySequence(),
      ':destroy': new Galaxy.GalaxySequence(true),
      ':class': new Galaxy.GalaxySequence().start()
    };
    this.observer = new Galaxy.GalaxyObserver(this);
    this.origin = false;

    let _this = this;
    this.rendered = new Promise(function (ready) {
      _this.ready = ready;
      _this.callLifecycleEvent('rendered');
    });

    __node__.value = this.node;
    GV.defineProp(this.schema, '__node__', __node__);

    referenceToThis.value = this;
    GV.defineProp(this.node, '__viewNode__', referenceToThis);
    GV.defineProp(this.placeholder, '__viewNode__', referenceToThis);

    this.callLifecycleEvent('postCreate');
  }

  /**
   *
   * @param {string} id event id
   */
  ViewNode.prototype.callLifecycleEvent = function (id) {
    if (this.schema.lifecycle && typeof this.schema.lifecycle[id] === 'function') {
      this.schema.lifecycle[id].call(this, this.inputs, this.data, this.sequences);
    }
  };

  ViewNode.prototype.broadcast = function (event) {
    this.node.dispatchEvent(event);
  };

  ViewNode.prototype.cloneSchema = function () {
    let schemaClone = Object.assign({}, this.schema);
    ViewNode.cleanReferenceNode(schemaClone);

    GV.defineProp(schemaClone, 'mother', {
      value: this.schema,
      writable: false,
      enumerable: false,
      configurable: false
    });

    return schemaClone;
  };

  ViewNode.prototype.toTemplate = function () {
    this.placeholder.nodeValue = JSON.stringify(this.schema, null, 2);
    this.virtual = true;
    this.setInDOM(false);
  };

  ViewNode.prototype.populateEnterSequence = function (sequence) {
    this.node.style.visibility = '';
  };

  ViewNode.prototype.populateLeaveSequence = function (sequence) {

  };

  ViewNode.prototype.setInDOM = function (flag) {
    let _this = this;
    _this.inDOM = flag;

    // We use domManipulationSequence to make sure dom manipulation activities happen in order and don't interfere
    if (flag /*&& !_this.node.parentNode*/ && !_this.virtual) {
      _this.sequences.leave.truncate();
      _this.callLifecycleEvent('preInsert');

      _this.sequences.enter.nextAction(function () {
        if (!_this.node.parentNode) {
          insertBefore(_this.placeholder.parentNode, _this.node, _this.placeholder.nextSibling);
        }

        if (_this.placeholder.parentNode) {
          removeChild(_this.placeholder.parentNode, _this.placeholder);
        }

        _this.callLifecycleEvent('postInsert');
      });

      let animationDone;
      const waitForNodeAnimation = new Promise(function (resolve) {
        animationDone = resolve;
      });

      _this.parent.sequences.enter.next(function (next) {
        waitForNodeAnimation.then(next);
      });

      _this.populateEnterSequence(_this.sequences.enter);
      // Go to next dom manipulation step when the whole :enter sequence is done
      _this.sequences.enter.nextAction(function () {
        animationDone();
      });
    } else if (!flag && _this.node.parentNode) {
      _this.sequences.enter.truncate();
      _this.callLifecycleEvent('preRemove');

      _this.origin = true;

      let animationDone;
      const waitForNodeAnimation = new Promise(function (resolve) {
        animationDone = resolve;
      });

      _this.parent.sequences.leave.next(function (next) {
        waitForNodeAnimation.then(next);
      });

      _this.populateLeaveSequence(_this.sequences.leave);
      // Start the :leave sequence and go to next dom manipulation step when the whole sequence is done
      _this.sequences.leave.nextAction(function () {
        if (!_this.placeholder.parentNode) {
          insertBefore(_this.node.parentNode, _this.placeholder, _this.node);
        }

        if (_this.node.parentNode) {
          removeChild(_this.node.parentNode, _this.node);
        }

        _this.origin = false;
        _this.callLifecycleEvent('postRemove');
        animationDone();
      });
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} viewNode
   * @param position
   */
  ViewNode.prototype.registerChild = function (viewNode, position) {
    const _this = this;
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
    // This cause memory leak for expressions
    let exist = this.properties[boundProperty.name];
    if (exist) {
      if (exist.indexOf(boundProperty) === -1) {
        exist.push(boundProperty);
      }
    } else {
      this.properties[boundProperty.name] = [boundProperty];
    }

    this.setters[propertyName] = GV.getPropertySetter(this, propertyName, /*this.virtual ? false :*/ expression);
    if (!this.setters[propertyName]) {
      let _this = this;
      this.setters[propertyName] = function () {
        console.error('No setter for property :', propertyName, '\nNode:', _this);
      };
    }
  };

  /**
   *
   * @param {Galaxy.GalaxySequence} leaveSequence
   */
  ViewNode.prototype.destroy = function (leaveSequence) {
    const _this = this;

    // The node is the original node that is being removed
    if (!leaveSequence) {
      _this.origin = true;
      if (_this.inDOM) {
        _this.sequences.enter.truncate();
        _this.callLifecycleEvent('preDestroy');

        let animationDone;
        const waitForNodeAnimation = new Promise(function (resolve) {
          animationDone = resolve;
        });

        _this.parent.sequences.leave.next(function (next) {
          waitForNodeAnimation.then(next);
        });

        // Add children leave sequence to this node(parent node) leave sequence
        _this.clean(_this.sequences.leave);
        _this.populateLeaveSequence(_this.sequences.leave);
        _this.sequences.leave.nextAction(function () {
          removeChild(_this.node.parentNode, _this.node);
          _this.placeholder.parentNode && removeChild(_this.placeholder.parentNode, _this.placeholder);
          _this.callLifecycleEvent('postRemove');
          _this.callLifecycleEvent('postDestroy');
          animationDone();
          _this.origin = false;
        });
      }
    } else if (leaveSequence) {
      if (_this.inDOM) {
        _this.sequences.enter.truncate();
        _this.callLifecycleEvent('preDestroy');

        _this.clean(_this.sequences.leave);
        _this.populateLeaveSequence(_this.sequences.leave);

        let animationDone;
        const waitForNodeAnimation = new Promise(function (resolve) {
          animationDone = resolve;
        });

        leaveSequence.next(function (next) {
          waitForNodeAnimation.then(next);
        });

        _this.sequences.leave.nextAction(function () {
          _this.callLifecycleEvent('postRemove');
          _this.callLifecycleEvent('postDestroy');
          _this.placeholder.parentNode && removeChild(_this.placeholder.parentNode, _this.placeholder);
          animationDone();
        });
      }
    }

    let property, properties = _this.properties;
    const removeItem = function (item) {
      item.removeNode(_this);
    };

    for (let key in properties) {
      property = properties[key];
      property.forEach(removeItem);
    }

    _this.dependedObjects.forEach(function (item) {
      let temp = GV.getBoundProperties(item);
      temp.forEach(function (property) {
        property.removeNode(item);
      });
    });

    _this.inDOM = false;
    _this.schema.__node__ = undefined;
    _this.inputs = {};
  };

  ViewNode.prototype.addDependedObject = function (item) {
    if (this.dependedObjects.indexOf(item) === -1) {
      this.dependedObjects.push(item);
    }
  };

  ViewNode.prototype.refreshBinds = function () {
    let property, properties = this.properties;
    for (let key in properties) {
      property = properties[key];

      if (property instanceof Array) {
        property.forEach(function (item) {
          if (item.nodes.indexOf(this) === -1) {
            item.nodes.push(this);
            item.props.push(key);
          }
        });
      } else {
        if (property.value.nodes.indexOf(this) === -1) {
          property.value.nodes.push(this);
          property.value.props.push(key);
        }
      }
    }
  };

  ViewNode.prototype.clean = function (leaveSequence) {
    let toBeRemoved = [], node, _this = this;

    const cn = Array.prototype.slice.call(_this.node.childNodes, 0);
    for (let i = cn.length - 1; i >= 0; i--) {
      node = cn[i]['__viewNode__'];

      if (node !== undefined) {
        toBeRemoved.push(node);
      }
    }

    // If leaveSequence is present we assume that this is being destroyed as a child, therefore its
    // children should also get destroyed as child
    if (leaveSequence) {
      ViewNode.destroyNodes(_this, toBeRemoved, leaveSequence);
      return _this.renderingFlow;
    }

    _this.renderingFlow.next(function (next) {
      if (!toBeRemoved.length) {
        next();
        return _this.renderingFlow;
      }

      ViewNode.destroyNodes(_this, toBeRemoved);

      _this.sequences.leave.nextAction(function () {
        next();
      });
    });

    return _this.renderingFlow;
  };

  ViewNode.prototype.getPlaceholder = function () {
    if (this.inDOM) {
      return this.node;
    }

    return this.placeholder;
  };

  ViewNode.prototype.notifyObserver = function (name, value, oldValue) {
    this.observer.notify(name, value, oldValue);
  };

  return ViewNode;

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
     * @this {Galaxy.GalaxyView.ViewNode}
     * @param context
     * @param value
     */
    bind: function (context, value) {
      if (value !== null && typeof  value !== 'object') {
        throw console.error('inputs property should be an object with explicits keys:\n', JSON.stringify(this.schema, null, '  '));
      }
      let live = GV.bindSubjectsToData(value, context, true);
      // Object.preventExtensions(live);
      // console.info(Object.isSealed(live), live);
      // if (this.virtual) {
      //   console.info(this);
      // }

      if (this.addons.inputs && live !== this.addons.inputs.live) {
        Galaxy.resetObjectTo(this.addons.inputs, {
          live: live,
          original: value
        });
      } else if (this.addons.inputs === undefined) {
        this.addons.inputs = {
          live: live,
          original: value
        };
      }

      this.inputs = live;
      this.addDependedObject(live);
    },
    onApply: function (cache, value, oldValue, context) {
    }
  };

  Galaxy.registerAddOnProvider('galaxy/inputs', function (scope) {
    return {
      create: function () {
        scope.inputs = scope.element.addons.inputs.live;

        return scope.inputs;
      },
      finalize: function () {
        // By linking the live to original we make sure that changes on the local copy of the input data will be
        // reflected to the original one
        GV.link(scope.element.addons.inputs.live, scope.element.addons.inputs.original);
      }
    };
  });
})(Galaxy.GalaxyView);

/* global Galaxy */

(function (G) {
  G.registerAddOnProvider('galaxy/view', function (scope) {
    return {
      create: function () {
        let view = new Galaxy.GalaxyView(scope);

        return view;
      },
      finalize: function () {

      }
    };
  });
})(Galaxy);

/* global Galaxy, TweenLite, TimelineLite */
'use strict';

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
      if (viewNode.virtual || !config) {
        return;
      }
      let enterAnimationConfig = config.enter;
      if (enterAnimationConfig) {
        viewNode.populateEnterSequence = function (sequence) {
          sequence.onTruncate(function () {
            TweenLite.killTweensOf(viewNode.node);

            if (enterAnimationConfig.sequence) {
              AnimationMeta.ANIMATIONS[enterAnimationConfig.sequence] = null;
            }

            if (enterAnimationConfig.parent) {
              AnimationMeta.ANIMATIONS[enterAnimationConfig.parent] = null;
            }
          });

          sequence.next(function (done) {
            if (enterAnimationConfig.sequence) {
              let animationMeta = AnimationMeta.get(enterAnimationConfig.sequence);
              animationMeta.duration = enterAnimationConfig.duration;
              animationMeta.position = enterAnimationConfig.position;
              animationMeta.NODE = viewNode;

              let lastStep = enterAnimationConfig.to || enterAnimationConfig.from;
              lastStep.clearProps = 'all';
              // enterAnimationConfig.to = enterAnimationConfig.to || {};
              // enterAnimationConfig.to.clearProps = 'all';
              animationMeta.add(viewNode.node, enterAnimationConfig, done);

              // Add to parent should happen after the animation is added to the child
              if (enterAnimationConfig.parent) {
                const parent = AnimationMeta.get(enterAnimationConfig.parent);
                parent.addChild(animationMeta);
              }
            } else {
              let lastStep = enterAnimationConfig.to || enterAnimationConfig.from;
              lastStep.clearProps = 'all';

              // enterAnimationConfig.to = enterAnimationConfig.to || {};
              // enterAnimationConfig.to.clearProps = 'all';
              AnimationMeta.createTween(viewNode.node, enterAnimationConfig, done);
            }
          });
        };
      }

      let leaveAnimationConfig = config.leave;
      if (leaveAnimationConfig) {
        viewNode.populateLeaveSequence = function (sequence) {
          sequence.onTruncate(function () {
            TweenLite.killTweensOf(viewNode.node);

            if (leaveAnimationConfig.sequence) {
              AnimationMeta.ANIMATIONS[leaveAnimationConfig.sequence] = null;
            }

            if (leaveAnimationConfig.parent) {
              AnimationMeta.ANIMATIONS[leaveAnimationConfig.parent] = null;
            }
          });

          sequence.next(function (done) {
            if (leaveAnimationConfig.sequence) {
              // debugger;

              let animationMeta = AnimationMeta.get(leaveAnimationConfig.sequence);
              animationMeta.duration = leaveAnimationConfig.duration;
              animationMeta.position = leaveAnimationConfig.position;
              animationMeta.NODE = viewNode;
              // if(leaveAnimationConfig.sequence === 'items-leave') {
              //   debugger;
              // }
              // let lastStep = leaveAnimationConfig.to || leaveAnimationConfig.from;
              // lastStep.clearProps = 'all';
              animationMeta.add(viewNode.node, leaveAnimationConfig, done);

              // Add to parent should happen after the animation is added to the child
              if (leaveAnimationConfig.parent) {
                const parent = AnimationMeta.get(leaveAnimationConfig.parent);
                parent.addChild(animationMeta);
              }
            } else {
              // let lastStep = leaveAnimationConfig.to || leaveAnimationConfig.from;
              // lastStep.clearProps = 'all';
              AnimationMeta.createTween(viewNode.node, leaveAnimationConfig, done);
            }
          });
        };
      }

      viewNode.rendered.then(function () {
        viewNode.observer.on('class', function (value, oldValue) {
          value.forEach(function (item) {
            if (item && oldValue.indexOf(item) === -1) {
              let _config = config['.' + item];
              if (_config) {
                viewNode.sequences[':class'].next(function (done) {
                  let classAnimationConfig = _config;
                  classAnimationConfig.to = Object.assign({className: '+=' + item || ''}, _config.to || {});

                  if (classAnimationConfig.sequence) {
                    let animationMeta = AnimationMeta.get(classAnimationConfig.sequence);

                    if (classAnimationConfig.group) {
                      animationMeta = animationMeta.getGroup(classAnimationConfig.group, classAnimationConfig.duration, classAnimationConfig.position || '+=0');
                    }

                    animationMeta.add(viewNode.node, classAnimationConfig, done);
                  } else {
                    AnimationMeta.createTween(viewNode.node, classAnimationConfig, done);
                  }
                });
              }
            }
          });

          oldValue.forEach(function (item) {
            if (item && value.indexOf(item) === -1) {
              let _config = config['.' + item];
              if (_config) {
                viewNode.sequences[':class'].next(function (done) {
                  let classAnimationConfig = _config;
                  classAnimationConfig.to = {className: '-=' + item || ''};

                  if (classAnimationConfig.sequence) {
                    let animationMeta = AnimationMeta.get(classAnimationConfig.sequence);

                    if (classAnimationConfig.group) {
                      animationMeta = animationMeta.getGroup(classAnimationConfig.group);
                    }

                    animationMeta.add(viewNode.node, classAnimationConfig, done);
                  } else {
                    AnimationMeta.createTween(viewNode.node, classAnimationConfig, done);
                  }
                });
              }
            }
          });
        });
      });
    }
  };

  function AnimationMeta(name) {
    const _this = this;
    _this.name = name;
    this.timeline = new TimelineLite({
      autoRemoveChildren: true,
      smoothChildTiming: true,
      onComplete: function () {
        _this.lastChildPosition = 0;
        // console.info(_this);
        // debugger;
        if (_this.parent) {
          _this.parent.timeline.remove(_this.timeline);
        }
      }
    });

    this.timeline.addLabel('beginning', 0);
    this.duration = 0;
    this.position = '+=0';
    this.queue = {};
    this.list = [];
    this.lastChildPosition = 0;
    this.parent = null;
  }

  AnimationMeta.ANIMATIONS = {};
  AnimationMeta.TIMELINES = {};

  AnimationMeta.getTimeline = function (name, onComplete) {
    if (!AnimationMeta.TIMELINES[name]) {
      AnimationMeta.TIMELINES[name] = new TimelineLite({
        autoRemoveChildren: true,
        onComplete: onComplete
      });
    }

    return AnimationMeta.TIMELINES[name];
  };

  AnimationMeta.get = function (name) {
    if (!AnimationMeta.ANIMATIONS[name]) {
      AnimationMeta.ANIMATIONS[name] = new AnimationMeta(name);
    }

    return AnimationMeta.ANIMATIONS[name];
  };

  AnimationMeta.parseSequence = function (sequence) {
    return sequence.split('/').filter(Boolean);
  };

  AnimationMeta.createTween = function (node, config, onComplete) {
    let to = Object.assign({}, config.to || {});

    if (to.onComplete) {
      const userOnComplete = to.onComplete;
      to.onComplete = function () {
        userOnComplete();
        onComplete();
      };
    } else {
      to.onComplete = onComplete;
    }
    let tween = null;

    if (config.from && config.to) {
      tween = TweenLite.fromTo(node,
        config.duration || 0,
        config.from || {},
        to);
    } else if (config.from) {
      let from = Object.assign({}, config.from || {});

      if (from.onComplete) {
        const userOnComplete = to.onComplete;
        from.onComplete = function () {
          userOnComplete();
          onComplete();
        };
      } else {
        from.onComplete = onComplete;
      }

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

  AnimationMeta.calculateDuration = function (duration, position) {
    let po = position.replace('=', '');
    return ((duration * 10) + (Number(po) * 10)) / 10;
  };

  AnimationMeta.prototype.calculateLastChildPosition = function (duration, position) {
    const calc = AnimationMeta.calculateDuration(duration, position || '+=0');
    const lcp = (this.lastChildPosition * 10);
    const c = (calc * 10);
    this.lastChildPosition = (lcp + c) / 10;

  };

  AnimationMeta.prototype.addChild = function (child, prior) {
    const _this = this;
    child.parent = _this;

    const children = this.timeline.getChildren(false);

    if (children.indexOf(child.timeline) === -1) {
      // debugger;
      _this.calculateLastChildPosition(child.duration, child.position);
      _this.timeline.add(child.timeline, _this.lastChildPosition);
    } else {
      // _this.calculateLastChildPosition(child.duration, child.position);
    }
  };

  AnimationMeta.prototype.add = function (node, config, onComplete) {
    const _this = this;
    let to = Object.assign({}, config.to || {});
    to.onComplete = onComplete;

    let tween = null;
    if (config.from && config.to) {
      tween = TweenLite.fromTo(node,
        config.duration || 0,
        config.from || {},
        to);
    } else if (config.from) {
      let from = Object.assign({}, config.from || {});
      from.onComplete = onComplete;
      tween = TweenLite.from(node,
        config.duration || 0,
        from || {});
    } else {
      tween = TweenLite.to(node,
        config.duration || 0,
        to || {});
    }

    // First animation in the timeline should always start at zero
    if (this.timeline.getChildren(false, true, false).length === 0) {
      _this.lastChildPosition = 0;
      let progress = _this.timeline.progress();
      _this.timeline.add(tween, 0);
      if (!progress) {
        _this.timeline.play(0);
      }
    } else {
      _this.calculateLastChildPosition(config.duration, config.position);
      _this.timeline.add(tween, _this.lastChildPosition);
    }
  };

  /**
   *
   * @param {number} order
   * @param {callback} operation
   */
  AnimationMeta.prototype.addToQueue = function (order, node, operation) {
    if (this.parent) {
      return this.parent.addToQueue(order, node, operation);
    }

    if (!this.queue[order]) {
      this.queue[order] = [];
    }
    this.queue[order].push({node: node, operation: operation});
    this.list.push({node: node, operation: operation, order: order});
  };
})(Galaxy);

/* global Galaxy */

(function (G) {
  G.GalaxyView.NODE_SCHEMA_PROPERTY_MAP['on'] = {
    type: 'custom',
    name: 'on',
    handler: function (viewNode, attr, events, oldEvents, scopeData) {
      if (events !== null && typeof events === 'object') {
        for (let name in events) {
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
    regex: GV.BINDING_SYNTAX_REGEX,
    bind: function (nodeScopeData, matches) {
      const _this = this;
      let parts = matches[1].split('.');
      let setter = new Function('data, value', 'data.' + matches[1] + ' = value;');
      _this.node.addEventListener('change', function () {
        setter.call(null, GV.getPropertyContainer(nodeScopeData, parts[0]), _this.node.checked);
      });
    },
    onApply: function (cache, value) {
      if (this.node.checked === value) {
        return;
      }

      this.node.checked = value || false;
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
    regex: GV.BINDING_SYNTAX_REGEX,
    /**
     *
     * @param {Galaxy.GalaxyView.ViewNode} viewNode
     * @param scopeData
     * @param matches
     */
    bind: function (scopeData, matches) {

    },
    onApply: function (cache, value, oldValue, context) {
      if (this.virtual) {
        return;
      }

      const _this = this;

      if (typeof value === 'string') {
        return _this.node.setAttribute('class', value);
      } else if (value instanceof Array) {
        return _this.node.setAttribute('class', value.join(' '));
      } else if (value === null) {
        return _this.node.removeAttribute('class');
      }

      let clone = GV.bindSubjectsToData(value, context, true);

      if (_this.hasOwnProperty('[reactive/class]') && clone !== _this['[reactive/class]']) {
        Galaxy.resetObjectTo(_this['[reactive/class]'], clone);
      } else if (!_this.hasOwnProperty('[reactive/class]')) {
        Object.defineProperty(_this, '[reactive/class]', {
          value: clone,
          enumerable: false
        });
      }

      _this.node.setAttribute('class', []);
      let observer = new Galaxy.GalaxyObserver(clone);
      observer.onAll(function (key, value, oldValue) {
        toggles.call(_this, key, value, oldValue, clone);
      });

      if (_this.schema.renderConfig && _this.schema.renderConfig.applyClassListAfterRender) {
        _this.rendered.then(function () {
          toggles.call(_this, null, true, false, clone);
        });
      } else {
        toggles.call(_this, null, true, false, clone);
      }

      _this.addDependedObject(clone);
    }
  };

  function getClasses(obj) {
    if (typeof classes === 'string') {
      return [obj];
    } else if (obj instanceof Array) {
      return obj;
    } else if (obj !== null && typeof obj === 'object') {
      let newClasses = [];

      for (let key in obj) {
        if (obj.hasOwnProperty(key) && obj[key]) newClasses.push(key);
      }

      return newClasses;
    }
  }

  function toggles(key, value, oldValue, classes) {
    if (oldValue === value) return;
    let oldClasses = this.node.getAttribute('class');
    oldClasses = oldClasses ? oldClasses.split(' ') : [];
    let newClasses = getClasses(classes);
    let _this = this;

    _this.notifyObserver('class', newClasses, oldClasses);
    // _this.sequences[':class'].start().finish(function () {
      _this.node.setAttribute('class', newClasses.join(' '));
    //   _this.sequences[':class'].reset();
    // });
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
    bind: function () {
      this.toTemplate();
    },
    getCache: function () {
      return {
        module: null
      };
    },
    onApply: function (cache, selector, oldSelector, scopeData) {
      if (scopeData.element.schema.children && scopeData.element.schema.hasOwnProperty('module')) {
        // this.domManipulationSequence.next(function (done) {
        let allContent = scopeData.element.schema.children;
        let parentViewNode = this.parent;
        allContent.forEach(function (content) {
          if (selector === '*' || selector.toLowerCase() === content.node.tagName.toLowerCase()) {
            content.__node__.__viewNode__.refreshBinds(scopeData);
            parentViewNode.registerChild(content.__node__.__viewNode__, this.placeholder);
            content.__node__.__viewNode__.setInDOM(true);
          }
        });

        // done();
        // });
      }
    }
  };
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param cache
   * @param changes
   * @param nodeScopeData
   */
  const createResetProcess = function (node, cache, changes, nodeScopeData) {
    // const parentNode = node.parent;
    node.renderingFlow.truncate();
    if (changes.type === 'reset') {
      node.renderingFlow.next(function forResetProcess(next) {
        GV.ViewNode.destroyNodes(node, cache.nodes.reverse());
        cache.nodes = [];

        node.parent.sequences.leave.nextAction(function () {
          next();
        });
      });

      changes = Object.assign({}, changes);
      changes.type = 'push';

      if (changes.params.length) {
        createPushProcess(node, cache, changes, nodeScopeData);
      }
    } else {
      createPushProcess(node, cache, changes, nodeScopeData);
    }
  };

  const createPushProcess = function (node, cache, changes, nodeScopeData) {
    const parentNode = node.parent;
    let position = null;
    let newItems = [];
    let action = Array.prototype.push;

    node.renderingFlow.next(function forPushProcess(next) {
      if (changes.type === 'push') {
        let length = cache.nodes.length;
        if (length) {
          position = cache.nodes[length - 1].getPlaceholder().nextSibling;
        } else {
          position = node.placeholder.nextSibling;
        }

        newItems = changes.params;
      } else if (changes.type === 'unshift') {
        position = cache.nodes[0] ? cache.nodes[0].getPlaceholder() : null;
        newItems = changes.params;
        action = Array.prototype.unshift;
      } else if (changes.type === 'splice') {
        let removedItems = Array.prototype.splice.apply(cache.nodes, changes.params.slice(0, 2));
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

      let itemDataScope = nodeScopeData;
      let p = cache.propName, n = cache.nodes, cns;
      const templateSchema = node.cloneSchema();
      Reflect.deleteProperty(templateSchema, '$for');

      // let processFinished;
      // const process = new Promise(function (resolve) {
      //   processFinished = resolve;
      // });

      // requestAnimationFrame(function () {
      if (newItems instanceof Array) {
        const c = newItems.slice(0);
        for (let i = 0, len = newItems.length; i < len; i++) {
          itemDataScope = GV.createMirror(nodeScopeData);
          itemDataScope[p] = c[i];
          itemDataScope['$forIndex'] = i;
          cns = Galaxy.clone(templateSchema);
          let vn = GV.createNode(parentNode, itemDataScope, cns, position);
          action.call(n, vn);
        }
      }

      // processFinished();
      parentNode.sequences.enter.nextAction(next);
      // });


      // process.then(function () {

      // });
    });
    // We check for domManipulationsBus in the next ui action so we can be sure all the dom manipulations have been set
    // on parentNode.domManipulationsBus. For example in the case of nested $for, there is no way of telling that
    // all the dom manipulations are set in a ui action, so we need to do that in the next ui action.
    // parentNode.renderingFlow.next(function (next) {
    // setTimeout(function () {
    // Promise.all(parentNode.domBus).then(next);
    // });
    // });
  };

  GV.NODE_SCHEMA_PROPERTY_MAP['$for'] = {
    type: 'reactive',
    name: '$for'
  };

  GV.REACTIVE_BEHAVIORS['$for'] = {
    regex: /^([\w]*)\s+in\s+([^\s\n]+)$/,
    bind: function (nodeScopeData, matches) {
      this.toTemplate();
      if (matches instanceof Array) {
        GV.makeBinding(this, nodeScopeData, '$for', matches[2]);
      } else if (matches) {
        const bindings = GV.getBindings(matches.data);
        if (bindings.variableNamePaths) {
          GV.makeBinding(this, nodeScopeData, '$for', bindings.variableNamePaths, bindings.isExpression);
        }
      }
    },
    getCache: function (matches) {
      return {
        propName: matches.as || matches[1],
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
    onApply: function (cache, changes, oldChanges, nodeScopeData, expression) {
      if (!changes || typeof changes === 'string') {
        return;
      }

      if (expression) {
        changes.params = expression();
      }

      const _this = this;
      createResetProcess(_this, cache, changes, nodeScopeData);
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
    bind: function (nodeScopeData, matches) {
    },
    onApply: function (cache, value, oldValue, scopeData, expression) {
      if (expression) {
        value = expression();
      }

      createProcess(this, value);
    }
  };

  function createProcess(node, value) {
    node.rendered.then(function () {
      node.renderingFlow.truncate();
      node.renderingFlow.next(function ifProcess(next) {
        if (value && !node.inDOM) {
          // debugger;
          node.setInDOM(true);
          node.sequences.enter.next(function () {
            next();
          });
        } else if (!value && node.inDOM) {
          // debugger;
          node.setInDOM(false);
          node.sequences.leave.next(next);
        }        else {
          next();
        }
      });
    });
  }
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  const loadModuleQueue = new Galaxy.GalaxySequence();
  loadModuleQueue.start();

  const moduleLoaderGenerator = function (viewNode, cache, moduleMeta) {
    return function (done) {
      if (cache.module) {
        cache.module.destroy();
      }
      // Check for circular module loading
      const tempURI = new Galaxy.GalaxyURI(moduleMeta.url);
      let moduleScope = cache.scope;
      let currentScope = cache.scope;

      while (moduleScope) {
        // In the case where module is a part of $for, cache.scope will be NOT an instance of GalaxyScope
        // but its __parent__ is
        if (!(currentScope instanceof Galaxy.GalaxyScope)) {
          currentScope = new Galaxy.GalaxyScope({
            systemId: '$for-item',
            url: moduleMeta.url,
            parentScope: cache.scope.__parent__
          });
        }

        if (tempURI.parsedURL === currentScope.uri.paresdURL) {
          return console.error('Circular module loading detected and stopped. \n' + currentScope.uri.paresdURL + ' tries to load itself.');
        }

        moduleScope = moduleScope.parentScope;
      }

      window.requestAnimationFrame(function () {
        currentScope.load(moduleMeta, {
          element: viewNode
        }).then(function (module) {
          cache.module = module;
          viewNode.node.setAttribute('module', module.systemId);
          module.start();
          done();
        }).catch(function (response) {
          console.error(response);
          done();
        });
      });
    };
  };

  GV.NODE_SCHEMA_PROPERTY_MAP['module'] = {
    type: 'reactive',
    name: 'module'
  };

  GV.REACTIVE_BEHAVIORS['module'] = {
    regex: null,
    bind: function (context, value) {
      // if (value !== null && typeof  value !== 'object') {
      //   throw console.error('module property should be an object with explicits keys:\n', JSON.stringify(this.schema, null, '  '));
      // }
      //
      // const live = GV.bindSubjectsToData(value, context, true);
      // this.addDependedObject(live);
    },
    getCache: function (matches, scope) {
      return {
        module: null,
        moduleMeta: null,
        scope: scope
      };
    },
    onApply: function handleModule(cache, moduleMeta, oldModuleMeta, nodeScopeData, expression) {
      const _this = this;

      if (expression) {
        moduleMeta = expression();
      }

      if (typeof moduleMeta !== 'object') {
        return console.error('module property only accept objects as value');
      }

      if (!_this.virtual && moduleMeta && moduleMeta.url && moduleMeta !== cache.moduleMeta) {
        _this.rendered.then(function () {
          // Add the new module request to the sequence
          loadModuleQueue.next(function (nextCall) {
            // Wait till all viewNode animation are done
            // console.info('Added to queue:', moduleMeta.id || moduleMeta.url);
            // Empty the node and wait till all animation are finished
            // Then load the next requested module in the queue
            // and after that proceed to next request in the queue
            _this.clean().next(moduleLoaderGenerator(_this, cache, moduleMeta))
              .next(function (done) {
                // module loader may add animations to the viewNode. if that is the case we will wait for the animations
                // to finish at the beginning of the next module request
                done();
                nextCall();
              });
          });
        });
      } else if (!moduleMeta) {
        _this.clean();
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
    regex: GV.BINDING_SYNTAX_REGEX,
    bind: function (nodeScopeData, matches) {
      if (this.node.type === 'text') {
        const _this = this;
        let parts = matches[1].split('.');
        let setter = new Function('data, value', 'data.' + matches[1] + ' = value;');
        _this.node.addEventListener('keyup', function () {
          setter.call(null, GV.getPropertyContainer(nodeScopeData, parts[0]), _this.node.value);
        });
      }
    },
    onApply: function (cache, value) {
      if (document.activeElement === this.node && this.node.value === value) {
        return;
      }

      this.node.value = value || '';
    }
  };
})(Galaxy.GalaxyView);

