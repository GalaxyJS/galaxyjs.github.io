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
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? module.exports = factory()
    : typeof define === 'function' && define.amd
    ? define(factory)
    : (global.Promise = factory());
}(this, (function () {
  'use strict';

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
    if (!(this instanceof Promise)) {
      throw new TypeError('Promises must be constructed via new');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('not a function');
    }
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
      if (newValue === self) {
        throw new TypeError('A promise cannot be resolved with itself.');
      }
      if (
        newValue &&
        (typeof newValue === 'object' || typeof newValue === 'function')
      ) {
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
      Promise._immediateFn(function () {
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
      fn(
        function (value) {
          if (done) {
            return;
          }
          done = true;
          resolve(self, value);
        },
        function (reason) {
          if (done) {
            return;
          }
          done = true;
          reject(self, reason);
        }
      );
    } catch (ex) {
      if (done) {
        return;
      }
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new this.constructor(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.prototype['finally'] = function (callback) {
    var constructor = this.constructor;
    return this.then(
      function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      },
      function (reason) {
        return constructor.resolve(callback()).then(function () {
          return constructor.reject(reason);
        });
      }
    );
  };

  Promise.all = function (arr) {
    return new Promise(function (resolve, reject) {
      if (!arr || typeof arr.length === 'undefined') {
        throw new TypeError('Promise.all accepts an array');
      }
      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) {
        return resolve([]);
      }
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(
                val,
                function (val) {
                  res(i, val);
                },
                reject
              );
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
  Promise._immediateFn =
    (typeof setImmediate === 'function' &&
      function (fn) {
        setImmediate(fn);
      }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  return Promise;

})));

/* global Galaxy, Promise */
'use strict';
/**
 * @exports Galaxy
 */
(function (root) {
  Array.prototype.unique = function () {
    const a = this.concat();
    for (let i = 0, lenI = a.length; i < lenI; ++i) {
      for (let j = i + 1, lenJ = a.length; j < lenJ; ++j) {
        if (a[i] === a[j]) {
          a.splice(j--, 1);
        }
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
    clone.__proto__ = obj.__proto__;
    for (let i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (typeof(obj[i]) === 'object' && obj[i] !== null) {
          clone[i] = Galaxy.clone(obj[i]);
        } else {
          clone[i] = obj[i];
        }
      }
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

      if (!obj) {
        continue;
      }

      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] instanceof Array) {
            result[key] = this.extend(result[key] || [], obj[key]);
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            result[key] = this.extend(result[key] || {}, obj[key]);
          } else {
            result[key] = obj[key];
          }
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
        str.push((v !== null && typeof v === 'object') ? _this.convertToURIString(v, k) : encodeURIComponent(k) + '=' +
          encodeURIComponent(v));
      }
    }

    return str.join('&');
  };

  GalaxyCore.prototype.load = function (module) {
    let _this = this;

    if (!module) {
      throw new Error('Module meta data or constructor is missing');
    }

    let promise = new Promise(function (resolve, reject) {

      if (module.hasOwnProperty('constructor') && typeof module.constructor === 'function') {
        module.url = module.id = 'internal/' + (new Date()).valueOf() + '-' + Math.round(performance.now());
        module.systemId = module.parentScope ? module.parentScope.systemId + '/' + module.id : module.id;

        return _this.compileModuleContent(module, module.constructor, []).then(function (compiledModule) {
          return _this.executeCompiledModule(compiledModule).then(resolve);
        });
      }

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
   * @param moduleConstructor
   * @param invokers
   * @returns {Promise<Galaxy.GalaxyModule>}
   */
  GalaxyCore.prototype.compileModuleContent = function (moduleMetaData, moduleConstructor, invokers) {
    let _this = this;
    let promise = new Promise(function (resolve, reject) {
      let doneImporting = function (module, imports) {
        imports.splice(imports.indexOf(module.importId || module.url) - 1, 1);

        if (imports.length === 0) {
          // This will load the original initilizer
          resolve(module);
        }
      };

      const unique = [];
      let imports = [];

      if (typeof moduleConstructor === 'function') {
        imports = moduleMetaData.imports ? moduleMetaData.imports.slice(0) : [];
        imports = imports.map(function (item) {
          if (unique.indexOf(item) !== -1) {
            return null;
          }

          unique.push(item);
          return { url: item };
        }).filter(Boolean);
      } else {
        // extract imports from the source code
        // removing comments cause an bug

        moduleConstructor = moduleConstructor.replace(/\/\*[\s\S]*?\*\n?\/|([^:;]|^)^[^\n]?\s*\/\/.*\n?$/gm, '');
        moduleConstructor = moduleConstructor.replace(/Scope\.import\(['|"](.*)['|"]\);/gm, function (match, path) {
          let query = path.match(/([\S]+)/gm);
          let url = query[query.length - 1];
          if (unique.indexOf(url) !== -1) {
            return 'Scope.__imports__[\'' + url + '\']';
          }

          unique.push(url);
          imports.push({
            url: url,
            fresh: query.indexOf('new') !== -1
          });

          return 'Scope.__imports__[\'' + url + '\']';
        });
      }

      let scope = new Galaxy.GalaxyScope(moduleMetaData, moduleMetaData.element || _this.rootElement);
      // var view = new Galaxy.GalaxyView(scope);
      // Create module from moduleMetaData
      let module = new Galaxy.GalaxyModule(moduleMetaData, moduleConstructor, scope);
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
        module.scope.inject(item, module.addOns[item]);
      }

      for (let item in importedLibraries) {
        if (importedLibraries.hasOwnProperty(item)) {
          let asset = importedLibraries[item];
          if (asset.module) {
            module.scope.inject(asset.name, asset.module);
          }
        }
      }

      let moduleSource = typeof module.source === 'function' ? module.source : new Function('Scope', module.source);
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
          module: module.scope.exports
        };
      } else if (module.fresh) {
        importedLibraries[mId].module = module.scope.exports;
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

  GalaxyObserver.notify = function (obj, key, value, oldValue, caller) {
    const observers = obj.__observers__;
    let portal;
    if (obj instanceof Galaxy.GalaxyView.Portal) {
      portal = obj;
    } else {
      portal = obj[G.GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
    }

    if (observers !== undefined) {
      observers.forEach(function (observer) {
        observer.notify(key, value, oldValue);
      });
    }

    if (portal !== undefined) {
      portal.getParents().forEach(function (reactive) {
        // console.info(reactive.portal !== caller);
        // TODO: this if could be removed but more test is needed
        if (reactive.portal !== caller) {
          reactive.notify(caller);
        }
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

Galaxy.GalaxyScope = /** @class*/(function () {
  const defineProp = Object.defineProperty;

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
    this.exports = {};
    this.uri = new Galaxy.GalaxyURI(module.url);
    this.eventHandlers = {};
    this.observers = [];
    this.on('module.destroy', this.destroy.bind(this));
    this.data = {};

    defineProp(this, '__imports__', {
      value: {},
      writable: false,
      enumerable: false,
      configurable: false
    });
  }

  /**
   *
   * @param id ID string which is going to be used for importing
   * @param instance The assigned object to this id
   */
  GalaxyScope.prototype.inject = function (id, instance) {
    this['__imports__'][id] = instance;
  };

  GalaxyScope.prototype.import = function (libId) {
    return this['__imports__'][libId];
  };

  GalaxyScope.prototype.destroy = function () {
    this.observers.forEach(function (observer) {
      observer.remove();
    });
  };

  GalaxyScope.prototype.load = function (moduleMeta, config) {
    let newModuleMetaData = Object.assign({}, moduleMeta, config || {});
    // Galaxy.GalaxyView.link(moduleMeta, newModuleMetaData);
    if (newModuleMetaData.url.indexOf('./') === 0) {
      newModuleMetaData.url = this.uri.path + moduleMeta.url.substr(2);
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
    const observer = new Galaxy.GalaxyObserver(object);
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

/* global Galaxy, Promise */
'use strict';

Galaxy.GalaxyView = /** @class */(function (G) {
  const defineProp = Object.defineProperty;
  const setAttr = Element.prototype.setAttribute;
  const removeAttr = Element.prototype.removeAttribute;

  let setterAndGetter = {
    configurable: true,
    enumerable: false,
    set: null,
    get: null
  };
  let boundPropertyReference = {
    configurable: false,
    writable: true,
    enumerable: true,
    value: null
  };

  GalaxyView.BINDING_SYNTAX_REGEX = new RegExp('^<([^\\[\\]\<\>]*)>\\s*([^\\[\\]\<\>]*)\\s*$');
  GalaxyView.BINDING_EXPRESSION_REGEX = new RegExp('(?:["\'][\w\s]*[\'"])|([^\d\s=+\-|&%{}()<>!/]+)', 'g');

  GalaxyView.PORTAL_PROPERTY_IDENTIFIER = '__portal__';

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
      type: 'prop',
      name: 'style'
    },
    css: {
      type: 'attr',
      name: 'style'
    },
    html: {
      type: 'prop',
      name: 'innerHTML'
    },
    checked: {
      type: 'prop',
      name: 'checked'
    },
    value: {
      type: 'prop',
      name: 'value'
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

  GalaxyView.createMirror = function (obj, forObj) {
    let result = forObj || {};

    defineProp(result, '__parent__', {
      enumerable: false,
      value: obj
    });

    return result;
  };

  GalaxyView.createClone = function (source) {
    let cloned = Galaxy.clone(source);

    GalaxyView.link(source, cloned);

    return cloned;
  };

  GalaxyView.link = function (from, to) {
    // const medium = GalaxyView.getPortal(from);
    // debugger;
    // for (let key in from) {
    //   const refKey = '<>' + key;
    //   if (medium.hasOwnProperty(key)) {
    //     debugger;
    //     // boundPropertyReference.value = from[refKey];
    //     // defineProp(to, refKey, boundPropertyReference);
    //     // defineProp(to, key, Object.getOwnPropertyDescriptor(from, key));
    //   }
    // }
    // debugger;
    defineProp(to, GalaxyView.PORTAL_PROPERTY_IDENTIFIER, {
      writable: true,
      configurable: true,
      enumerable: false,
      value: GalaxyView.getPortal(from)
    });
    // debugger;
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

  /**
   *
   * @param host
   * @return {Array<Galaxy.GalaxyView.ReactiveProperty>}
   */
  GalaxyView.getBoundProperties = function (host) {
    const portal = host[GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
    return portal ? portal.getPropertiesList() : [];
  };

  GalaxyView.getBindings = function (value) {
    let propertyKeysPaths = null;
    let isExpression = false;
    const type = typeof(value);
    let modifiers = null;

    if (type === 'string') {
      const props = value.match(GalaxyView.BINDING_SYNTAX_REGEX);
      if (props) {
        modifiers = props[1] || null;
        propertyKeysPaths = [props[2]];
      } else {
        modifiers = null;
        propertyKeysPaths = null;
      }
    }
    else if (value instanceof Array && typeof value[value.length - 1] === 'function') {
      propertyKeysPaths = value.slice(0);
      isExpression = true;
    } else {
      propertyKeysPaths = null;
    }

    return {
      modifiers: modifiers,
      propertyKeysPaths: propertyKeysPaths,
      isExpression: isExpression
    };
  };

  GalaxyView.propertyLookup = function (data, properties) {
    properties = properties.split('.');
    let property = properties[0];
    const original = data;
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
        // debugger;
        // let ph = original;
        // properties.forEach(function (key) {
        //   if(ph && ph.hasOwnProperty(key)) {
        //     ph = ph[key];
        //   } else {
        //     debugger;
        //   }
        // });

        return original;
      }
    }

    // let ph = target;
    // properties.forEach(function (key) {
    //   if(ph && ph.hasOwnProperty(key)) {
    //     ph = ph[key];
    //   } else {
    //     debugger;
    //   }
    // });

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

  GalaxyView.getPortal = function (host, parent) {
    const portal = host[GalaxyView.PORTAL_PROPERTY_IDENTIFIER] || new GalaxyView.Portal();

    if (parent) {
      portal.addParent(parent);
    }

    if (!host.hasOwnProperty(GalaxyView.PORTAL_PROPERTY_IDENTIFIER)) {
      defineProp(host, GalaxyView.PORTAL_PROPERTY_IDENTIFIER, {
        writable: true,
        configurable: true,
        enumerable: false,
        value: portal
      });
    }

    return portal;
  };

  GalaxyView.setPortalFor = function (data, portal) {
    if (!data.hasOwnProperty(GalaxyView.PORTAL_PROPERTY_IDENTIFIER)) {
      defineProp(data, GalaxyView.PORTAL_PROPERTY_IDENTIFIER, {
        writable: true,
        configurable: true,
        enumerable: false,
        value: portal
      });
    } else {
      data[GalaxyView.PORTAL_PROPERTY_IDENTIFIER] = portal;
    }

    return data[GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
  };

  /**
   *
   * @param {Object|Array} host
   * @param {string} propertyName
   * @param {any} config
   * @returns {Galaxy.GalaxyView.ReactiveProperty}
   */
  GalaxyView.createReactiveProperty = function (host, propertyName, config) {
    const portal = GalaxyView.getPortal(host);
    const referenceName = propertyName;
    let scope = host;
    let reactiveProperty;

    if (config.referencePropertyName) {
      // If referencePropertyName is set and it refers to a value of the type of object
      // then host[propertyName] is going to be the config.scope[referencePropertyName]
      // this means that there will be only one ReactiveProperty for each property and we are going to bind to that
      // through this property
      scope = config.referencePropertyScope;
      const reference = scope[GalaxyView.PORTAL_PROPERTY_IDENTIFIER].refs[config.referencePropertyName];
      if (reference.valueStructure || reference.value instanceof Array) {
        reactiveProperty = reference;
      }
    }

    if (!reactiveProperty) {
      reactiveProperty = new GalaxyView.ReactiveProperty(config.expression ? {} : portal, config.alias || propertyName, config.initValue);

      if (config.initValue === null || config.initValue === undefined) {
        const defaultValueStructure = {};
        GalaxyView.getPortal(defaultValueStructure);
        reactiveProperty.setValueStructure(defaultValueStructure);
      } else if (typeof config.initValue === 'object') {
        GalaxyView.getPortal(config.initValue);
        reactiveProperty.setValueStructure(config.initValue);
      }
    }

    portal.setProperty(reactiveProperty, propertyName);

    // Default getter
    let getter = function () {
      const property = this[GalaxyView.PORTAL_PROPERTY_IDENTIFIER].refs[referenceName];
      if (property.placeholderFor) {
        return property.placeholderFor;
      }

      return property.value;
    };

    // Default setter
    let setter = function (newValue) {
      const portal = this[GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
      let oldValue = portal.getValueOf(referenceName);
      /** @type {Galaxy.GalaxyView.ReactiveProperty} */
      let referencePortalProperty = portal.refs[referenceName];

      if (oldValue === newValue) {
        return;
      }
      // if(newValue === 'New') debugger;

      // If newValue is an array, then set it through. Binding will be handled by ReactiveProperty
      if (newValue instanceof Array) {
        debugger;
        return referencePortalProperty.setValue(newValue, scope);
      }

      if ((newValue === null || typeof newValue !== 'object') && referencePortalProperty.valueStructure !== null) {
        // newValue is not object while the referencePortalProperty has a structure thus, it can be an object
        // in this case all the properties of the structure will be set to undefined
        // debugger;
        // if(referencePortalProperty.placeholderFor) {
        referencePortalProperty.removePlaceholder();
// debugger;
        // const valueStructurePortal = referencePortalProperty.valueStructure[GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
        // GalaxyView.setPortalFor(newValue, valueStructurePortal);
        // }

        const oldKeys = Object.keys(referencePortalProperty.valueStructure);
        const valueStructure = referencePortalProperty.valueStructure;
        if (oldValue !== null) {
          oldKeys.forEach(function (key) {
            valueStructure[key] = undefined;
          });
        }
        debugger;
        return referencePortalProperty.setValue(newValue, scope);
      }

      if (newValue !== null && typeof newValue === 'object') {
        const valueStructure = referencePortalProperty.valueStructure;

        if(valueStructure instanceof Array) {
          debugger
        }
         else if (valueStructure === null) {
          debugger;
          // No structure means that the type of the value was not object
          // e. g. obj.propertyOne = 'String Value' is changed to obj.propertyOne = {}
          return referencePortalProperty.setValue(newValue, scope);
        }

        const valueStructurePortal = valueStructure[GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
        let newValuePortal = newValue[GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
        // If nweValue has no portal, that man it is a new object
        if (!newValuePortal) {
          // Remove the placeholder for this property because it is no longer valid
          referencePortalProperty.removePlaceholder();
          // if newValue has no portal that means it's completely new, with no previous binding
          // So all the reactivity on the structure should be made available on the new value as well
          let newValueStructure = {};
          newValuePortal = GalaxyView.getPortal(newValueStructure);
          newValueStructure.parents = valueStructurePortal.parents.slice(0);

          GalaxyView.setPortalFor(newValue, newValuePortal);
          // newValuePortal.parents = valueStructurePortal.parents.slice(0);
          const valueStructureProps = valueStructurePortal.refs;
          const keys = Object.keys(valueStructureProps);

          keys.forEach(function (key) {
            const clone = valueStructureProps[key].clone(newValuePortal);
            newValuePortal.setProperty(clone, key);
            debugger;
            clone.setValue(newValue[key], scope);
            defineProp(newValue, key, Object.getOwnPropertyDescriptor(valueStructure, key));
          });
        } else {
          // const valueStructure = referencePortalProperty.valueStructure;
          if (referencePortalProperty.placeholderFor) {
            if (referencePortalProperty.placeholderFor === newValue) {
              debugger;
              return referencePortalProperty.setValue(newValue, scope);
            }
          }

          referencePortalProperty.setPlaceholder(newValue);

          // referencePortalProperty.placeholderFor = newValue;
          //
          // // referencePortalProperty.portal.addParent(newValue.__portal__.parents[0]);
          // newValuePortal.addParent(referencePortalProperty);
          // const oldKeys = Object.keys(valueStructure);
          //
          // debugger;
          // oldKeys.forEach(function (key) {
          //   // We use soft just to update UI and leave the actual data of
          //   // the valueStructurePortal intact
          //   // const p = valueStructurePortal.refs[key].clone(newValue.__portal__);
          //   // np.setProperty(p, key);
          //   // p.setValue(newValue[key], scope);
          //   // defineProp(v, key, Object.getOwnPropertyDescriptor(valueStructure, key));
          //   if(newValuePortal.refs[key]) {
          //     debugger;
          //     newValuePortal.refs[key].concat(valueStructurePortal.refs[key]);
          //   }
          //   valueStructurePortal.refs[key].softUpdate(newValue[key]);
          //   // valueStructure[key] = newValue[key];
          // });
          // // referencePortalProperty.valueStructure = v;
          // debugger;
        }
      }

      referencePortalProperty.setValue(newValue, scope);
    };

    if (config.expression) {
      getter = function exp() {
        // console.info('exp getter', this);
        return config.expression();
      };
      setter = undefined;
    }

    setterAndGetter.enumerable = config.enumerable;
    setterAndGetter.get = getter;
    setterAndGetter.set = setter;
    defineProp(host, propertyName, setterAndGetter);

    return reactiveProperty;
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
      let args = [];
      try {
        args = getExpressionArguments.call(host, Galaxy.GalaxyView.propertyLookup, scope);
      } catch (ex) {
        console.error('Can\'t find the property: \n' + variables.join('\n'), '\n\nIt is recommended to inject the parent object instead' +
          ' of its property.\n\n', scope, '\n', ex);
      }
      return handler.apply(host, args);
    };
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode | Object} target
   * @param {String} targetKeyName
   * @param {Galaxy.GalaxyView.ReactiveProperty} scopeData
   * @param {Object} bindings
   * @param {number} expressionArgumentsCount
   */
  GalaxyView.makeBinding = function (target, targetKeyName, scopeData, bindings, expressionArgumentsCount) {
    if (typeof scopeData !== 'object') {
      return;
    }

    // Create portal for scope data
    // Create reactive property for each property on the scope data
    // Use that property structure to create further bindings

    let structure = scopeData;
    let value = scopeData;

    if (scopeData instanceof GalaxyView.ReactiveProperty) {
      structure = scopeData.valueStructure;
      value = scopeData.value;
    }

    let propertyKeysPaths = bindings.propertyKeysPaths;
    let expression = bindings.isExpression;

    // expression === true means that a expression function is available and should be extracted
    if (expression === true) {
      const handler = propertyKeysPaths.pop();
      // variables = variables.slice(0, variables.length - 1);
      expressionArgumentsCount = propertyKeysPaths.length;
      propertyKeysPaths = propertyKeysPaths.map(function (name) {
        return name.replace(/<>/g, '');
      });

      // bindings.expressionScope = value;

      // Generate expression arguments
      try {
        expression = Galaxy.GalaxyView.createExpressionFunction(target, handler, propertyKeysPaths, value, targetKeyName);
      }
      catch (exception) {
        throw console.error(exception.message + '\n', propertyKeysPaths);
      }
    } else if (!expression) {
      expressionArgumentsCount = 1;
    }

    let propertyKeyPath = null;
    let childPropertyKeyPath = null;
    let initValue = null;
    let aliasPropertyName = false;
    let propertyKeyPathItems = [];

    for (let i = 0, len = propertyKeysPaths.length; i < len; i++) {
      propertyKeyPath = propertyKeysPaths[i];
      childPropertyKeyPath = null;
      aliasPropertyName = false;

      propertyKeyPathItems = propertyKeyPath.split('.');
      if (propertyKeyPathItems.length > 1) {
        propertyKeyPath = propertyKeyPathItems.shift();
        childPropertyKeyPath = propertyKeyPathItems.join('.');
      }

      const structurePortal = GalaxyView.getPortal(structure);

      if (typeof expression === 'function') {
        // debugger;
      }

      // If the property name is `this` and its index is zero, then it is pointing to the ViewNode.data property
      if (i === 0 && propertyKeyPath === 'this' && target instanceof Galaxy.GalaxyView.ViewNode) {
        i = 1;
        propertyKeyPath = propertyKeyPathItems.shift();
        childPropertyKeyPath = null;
        aliasPropertyName = 'this.' + propertyKeyPath;
        value = GalaxyView.propertyLookup(target.data, propertyKeyPath);
      } else {
        value = GalaxyView.propertyLookup(structure, propertyKeyPath);
      }

      // if (typeof expression === 'function') {
      //   debugger;
      // }

      initValue = value;
      if (value !== null && typeof value === 'object') {
        initValue = value[propertyKeyPath];
        // if (scopeData instanceof Array) {
        //   initValue = value[propertyKeyPath];
        // } else {
        //   initValue = structure[propertyKeyPath];
        // }
      }

      let enumerable = true;
      if (propertyKeyPath === 'length' && value instanceof Array) {
        propertyKeyPath = '_length';
        aliasPropertyName = 'length';
        enumerable = false;
      }
      if(propertyKeyPath==='groups') debugger;
      const referenceName = propertyKeyPath;

      /** @type Galaxy.GalaxyView.ReactiveProperty */
      let reactiveProperty = structurePortal.refs[referenceName];

      if (typeof reactiveProperty === 'undefined') {
        reactiveProperty = GalaxyView.createReactiveProperty(value, propertyKeyPath, {
          alias: aliasPropertyName,
          enumerable: enumerable,
          initValue: initValue
        });
      }

      if (initValue !== null && typeof initValue === 'object' && !(initValue instanceof Array)) {
        const initValuePortal = GalaxyView.getPortal(initValue, structurePortal.refs[propertyKeyPath]);

        for (let key in initValue) {
          if (initValue.hasOwnProperty(key) && !initValuePortal.refs.hasOwnProperty(key)) {
            GalaxyView.createReactiveProperty(initValue, key, {
              enumerable: true,
              initValue: initValue[key]
            });
          }
        }
      }

      if (childPropertyKeyPath === null) {
        if (!(target instanceof Galaxy.GalaxyView.ViewNode)) {
          // If referenceName is not null target[targetKeyName] will be dataObject[referenceName]
          // so any opration on target[targetKeyName] will actually happen on dataObject[referenceName]
          GalaxyView.createReactiveProperty(target, targetKeyName, {
            referencePropertyName: referenceName,
            referencePropertyScope: value,
            enumerable: enumerable,
            initValue: initValue,
            expression: expression
          });
        }

        reactiveProperty.addNode(target, targetKeyName, value, expression);
      }

      if (typeof expression === 'function') {
        // debugger;
      }

      if (childPropertyKeyPath !== null) {
        // If initValue is null, then use valueStructure.
        // This makes sure that valueStructure will always correctly represent how the value will be
        GalaxyView.makeBinding(target, targetKeyName, reactiveProperty, {
          propertyKeysPaths: [childPropertyKeyPath],
          isExpression: expression
        }, expressionArgumentsCount);

      }
      // Call init value only on the last variable binding,
      // so the expression with multiple arguments get called only once
      else if (typeof value === 'object' && expressionArgumentsCount === 1) {
        // reactiveProperty.setValueStructure(valueStructure);
        reactiveProperty.initValueFor(target, targetKeyName, initValue, value);
      }
      expressionArgumentsCount--;
    }
  };

  /**
   *
   * @param subjects
   * @param data
   * @param {boolean} cloneSubject
   * @returns {*}
   */
  GalaxyView.bindSubjectsToData = function (subjects, data, cloneSubject) {
    let keys = Object.keys(subjects);
    let attributeName;
    let attributeValue;
    let subjectsClone = cloneSubject ? GalaxyView.createClone(subjects) : subjects;

    for (let i = 0, len = keys.length; i < len; i++) {
      attributeName = keys[i];
      attributeValue = subjectsClone[attributeName];

      let bindings = GalaxyView.getBindings(attributeValue);

      if (bindings.propertyKeysPaths) {
        GalaxyView.makeBinding(subjectsClone, attributeName, data, bindings);
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
    if (!property.name) {
      throw new Error('createPropertySetter: property.name is mandatory in order to create property setter');
    }

    return function (value, oldValue) {
      if (value instanceof Promise) {
        let asyncCall = function (asyncValue) {
          let newValue = property.parser ? property.parser(asyncValue) : asyncValue;
          node.node[property.name] = newValue;
          node.notifyObserver(property.name, newValue, oldValue);
        };
        value.then(asyncCall).catch(asyncCall);
      } else {
        const newValue = property.parser ? property.parser(value, GalaxyView.getBindings(node.schema[property.name])) : value;
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
      if (value instanceof Promise) {
        const asyncCall = function (asyncValue) {
          const newValue = parser ? parser(asyncValue) : asyncValue;
          GalaxyView.setAttr(node, attributeName, newValue, oldValue);
        };
        value.then(asyncCall).catch(asyncCall);
      } else {
        const newValue = parser ? parser(value) : value;
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

    if (value['reactive']) {
      return changes;
    }

    const arrayProto = Array.prototype;
    const methods = [
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
    defineProp(value, 'reactive', boundPropertyReference);

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
  GalaxyView.installReactiveBehavior = function (node, key, scopeData) {
    let behavior = GalaxyView.REACTIVE_BEHAVIORS[key];
    let bindTo = node.schema[key];

    if (behavior) {
      // let matches = behavior.regex ? (typeof(bindTo) === 'string' ? bindTo.match(behavior.regex) : bindTo) : bindTo;

      // node.setters[key] = (function (_behavior, _matches, _scopeData) {
      //   let _cache = {};
      //   if (_behavior.getCache) {
      //     _cache = _behavior.getCache.call(node, _matches, _scopeData);
      //   }

      // return function (vn, value, valueStructure, expression) {
      //   return _behavior.onApply.call(vn, _cache, value, valueStructure, _scopeData, expression);
      // };
      // })(behavior, matches, scopeData);

      const matches = behavior.regex ? (typeof(bindTo) === 'string' ? bindTo.match(behavior.regex) : bindTo) : bindTo;
      const data = behavior.prepareData.call(node, matches, scopeData);
      if (data !== undefined) {
        node.cache[key] = data;
      }

      behavior.install.call(node, data);
    }
  };

  GalaxyView.PROPERTY_SETTERS = {
    'none': function () {
      return function () {

      };
    }
  };

  GalaxyView.createSetter = function (viewNode, attributeName, expression, scope) {
    let property = GalaxyView.NODE_SCHEMA_PROPERTY_MAP[attributeName];

    if (!property) {
      property = {
        type: 'attr'
      };
    }

    if (property.util) {
      property.util(viewNode, attributeName, expression, scope);
    }

    // if viewNode is virtual, then the expression should be ignored
    if (property.type !== 'reactive' && viewNode.virtual) {
      return function () { };
    }

    return GalaxyView.PROPERTY_SETTERS[property.type](viewNode, attributeName, property, expression, scope);
  };

  GalaxyView.setPropertyForNode = function (viewNode, attributeName, value, scopeData) {
    const property = GalaxyView.NODE_SCHEMA_PROPERTY_MAP[attributeName] || { type: 'attr' };

    switch (property.type) {
      case 'attr':
        GalaxyView.createDefaultSetter(viewNode, attributeName, property.parser)(value, null);
        break;

      case 'prop':
        GalaxyView.createPropertySetter(viewNode, property)(value, null);
        break;

      case 'reactive': {
        // const reactiveApply = GalaxyView.createSetter(viewNode, attributeName, null, scopeData);
        if (viewNode.setters[property.name]) {
          // debugger;
          return;
        }
        // if(value instanceof Array) debugger;
        const reactiveApply = GalaxyView.createSetter(viewNode, attributeName, null, scopeData);
        viewNode.setters[property.name] = reactiveApply;

        reactiveApply(value, null);
        break;
      }

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

    if (typeof nodeSchema === 'string') {
      const content = document.createElement('div');
      content.innerHTML = nodeSchema;
      const nodes = Array.prototype.slice.call(content.childNodes);
      nodes.forEach(function (node) {
        parent.node.appendChild(node);
      });

      return nodes;
    }

    if (nodeSchema instanceof Array) {
      for (i = 0, len = nodeSchema.length; i < len; i++) {
        GalaxyView.createNode(parent, scopeData, nodeSchema[i], null);
      }
    } else if (nodeSchema !== null && typeof(nodeSchema) === 'object') {
      // make scopeData reactive ready
      // GalaxyView.makeReactiveReady(scopeData);

      let viewNode = new GalaxyView.ViewNode(null, nodeSchema, null, localScope);
      parent.registerChild(viewNode, position);

      // if (nodeSchema['mutator']) {
      //   viewNode.mutator = nodeSchema['mutator'];
      // }

      let keys = Object.keys(nodeSchema);
      let attributeValue, attributeName;

      // Definition stage
      for (i = 0, len = keys.length; i < len; i++) {
        attributeName = keys[i];
        if (GalaxyView.REACTIVE_BEHAVIORS[attributeName]) {
          GalaxyView.installReactiveBehavior(viewNode, attributeName, scopeData);
        }
      }

      // Value assignment stage
      for (i = 0, len = keys.length; i < len; i++) {
        attributeName = keys[i];
        attributeValue = nodeSchema[attributeName];

        let bindings = GalaxyView.getBindings(attributeValue);

        // if (attributeValue instanceof String) {
        //   console.info(Array.prototype.join.call(attributeValue));
        //   // debugger;
        //   // attributeValue = String.prototype.toString.call('',);
        // }

        if (bindings.propertyKeysPaths) {
          GalaxyView.makeBinding(viewNode, attributeName, scopeData, bindings);
        } else {
          GalaxyView.setPropertyForNode(viewNode, attributeName, attributeValue, scopeData);
        }
      }

      if (!viewNode.virtual) {
        viewNode.callLifecycleEvent('postInit');
        if (viewNode.inDOM) {
          viewNode.setInDOM(true);
        }

        GalaxyView.createNode(viewNode, scopeData, nodeSchema.children, null);
        viewNode.inserted.then(function () {
          viewNode.callLifecycleEvent('postChildrenInsert');
        });
      } else {
        viewNode.callLifecycleEvent('postInit');
      }

      // viewNode.onReady promise will be resolved after all the dom manipulations are done
      // this make sure that the viewNode and its child elements are rendered
      // setTimeout(function () {
      viewNode.sequences.enter.nextAction(function () {
        viewNode.callLifecycleEvent('rendered');
        viewNode.hasBeenRendered();
      });

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
    _this.config = {
      cleanContainer: false
    };

    if (scope.element instanceof GalaxyView.ViewNode) {
      _this.container = scope.element;
    } else {
      _this.container = new GalaxyView.ViewNode(null, {
        tag: scope.element.tagName
      }, scope.element);

      _this.container.sequences.enter.nextAction(function () {
        _this.container.hasBeenRendered();
      });
    }

    _this.renderingFlow = this.container.renderingFlow;
  }

  GalaxyView.prototype.setupRepos = function (repos) {
    this.dataRepos = repos;
  };

  GalaxyView.prototype.init = function (schema) {
    const _this = this;

    if (_this.config.cleanContainer) {
      _this.container.node.innerHTML = '';
    }

    _this.container.renderingFlow.next(function (next) {
      GalaxyView.createNode(_this.container, _this.scope, schema, null);
      _this.container.sequences.enter.nextAction(function () {
        next();
      });
    });
  };

  GalaxyView.prototype.broadcast = function (event) {
    this.container.broadcast(event);
  };

  return GalaxyView;
}(Galaxy || {}));

/* global Galaxy */

Galaxy.GalaxyView.Portal = /** @class */(function () {
  /**
   *
   * @constructor
   */
  function Portal() {
    /** @type Galaxy.GalaxyView.ReactiveProperty */
    this.parents = [];
    this.refs = {};
  }

  //
  // Portal.prototype.setOwner = function (owner) {
  //   if (owner) {
  //     this.removeOwner(this.owner);
  //   }
  //
  //   this.owner = owner;
  // };

  Portal.prototype.getParents = function () {
    return this.parents;
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ReactiveProperty} owner
   */
  Portal.prototype.addParent = function (owner) {
    if (this.parents.indexOf(owner) === -1) {
      this.parents.push(owner);
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ReactiveProperty} owner
   */
  Portal.prototype.removeParent = function (owner) {
    let index = this.parents.indexOf(owner);
    if (index !== -1) {
      this.parents.splice(index, 1);
    }
  };

  /**
   *
   * @return {Array<Galaxy.GalaxyView.ReactiveProperty>}
   */
  Portal.prototype.getPropertiesList = function () {
    let list = [];
    const keys = Object.keys(this.refs);
    let i = 0;

    for (const len = keys.length; i < len; i++) {
      list.push(this.refs[keys[i]]);
    }

    return list;
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ReactiveProperty} property
   */
  Portal.prototype.setProperty = function (property, key) {
    this.refs[key] = property;
  };

  Portal.prototype.getValueOf = function (key) {
    const prop = this.refs[key];

    return prop ? prop.value : undefined;
  };

  Portal.prototype.setValue = function (value, scope) {
    const props = this.getPropertiesList();
    let i = 0, len = props.length;
    for (; i < len; i++) {
      props[i].setValue(value, scope);
    }
  };

  return Portal;
}());

/* global Galaxy */

Galaxy.GalaxyView.ReactiveProperty = /** @class */ (function () {
  const GV = Galaxy.GalaxyView;
  /**
   *
   * @param {Array|Object} host
   * @param {Galaxy.GalaxyView.ReactiveProperty} reactiveProperty
   */
  ReactiveProperty.installParentFor = function (host, reactiveProperty) {
    if (host instanceof Array) {
      let i = 0, len = host.length, itemPortal;
      for (; i < len; i++) {
        itemPortal = GV.getPortal(host[i]);
        if (itemPortal !== undefined) {
          itemPortal.addParent(reactiveProperty);
        }
      }
    } else {
      const itemPortal = GV.getPortal(host);
      if (itemPortal !== undefined) {
        itemPortal.addParent(reactiveProperty);
      }
    }
  };

  /**
   *
   * @param {Array} list
   * @param {Galaxy.GalaxyView.ReactiveProperty} reactiveProperty
   */
  ReactiveProperty.uninstallParentFor = function (list, reactiveProperty) {
    let itemPortal;
    list.forEach(function (item) {
      itemPortal = item[GV.PORTAL_PROPERTY_IDENTIFIER];
      if (itemPortal !== undefined) {
        itemPortal.removeParent(reactiveProperty);
      }
    });
  };

  /**
   *
   * @param {Object|Galaxy.GalaxyView.Portal} portal
   * @param {string} name
   * @param {*} value
   * @param {any?} valueStructure
   * @constructor
   * @memberOf Galaxy.GalaxyView
   */
  function ReactiveProperty(portal, name, value, valueStructure) {
    this.name = name;

    this.oldValue = undefined;
    this.value = value;
    this.portal = portal;
    this.valueStructure = null;

    this.keys = [];
    this.nodes = [];

    this.placeholderFor = null;
    this.valueStructure = valueStructure || null;
  }

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param {string} attributeName
   * @param {Function} expression
   * @public
   */
  ReactiveProperty.prototype.addNode = function (node, attributeName, scope, expression) {
    let index = this.nodes.indexOf(node);
    // Check if the node with the same property already exist
    // Insure that same node with different property bind can exist
    if (index === -1 || this.keys[index] !== attributeName) {
      if (node instanceof Galaxy.GalaxyView.ViewNode && !node.setters[attributeName]) {
        // debugger;
        node.installPropertySetter(this, attributeName, scope, expression);
      }

      this.keys.push(attributeName);
      this.nodes.push(node);
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   */
  ReactiveProperty.prototype.removeNode = function (node) {
    let nodeIndexInTheHost;
    while ((nodeIndexInTheHost = this.nodes.indexOf(node)) !== -1) {
      this.nodes.splice(nodeIndexInTheHost, 1);
      this.keys.splice(nodeIndexInTheHost, 1);
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ReactiveProperty} property
   */
  ReactiveProperty.prototype.removeNodesByProperty = function (property) {
    const _this = this;
    property.nodes.forEach(function (node) {
      _this.removeNode(node);
    });
  };

  ReactiveProperty.prototype.setValueStructure = function (structure) {
    this.valueStructure = (structure !== null && typeof structure === 'object') ? structure : null;
  };

  ReactiveProperty.prototype.initValueFor = function (target, key, value, scopeData) {
    // const oldValue = this.value;
    this.value = value;

    if (this.value instanceof Array) {
      ReactiveProperty.installParentFor(this.value, this);
      let init = GV.createActiveArray(this.value, this.update.bind(this));

      if (target instanceof GV.ViewNode) {
        this.setUpdateFor(target, key, init);
      }
    } else {
      this.setValueFor(target, key, this.value, this.oldValue, scopeData);
    }
  };

  ReactiveProperty.prototype.setValue = function (value, scopeData) {
    if (value === this.value) {
      return;
    }

    this.oldValue = this.value;
    if (value instanceof Array) {
      debugger;
    }
    this.applyValue(value, scopeData);
  };

  ReactiveProperty.prototype.applyValue = function (value, scopeData) {
    let oldValue = this.oldValue;
    if (value !== this.value) {
      oldValue = this.oldValue = this.value;
    }

    this.value = value;
    if (value instanceof Array) {
      let change = GV.createActiveArray(value, this.update.bind(this));
      change.type = 'reset';
      change.result = oldValue;
      this.update(change, { original: oldValue });
      Galaxy.GalaxyObserver.notify(this.portal, this.name, change, oldValue, this.portal);
    } else {
      let i = 0, len = this.nodes.length;
      for (; i < len; i++) {
        this.setValueFor(this.nodes[i], this.keys[i], value, oldValue, scopeData);
      }
      Galaxy.GalaxyObserver.notify(this.portal, this.name, value, oldValue, this.portal);
    }
  };

  ReactiveProperty.prototype.update = function (changes, oldChanges) {
    if (changes) {
      if (changes.type === 'push' || changes.type === 'reset' || changes.type === 'unshift') {
        ReactiveProperty.installParentFor(changes.params, this);
      } else if (changes.type === 'shift' || changes.type === 'pop') {
        ReactiveProperty.uninstallParentFor([changes.result], this);
      } else if (changes.type === 'splice' || changes.type === 'reset') {
        ReactiveProperty.uninstallParentFor(changes.result, this);
      }
    }

    for (let i = 0, len = this.nodes.length; i < len; i++) {
      this.setUpdateFor(this.nodes[i], this.keys[i], changes, oldChanges);
    }
  };

  ReactiveProperty.prototype.notify = function (caller) {
    for (let i = 0, len = this.nodes.length; i < len; i++) {
      this.setUpdateFor(this.nodes[i], this.keys[i], this.value, this.oldValue);
    }

    if (!this.placeholderFor) {
      Galaxy.GalaxyObserver.notify(this.portal, this.name, this.value, this.oldValue, caller);
    } else {
      debugger;
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
  ReactiveProperty.prototype.setValueFor = function (host, attributeName, value, oldValue, scopeData) {
    if (host instanceof Galaxy.GalaxyView.ViewNode) {
      if (!host.setters[attributeName]) {
        return console.info(host, attributeName, value);
      }

      host.setters[attributeName](value, oldValue, scopeData);
    } else {
      host[attributeName] = value;
    }
  };

  /**
   *
   * @param {(Galaxy.GalaxyView.ViewNode|Object)} host
   * @param {string} attributeName
   * @param {*} changes
   * @param {*} oldChanges
   */
  ReactiveProperty.prototype.setUpdateFor = function (host, attributeName, changes, oldChanges) {
    if (host instanceof Galaxy.GalaxyView.ViewNode) {
      host.setters[attributeName](changes, oldChanges);
    } else {
      // host[attributeName] = changes;
    }
  };

  ReactiveProperty.prototype.softUpdate = function (value) {
    if (value instanceof Array) {
      let change = GV.createActiveArray(value, this.update.bind(this));
      change.type = 'reset';
      change.result = this.oldValue;
      debugger
      this.update(change, { original: this.oldValue });
    } else {
      for (let i = 0, len = this.nodes.length; i < len; i++) {
        this.setUpdateFor(this.nodes[i], this.keys[i], value, this.oldValue);
      }
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ReactiveProperty} property
   */
  ReactiveProperty.prototype.concat = function (property) {
    this.nodes = this.nodes.concat(property.nodes);
    this.keys = this.keys.concat(property.keys);
  };

  ReactiveProperty.prototype.clone = function (portal) {
    const clone = new Galaxy.GalaxyView.ReactiveProperty(portal, this.name, null);
    clone.concat(this);
    clone.valueStructure = this.valueStructure;

    return clone;
  };

  ReactiveProperty.prototype.setPlaceholder = function (value) {
    const valuePortal = value[Galaxy.GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
    valuePortal.addParent(this);
    const oldKeys = Object.keys(this.valueStructure);
    const valueStructurePortal = this.valueStructure[Galaxy.GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
    debugger;
    oldKeys.forEach(function (key) {
      // We use soft just to update UI and leave the actual data of
      // the valueStructurePortal intact
      if (valuePortal.refs[key]) {
        valuePortal.refs[key].concat(valueStructurePortal.refs[key]);
      }
      valueStructurePortal.refs[key].softUpdate(value[key]);
    });
  };

  ReactiveProperty.prototype.removePlaceholder = function () {
    if (!this.placeholderFor) {
      return;
    }

    const _this = this;
    const placeholderPortal = this.placeholderFor[Galaxy.GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
    placeholderPortal.removeParent(_this);
    const keys = Object.keys(this.placeholderFor);
    // const valueStructurePortal = this.valueStructure[Galaxy.GalaxyView.PORTAL_PROPERTY_IDENTIFIER];

    keys.forEach(function (key) {
      if (placeholderPortal.refs[key]) {
        placeholderPortal.refs[key].removeNodesByProperty(_this);
      }
      // valueStructurePortal.refs[key].softUpdate(this.placeholderFor[key]);
    });
    this.placeholderFor = null;
  };

  return ReactiveProperty;

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
    let remove = null;

    for (let i = 0, len = toBeRemoved.length; i < len; i++) {
      remove = toBeRemoved[i];
      remove.renderingFlow.truncate();
      remove.destroy(sequence);
    }
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
    const _this = this;
    // this.root = root;
    _this.node = node || createElem(schema.tag || 'div');
    _this.schema = schema;
    _this.data = {};
    _this.cache = {};
    // _this.addons = {};
    _this.inputs = {};
    // _this.localScope = {};
    _this.virtual = false;
    _this.placeholder = createComment(schema.tag || 'div');
    _this.properties = {};
    // _this.behaviors = {};
    _this.inDOM = typeof schema.inDOM === 'undefined' ? true : schema.inDOM;
    _this.setters = {};
    _this.parent = null;
    _this.dependedObjects = [];
    // _this.domBus = [];
    _this.renderingFlow = new Galaxy.GalaxySequence();
    // _this.domManipulationSequence = new Galaxy.GalaxySequence();
    _this.sequences = {
      enter: new Galaxy.GalaxySequence(),
      leave: new Galaxy.GalaxySequence(),
      ':destroy': new Galaxy.GalaxySequence(true),
      ':class': new Galaxy.GalaxySequence().start()
    };
    _this.observer = new Galaxy.GalaxyObserver(_this);
    _this.origin = false;

    _this.hasBeenRendered = null;
    _this.rendered = new Promise(function (done) {
      _this.hasBeenRendered = function () {
        _this.rendered.resolved = true;
        done();
      };
    });
    _this.rendered.resolved = false;

    _this.inserted = new Promise(function (done) {
      _this.hasBeenInserted = function () {
        _this.inserted.resolved = true;
        done();
      };
    });
    _this.inserted.resolved = false;

    _this.destroyed = new Promise(function (done) {
      _this.hasBeenDestroyed = function () {
        _this.destroyed.resolved = true;
        done();
      };
    });
    _this.destroyed.resolved = false;

    __node__.value = this.node;
    GV.defineProp(this.schema, '__node__', __node__);

    referenceToThis.value = this;
    GV.defineProp(this.node, '__viewNode__', referenceToThis);
    GV.defineProp(this.placeholder, '__viewNode__', referenceToThis);

    _this.callLifecycleEvent('postCreate');
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

  ViewNode.prototype.virtualize = function () {
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
        _this.hasBeenInserted();
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
      _this.sequences.enter.nextAction(animationDone);
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
   * @param {Galaxy.GalaxyView.ReactiveProperty} boundProperty
   * @param {string} propertyName
   * @param {Function} expression
   */
  ViewNode.prototype.installPropertySetter = function (boundProperty, propertyName, scope, expression) {
    const exist = this.properties[boundProperty.name];
    if (exist) {
      if (exist.indexOf(boundProperty) === -1) {
        exist.push(boundProperty);
      }
    } else {
      this.properties[boundProperty.name] = [boundProperty];
    }

    this.setters[propertyName] = GV.createSetter(this, propertyName, expression, scope);
    if (!this.setters[propertyName]) {
      const _this = this;
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
          waitForNodeAnimation.then(function () {
            _this.hasBeenDestroyed();
            next();
          });
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

          waitForNodeAnimation.then(function () {
            _this.hasBeenDestroyed();
            next();
          });
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
      // debugger
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
            item.keys.push(key);
          }
        });
      } else {
        if (property.value.nodes.indexOf(this) === -1) {
          property.value.nodes.push(this);
          property.value.keys.push(key);
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

  /**
   *
   * @returns {*}
   */
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

/* global Galaxy, TweenLite, TimelineLite */
'use strict';

(function (G) {
  if (!window.TweenLite || !window.TimelineLite) {
    return console.warn('please load GSAP - GreenSock in order to activate animations');
  }

  G.GalaxyView.NODE_SCHEMA_PROPERTY_MAP['animations'] = {
    type: 'custom',
    name: 'animations',
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
        if (enterAnimationConfig.sequence) {
          AnimationMeta.get(enterAnimationConfig.sequence).configs.enter = enterAnimationConfig;
        }

        viewNode.populateEnterSequence = function (sequence) {
          sequence.onTruncate(function () {
            TweenLite.killTweensOf(viewNode.node);
          });

          sequence.next(function (done) {
            // if (enterAnimationConfig.cssName) {
            //   AnimationMeta.installCSSAnimation(viewNode, enterAnimationConfig, done);
            // } else {
            AnimationMeta.installGSAPAnimation(viewNode, enterAnimationConfig, done);
            // }
          });
        };
      }

      let leaveAnimationConfig = config.leave;
      if (leaveAnimationConfig) {
        if (leaveAnimationConfig.sequence) {
          AnimationMeta.get(leaveAnimationConfig.sequence).configs.leave = leaveAnimationConfig;
        }

        viewNode.populateLeaveSequence = function (sequence) {
          sequence.onTruncate(function () {
            TweenLite.killTweensOf(viewNode.node);
          });

          // in the case which the viewNode is not visible, then ignore its animation
          if (viewNode.node.offsetWidth === 0 || viewNode.node.offsetHeight === 0) {
            return sequence.next(function (done) {
              done();
            });
          }

          let animationDone;
          const pr = new Promise(function (res) {
            animationDone = res;
          });

          sequence.next((function (promise) {
            return function (done) {
              promise.then(done);
            };
          })(pr));

          if (leaveAnimationConfig.sequence) {
            // in the case which the viewNode is not visible, then ignore its animation
            // if (viewNode.node.offsetWidth === 0 || viewNode.node.offsetHeight === 0) {
            //   return animationDone();
            // }

            const animationMeta = AnimationMeta.get(leaveAnimationConfig.sequence);
            animationMeta.add(viewNode.node, leaveAnimationConfig, animationDone);

            // Add to parent should happen after the animation is added to the child
            if (leaveAnimationConfig.parent) {
              const parent = AnimationMeta.get(leaveAnimationConfig.parent);
              parent.addChild(animationMeta, animationMeta.configs.leave || {}, parent.configs.leave || {});
            }
          } else {
            AnimationMeta.createTween(viewNode.node, leaveAnimationConfig, animationDone);
          }
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
                      animationMeta =
                        animationMeta.getGroup(classAnimationConfig.group, classAnimationConfig.duration, classAnimationConfig.position ||
                          '+=0');
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

  // AnimationMeta.installCSSAnimation = function (viewNode, config, onComplete) {
  //   const duration = typeof config.duration === 'string' ? (config.duration || '0s') : (config.duration || 0) + 's';
  //   viewNode.node.style.animationName = config.cssName;
  //   viewNode.node.style.animationDuration = duration;
  //   const onAnimationEnd = function (event) {
  //     if (event.animationName === config.cssName) {
  //       viewNode.node.style.animationName = null;
  //       viewNode.node.style.animationDuration = null;
  //       onComplete();
  //       viewNode.node.removeEventListener('animationend', onAnimationEnd);
  //     }
  //   };
  //
  //   viewNode.node.addEventListener('animationend', onAnimationEnd);
  // };

  AnimationMeta.installGSAPAnimation = function (viewNode, config, onComplete) {
    if (config.sequence) {
      let animationMeta = AnimationMeta.get(config.sequence);
      let lastStep = config.to || config.from;
      lastStep.clearProps = 'all';
      animationMeta.add(viewNode.node, config, onComplete);

      // Add to parent should happen after the animation is added to the child
      if (config.parent) {
        const parent = AnimationMeta.get(config.parent);
        parent.addChild(animationMeta, animationMeta.configs.enter || {}, parent.configs.enter || {});
      }
    } else {
      let lastStep = config.to || config.from;
      lastStep.clearProps = 'all';
      AnimationMeta.createTween(viewNode.node, config, onComplete);
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
        if (_this.parent) {
          _this.parent.timeline.remove(_this.timeline);
        }
      }
    });

    this.timeline.addLabel('beginning', 0);
    // this.duration = 0;
    // this.position = '+=0';
    this.configs = {};
    this.lastChildPosition = 0;
    this.parent = null;
  }

  AnimationMeta.prototype.calculateLastChildPosition = function (duration, position) {
    const calc = AnimationMeta.calculateDuration(duration, position || '+=0');
    const lcp = (this.lastChildPosition * 10);
    const c = (calc * 10);
    this.lastChildPosition = (lcp + c) / 10;

  };

  AnimationMeta.prototype.addChild = function (child, childConf, parentConf) {
    const _this = this;
    child.parent = _this;

    const children = this.timeline.getChildren(false);

    if (children.indexOf(child.timeline) === -1) {
      if (_this.timeline.getChildren(false, true, false).length === 0) {
        _this.timeline.add(child.timeline, 0);
      } else {
        _this.timeline.add(child.timeline, childConf.chainToParent ? childConf.position : '+=0');
      }
    }
  };

  AnimationMeta.prototype.add = function (node, config, onComplete) {
    const _this = this;
    let to = Object.assign({}, config.to || {});
    to.onComplete = onComplete;
    to.onStartParams = [node['__viewNode__']];

    let onStart = config.onStart;
    to.onStart = onStart;

    let tween = null;
    if (config.from && config.to) {
      tween = TweenLite.fromTo(node,
        config.duration || 0,
        config.from || {},
        to);
    } else if (config.from) {
      let from = Object.assign({}, config.from || {});
      from.onComplete = onComplete;
      from.onStartParams = [node['__viewNode__']];
      from.onStart = onStart;
      tween = TweenLite.from(node,
        config.duration || 0,
        from || {});
    } else {
      tween = TweenLite.to(node,
        config.duration || 0,
        to || {});
    }

    tween.data = {
      am: _this,
      config: config
    };
    // debugger;
    // First animation in the timeline should always start at zero
    if (this.timeline.getChildren(false, true, false).length === 0) {
      let progress = _this.timeline.progress();
      if (config.parent) {
        _this.timeline.add(tween, config.chainToParent ? config.position : '+=0');
      } else {
        _this.timeline.add(tween, config.position);
      }

      if (!progress) {
        _this.timeline.play(0);
      }
    } else {
      // if (config.parent) {
      //   _this.timeline.add(tween, config.chainToParent ? config.position : '+=0');
      // } else {
      _this.timeline.add(tween, config.position);
      // }
    }
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

(function (G) {
  G.GalaxyView.NODE_SCHEMA_PROPERTY_MAP['text'] = {
    type: 'custom',
    name: 'text',
    handler: function (viewNode, attr, value) {
      const textNode = viewNode.node['<>text'];
      const textValue = typeof value === 'undefined' ? '' : value;
      if (textNode) {
        textNode.textContent = textValue;
      } else {
        viewNode.node['<>text'] = document.createTextNode(textValue);
        viewNode.node.insertBefore(viewNode.node['<>text'], viewNode.node.firstChild);
      }
    }
  };
})(Galaxy);

/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['checked'] = {
    type: 'prop',
    name: 'checked',
    util: function (viewNode, prop, expression, dataObject) {
      if (expression && viewNode.schema.tag === 'input') {
        throw new Error('input.checked property does not support binding expressions ' +
          'because it must be able to change its data.\n' +
          'It uses its bound value as its `model` and expressions can not be used as model.\n');
      }

      const bindings = GV.getBindings(viewNode.schema.checked);
      const id = bindings.propertyKeysPaths[0].split('.').pop();
      viewNode.node.addEventListener('change', function () {
        dataObject[id] = viewNode.node.checked;
      });
    }
  };
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['value.config'] = {
    type: 'none'
  };

  GV.NODE_SCHEMA_PROPERTY_MAP['value'] = {
    type: 'prop',
    name: 'value',
    util: function (viewNode, prop, expression, dataObject) {
      if (expression) {
        throw new Error('input.value property does not support binding expressions ' +
          'because it must be able to change its data.\n' +
          'It uses its bound value as its `model` and expressions can not be used as model.\n');
      }

      const bindings = GV.getBindings(viewNode.schema.value);
      const id = bindings.propertyKeysPaths[0].split('.').pop();
      if (bindings.modifiers === 'number') {
        viewNode.node.addEventListener('keyup', function () {
          dataObject[id] = viewNode.node.value ? Number(viewNode.node.value) : null;
        });
      } else {
        viewNode.node.addEventListener('keyup', function () {
          dataObject[id] = viewNode.node.value;
        });
      }
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
    prepareData: function () {

    },
    install: function (data) {

    },
    /**
     *
     * @param data
     * @param value
     * @param oldValue
     * @param scope
     * @this {Galaxy.GalaxyView.ViewNode}
     */
    apply: function (data, value, oldValue, expression, scope) {
      if (this.virtual) {
        return;
      }

      const _this = this;
      const node = _this.node;

      if (typeof value === 'string') {
        return node.setAttribute('class', value);
      } else if (value instanceof Array) {
        return node.setAttribute('class', value.join(' '));
      } else if (value === null) {
        return node.removeAttribute('class');
      }

      const clone = GV.bindSubjectsToData(value, scope, true);

      if (_this.setters.class.hasOwnProperty('data') && clone !== _this.setters.class['data']) {
        Galaxy.resetObjectTo(_this.setters.class['data'], clone);
      } else if (!_this.setters.class.hasOwnProperty('data')) {
        _this.setters.class['data'] = clone;
      }

      node.setAttribute('class', []);
      const observer = new Galaxy.GalaxyObserver(clone);
      observer._node = _this.node;

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

      // We add clone as a depended object to this node so when the node is destroyed,
      // its depended objects will be destroyed as well and prevents memory leak.
      _this.addDependedObject(clone);
    }
  };

  function getClasses(classes) {
    if (typeof classes === 'string') {
      return [classes];
    } else if (classes instanceof Array) {
      return classes;
    } else if (classes !== null && typeof classes === 'object') {
      let newClasses = [];

      for (let key in classes) {
        if (classes.hasOwnProperty(key) && classes[key]) {
          newClasses.push(key);
        }
      }

      return newClasses;
    }
  }

  function toggles(key, value, oldValue, classes) {
    if (oldValue === value) {
      return;
    }
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
    prepareData: function (matches, scope) {
      this.virtualize();
      return {
        module: null
      };
    },
    install: function (data) {

    },
    apply: function (cache, selector, oldSelector, expression, scope) {
      if (scope.element.schema.children && scope.element.schema.hasOwnProperty('module')) {
        // this.domManipulationSequence.next(function (done) {
        let allContent = scope.element.schema.children;
        let parentViewNode = this.parent;
        allContent.forEach(function (content) {
          if (selector === '*' || selector.toLowerCase() === content.node.tagName.toLowerCase()) {
            content.__node__.__viewNode__.refreshBinds(scope);
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
  GV.NODE_SCHEMA_PROPERTY_MAP['$for'] = {
    type: 'reactive',
    name: '$for'
  };

  GV.REACTIVE_BEHAVIORS['$for'] = {
    regex: /^([\w]*)\s+in\s+([^\s\n]+)$/,
    prepareData: function (matches, scope) {
      this.virtualize();

      return {
        propName: matches.as || matches[1],
        nodes: [],
        scope: scope,
        matches: matches
      };
    },
    /**
     *
     * @param data Return of prepareData method
     */
    install: function (data) {
      if (data.matches instanceof Array) {
        GV.makeBinding(this, '$for', data.scope, {
          isExpression: false,
          modifiers: null,
          propertyKeysPaths: [data.matches[2]]
        });
      } else if (data.matches) {
        const bindings = GV.getBindings(data.matches.data);
        if (bindings.propertyKeysPaths) {
          GV.makeBinding(this, '$for', data.scope, bindings);
        }
      }
    },
    /**
     *
     * @this {Galaxy.GalaxyView.ViewNode}
     * @param data The return of prepareData
     * @param changes
     * @param oldChanges
     * @param expression
     * @param scope
     */
    apply: function (data, changes, oldChanges, expression, scope) {
      if (!changes || typeof changes === 'string') {
        changes = {
          type: 'reset',
          params: []
        };
      }

      if (expression) {
        changes.params = expression();
      }

      const _this = this;
      debugger
      createResetProcess(_this, data, changes, data.scope);
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param data
   * @param changes
   * @param nodeScopeData
   */
  const createResetProcess = function (node, data, changes, nodeScopeData) {
    node.renderingFlow.truncate();
    if (changes.type === 'reset') {
      node.renderingFlow.next(function forResetProcess(next) {
        GV.ViewNode.destroyNodes(node, data.nodes.reverse());
        data.nodes = [];

        node.parent.sequences.leave.nextAction(function () {
          next();
        });
      });

      changes = Object.assign({}, changes);
      changes.type = 'push';

      if (changes.params.length) {
        createPushProcess(node, data, changes, nodeScopeData);
      }
    } else {
      createPushProcess(node, data, changes, nodeScopeData);
    }
  };

  const createPushProcess = function (node, data, changes, nodeScopeData) {
    const parentNode = node.parent;
    let position = null;
    let newItems = [];
    let action = Array.prototype.push;

    node.renderingFlow.next(function forPushProcess(next) {
      if (changes.type === 'push') {
        let length = data.nodes.length;
        if (length) {
          position = data.nodes[length - 1].getPlaceholder().nextSibling;
        } else {
          position = node.placeholder.nextSibling;
        }

        newItems = changes.params;
      } else if (changes.type === 'unshift') {
        position = data.nodes[0] ? data.nodes[0].getPlaceholder() : null;
        newItems = changes.params;
        action = Array.prototype.unshift;
      } else if (changes.type === 'splice') {
        let removedItems = Array.prototype.splice.apply(data.nodes, changes.params.slice(0, 2));
        newItems = changes.params.slice(2);
        removedItems.forEach(function (node) {
          node.destroy();
        });
      } else if (changes.type === 'pop') {
        data.nodes.pop().destroy();
      } else if (changes.type === 'shift') {
        data.nodes.shift().destroy();
      } else if (changes.type === 'sort' || changes.type === 'reverse') {
        data.nodes.forEach(function (viewNode) {
          viewNode.destroy();
        });

        data.nodes = [];
        newItems = changes.original;
      }

      let itemDataScope = nodeScopeData;
      let p = data.propName, n = data.nodes, cns;
      const templateSchema = node.cloneSchema();
      Reflect.deleteProperty(templateSchema, '$for');

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

      parentNode.sequences.enter.nextAction(next);
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
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['$if'] = {
    type: 'reactive',
    name: '$if'
  };

  GV.REACTIVE_BEHAVIORS['$if'] = {
    prepareData: function () {

    },
    install: function (data) {
    },
    apply: function (data, value, oldValue, expression, scope) {
      if (expression) {
        value = expression();
      }

      createProcess(this, value);
    }
  };

  function createProcess(node, value) {
    // debugger
    // node.rendered.then(function () {
    // node.renderingFlow.truncate();
    // node.renderingFlow.next(function ifProcess(next) {
    if (value && !node.inDOM) {
      node.setInDOM(true);
      // node.sequences.enter.next(function () {
      //   next();
      // });
    } else if (!value && node.inDOM) {
      // debugger;
      node.setInDOM(false);
      // node.sequences.leave.next(next);
    } else {
      // next();
    }
    // });
    // });
  }
})(Galaxy.GalaxyView);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['module'] = {
    type: 'reactive',
    name: 'module'
  };

  GV.REACTIVE_BEHAVIORS['module'] = {
    regex: null,
    prepareData: function (matches, scope) {
      return {
        module: null,
        moduleMeta: null,
        scope: scope
      };
    },
    install: function (data) {

    },
    apply: function handleModule(data, moduleMeta, oldModuleMeta, expression, scope) {
      const _this = this;

      if (expression) {
        moduleMeta = expression();
      }

      if (moduleMeta === undefined) {
        return;
      }

      if (typeof moduleMeta !== 'object') {
        return console.error('module property only accept objects as value', moduleMeta);
      }

      if (!_this.virtual && moduleMeta && moduleMeta.url && moduleMeta !== data.moduleMeta) {
        _this.rendered.then(function () {
          _this.renderingFlow.truncate();
          _this.clean();

          moduleLoaderGenerator(_this, data, moduleMeta)(function () {});
        });
      } else if (!moduleMeta) {
        _this.clean();
      }

      data.moduleMeta = moduleMeta;
    }
  };

  const moduleLoaderGenerator = function (viewNode, cache, moduleMeta) {
    // viewNode.renderingFlow.truncate();
    return function (done) {
      // viewNode.renderingFlow.truncate();
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
        viewNode.renderingFlow.truncate();
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
})(Galaxy.GalaxyView);


/* global Galaxy */

Galaxy.GalaxyView.PROPERTY_SETTERS.attr = function (viewNode, attrName, property, expression) {
  let parser = property.parser;
  const setter = Galaxy.GalaxyView.createDefaultSetter(viewNode, attrName, parser);
  if (expression) {
    return function (none, oldValue) {
      let expressionValue = expression(none);
      setter(expressionValue, oldValue);
    };
  }

  return setter;
};

/* global Galaxy */

Galaxy.GalaxyView.PROPERTY_SETTERS.custom = function (viewNode, attrName, property, expression) {
  const setter = Galaxy.GalaxyView.createCustomSetter(viewNode, attrName, property);

  if (expression) {
    return function (none, oldValue, scopeData) {
      const expressionValue = expression(none);
      setter(expressionValue, oldValue, scopeData);
    };
  }

  return setter;
};

/* global Galaxy */

Galaxy.GalaxyView.PROPERTY_SETTERS.prop = function (viewNode,attrName, property, expression) {
  const setter = Galaxy.GalaxyView.createPropertySetter(viewNode, property);

  if (expression) {
    return function (none, oldValue) {
      let expressionValue = expression(none);
      setter(expressionValue, oldValue);
    };
  }

  return setter;
};

/* global Galaxy */
(function () {
  Galaxy.GalaxyView.PROPERTY_SETTERS.reactive = function (viewNode, attrName, property, expression, scope) {
    // const reactiveFunction = viewNode.setters[property.name];
    let behavior = Galaxy.GalaxyView.REACTIVE_BEHAVIORS[property.name];
    const cache = viewNode.cache[attrName];
    const reactiveFunction = createReactiveFunction(behavior, viewNode, cache, expression, scope);

    // if (!reactiveFunction) {
    //   console.error('Reactive handler not found for: ' + property.name);
    // }

    return reactiveFunction;
  };

  function createReactiveFunction(behavior, vn, data, expression, scope) {
    return function (value, oldValue) {
      return behavior.apply.call(vn, data, value, oldValue, expression, scope);
    };
  }
})();

/* global Galaxy */
'use strict';

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
    prepareData: function (matches, scope) {
      if (matches !== null && typeof  matches !== 'object') {
        throw console.error('inputs property should be an object with explicits keys:\n', JSON.stringify(this.schema, null, '  '));
      }

      const reactive = GV.bindSubjectsToData(matches, scope, true);

      return {
        reactive: reactive,
        subjects: matches,
        scope: scope
      };
    },
    install: function (data) {
      if (this.virtual) {
        return;
      }

      if (this.cache.inputs && this.cache.inputs.reactive !== data.reactive) {
        Galaxy.resetObjectTo(this.cache.inputs, data);
      } else if (this.cache.inputs === undefined) {
        this.cache.inputs = data;
      }

      this.inputs = data.reactive;
      this.addDependedObject(data.reactive);
    },
    apply: function (cache, value, oldValue, context) {

    }
  };

  Galaxy.registerAddOnProvider('galaxy/inputs', function (scope) {
    return {
      create: function () {
        scope.inputs = scope.element.cache.inputs.reactive;

        return scope.inputs;
      },
      finalize: function () {
        // By linking the live to original we make sure that changes on the local copy of the input data will be
        // reflected to the original one
        // GV.link(scope.element.addons.inputs.live, scope.element.addons.inputs.original);
      }
    };
  });
})(Galaxy.GalaxyView);

/* global Galaxy */
'use strict';

(function (G) {

  const elements = [
    // Content sectioning
    'address',
    'article',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hgroup',
    // Text content
    'blockquote',
    'li',
    'p',
    'pre',
    // Inline text semantics
    'a',
    'br',
    'code',
    'span',
    'strong',
    'time',
    // Image and multimedia
    'area',
    'audio',
    'img',
    'map',
    'track',
    'video',
    // Embedded content
    'object',
    'param',
    // Table content
    'caption',
    'col',
    'td',
    'th',
    // Forms
    'button',
    'input',
    'label',
    'legend',
    'meter',
    'option',
    'output',
    'progress',
    'textarea',
    // Interactive elements
    'summary',
    // Web Components
    'slot',
    'template'
  ];
  const decorators = [
    'type',
    'text',
    'html',
    'value',
    'checked',
    'disabled',
    'id',
    'title',
    'translate',
    'dir',
    'lang',
    'spellcheck',
    'draggable',
    'dropzone',
    'hidden',
    'accesskey',
    'tabindex',
    'lifecycle',
    'inputs',
    'for',
    'if'
  ];

  function Tag(tag) {
    const _this = this;
    _this.tag = tag;
  }

  Object.defineProperty(Tag.prototype, '_decorate', {
    value: function (id, value) {
      if (value === undefined) {
        Reflect.deleteProperty(this, id);

        return this;
      }

      this[id] = value;

      return this;
    },
    enumerable: false
  });

  Object.defineProperty(Tag.prototype, '_attr', {
    value: function (id, value) {
      if (value === undefined) {
        Reflect.deleteProperty(this, id);

        return this;
      }

      this[id] = value;

      return this;
    },
    enumerable: false
  });

  Object.defineProperty(Tag.prototype, 'class', {
    value: function (value) {
      return this._decorate('class', value);
    },
    enumerable: false,
    writable: true
  });

  Object.defineProperty(Tag.prototype, 'css', {
    value: function (value) {
      return this._decorate('style', value);
    },
    enumerable: false
  });

  Object.defineProperty(Tag.prototype, 'onEvent', {
    value: function (event, handler) {
      this.on = this.on || {};

      this.on[event] = handler;

      return this;
    },
    enumerable: false
  });

  decorators.forEach(function (decorator) {
    Object.defineProperty(Tag.prototype, decorator, {
      value: function (value) {
        return this._decorate(decorator, value);
      },
      enumerable: false,
      writable: true
    });
  });

  elements.forEach(function (element) {
    Tag[element] = function (text) {
      const tag = new Tag(element);

      if (text) {
        tag.text(text);
      }

      return tag;
    };
  });

  G.registerAddOnProvider('galaxy/tag', function (scope) {
    return {
      create: function () {
        return Tag;
      },
      finalize: function () {

      }
    };
  });
})(Galaxy);

/* global Galaxy */
'use strict';

(function (G) {
  G.registerAddOnProvider('galaxy/view', function (scope) {
    return {
      create: function () {
        const view = new Galaxy.GalaxyView(scope);

        return view;
      },
      finalize: function () {

      }
    };
  });
})(Galaxy);
