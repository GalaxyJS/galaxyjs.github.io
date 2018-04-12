/* eslint-disable */
/**
 * @link https://github.github.io/fetch/
 */

(function (self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function () {
      try {
        new Blob()
        return true
      } catch (e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

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
    ]

    var isDataView = function (obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function (obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function () {
        var value = items.shift()
        return { done: value === undefined, value: value }
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function () {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function (value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function (header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function (name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function (name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue + ',' + value : value
  }

  Headers.prototype['delete'] = function (name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function (name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function (name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function (name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function (callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function () {
    var items = []
    this.forEach(function (value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function () {
    var items = []
    this.forEach(function (value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function () {
    var items = []
    this.forEach(function (value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.onerror = function () {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function (body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function () {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function () {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function () {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function () {
        return this.text().then(decode)
      }
    }

    this.json = function () {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function () {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function (bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
    preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status === undefined ? 200 : options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function () {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function () {
    var response = new Response(null, { status: 0, statusText: '' })
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function (url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, { status: status, headers: { location: url } })
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function (input, init) {
    return new Promise(function (resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function () {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function () {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function () {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function (value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

(function () {
  if (typeof Object.assign != 'function') {
    Object.assign = function (target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      const to = Object(target);

      for (let index = 1; index < arguments.length; index++) {
        let nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (let nextKey in nextSource) {
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
})();

(function (root) {
  if (typeof root.CustomEvent === 'function') {
    return false;
  }

  function CustomEvent(event, params) {
    params = params || {bubbles: false, cancelable: false, detail: undefined};
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = root.Event.prototype;

  root.CustomEvent = CustomEvent;
})(this);

(function (root) {
  root.Reflect = root.Reflect || {
    deleteProperty: function (target, propertyKey) {
      delete target[propertyKey];
    }
  };
})(this);

/* eslint-disable */
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.4+314e4831
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.ES6Promise = factory());
}(this, (function () { 'use strict';

  function objectOrFunction(x) {
    var type = typeof x;
    return x !== null && (type === 'object' || type === 'function');
  }

  function isFunction(x) {
    return typeof x === 'function';
  }



  var _isArray = void 0;
  if (Array.isArray) {
    _isArray = Array.isArray;
  } else {
    _isArray = function (x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  }

  var isArray = _isArray;

  var len = 0;
  var vertxNext = void 0;
  var customSchedulerFn = void 0;

  var asap = function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      // If len is 2, that means that we need to schedule an async flush.
      // If additional callbacks are queued before the queue is flushed, they
      // will be processed by this flush that we are scheduling.
      if (customSchedulerFn) {
        customSchedulerFn(flush);
      } else {
        scheduleFlush();
      }
    }
  };

  function setScheduler(scheduleFn) {
    customSchedulerFn = scheduleFn;
  }

  function setAsap(asapFn) {
    asap = asapFn;
  }

  var browserWindow = typeof window !== 'undefined' ? window : undefined;
  var browserGlobal = browserWindow || {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
  function useNextTick() {
    // node version 0.10.x displays a deprecation warning when nextTick is used recursively
    // see https://github.com/cujojs/when/issues/410 for details
    return function () {
      return process.nextTick(flush);
    };
  }

// vertx
  function useVertxTimer() {
    if (typeof vertxNext !== 'undefined') {
      return function () {
        vertxNext(flush);
      };
    }

    return useSetTimeout();
  }

  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, { characterData: true });

    return function () {
      node.data = iterations = ++iterations % 2;
    };
  }

// web worker
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function () {
      return channel.port2.postMessage(0);
    };
  }

  function useSetTimeout() {
    // Store setTimeout reference so es6-promise will be unaffected by
    // other code modifying setTimeout (like sinon.useFakeTimers())
    var globalSetTimeout = setTimeout;
    return function () {
      return globalSetTimeout(flush, 1);
    };
  }

  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];

      callback(arg);

      queue[i] = undefined;
      queue[i + 1] = undefined;
    }

    len = 0;
  }

  function attemptVertx() {
    try {
      var vertx = Function('return this')().require('vertx');
      vertxNext = vertx.runOnLoop || vertx.runOnContext;
      return useVertxTimer();
    } catch (e) {
      return useSetTimeout();
    }
  }

  var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
  if (isNode) {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else if (browserWindow === undefined && typeof require === 'function') {
    scheduleFlush = attemptVertx();
  } else {
    scheduleFlush = useSetTimeout();
  }

  function then(onFulfillment, onRejection) {
    var parent = this;

    var child = new this.constructor(noop);

    if (child[PROMISE_ID] === undefined) {
      makePromise(child);
    }

    var _state = parent._state;


    if (_state) {
      var callback = arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    } else {
      subscribe(parent, child, onFulfillment, onRejection);
    }

    return child;
  }

  /**
   `Promise.resolve` returns a promise that will become resolved with the
   passed `value`. It is shorthand for the following:

   ```javascript
   let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

   promise.then(function(value){
    // value === 1
  });
   ```

   Instead of writing the above, your code now simply becomes the following:

   ```javascript
   let promise = Promise.resolve(1);

   promise.then(function(value){
    // value === 1
  });
   ```

   @method resolve
   @static
   @param {Any} value value that the returned promise will be resolved with
   Useful for tooling.
   @return {Promise} a promise that will become fulfilled with the given
   `value`
   */
  function resolve$1(object) {
    /*jshint validthis:true */
    var Constructor = this;

    if (object && typeof object === 'object' && object.constructor === Constructor) {
      return object;
    }

    var promise = new Constructor(noop);
    resolve(promise, object);
    return promise;
  }

  var PROMISE_ID = Math.random().toString(36).substring(2);

  function noop() {}

  var PENDING = void 0;
  var FULFILLED = 1;
  var REJECTED = 2;

  var TRY_CATCH_ERROR = { error: null };

  function selfFulfillment() {
    return new TypeError("You cannot resolve a promise with itself");
  }

  function cannotReturnOwn() {
    return new TypeError('A promises callback cannot return that same promise.');
  }

  function getThen(promise) {
    try {
      return promise.then;
    } catch (error) {
      TRY_CATCH_ERROR.error = error;
      return TRY_CATCH_ERROR;
    }
  }

  function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
    try {
      then$$1.call(value, fulfillmentHandler, rejectionHandler);
    } catch (e) {
      return e;
    }
  }

  function handleForeignThenable(promise, thenable, then$$1) {
    asap(function (promise) {
      var sealed = false;
      var error = tryThen(then$$1, thenable, function (value) {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable !== value) {
          resolve(promise, value);
        } else {
          fulfill(promise, value);
        }
      }, function (reason) {
        if (sealed) {
          return;
        }
        sealed = true;

        reject(promise, reason);
      }, 'Settle: ' + (promise._label || ' unknown promise'));

      if (!sealed && error) {
        sealed = true;
        reject(promise, error);
      }
    }, promise);
  }

  function handleOwnThenable(promise, thenable) {
    if (thenable._state === FULFILLED) {
      fulfill(promise, thenable._result);
    } else if (thenable._state === REJECTED) {
      reject(promise, thenable._result);
    } else {
      subscribe(thenable, undefined, function (value) {
        return resolve(promise, value);
      }, function (reason) {
        return reject(promise, reason);
      });
    }
  }

  function handleMaybeThenable(promise, maybeThenable, then$$1) {
    if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
      handleOwnThenable(promise, maybeThenable);
    } else {
      if (then$$1 === TRY_CATCH_ERROR) {
        reject(promise, TRY_CATCH_ERROR.error);
        TRY_CATCH_ERROR.error = null;
      } else if (then$$1 === undefined) {
        fulfill(promise, maybeThenable);
      } else if (isFunction(then$$1)) {
        handleForeignThenable(promise, maybeThenable, then$$1);
      } else {
        fulfill(promise, maybeThenable);
      }
    }
  }

  function resolve(promise, value) {
    if (promise === value) {
      reject(promise, selfFulfillment());
    } else if (objectOrFunction(value)) {
      handleMaybeThenable(promise, value, getThen(value));
    } else {
      fulfill(promise, value);
    }
  }

  function publishRejection(promise) {
    if (promise._onerror) {
      promise._onerror(promise._result);
    }

    publish(promise);
  }

  function fulfill(promise, value) {
    if (promise._state !== PENDING) {
      return;
    }

    promise._result = value;
    promise._state = FULFILLED;

    if (promise._subscribers.length !== 0) {
      asap(publish, promise);
    }
  }

  function reject(promise, reason) {
    if (promise._state !== PENDING) {
      return;
    }
    promise._state = REJECTED;
    promise._result = reason;

    asap(publishRejection, promise);
  }

  function subscribe(parent, child, onFulfillment, onRejection) {
    var _subscribers = parent._subscribers;
    var length = _subscribers.length;


    parent._onerror = null;

    _subscribers[length] = child;
    _subscribers[length + FULFILLED] = onFulfillment;
    _subscribers[length + REJECTED] = onRejection;

    if (length === 0 && parent._state) {
      asap(publish, parent);
    }
  }

  function publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;

    if (subscribers.length === 0) {
      return;
    }

    var child = void 0,
      callback = void 0,
      detail = promise._result;

    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];

      if (child) {
        invokeCallback(settled, child, callback, detail);
      } else {
        callback(detail);
      }
    }

    promise._subscribers.length = 0;
  }

  function tryCatch(callback, detail) {
    try {
      return callback(detail);
    } catch (e) {
      TRY_CATCH_ERROR.error = e;
      return TRY_CATCH_ERROR;
    }
  }

  function invokeCallback(settled, promise, callback, detail) {
    var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = void 0,
      failed = void 0;

    if (hasCallback) {
      value = tryCatch(callback, detail);

      if (value === TRY_CATCH_ERROR) {
        failed = true;
        error = value.error;
        value.error = null;
      } else {
        succeeded = true;
      }

      if (promise === value) {
        reject(promise, cannotReturnOwn());
        return;
      }
    } else {
      value = detail;
      succeeded = true;
    }

    if (promise._state !== PENDING) {
      // noop
    } else if (hasCallback && succeeded) {
      resolve(promise, value);
    } else if (failed) {
      reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      reject(promise, value);
    }
  }

  function initializePromise(promise, resolver) {
    try {
      resolver(function resolvePromise(value) {
        resolve(promise, value);
      }, function rejectPromise(reason) {
        reject(promise, reason);
      });
    } catch (e) {
      reject(promise, e);
    }
  }

  var id = 0;
  function nextId() {
    return id++;
  }

  function makePromise(promise) {
    promise[PROMISE_ID] = id++;
    promise._state = undefined;
    promise._result = undefined;
    promise._subscribers = [];
  }

  function validationError() {
    return new Error('Array Methods must be provided an Array');
  }

  var Enumerator = function () {
    function Enumerator(Constructor, input) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor(noop);

      if (!this.promise[PROMISE_ID]) {
        makePromise(this.promise);
      }

      if (isArray(input)) {
        this.length = input.length;
        this._remaining = input.length;

        this._result = new Array(this.length);

        if (this.length === 0) {
          fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate(input);
          if (this._remaining === 0) {
            fulfill(this.promise, this._result);
          }
        }
      } else {
        reject(this.promise, validationError());
      }
    }

    Enumerator.prototype._enumerate = function _enumerate(input) {
      for (var i = 0; this._state === PENDING && i < input.length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
      var c = this._instanceConstructor;
      var resolve$$1 = c.resolve;


      if (resolve$$1 === resolve$1) {
        var _then = getThen(entry);

        if (_then === then && entry._state !== PENDING) {
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof _then !== 'function') {
          this._remaining--;
          this._result[i] = entry;
        } else if (c === Promise$2) {
          var promise = new c(noop);
          handleMaybeThenable(promise, entry, _then);
          this._willSettleAt(promise, i);
        } else {
          this._willSettleAt(new c(function (resolve$$1) {
            return resolve$$1(entry);
          }), i);
        }
      } else {
        this._willSettleAt(resolve$$1(entry), i);
      }
    };

    Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
      var promise = this.promise;


      if (promise._state === PENDING) {
        this._remaining--;

        if (state === REJECTED) {
          reject(promise, value);
        } else {
          this._result[i] = value;
        }
      }

      if (this._remaining === 0) {
        fulfill(promise, this._result);
      }
    };

    Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
      var enumerator = this;

      subscribe(promise, undefined, function (value) {
        return enumerator._settledAt(FULFILLED, i, value);
      }, function (reason) {
        return enumerator._settledAt(REJECTED, i, reason);
      });
    };

    return Enumerator;
  }();

  /**
   `Promise.all` accepts an array of promises, and returns a new promise which
   is fulfilled with an array of fulfillment values for the passed promises, or
   rejected with the reason of the first passed promise to be rejected. It casts all
   elements of the passed iterable to promises as it runs this algorithm.

   Example:

   ```javascript
   let promise1 = resolve(1);
   let promise2 = resolve(2);
   let promise3 = resolve(3);
   let promises = [ promise1, promise2, promise3 ];

   Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
   ```

   If any of the `promises` given to `all` are rejected, the first promise
   that is rejected will be given as an argument to the returned promises's
   rejection handler. For example:

   Example:

   ```javascript
   let promise1 = resolve(1);
   let promise2 = reject(new Error("2"));
   let promise3 = reject(new Error("3"));
   let promises = [ promise1, promise2, promise3 ];

   Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
   ```

   @method all
   @static
   @param {Array} entries array of promises
   @param {String} label optional string for labeling the promise.
   Useful for tooling.
   @return {Promise} promise that is fulfilled when all `promises` have been
   fulfilled, or rejected if any of them become rejected.
   @static
   */
  function all(entries) {
    return new Enumerator(this, entries).promise;
  }

  /**
   `Promise.race` returns a new promise which is settled in the same way as the
   first passed promise to settle.

   Example:

   ```javascript
   let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

   let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

   Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
   ```

   `Promise.race` is deterministic in that only the state of the first
   settled promise matters. For example, even if other promises given to the
   `promises` array argument are resolved, but the first settled promise has
   become rejected before the other promises became fulfilled, the returned
   promise will become rejected:

   ```javascript
   let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

   let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

   Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
   ```

   An example real-world use case is implementing timeouts:

   ```javascript
   Promise.race([ajax('foo.json'), timeout(5000)])
   ```

   @method race
   @static
   @param {Array} promises array of promises to observe
   Useful for tooling.
   @return {Promise} a promise which settles in the same way as the first passed
   promise to settle.
   */
  function race(entries) {
    /*jshint validthis:true */
    var Constructor = this;

    if (!isArray(entries)) {
      return new Constructor(function (_, reject) {
        return reject(new TypeError('You must pass an array to race.'));
      });
    } else {
      return new Constructor(function (resolve, reject) {
        var length = entries.length;
        for (var i = 0; i < length; i++) {
          Constructor.resolve(entries[i]).then(resolve, reject);
        }
      });
    }
  }

  /**
   `Promise.reject` returns a promise rejected with the passed `reason`.
   It is shorthand for the following:

   ```javascript
   let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

   promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
   ```

   Instead of writing the above, your code now simply becomes the following:

   ```javascript
   let promise = Promise.reject(new Error('WHOOPS'));

   promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
   ```

   @method reject
   @static
   @param {Any} reason value that the returned promise will be rejected with.
   Useful for tooling.
   @return {Promise} a promise rejected with the given `reason`.
   */
  function reject$1(reason) {
    /*jshint validthis:true */
    var Constructor = this;
    var promise = new Constructor(noop);
    reject(promise, reason);
    return promise;
  }

  function needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  function needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  /**
   Promise objects represent the eventual result of an asynchronous operation. The
   primary way of interacting with a promise is through its `then` method, which
   registers callbacks to receive either a promise's eventual value or the reason
   why the promise cannot be fulfilled.

   Terminology
   -----------

   - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
   - `thenable` is an object or function that defines a `then` method.
   - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
   - `exception` is a value that is thrown using the throw statement.
   - `reason` is a value that indicates why a promise was rejected.
   - `settled` the final resting state of a promise, fulfilled or rejected.

   A promise can be in one of three states: pending, fulfilled, or rejected.

   Promises that are fulfilled have a fulfillment value and are in the fulfilled
   state.  Promises that are rejected have a rejection reason and are in the
   rejected state.  A fulfillment value is never a thenable.

   Promises can also be said to *resolve* a value.  If this value is also a
   promise, then the original promise's settled state will match the value's
   settled state.  So a promise that *resolves* a promise that rejects will
   itself reject, and a promise that *resolves* a promise that fulfills will
   itself fulfill.


   Basic Usage:
   ------------

   ```js
   let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

   promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
   ```

   Advanced Usage:
   ---------------

   Promises shine when abstracting away asynchronous interactions such as
   `XMLHttpRequest`s.

   ```js
   function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

   getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
   ```

   Unlike callbacks, promises are great composable primitives.

   ```js
   Promise.all([
   getJSON('/posts'),
   getJSON('/comments')
   ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
   ```

   @class Promise
   @param {Function} resolver
   Useful for tooling.
   @constructor
   */

  var Promise$2 = function () {
    function Promise(resolver) {
      this[PROMISE_ID] = nextId();
      this._result = this._state = undefined;
      this._subscribers = [];

      if (noop !== resolver) {
        typeof resolver !== 'function' && needsResolver();
        this instanceof Promise ? initializePromise(this, resolver) : needsNew();
      }
    }

    /**
     The primary way of interacting with a promise is through its `then` method,
     which registers callbacks to receive either a promise's eventual value or the
     reason why the promise cannot be fulfilled.
     ```js
     findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
     ```
     Chaining
     --------
     The return value of `then` is itself a promise.  This second, 'downstream'
     promise is resolved with the return value of the first promise's fulfillment
     or rejection handler, or rejected if the handler throws an exception.
     ```js
     findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
     findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
     ```
     If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
     ```js
     findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
     ```
     Assimilation
     ------------
     Sometimes the value you want to propagate to a downstream promise can only be
     retrieved asynchronously. This can be achieved by returning a promise in the
     fulfillment or rejection handler. The downstream promise will then be pending
     until the returned promise is settled. This is called *assimilation*.
     ```js
     findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
     ```
     If the assimliated promise rejects, then the downstream promise will also reject.
     ```js
     findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
     ```
     Simple Example
     --------------
     Synchronous Example
     ```javascript
     let result;
     try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
     ```
     Errback Example
     ```js
     findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
     ```
     Promise Example;
     ```javascript
     findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
     ```
     Advanced Example
     --------------
     Synchronous Example
     ```javascript
     let author, books;
     try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
     ```
     Errback Example
     ```js
     function foundBooks(books) {
   }
     function failure(reason) {
   }
     findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
     ```
     Promise Example;
     ```javascript
     findAuthor().
     then(findBooksByAuthor).
     then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
     ```
     @method then
     @param {Function} onFulfilled
     @param {Function} onRejected
     Useful for tooling.
     @return {Promise}
     */

    /**
     `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
     as the catch block of a try/catch statement.
     ```js
     function findAuthor(){
  throw new Error('couldn't find that author');
  }
     // synchronous
     try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
     // async with promises
     findAuthor().catch(function(reason){
  // something went wrong
  });
     ```
     @method catch
     @param {Function} onRejection
     Useful for tooling.
     @return {Promise}
     */


    Promise.prototype.catch = function _catch(onRejection) {
      return this.then(null, onRejection);
    };

    /**
     `finally` will be invoked regardless of the promise's fate just as native
     try/catch/finally behaves

     Synchronous example:

     ```js
     findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }

     try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
     ```

     Asynchronous example:

     ```js
     findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
     ```

     @method finally
     @param {Function} callback
     @return {Promise}
     */


    Promise.prototype.finally = function _finally(callback) {
      var promise = this;
      var constructor = promise.constructor;

      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    };

    return Promise;
  }();

  Promise$2.prototype.then = then;
  Promise$2.all = all;
  Promise$2.race = race;
  Promise$2.resolve = resolve$1;
  Promise$2.reject = reject$1;
  Promise$2._setScheduler = setScheduler;
  Promise$2._setAsap = setAsap;
  Promise$2._asap = asap;

  /*global self*/
  function polyfill() {
    var local = void 0;

    if (typeof global !== 'undefined') {
      local = global;
    } else if (typeof self !== 'undefined') {
      local = self;
    } else {
      try {
        local = Function('return this')();
      } catch (e) {
        throw new Error('polyfill failed because global object is unavailable in this environment');
      }
    }

    var P = local.Promise;

    if (P) {
      var promiseToString = null;
      try {
        promiseToString = Object.prototype.toString.call(P.resolve());
      } catch (e) {
        // silently ignored
      }

      if (promiseToString === '[object Promise]' && !P.cast) {
        return;
      }
    }

    local.Promise = Promise$2;
  }

// Strange compat..
  Promise$2.polyfill = polyfill;
  Promise$2.Promise = Promise$2;

  Promise$2.polyfill();

  return Promise$2;

})));

/* global Galaxy, Promise */
'use strict';
/**
 * @exports Galaxy
 */
window.Galaxy = window.Galaxy || /** @class */(function () {
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

  const importedLibraries = {};

  /**
   *
   * @constructor
   */
  function Core() {
    this.modules = {};
    this.moduleContents = {};
    this.addOnProviders = [];
    this.rootElement = null;
  }

  Core.prototype = {
    /**
     *
     * @param {Object} out
     * @returns {*|{}}
     */
    extend: function (out) {
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
    },
    clone: function (obj) {
      let clone = obj instanceof Array ? [] : {};
      clone.__proto__ = obj.__proto__;
      for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
          if (typeof(obj[i]) === 'object' && obj[i] !== null) {

            clone[i] = Galaxy.clone(obj[i]);
          } else {
            // console.info(Object.getOwnPropertyDescriptor(obj, i).enumerable, i);
            clone[i] = obj[i];
          }
        }
      }

      return clone;
    },
    /**
     *
     * @param {Object} bootModule
     * @return {Promise<any>}
     */
    boot: function (bootModule) {
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
    },

    convertToURIString: function (obj, prefix) {
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
    },

    /**
     *
     * @param module
     * @return {Promise<any>}
     */
    load: function (module) {
      const _this = this;

      if (!module) {
        throw new Error('Module meta data or constructor is missing');
      }

      const promise = new Promise(function (resolve, reject) {
        if (module.hasOwnProperty('constructor') && typeof module.constructor === 'function') {
          module.url = module.id = 'internal/' + (new Date()).valueOf() + '-' + Math.round(performance.now());
          module.systemId = module.parentScope ? module.parentScope.systemId + '/' + module.id : module.id;

          return _this.compileModuleContent(module, module.constructor, []).then(function (compiledModule) {
            return _this.executeCompiledModule(compiledModule).then(resolve);
          });
        }

        module.id = module.id || 'noid-' + (new Date()).valueOf() + '-' + Math.round(performance.now());
        module.systemId = module.parentScope ? module.parentScope.systemId + '/' + module.id : module.id;

        let invokers = [module.url];
        if (module.invokers) {
          if (module.invokers.indexOf(module.url) !== -1) {
            throw new Error('circular dependencies: \n' + module.invokers.join('\n') + '\nwanna load: ' + module.url);
          }

          invokers = module.invokers;
          invokers.push(module.url);
        }

        let url = module.url + '?' + _this.convertToURIString(module.params || {});
        // contentFetcher makes sure that any module gets loaded from network only once unless fresh property is present
        let contentFetcher = Galaxy.moduleContents[url];
        if (!contentFetcher || module.fresh) {
          contentFetcher = Galaxy.moduleContents[url] = fetch(url).then(function (response) {
            if (response.status !== 200) {
              reject(response);
              return '';
            }

            return response.text();
          }).catch(reject);
        }

        contentFetcher.then(function (moduleContent) {
          _this.compileModuleContent(module, moduleContent, invokers).then(function (compiledModule) {
            return _this.executeCompiledModule(compiledModule).then(resolve);
          });

          return moduleContent;
        }).catch(reject);
      });

      return promise;
    },

    /**
     *
     * @param {Object} moduleMetaData
     * @param moduleConstructor
     * @param invokers
     * @returns {Promise<Galaxy.GalaxyModule>}
     */
    compileModuleContent: function (moduleMetaData, moduleConstructor, invokers) {
      const _this = this;
      const promise = new Promise(function (resolve, reject) {
        let doneImporting = function (module, imports) {
          imports.splice(imports.indexOf(module.importId || module.url) - 1, 1);

          if (imports.length === 0) {
            // This will load the original initializer
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

        const scope = new Galaxy.GalaxyScope(moduleMetaData, moduleMetaData.element || _this.rootElement);
        // Create module from moduleMetaData
        const module = new Galaxy.GalaxyModule(moduleMetaData, moduleConstructor, scope);
        Galaxy.modules[module.systemId] = module;

        if (imports.length) {
          const importsCopy = imports.slice(0);
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
    },

    /**
     *
     * @param {Galaxy.GalaxyModule}  module
     * @return {Promise<any>}
     */
    executeCompiledModule: function (module) {
      const promise = new Promise(function (resolve, reject) {
        try {
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

          const source = module.source;
          const moduleSource = typeof module.source === 'function' ?
            module.source :
            new Function('Scope', ['// ' + module.id + ': ' + module.url, source].join('\n'));
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
        }
        catch (error) {
          reject(error);
          throw new Error(error);
        }
      });

      return promise;
    },

    getModuleAddOnProvider: function (name) {
      return this.addOnProviders.filter(function (service) {
        return service.name === name;
      })[0];
    },

    registerAddOnProvider: function (name, handler) {
      if (typeof handler !== 'function') {
        throw 'Addon provider should be a function';
      }

      this.addOnProviders.push({
        name: name,
        handler: handler
      });
    }
  };

  const instance = new Core();
  instance.Core = Core;

  return instance;
}(this));

/* global Galaxy */
'use strict';

Galaxy.GalaxyModule = /** @class */ (function () {

  /**
   *
   * @param {Object} module
   * @param {string} source
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

  GalaxyModule.prototype = {
    init: function () {
      this.scope.trigger('module.init');
    },

    start: function () {
      this.scope.trigger('module.start');
    },

    destroy: function () {
      this.scope.trigger('module.destroy');
    },

    registerAddOn: function (id, object) {
      this.addOns[id] = object;
    }
  };

  return GalaxyModule;
}(Galaxy || {}));

/* global Galaxy */
'use strict';

Galaxy.Observer = /** @class */ (function () {
  const defProp = Object.defineProperty;

  Observer.notify = function (obj, key, value, oldValue) {
    const observers = obj.__observers__;

    if (observers !== undefined) {
      observers.forEach(function (observer) {
        observer.notify(key, value, oldValue);
      });
    }
  };

  /**
   *
   * @param {Object} context
   * @constructor
   * @memberOf Galaxy
   */
  function Observer(context) {
    this.context = context;
    this.subjectsActions = {};
    this.allSubjectAction = [];

    if (!this.context.hasOwnProperty('__observers__')) {
      defProp(context, '__observers__', {
        value: [],
        writable: true,
        configurable: true
      });
    }

    this.context.__observers__.push(this);
  }

  Observer.prototype = {
    remove: function () {
      let index = this.context.__observers__.indexOf(this);
      if (index !== -1) {
        this.context.__observers__.splice(index, 1);
      }
    },
    /**
     *
     * @param {string} key
     * @param value
     * @param oldValue
     */
    notify: function (key, value, oldValue) {
      const _this = this;

      if (_this.subjectsActions.hasOwnProperty(key)) {
        _this.subjectsActions[key].call(_this.context, value, oldValue);
      }

      _this.allSubjectAction.forEach(function (action) {
        action.call(_this.context, key, value, oldValue);
      });
    },
    /**
     *
     * @param subject
     * @param action
     */
    on: function (subject, action) {
      this.subjectsActions[subject] = action;
    },
    /**
     *
     * @param {Function} action
     */
    onAll: function (action) {
      if (this.allSubjectAction.indexOf(action) === -1) {
        this.allSubjectAction.push(action);
      }
    }
  };

  return Observer;
})();

/* global Galaxy */
'use strict';

Galaxy.GalaxyScope = /** @class */ (function () {
  const defProp = Object.defineProperty;

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
    this.data = {};

    defProp(this, '__imports__', {
      value: {},
      writable: false,
      enumerable: false,
      configurable: false
    });

    this.on('module.destroy', this.destroy.bind(this));
  }

  GalaxyScope.prototype = {
    /**
     *
     * @param id ID string which is going to be used for importing
     * @param instance The assigned object to this id
     */
    inject: function (id, instance) {
      this['__imports__'][id] = instance;
    },
    /**
     *
     * @param libId Path or id of the addon you want to import
     * @return {*}
     */
    import: function (libId) {
      return this['__imports__'][libId];
    },
    /**
     *
     */
    destroy: function () {
      this.observers.forEach(function (observer) {
        observer.remove();
      });
    },
    /**
     *
     * @param moduleMeta
     * @param config
     * @returns {*}
     */
    load: function (moduleMeta, config) {
      let newModuleMetaData = Object.assign({}, moduleMeta, config || {});

      if (newModuleMetaData.url.indexOf('./') === 0) {
        newModuleMetaData.url = this.uri.path + moduleMeta.url.substr(2);
      }

      newModuleMetaData.parentScope = this;
      newModuleMetaData.domain = newModuleMetaData.domain || Galaxy;
      return Galaxy.load(newModuleMetaData);
    },
    /**
     *
     * @param moduleMetaData
     * @param viewNode
     * @returns {*|PromiseLike<T>|Promise<T>}
     */
    loadModuleInto: function (moduleMetaData, viewNode) {
      return this.load(moduleMetaData, {
        element: viewNode
      }).then(function (module) {
        module.start();
        return module;
      });
    },
    /**
     *
     * @param {string} event
     * @param {Function} handler
     */
    on: function (event, handler) {
      if (!this.eventHandlers[event]) {
        this.eventHandlers[event] = [];
      }

      if (this.eventHandlers[event].indexOf(handler) === -1) {
        this.eventHandlers[event].push(handler);
      }
    },
    /**
     *
     * @param {string} event
     * @param {*} data
     */
    trigger: function (event, data) {
      if (this.eventHandlers[event]) {
        this.eventHandlers[event].forEach(function (handler) {
          handler.call(null, data);
        });
      }
    },
    /**
     *
     * @param object
     * @returns {Galaxy.Observer}
     */
    observe: function (object) {
      const observer = new Galaxy.Observer(object);
      this.observers.push(observer);

      return observer;
    }
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
  function GalaxySequence() {
    const _this = this;
    _this.truncateHandlers = [];
    _this.activeStateResolve = null;
    _this.isFinished = false;
    _this.processing = false;
    /** activeState is a promise that will resolve when all the sequence activities has been resolved
     *
     * @type {Promise}
     */
    _this.activeState = Promise.resolve('sequence-constructor');
    _this.actions = [];
    _this.resolver = Promise.resolve();

    this.reset();
  }

  GalaxySequence.prototype = {
    reset: function () {
      const _this = this;
      _this.actions = [];
      _this.isFinished = false;
      _this.processing = false;

      this.activeState = new Promise(function (resolve) {
        _this.activeStateResolve = function () {
          _this.isFinished = true;
          _this.processing = false;
          resolve();
        };
      });

      return _this;
    },

    next: function (action) {
      const _this = this;

      // if sequence was finished, then reset the sequence
      if (_this.isFinished) {
        _this.reset();
      }

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

      _this.actions.push(act);

      if (!_this.processing) {
        _this.processing = true;
        _this.resolver.then(act.run.bind(act));
      }

      return _this;
    },

    proceed: function (p) {
      const _this = this;
      const oldAction = _this.actions.shift();
      const firstAction = _this.actions[0];
      if (firstAction) {
        _this.resolver.then(firstAction.run.bind(firstAction));
      } else if (oldAction) {
        _this.resolver.then(_this.activeStateResolve.bind(_this));
      }
    },

    onTruncate: function (act) {
      if (this.truncateHandlers.indexOf(act) === -1) {
        this.truncateHandlers.push(act);
      }
    },

    truncate: function () {
      const _this = this;

      _this.actions.forEach(function (item) {
        item.process = disabledProcess;
      });

      let i = 0;
      const len = this.truncateHandlers.length;
      for (; i < len; i++) {
        this.truncateHandlers[i].call(this);
      }

      this.truncateHandlers = [];
      _this.isFinished = true;
      _this.processing = false;

      return _this;
    },

    nextAction: function (action) {
      this.next(function (done) {
        action.call();
        done('sequence-action');
      });
    }
  };
  return GalaxySequence;
})();

/* global Galaxy */
'use strict';

Galaxy.GalaxyURI = /** @class */ (function () {
  /**
   *
   * @param {string} url
   * @constructor
   */
  function GalaxyURI(url) {
    let urlParser = document.createElement('a');
    urlParser.href = url;
    let myRegexp = /([^\t\n]+)\//g;
    let match = myRegexp.exec(urlParser.pathname);

    this.paresdURL = urlParser.href;
    this.path = match ? match[0] : '/';
    this.base = window.location.pathname;
  }

  return GalaxyURI;
})();

/* global Galaxy, Promise */
'use strict';

Galaxy.View = /** @class */(function (G) {
  const defProp = Object.defineProperty;
  const setAttr = Element.prototype.setAttribute;
  const removeAttr = Element.prototype.removeAttribute;

  //------------------------------

  View.BINDING_SYNTAX_REGEX = new RegExp('^<([^\\[\\]\<\>]*)>\\s*([^\\[\\]\<\>]*)\\s*$');
  View.BINDING_EXPRESSION_REGEX = new RegExp('(?:["\'][\w\s]*[\'"])|([^\d\s=+\-|&%{}()<>!/]+)', 'g');

  View.REACTIVE_BEHAVIORS = {};

  View.NODE_SCHEMA_PROPERTY_MAP = {
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
    // style: {
    //   type: 'prop',
    //   name: 'style'
    // },
    // css: {
    //   type: 'attr',
    //   name: 'style'
    // },
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
    scrollTop: {
      type: 'prop',
      name: 'scrollTop'
    },
    scrollLeft: {
      type: 'prop',
      name: 'scrollLeft'
    },
    disabled: {
      type: 'attr',
      name: 'disabled'
    }
  };

  View.setAttr = function (viewNode, name, value, oldValue) {
    viewNode.notifyObserver(name, value, oldValue);
    if (value) {
      setAttr.call(viewNode.node, name, value, oldValue);
    } else {
      removeAttr.call(viewNode.node, name);
    }
  };

  View.createMirror = function (obj, forObj) {
    let result = forObj || {};

    defProp(result, '__parent__', {
      enumerable: false,
      value: obj
    });

    return result;
  };

  View.getAllViewNodes = function (node) {
    let item, viewNodes = [];

    const childNodes = Array.prototype.slice(node.childNodes, 0);
    for (let i = 0, len = childNodes.length; i < len; i++) {
      item = node.childNodes[i];

      if (item['__viewNode__'] !== undefined) {
        viewNodes.push(item.__viewNode__);
      }

      viewNodes = viewNodes.concat(View.getAllViewNodes(item));
    }

    return viewNodes.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
  };

  /**
   *
   * @param {string|Array} value
   * @return {{modifiers: *, propertyKeysPaths: *[], isExpression: boolean, expressionFn: null}}
   */
  View.getBindings = function (value) {
    let propertyKeysPaths = null;
    let isExpression = false;
    const type = typeof(value);
    let modifiers = null;

    if (type === 'string') {
      const props = value.match(View.BINDING_SYNTAX_REGEX);
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
      isExpression: isExpression,
      expressionFn: null
    };
  };

  /**
   *
   * @param data
   * @param {string} properties
   * @return {*}
   */
  View.safePropertyLookup = function (data, properties) {
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

        temp = temp.__parent__;
      }

      // if the property is not found in the parents then return the original object as the context
      if (target[property] === undefined) {
        target = original;
      }
    }

    target = target || {};
    const lastIndex = properties.length - 1;
    properties.forEach(function (key, i) {
      target = target[key];

      if (i !== lastIndex && !(target instanceof Object)) {
        target = {};
      }
    });

    return target;
  };

  View.propertyLookup = function (data, properties) {
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
        return original;
      }
    }

    return target;
  };

  /**
   *
   * @param data
   * @param property
   * @returns {Galaxy.View.ReactiveData}
   */
  View.propertyScopeLookup = function (data, property) {
    const properties = property.split('.');
    const li = properties.length - 1;
    let target = data;
    properties.forEach(function (p, i) {
      target = View.propertyLookup(target, p);

      if (i !== li) {
        if (!target[p]) {
          target = target.__rd__.shadow[p].data;
        } else {
          target = target[p];
        }
      }
    });

    return target.__rd__;
  };

  View.EXPRESSION_ARGS_FUNC_CACHE = {};

  View.createExpressionArgumentsProvider = function (variables) {
    const id = variables.join();

    if (View.EXPRESSION_ARGS_FUNC_CACHE[id]) {
      return View.EXPRESSION_ARGS_FUNC_CACHE[id];
    }

    let functionContent = 'return [';

    let middle = '';
    for (let i = 0, len = variables.length; i < len; i++) {
      // middle += 'prop(scope, "' + variables[i] + '").' + variables[i] + ',';
      middle += 'prop(scope, "' + variables[i] + '"),';
    }

    // Take care of variables that contain square brackets like '[variable_name]'
    // for the convenience of the programmer

    // middle = middle.substring(0, middle.length - 1).replace(/<>/g, '');
    functionContent += middle.substring(0, middle.length - 1) + ']';

    const func = new Function('prop, scope', functionContent);
    View.EXPRESSION_ARGS_FUNC_CACHE[id] = func;

    return func;
  };

  View.createExpressionFunction = function (host, handler, variables, scope) {
    let getExpressionArguments = Galaxy.View.createExpressionArgumentsProvider(variables);

    return function () {
      let args = [];
      try {
        args = getExpressionArguments.call(host, Galaxy.View.safePropertyLookup, scope);
      } catch (ex) {
        console.error('Can\'t find the property: \n' + variables.join('\n'), '\n\nIt is recommended to inject the parent object instead' +
          ' of its property.\n\n', scope, '\n', ex);
      }
      return handler.apply(host, args);
    };
  };

  /**
   *
   * @param target
   * @param targetKeyName
   * @param scope
   * @param bindings
   * @returns {Function|boolean}
   */
  View.prepareExpression = function (target, targetKeyName, scope, bindings) {
    if (!bindings.isExpression) {
      return false;
    }

    const dependencies = bindings.propertyKeysPaths;
    // Extracting the function from the list of dependencies
    const handler = dependencies.pop();
    bindings.propertyKeysPaths = dependencies.map(function (name) {
      return name.replace(/<>/g, '');
    });

    // Generate expression arguments
    try {
      bindings.expressionFn = Galaxy.View.createExpressionFunction(target, handler, dependencies, scope, targetKeyName);
      return bindings.expressionFn;
    }
    catch (exception) {
      throw console.error(exception.message + '\n', dependencies);
    }
  };

  /**
   *
   * @param {Galaxy.View.ViewNode | Object} target
   * @param {String} targetKeyName
   * @param {Galaxy.View.ReactiveData} parentReactiveData
   * @param {Galaxy.View.ReactiveData} scopeData
   * @param {Object} bindings
   */
  View.makeBinding = function (target, targetKeyName, parentReactiveData, scopeData, bindings) {
    let value = scopeData;

    if (!parentReactiveData && !(scopeData instanceof Galaxy.GalaxyScope)) {
      if (scopeData.hasOwnProperty('__rd__')) {
        parentReactiveData = scopeData.__rd__;
      } else {

        parentReactiveData = new Galaxy.View.ReactiveData(targetKeyName, value);
      }
    }

    const propertyKeysPaths = bindings.propertyKeysPaths;
    const expressionFn = bindings.expressionFn || View.prepareExpression(target, targetKeyName, value, bindings);

    let propertyKeyPath = null;
    let childPropertyKeyPath = null;
    let initValue = null;
    let propertyKeyPathItems = [];

    for (let i = 0, len = propertyKeysPaths.length; i < len; i++) {
      propertyKeyPath = propertyKeysPaths[i];
      childPropertyKeyPath = null;

      propertyKeyPathItems = propertyKeyPath.split('.');
      if (propertyKeyPathItems.length > 1) {
        propertyKeyPath = propertyKeyPathItems.shift();
        childPropertyKeyPath = propertyKeyPathItems.join('.');
      }
      // If the property name is `this` and its index is zero, then it is pointing to the ViewNode.data property
      if (i === 0 && propertyKeyPath === 'this' && target instanceof Galaxy.View.ViewNode) {
        i = 1;
        propertyKeyPath = propertyKeyPathItems.shift();
        childPropertyKeyPath = null;
        // aliasPropertyName = 'this.' + propertyKeyPath;
        // shadow = View.propertyLookup(target.data, propertyKeyPath);
      } else {
        if (value) {
          value = View.propertyLookup(value, propertyKeyPath);
        }
      }

      initValue = value;
      if (value !== null && typeof value === 'object') {
        initValue = value[propertyKeyPath];
      }

      let reactiveData;

      if (initValue instanceof Object) {
        reactiveData = new Galaxy.View.ReactiveData(propertyKeyPath, initValue, parentReactiveData);
      } else if (childPropertyKeyPath) {
        reactiveData = new Galaxy.View.ReactiveData(propertyKeyPath, null, parentReactiveData);
      } else {
        parentReactiveData.addKeyToShadow(propertyKeyPath);
      }

      if (childPropertyKeyPath === null) {
        if (!(target instanceof Galaxy.View.ViewNode)) {
          defProp(target, targetKeyName, {
            // set: function (newValue) {
            // console.warn('It is not allowed', parentReactiveData.id, targetKeyName);
            // value[propertyKeyPath] = newValue;
            // },
            get: function ref() {
              if (expressionFn) {
                return expressionFn();
              }

              if (value === null || value === undefined) {
                return value;
              }

              return value[propertyKeyPath];
            },
            enumerable: true,
            configurable: true
          });
        }

        // The parentReactiveData would be empty when the developer is trying to bind to a direct property of GalaxyScope
        if (!parentReactiveData && scopeData instanceof Galaxy.GalaxyScope) {
          // if (scopeData instanceof Galaxy.GalaxyScope) {
          throw new Error('Binding to Scope direct properties is not allowed.\n' +
            'Try to define your properties on Scope.data.{property_name}\n' + 'path: ' + scopeData.uri.paresdURL + '\n');
        }

        parentReactiveData.addNode(target, targetKeyName, propertyKeyPath, expressionFn, scopeData);
      }

      if (childPropertyKeyPath !== null) {
        View.makeBinding(target, targetKeyName, reactiveData, initValue, {
          propertyKeysPaths: [childPropertyKeyPath],
          isExpression: false,
          expressionFn: expressionFn
        });
      }
    }
  };

  /**
   * Bind subjects to the data and takes care of dependent objects
   * @param viewNode
   * @param subjects
   * @param data
   * @param cloneSubject
   * @returns {*}
   */
  View.bindSubjectsToData = function (viewNode, subjects, data, cloneSubject) {
    const keys = Object.keys(subjects);
    let attributeName;
    let attributeValue;
    const subjectsClone = cloneSubject ? Galaxy.clone(subjects) : subjects;

    let parentReactiveData;
    if (!(data instanceof Galaxy.GalaxyScope)) {
      parentReactiveData = new Galaxy.View.ReactiveData('@', data);
    }

    for (let i = 0, len = keys.length; i < len; i++) {
      attributeName = keys[i];
      attributeValue = subjectsClone[attributeName];

      const bindings = View.getBindings(attributeValue);

      if (bindings.propertyKeysPaths) {
        View.makeBinding(subjectsClone, attributeName, parentReactiveData, data, bindings);
        bindings.propertyKeysPaths.forEach(function (path) {
          try {
            const rd = View.propertyScopeLookup(data, path);
            viewNode.addDependedObject(rd, subjectsClone);
          } catch (error) {
            console.info(path);
            console.error(error);
          }
        });
      }

      if (attributeValue && typeof attributeValue === 'object' && !(attributeValue instanceof Array)) {
        View.bindSubjectsToData(viewNode, attributeValue, data);
      }
    }

    return subjectsClone;
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} node
   * @param property
   * @returns {Function}
   */
  View.createPropertySetter = function (node, property) {
    if (!property.name) {
      throw new Error('createPropertySetter: property.name is mandatory in order to create property setter');
    }

    return function (value, oldValue) {
      if (value instanceof Promise) {
        const asyncCall = function (asyncValue) {
          node.node[property.name] = asyncValue;
          node.notifyObserver(property.name, asyncValue, oldValue);
        };
        value.then(asyncCall).catch(asyncCall);
      } else {
        node.node[property.name] = value;
        node.notifyObserver(property.name, value, oldValue);
      }
    };
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} node
   * @param {string} attributeName
   * @param property
   * @returns {Function}
   */
  View.createCustomSetter = function (node, attributeName, property) {
    return function (value, oldValue) {
      if (value instanceof Promise) {
        const asyncCall = function (asyncValue) {
          property.handler(node, attributeName, asyncValue, oldValue);
        };
        value.then(asyncCall).catch(asyncCall);
      } else {
        property.handler(node, attributeName, value, oldValue);
      }
    };
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} node
   * @param {string} attributeName
   * @returns {Function}
   */
  View.createDefaultSetter = function (node, attributeName) {
    return function (value, oldValue) {
      if (value instanceof Promise) {
        const asyncCall = function (asyncValue) {
          View.setAttr(node, attributeName, asyncValue, oldValue);
        };
        value.then(asyncCall).catch(asyncCall);
      } else {
        View.setAttr(node, attributeName, value, oldValue);
      }
    };
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} node
   * @param {string} key
   * @param scopeData
   */
  View.installReactiveBehavior = function (node, key, scopeData) {
    let behavior = View.REACTIVE_BEHAVIORS[key];
    let bindTo = node.schema[key];

    if (behavior) {
      const matches = behavior.regex ? (typeof(bindTo) === 'string' ? bindTo.match(behavior.regex) : bindTo) : bindTo;
      const data = behavior.prepareData.call(node, matches, scopeData);
      if (data !== undefined) {
        node.cache[key] = data;
      }

      const needValueAssign = behavior.install.call(node, data);
      return needValueAssign === undefined || needValueAssign === null ? true : needValueAssign;
    }

    return true;
  };

  View.PROPERTY_SETTERS = {
    'none': function () {
      return function () {

      };
    }
  };

  View.createSetter = function (viewNode, key, scopeProperty, expression) {
    let property = View.NODE_SCHEMA_PROPERTY_MAP[key];

    if (!property) {
      property = {
        type: 'attr'
      };
    }

    if (property.util) {
      property.util(viewNode, scopeProperty, key, expression);
    }

    // if viewNode is virtual, then the expression should be ignored
    if (property.type !== 'reactive' && viewNode.virtual) {
      return function () { };
    }

    return View.PROPERTY_SETTERS[property.type](viewNode, key, property, expression);
  };

  View.setPropertyForNode = function (viewNode, attributeName, value) {
    const property = View.NODE_SCHEMA_PROPERTY_MAP[attributeName] || { type: 'attr' };

    switch (property.type) {
      case 'attr':
        View.createDefaultSetter(viewNode, attributeName)(value, null);
        break;

      case 'prop':
        View.createPropertySetter(viewNode, property)(value, null);
        break;

      case 'reactive': {
        // const reactiveApply = View.createSetter(viewNode, attributeName, null, scopeData);
        if (viewNode.setters[property.name]) {
          value;
          viewNode.node;
          debugger;
          return;
        }
        // if(value instanceof Array) debugger;
        const reactiveApply = View.createSetter(viewNode, attributeName, null, null);
        viewNode.setters[property.name] = reactiveApply;

        reactiveApply(value, null);
        break;
      }

      case 'event':
        viewNode.node.addEventListener(attributeName, value.bind(viewNode), false);
        break;

      case 'custom':
        View.createCustomSetter(viewNode, attributeName, property)(value, null);
        break;
    }
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} parent
   * @param {Object} scopeData
   * @param {Object} nodeSchema
   * @param position
   * @param {null|Object} localScope
   */
  View.createNode = function (parent, scopeData, nodeSchema, position) {
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
        View.createNode(parent, scopeData, nodeSchema[i], null);
      }
    } else if (nodeSchema !== null && typeof(nodeSchema) === 'object') {
      let attributeValue, attributeName;
      const keys = Object.keys(nodeSchema);
      const needInitKeys = [];
      // keys.splice(keys.indexOf('tag'), 1);

      const viewNode = new View.ViewNode(nodeSchema);
      parent.registerChild(viewNode, position);

      // Behaviors definition stage
      for (i = 0, len = keys.length; i < len; i++) {
        attributeName = keys[i];
        if (View.REACTIVE_BEHAVIORS[attributeName]) {
          const needValueAssign = View.installReactiveBehavior(viewNode, attributeName, scopeData);
          if (needValueAssign !== false) {
            needInitKeys.push(attributeName);
          }
        } else {
          needInitKeys.push(attributeName);
        }
      }

      // const parentReactiveData = new Galaxy.View.ReactiveData('SCOPE', value || {});

      let bindings;
      // Value assignment stage
      for (i = 0, len = needInitKeys.length; i < len; i++) {
        attributeName = needInitKeys[i];
        attributeValue = nodeSchema[attributeName];

        bindings = View.getBindings(attributeValue);
        if (bindings.propertyKeysPaths) {
          View.makeBinding(viewNode, attributeName, null, scopeData, bindings);
        } else {
          View.setPropertyForNode(viewNode, attributeName, attributeValue);
        }
      }

      if (!viewNode.virtual) {
        viewNode.callLifecycleEvent('postInit');
        if (viewNode.inDOM) {
          viewNode.setInDOM(true);
        }

        View.createNode(viewNode, scopeData, nodeSchema.children, null);
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
  function View(scope) {
    const _this = this;
    _this.scope = scope;
    _this.dataRepos = {};
    _this.config = {
      cleanContainer: false
    };

    if (scope.element instanceof View.ViewNode) {
      _this.container = scope.element;
    } else {
      _this.container = new View.ViewNode({
        tag: scope.element.tagName
      }, scope.element);

      _this.container.sequences.enter.nextAction(function () {
        _this.container.hasBeenRendered();
      });
    }

    _this.renderingFlow = this.container.renderingFlow;
  }

  View.prototype = {
    setupRepos: function (repos) {
      this.dataRepos = repos;
    },
    init: function (schema) {
      const _this = this;

      if (_this.config.cleanContainer) {
        _this.container.node.innerHTML = '';
      }

      _this.container.renderingFlow.next(function (next) {
        View.createNode(_this.container, _this.scope, schema, null);
        _this.container.sequences.enter.nextAction(function () {
          next();
        });
      });
    },
    broadcast: function (event) {
      this.container.broadcast(event);
    }
  };

  return View;
}(Galaxy || {}));

/* global Galaxy */

Galaxy.View.ReactiveData = /** @class */ (function () {
  const ARRAY_PROTO = Array.prototype;
  const ARRAY_MUTATOR_METHODS = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ];
  const objKeys = Object.keys;
  const defProp = Object.defineProperty;
  const scopeBuilder = function () {
    return {
      id: '{}',
      shadow: {},
      data: {},
      notify: function () { },
      sync: function () { },
      makeReactiveObject: function () { },
      addKeyToShadow: function () { }
    };
  };

  /**
   * @param {string} id
   * @param {Object} data
   * @param {Galaxy.View.ReactiveData} p
   * @constructor
   * @memberOf Galaxy.View
   */
  function ReactiveData(id, data, p) {
    const parent = p || scopeBuilder();
    this.data = data;
    this.id = parent.id + '.' + id;
    this.keyInParent = id;
    this.nodesMap = {};
    this.parent = parent;
    this.refs = [];
    this.shadow = {};
    this.oldValue = undefined;

    if (this.data && this.data.hasOwnProperty('__rd__')) {
      this.refs = this.data.__rd__.refs;
      const refExist = this.getRefById(this.id);
      if (refExist) {
        return refExist;
      }

      this.refs.push(this);
    } else {
      this.refs.push(this);

      // data === null means that parent does not have this id
      if (this.data === null) {
        // if a property with same id already exist in the parent shadow, then return it instead of making a new one
        if (this.parent.shadow[id]) {
          return this.parent.shadow[id];
        }
        this.data = {};
        this.parent.makeReactiveObject(this.parent.data, id, true);
      }

      defProp(this.data, '__rd__', {
        enumerable: false,
        configurable: true,
        value: this
      });

      this.walk(this.data);
    }

    if (this.parent.data instanceof Array) {
      this.keyInParent = this.parent.keyInParent;
    } else {
      this.parent.shadow[id] = this;
    }
  }

  ReactiveData.prototype = {
    setData: function (data) {
      this.removeMyRef(data);

      if (!(data instanceof Object)) {
        this.data = {};

        for (let key in this.shadow) {
          // Cascade changes down to all children reactive data
          if (this.shadow[key] instanceof Galaxy.View.ReactiveData) {
            this.shadow[key].setData(data);
          } else {
            // changes should only propagate downward
            this.notifyDown(key);
          }
        }

        return;
      }

      this.data = data;
      if (data.hasOwnProperty('__rd__')) {
        this.data.__rd__.addRef(this);
        this.refs = this.data.__rd__.refs;

        if (this.data instanceof Array) {
          this.sync('length');
          this.sync('changes');
        } else {
          this.syncAll();
        }
      } else {
        defProp(this.data, '__rd__', {
          enumerable: false,
          configurable: true,
          value: this
        });

        this.walk(this.data);
      }

      this.setupShadowProperties();
    },
    /**
     *
     * @param data
     */
    walk: function (data) {
      const _this = this;
      if (data instanceof Array) {
        _this.makeReactiveArray(data);
      } else if (data instanceof Object) {
        for (let key in data) {
          _this.makeReactiveObject(data, key);
        }
      }
    },
    /**
     *
     * @param data
     * @param {string} key
     * @param shadow
     */
    makeReactiveObject: function (data, key, shadow) {
      const _this = this;
      let value = data[key];

      defProp(data, key, {
        get: function () {
          return value;
        },
        set: function (val) {
          if (value === val) {
            // If value is array, then sync should be called so nodes that are listening to array itself get updated
            if (val instanceof Array) {
              _this.sync(key);
            }
            return;
          }

          _this.oldValue = value;
          value = val;
          // This means that the property suppose to be an object and there probably active binds to it
          if (_this.shadow[key]) {
            _this.makeKeyEnum(key);
            // setData provide downward data flow
            _this.shadow[key].setData(val);
          }
          _this.notify(key);
        },
        enumerable: !shadow,
        configurable: true
      });

      if (this.shadow[key]) {
        this.shadow[key].setData(value);
      } else {
        this.shadow[key] = null;
      }

      // Update the ui for this key
      // This is for when the makeReactive method has been called by setData
      this.sync(key);
    },
    /**
     *
     * @param value
     * @returns {*}
     */
    makeReactiveArray: function (value) {
      /**
       *
       * @type {Galaxy.View.ReactiveData}
       * @private
       */
      const _this = this;

      if (value.hasOwnProperty('live')) {
        return value.changes;
      }
      _this.makeReactiveObject(value, 'live', true);

      const initialChanges = {
        original: value,
        type: 'reset',
        params: value
      };

      initialChanges.params.forEach(function (item) {
        new Galaxy.View.ReactiveData(initialChanges.original.indexOf(item), item, _this);
      });

      let i = 0;
      let args;

      _this.sync('length');
      _this.oldValue = Object.assign({}, initialChanges);
      initialChanges.init = initialChanges;
      value.changes = initialChanges;
      _this.makeReactiveObject(value, 'changes');

      // We override all the array methods which mutate the array
      ARRAY_MUTATOR_METHODS.forEach(function (method) {
        const originalMethod = ARRAY_PROTO[method];
        defProp(value, method, {
          value: function () {
            i = arguments.length;
            args = new Array(i);
            while (i--) {
              args[i] = arguments[i];
            }

            const result = originalMethod.apply(this, args);
            const changes = {
              original: value,
              type: 'reset',
              params: value
            };

            changes.type = method;
            changes.params = args;
            changes.result = result;
            changes.init = initialChanges;

            _this.oldValue = value.changes;

            if (method === 'push' || method === 'reset' || method === 'unshift') {
              changes.params.forEach(function (item) {
                new Galaxy.View.ReactiveData(changes.original.indexOf(item), item, _this);
              });
            } else if (method === 'pop' || method === 'splice' || method === 'shift') {
              //
            }

            // For arrays we have to sync length manually
            // if we use notify here we will get
            _this.sync('length');
            value.changes = changes;

            return result;
          },
          writable: false,
          configurable: true
        });
      });

      return initialChanges;
    },
    /**
     *
     * @param {string} key
     * @param refs
     */
    notify: function (key, refs) {
      const _this = this;

      if (this.refs === refs) {
        _this.sync(key);
        return;
      }

      _this.refs.forEach(function (ref) {
        if (_this === ref) {
          return;
        }

        ref.notify(key, _this.refs);
      });

      _this.sync(key);
      _this.parent.notify(_this.keyInParent);
    },

    notifyDown: function (key) {
      const _this = this;

      _this.refs.forEach(function (ref) {
        if (_this === ref) {
          return;
        }

        ref.notify(key, _this.refs);
      });

      _this.sync(key);
    },
    /**
     *
     * @param {string} key
     */
    sync: function (key) {
      const _this = this;

      const map = this.nodesMap[key];
      const value = this.data[key];

      if (map) {
        let key;
        map.nodes.forEach(function (node, i) {
          key = map.keys[i];
          _this.syncNode(node, key, value);
        });
      }
    },
    /**
     *
     */
    syncAll: function () {
      const _this = this;
      const keys = objKeys(this.data);
      keys.forEach(function (key) {
        _this.sync(key);
      });
    },
    /**
     *
     * @param node
     * @param {string} key
     * @param value
     */
    syncNode: function (node, key, value) {
      if (node instanceof Galaxy.View.ViewNode) {
        node.setters[key](value, this.oldValue);
      } else {
        node[key] = value;
      }

      Galaxy.Observer.notify(node, key, value, this.oldValue);
    },
    /**
     *
     * @param {Galaxy.View.ReactiveData} reactiveData
     */
    addRef: function (reactiveData) {
      if (this.refs.indexOf(reactiveData) === -1) {
        this.refs.push(reactiveData);
      }
    },
    /**
     *
     * @param {Galaxy.View.ReactiveData} reactiveData
     */
    removeRef: function (reactiveData) {
      const index = this.refs.indexOf(reactiveData);
      if (index !== -1) {
        this.refs.splice(index, 1);
      }
    },
    /**
     *
     */
    removeMyRef: function () {
      if (this.data && this.data.hasOwnProperty('__rd__')) {
        // if I am not the original reference, then remove me from the refs
        if (this.data.__rd__ !== this) {
          this.refs = [this];
          this.data.__rd__.removeRef(this);
        }
        // if I am the original reference and the only one, then remove the __rd__
        else if (this.refs.length === 1) {
          // TODO: Should be tested as much as possible to make sure it works with no bug
          delete this.data.__rd__;
          if (this.data instanceof Array) {
            delete this.data.live;
            delete this.data.changes;
          }
        }
        // if I am the original reference and not the only one
        else {
          this.data.__rd__.removeRef(this);

          const nextOwener = this.refs[0];
          defProp(this.data, '__rd__', {
            enumerable: false,
            configurable: true,
            value: nextOwener
          });

          nextOwener.walk(this.data);

          this.refs = [this];
        }
      }
    },
    /**
     *
     * @param {string} id
     * @returns {*}
     */
    getRefById: function (id) {
      return this.refs.filter(function (ref) {
        return ref.id === id;
      })[0];
    },
    /**
     *
     * @param node
     * @param {string} nodeKey
     * @param dataKey
     * @param expression
     */
    addNode: function (node, nodeKey, dataKey, expression) {
      let map = this.nodesMap[dataKey];
      if (!map) {
        map = this.nodesMap[dataKey] = {
          keys: [],
          nodes: []
        };
      }

      const index = map.nodes.indexOf(node);
      // Check if the node with the same property already exist
      // Insure that same node with different property bind can exist
      if (index === -1 || map.keys[index] !== nodeKey) {
        if (node instanceof Galaxy.View.ViewNode && !node.setters[nodeKey]) {
          node.installSetter(this, nodeKey, expression);
        }

        map.keys.push(nodeKey);
        map.nodes.push(node);

        let initValue = this.data[dataKey];
        // We need initValue for cases where ui is bound to a property of an null object
        if ((initValue === null || initValue === undefined) && this.shadow[dataKey]) {
          initValue = {};
        }

        // if initValue is a change object, then we have to use its init for nodes that are newly being added
        // if the dataKey is length then ignore this line and use initValue which represent the length of array
        if (this.data instanceof Array && dataKey !== 'length' && initValue) {
          initValue = initValue.init;
        }

        this.syncNode(node, nodeKey, initValue);
      }
    },
    /**
     *
     * @param node
     */
    removeNode: function (node) {
      const _this = this;
      this.refs.forEach(function (ref) {
        _this.removeNodeFromRef(ref, node);
      });
    },
    /**
     *
     * @param ref
     * @param node
     */
    removeNodeFromRef: function (ref, node) {
      let map;
      for (let key in ref.nodesMap) {
        map = ref.nodesMap[key];

        let index = -1;
        while ((index = map.nodes.indexOf(node)) !== -1) {
          map.nodes.splice(index, 1);
          map.keys.splice(index, 1);
        }
      }
    },
    /**
     *
     * @param {string} key
     */
    addKeyToShadow: function (key) {
      // Don't empty the shadow object if it exist
      if (!this.shadow[key]) {
        this.shadow[key] = null;
      }

      if (!this.data.hasOwnProperty(key)) {
        this.makeReactiveObject(this.data, key, false);
      }
    },
    /**
     *
     */
    setupShadowProperties: function () {
      for (let key in this.shadow) {
        if (!this.data.hasOwnProperty(key)) {
          this.makeReactiveObject(this.data, key, true);
        } else if (this.shadow[key] instanceof Galaxy.View.ReactiveData) {
          this.shadow[key].setData(this.data[key]);
        }
      }
    },
    /**
     *
     * @param {string} key
     */
    makeKeyEnum: function (key) {
      const desc = Object.getOwnPropertyDescriptor(this.data, key);
      if (desc && desc.enumerable === false) {
        desc.enumerable = true;
        defProp(this.data, key, desc);
      }
    }
  };

  return ReactiveData;

})();

/* global Galaxy, Promise */
'use strict';

Galaxy.View.ViewNode = /** @class */ (function (GV) {
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

  const commentNode = document.createComment('');

  function createComment(t) {
    return commentNode.cloneNode(t);
  }

  function createElem(t) {
    return document.createElement(t);
  }

  function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild(node, child) {
    node.removeChild(child);
  }

  const defProp = Object.defineProperty;

  const referenceToThis = {
    value: this,
    configurable: false,
    enumerable: false
  };

  const __node__ = {
    value: null,
    configurable: false,
    enumerable: false
  };

  //------------------------------

  /**
   *
   * @param schemas
   * @memberOf Galaxy.View.ViewNode
   * @static
   */
  ViewNode.cleanReferenceNode = function (schemas) {
    if (schemas instanceof Array) {
      schemas.forEach(function (node) {
        ViewNode.cleanReferenceNode(node);
      });
    } else if (schemas) {
      __node__.value = null;
      defProp(schemas, '__node__', __node__);
      ViewNode.cleanReferenceNode(schemas.children);
    }
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} node
   * @param {Array<Galaxy.View.ViewNode>} toBeRemoved
   * @param {Galaxy.GalaxySequence} sequence
   * @param {Galaxy.GalaxySequence} root
   * @memberOf Galaxy.View.ViewNode
   * @static
   */
  ViewNode.destroyNodes = function (node, toBeRemoved, sequence, root) {
    let remove = null;

    for (let i = 0, len = toBeRemoved.length; i < len; i++) {
      remove = toBeRemoved[i];
      remove.renderingFlow.truncate();
      remove.destroy(sequence, root);
    }
  };

  /**
   *
   * @param schema
   * @param {Node|Element} node
   * @constructor
   * @memberOf Galaxy.View
   */
  function ViewNode(schema, node) {
    const _this = this;
    _this.node = node || createElem(schema.tag || 'div');
    _this.schema = schema;
    _this.data = {};
    _this.cache = {};
    _this.inputs = {};
    _this.virtual = false;
    _this.placeholder = createComment(schema.tag || 'div');
    _this.properties = [];
    _this.inDOM = typeof schema.inDOM === 'undefined' ? true : schema.inDOM;
    _this.setters = {};
    _this.parent = null;
    _this.dependedObjects = [];
    _this.renderingFlow = new Galaxy.GalaxySequence();
    _this.sequences = {
      enter: new Galaxy.GalaxySequence(),
      leave: new Galaxy.GalaxySequence(),
      ':destroy': new Galaxy.GalaxySequence(),
      ':class': new Galaxy.GalaxySequence()
    };
    _this.observer = new Galaxy.Observer(_this);
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
    defProp(this.schema, '__node__', __node__);

    referenceToThis.value = this;
    defProp(this.node, '__viewNode__', referenceToThis);
    defProp(this.placeholder, '__viewNode__', referenceToThis);

    _this.callLifecycleEvent('postCreate');

  }

  ViewNode.prototype.querySelector = function (selectors) {
    return this.node.querySelector(selectors);
  };

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
    const schemaClone = Object.assign({}, this.schema);
    ViewNode.cleanReferenceNode(schemaClone);

    defProp(schemaClone, 'mother', {
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

  /**
   *
   * @param {Galaxy.GalaxySequence} sequence
   */
  ViewNode.prototype.populateEnterSequence = function (sequence) {
    // this.node.style.visibility = '';
  };

  /**
   *
   * @param {Galaxy.GalaxySequence} sequence
   */
  ViewNode.prototype.populateLeaveSequence = function (sequence) {

  };

  /**
   *
   * @param {boolean} flag
   */
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
   * @param {Galaxy.View.ViewNode} viewNode
   * @param position
   */
  ViewNode.prototype.registerChild = function (viewNode, position) {
    const _this = this;
    viewNode.parent = _this;
    _this.node.insertBefore(viewNode.placeholder, position);
  };

  /**
   * @param {Galaxy.View.ReactiveData} reactiveData
   * @param {string} propertyName
   * @param {Function} expression
   */
  ViewNode.prototype.installSetter = function (reactiveData, propertyName, expression) {
    const _this = this;
    _this.registerProperty(reactiveData);

    _this.setters[propertyName] = GV.createSetter(_this, propertyName, reactiveData, expression);
    if (!_this.setters[propertyName]) {
      _this.setters[propertyName] = function () {
        console.error('No setter for property :', propertyName, '\nNode:', _this);
      };
    }
  };

  /**
   *
   * @param {Galaxy.View.ReactiveData} reactiveData
   */
  ViewNode.prototype.registerProperty = function (reactiveData) {
    if (this.properties.indexOf(reactiveData) === -1) {
      this.properties.push(reactiveData);
    }
  };

  /**
   *
   * @param {Galaxy.GalaxySequence} leaveSequence
   * @param {Galaxy.GalaxySequence} root
   */
  ViewNode.prototype.destroy = function (leaveSequence, root) {
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
        _this.clean(_this.sequences.leave, root);
        _this.populateLeaveSequence(_this.sequences.leave);
        _this.sequences.leave.nextAction(function () {
          if (_this.schema.renderConfig && _this.schema.renderConfig.domManipulationOrder === 'cascade') {
            root.nextAction(function () {
              removeChild(_this.node.parentNode, _this.node);
            });
          } else {
            removeChild(_this.node.parentNode, _this.node);
          }
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

        _this.clean(_this.sequences.leave, root);
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

    _this.properties.forEach(function (reactiveData) {
      reactiveData.removeNode(_this);
    });

    _this.dependedObjects.forEach(function (dependent) {
      dependent.reactiveData.removeNode(dependent.item);
    });

    _this.properties = [];
    _this.inDOM = false;
    _this.schema.__node__ = undefined;
    _this.inputs = {};
  };

  /**
   *
   * @param {Galaxy.View.ReactiveData} reactiveData
   * @param {Object} item
   */
  ViewNode.prototype.addDependedObject = function (reactiveData, item) {
    this.dependedObjects.push({ reactiveData: reactiveData, item: item });
  };

  /**
   *
   * @param {Galaxy.GalaxySequence} leaveSequence
   * @param {Galaxy.GalaxySequence} root
   * @return {Galaxy.GalaxySequence}
   */
  ViewNode.prototype.clean = function (leaveSequence, root) {
    let toBeRemoved = [], node, _this = this;

    const cn = Array.prototype.slice.call(_this.node.childNodes, 0);
    for (let i = cn.length - 1; i >= 0; i--) {
      node = cn[i]['__viewNode__'];

      if (node !== undefined) {
        toBeRemoved.push(node);
      }
    }

    if (_this.schema.renderConfig && _this.schema.renderConfig.domManipulationOrder === 'cascade') {
      toBeRemoved.reverse().forEach(function (node) {
        node.schema.renderConfig = node.schema.renderConfig || {};
        node.schema.renderConfig.domManipulationOrder = 'cascade';
      });
    }
    // If leaveSequence is present we assume that this is being destroyed as a child, therefore its
    // children should also get destroyed as child
    if (leaveSequence) {
      ViewNode.destroyNodes(_this, toBeRemoved, leaveSequence, root);
      return _this.renderingFlow;
    }

    _this.renderingFlow.next(function (next) {
      if (!toBeRemoved.length) {
        next();
        return _this.renderingFlow;
      }

      ViewNode.destroyNodes(_this, toBeRemoved, null, root || _this.sequences.leave);

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

  /**
   *
   * @param {string} name
   * @param value
   * @param oldValue
   */
  ViewNode.prototype.notifyObserver = function (name, value, oldValue) {
    this.observer.notify(name, value, oldValue);
  };

  return ViewNode;

})(Galaxy.View);

/* global Galaxy, TweenLite, TimelineLite */
'use strict';

(function (G) {
  if (!window.TweenLite || !window.TimelineLite) {
    return console.warn('please load GSAP - GreenSock in order to activate animations');
  }

  G.View.NODE_SCHEMA_PROPERTY_MAP['animations'] = {
    type: 'custom',
    name: 'animations',
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
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
          const waitForAnimation = new Promise(function (resolve) {
            animationDone = resolve;
          });

          sequence.next((function (promise) {
            return function (done) {
              promise.then(done);
            };
          })(waitForAnimation));

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
  G.View.NODE_SCHEMA_PROPERTY_MAP['on'] = {
    type: 'custom',
    name: 'on',
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param attr
     * @param events
     */
    handler: function (viewNode, attr, events) {
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
  G.View.NODE_SCHEMA_PROPERTY_MAP['text'] = {
    type: 'custom',
    name: 'text',
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param {string} attr
     * @param value
     */
    handler: function (viewNode, attr, value) {
      const textNode = viewNode.node['<>text'];
      const textValue = typeof value === 'undefined' || value === null ? '' : value;

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
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param {Galaxy.View.ReactiveData} scopeReactiveData
     * @param prop
     * @param {Function} expression
     */
    util: function (viewNode, scopeReactiveData, prop, expression) {
      if (expression && viewNode.schema.tag === 'input') {
        throw new Error('input.checked property does not support binding expressions ' +
          'because it must be able to change its data.\n' +
          'It uses its bound value as its `model` and expressions can not be used as model.\n');
      }

      const bindings = GV.getBindings(viewNode.schema.checked);
      const id = bindings.propertyKeysPaths[0].split('.').pop();
      viewNode.node.addEventListener('change', function () {
        scopeReactiveData.data[id] = viewNode.node.checked;
      });
    }
  };
})(Galaxy.View);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['value.config'] = {
    type: 'none'
  };

  GV.NODE_SCHEMA_PROPERTY_MAP['value'] = {
    type: 'prop',
    name: 'value',
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param {Galaxy.View.ReactiveData} scopeReactiveData
     * @param prop
     * @param {Function} expression
     */
    util: function valueUtil(viewNode, scopeReactiveData, prop, expression) {
      if (expression) {
        throw new Error('input.value property does not support binding expressions ' +
          'because it must be able to change its data.\n' +
          'It uses its bound value as its `model` and expressions can not be used as model.\n');
      }

      const bindings = GV.getBindings(viewNode.schema.value);
      const id = bindings.propertyKeysPaths[0].split('.').pop();
      const nativeNode = viewNode.node;
      if(nativeNode.type === 'number') {
        nativeNode.addEventListener('input', function () {
          scopeReactiveData.data[id] = nativeNode.value ? Number(nativeNode.value) : null;
        });
      } else {
        nativeNode.addEventListener('keyup', function () {
          scopeReactiveData.data[id] = nativeNode.value;
        });
      }
    }
  };
})(Galaxy.View);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['class'] = {
    type: 'reactive',
    name: 'class'
  };

  GV.REACTIVE_BEHAVIORS['class'] = {
    regex: GV.BINDING_SYNTAX_REGEX,
    prepareData: function (m, s) {
      return {
        scope: s
      };
    },
    install: function (data) {
      return true;
    },
    /**
     *
     * @param data
     * @param value
     * @param oldValue
     * @param expression
     * @this {Galaxy.View.ViewNode}
     */
    apply: function (data, value, oldValue, expression) {
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

      node.setAttribute('class', []);

      // when value is an object
      const clone = GV.bindSubjectsToData(_this, value, data.scope, true);
      const observer = new Galaxy.Observer(clone);

      observer.onAll(function (key, value, oldValue) {
        applyClasses.call(_this, key, value, oldValue, clone);
      });

      if (_this.schema.renderConfig && _this.schema.renderConfig.applyClassListAfterRender) {
        _this.rendered.then(function () {
          applyClasses.call(_this, '*', true, false, clone);
        });
      } else {
        applyClasses.call(_this, '*', true, false, clone);
      }
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

  function applyClasses(key, value, oldValue, classes) {
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
})(Galaxy.View);


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
    apply: function (cache, selector, oldSelector, expression) {
      // if (scope.element.schema.children && scope.element.schema.hasOwnProperty('module')) {
      //   // this.domManipulationSequence.next(function (done) {
      //   let allContent = scope.element.schema.children;
      //   let parentViewNode = this.parent;
      //   allContent.forEach(function (content) {
      //     if (selector === '*' || selector.toLowerCase() === content.node.tagName.toLowerCase()) {
      //       content.__node__.__viewNode__.refreshBinds(scope);
      //       parentViewNode.registerChild(content.__node__.__viewNode__, this.placeholder);
      //       content.__node__.__viewNode__.setInDOM(true);
      //     }
      //   });
      //
      //   // done();
      //   // });
      // }
    }
  };
})(Galaxy.View);


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
        // debugger
        GV.makeBinding(this, '$for', undefined, data.scope, {
          isExpression: false,
          modifiers: null,
          propertyKeysPaths: [data.matches[2] + '.changes']
        });
        // debugger;
      } else if (data.matches) {
        const bindings = GV.getBindings(data.matches.data);
        if (bindings.propertyKeysPaths) {
          bindings.propertyKeysPaths[0] = bindings.propertyKeysPaths[0] + '.changes';
          // debugger;
          GV.makeBinding(this, '$for', undefined, data.scope, bindings);
          // debugger;
        }
      }

      return false;
    },
    /**
     *
     * @this {Galaxy.View.ViewNode}
     * @param data The return of prepareData
     * @param changes
     * @param oldChanges
     * @param {Function} expression
     */
    apply: function (data, changes, oldChanges, expression) {
      // debugger;
      if (changes instanceof Array) {
        return;
      }
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
      runForProcess(_this, data, changes, data.scope);
    }
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} node
   * @param data
   * @param changes
   * @param nodeScopeData
   */
  const runForProcess = function (node, data, changes, nodeScopeData) {
    node.renderingFlow.truncate();
    if (changes.type === 'reset') {
      node.renderingFlow.next(function forResetProcess(next) {
        if (node.schema.renderConfig && node.schema.renderConfig.domManipulationOrder === 'cascade') {
          GV.ViewNode.destroyNodes(node, data.nodes, null, node.parent.sequences.leave);
        } else {
          GV.ViewNode.destroyNodes(node, data.nodes.reverse());
        }

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

          const vn = GV.createNode(parentNode, itemDataScope, cns, position);
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
})(Galaxy.View);


/* global Galaxy */

(function (GV) {
  GV.NODE_SCHEMA_PROPERTY_MAP['$if'] = {
    type: 'reactive',
    name: '$if'
  };

  GV.REACTIVE_BEHAVIORS['$if'] = {
    prepareData: function () { },
    install: function (data) { },
    apply: function (data, value, oldValue, expression) {
      const _this = this;
      if (expression) {
        value = expression();
      }
      runIfProcess(_this, value);
    }
  };

  function runIfProcess(node, value) {
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
      node.setInDOM(false);
      // node.sequences.leave.next(next);
    } else {
      // next();
    }
    // });
    // });
  }
})(Galaxy.View);


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
      return true;
    },
    apply: function handleModule(data, moduleMeta, oldModuleMeta, expression) {
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
})(Galaxy.View);


/* global Galaxy */

(function (GV) {
  const NAME = 'style';

  GV.NODE_SCHEMA_PROPERTY_MAP['style.config'] = {
    type: 'none'
  };

  GV.NODE_SCHEMA_PROPERTY_MAP[NAME] = {
    type: 'reactive',
    name: NAME
  };

  GV.REACTIVE_BEHAVIORS[NAME] = {
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param {string} attr
     * @param value
     */
    regex: null,
    prepareData: function (m, s) {
      return {
        scope: s
      };
    },
    install: function (data) {
      return true;
    },
    /**
     *
     * @param data
     * @param value
     * @param oldValue
     * @param expression
     * @this {Galaxy.View.ViewNode}
     */
    apply: function (data, value, oldValue, expression) {
      if (this.virtual) {
        return;
      }

      const _this = this;
      const node = _this.node;

      if (typeof value === 'string') {
        return node.setAttribute('style', value);
      } else if (value instanceof Array) {
        return node.setAttribute('style', value.join(' '));
      } else if (value === null) {
        return node.removeAttribute('style');
      }

      const reactiveStyle = GV.bindSubjectsToData(_this, value, data.scope, true);

      const observer = new Galaxy.Observer(reactiveStyle);
      observer.onAll(function (key, value, oldValue) {
        applyStyles.call(_this, reactiveStyle);
      });

      applyStyles.call(_this, reactiveStyle);
    }
  };

  function applyStyles(value) {
    if (value instanceof Object) {
      Object.assign(this.node.style, value);
    } else {
      this.node.setAttribute('style', value);
    }
  }
})(Galaxy.View);


/* global Galaxy */

Galaxy.View.PROPERTY_SETTERS.attr = function (viewNode, attrName, property, expression) {
  let parser = property.parser;
  const setter = Galaxy.View.createDefaultSetter(viewNode, attrName, parser);

  // function (value, oldValue) {
  //   if (value instanceof Promise) {
  //     const asyncCall = function (asyncValue) {
  //       const newValue = parser ? parser(asyncValue) : asyncValue;
  //       View.setAttr(node, attributeName, newValue, oldValue);
  //     };
  //     value.then(asyncCall).catch(asyncCall);
  //   } else {
  //     const newValue = parser ? parser(value) : value;
  //     View.setAttr(node, attributeName, newValue, oldValue);
  //   }
  // };

  if (expression) {
    return function (none, oldValue) {
      let expressionValue = expression(none);
      setter(expressionValue, oldValue);
    };
  }

  return setter;
};

/* global Galaxy */

Galaxy.View.PROPERTY_SETTERS.custom = function (viewNode, attrName, property, expression) {
  const setter = Galaxy.View.createCustomSetter(viewNode, attrName, property);

  // return function (value, oldValue, scopeData) {
  //   if (value instanceof Promise) {
  //     const asyncCall = function (asyncValue) {
  //       property.handler(node, attributeName, asyncValue, oldValue, scopeData);
  //     };
  //     value.then(asyncCall).catch(asyncCall);
  //   } else {
  //     property.handler(node, attributeName, value, oldValue, scopeData);
  //   }
  // };

  if (expression) {
    return function (none, oldValue) {
      const expressionValue = expression(none);
      setter(expressionValue, oldValue);
    };
  }

  return setter;
};

/* global Galaxy */

Galaxy.View.PROPERTY_SETTERS.prop = function (viewNode, attrName, property, expression) {
  const setter = Galaxy.View.createPropertySetter(viewNode, property);

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
  Galaxy.View.PROPERTY_SETTERS.reactive = function (viewNode, attrName, property, expression, scope) {
    const behavior = Galaxy.View.REACTIVE_BEHAVIORS[property.name];
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
     * @this {Galaxy.View.ViewNode}
     * @param matches
     * @param scope
     */
    prepareData: function (matches, scope) {
      if (matches !== null && typeof  matches !== 'object') {
        throw console.error('inputs property should be an object with explicits keys:\n', JSON.stringify(this.schema, null, '  '));
      }

      return {
        subjects: matches,
        scope: scope
      };
    },
    /**
     *
     * @this {Galaxy.View.ViewNode}
     * @param data
     * @return {boolean}
     */
    install: function (data) {
      if (this.virtual) {
        return;
      }

      const reactive = GV.bindSubjectsToData(this, data.subjects, data.scope, true);
      data.reactive = reactive;

      this.inputs = data.reactive;

      return false;
    },
    apply: function (cache, value, oldValue, context) { }
  };

  Galaxy.registerAddOnProvider('galaxy/inputs', function (scope) {
    return {
      /**
       *
       * @return {*}
       */
      create: function () {
        scope.inputs = scope.element.cache.inputs.reactive;
        return scope.inputs;
      },
      finalize: function () { }
    };
  });
})(Galaxy.View);

(function (G) {
  'use strict';

  SimpleRouter.PARAMETER_REGEXP = /([:*])(\w+)/g;
  SimpleRouter.WILDCARD_REGEXP = /\*/g;
  SimpleRouter.REPLACE_VARIABLE_REGEXP = '([^\/]+)';
  SimpleRouter.REPLACE_WILDCARD = '(?:.*)';
  SimpleRouter.FOLLOWED_BY_SLASH_REGEXP = '(?:\/$|$)';
  SimpleRouter.MATCH_REGEXP_FLAGS = '';

  const _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
    ? function (obj) { return typeof obj; }
    : function (obj) {
      return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype
        ? 'symbol'
        : typeof obj;
    };

  function isPushStateAvailable() {
    return !!(typeof window !== 'undefined' && window.history && window.history.pushState);
  }

  function clean(s) {
    if (s instanceof RegExp) {
      return s;
    }
    return s.replace(/\/+$/, '').replace(/^\/+/, '^/');
  }

  function regExpResultToParams(match, names) {
    if (names.length === 0) {
      return null;
    }

    if (!match) {
      return null;
    }

    return match.slice(1, match.length).reduce(function (params, value, index) {
      if (params === null) {
        params = {};
      }
      params[names[index]] = decodeURIComponent(value);
      return params;
    }, null);
  }

  function replaceDynamicURLParts(route) {
    const paramNames = [];
    let regexp;

    if (route instanceof RegExp) {
      regexp = route;
    } else {
      regexp = new RegExp(route.replace(SimpleRouter.PARAMETER_REGEXP,
        function (full, dots, name) {
          paramNames.push(name);
          return SimpleRouter.REPLACE_VARIABLE_REGEXP;
        }).replace(SimpleRouter.WILDCARD_REGEXP, SimpleRouter.REPLACE_WILDCARD) +
        SimpleRouter.FOLLOWED_BY_SLASH_REGEXP, SimpleRouter.MATCH_REGEXP_FLAGS);
    }

    return {
      regexp: regexp,
      paramNames: paramNames
    };
  }

  function getUrlDepth(url) {
    return url.replace(/\/$/, '').split('/').length;
  }

  function compareUrlDepth(urlA, urlB) {
    return getUrlDepth(urlB) - getUrlDepth(urlA);
  }

  function findMatchedRoutes(url) {
    const routes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    return routes.map(function (route) {
      const _replaceDynamicURLPar = replaceDynamicURLParts(clean(route.route)),
        regexp = _replaceDynamicURLPar.regexp,
        paramNames = _replaceDynamicURLPar.paramNames;

      const match = url.replace(/^\/+/, '/').match(regexp);
      const params = regExpResultToParams(match, paramNames);

      if (route.route === '/' && match.input !== '/') {
        return false;
      }

      return match ? { match: match, route: route, params: params } : false;
    }).filter(function (m) {
      return m;
    });
  }

  function match(url, routes) {
    return findMatchedRoutes(url, routes)[0] || false;
  }

  function root(url, routes) {
    const matched = routes.map(function (route) {
      return route.route === '/' || route.route === '*' ? url : url.split(new RegExp(route.route + '($|\/)'))[0];
    });
    const fallbackURL = clean(url);

    if (matched.length > 1) {
      return matched.reduce(function (result, url) {
        if (result.length > url.length) {
          result = url;
        }
        return result;
      }, matched[0]);
    } else if (matched.length === 1) {
      return matched[0];
    }

    return fallbackURL;
  }

  function isHashChangeAPIAvailable() {
    return typeof window !== 'undefined' && 'onhashchange' in window;
  }

  function extractGETParameters(url) {
    return url.split(/\?(.*)?$/).slice(1).join('');
  }

  function getOnlyURL(url, useHash, hash) {
    let onlyURL = url,
      split;
    const cleanGETParam = function cleanGETParam(str) {
      return str.split(/\?(.*)?$/)[0];
    };

    if (typeof hash === 'undefined') {
      // To preserve BC
      hash = '#';
    }

    if (isPushStateAvailable() && !useHash) {
      onlyURL = cleanGETParam(url).split(hash)[0];
    } else {
      split = url.split(hash);
      onlyURL = split.length > 1 ? cleanGETParam(split[1]) : cleanGETParam(split[0]);
    }

    return onlyURL.replace(/\/+$/, '').replace(/\/\//, '/') || '/';
  }

  function manageHooks(handler, hooks, params) {
    if (hooks && (typeof hooks === 'undefined' ? 'undefined' : _typeof(hooks)) === 'object') {
      if (hooks.before) {
        hooks.before(function () {
          const shouldRoute = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

          if (!shouldRoute) {
            return;
          }
          handler();
          hooks.after && hooks.after(params);
        }, params);
        return;
      } else if (hooks.after) {
        handler();
        hooks.after && hooks.after(params);
        return;
      }
    }
    handler();
  }

  function isHashedRoot(url, useHash, hash) {
    if (isPushStateAvailable() && !useHash) {
      return false;
    }

    if (!url.match(hash)) {
      return false;
    }

    const split = url.split(hash);

    return split.length < 2 || split[1] === '';
  }

  function SimpleRouter(r, useHash, hash) {
    const _this = this;

    _this.root = null;
    _this._routes = [];
    _this._useHash = useHash;
    _this._hash = typeof hash === 'undefined' ? '#' : hash;
    _this._paused = false;
    _this._destroyed = false;
    _this._lastRouteResolved = null;
    _this._notFoundHandler = null;
    _this._defaultHandler = null;
    _this._usePushState = !useHash && isPushStateAvailable();
    _this._onLocationChange = function () {
      _this.resolve();
    };
    _this._genericHooks = null;
    _this._historyAPIUpdateMethod = 'pushState';

    if (r) {
      _this.root = useHash ? r.replace(/\/$/, '/' + _this._hash) : r.replace(/\/$/, '');
    } else if (useHash) {
      _this.root = _this._cLoc().split(_this._hash)[0].replace(/\/$/, '/' + _this._hash);
    }

    _this._listen();
  }

  SimpleRouter.prototype = {
    helpers: {
      match: match,
      root: root,
      clean: clean,
      getOnlyURL: getOnlyURL
    },

    navigate: function navigate(path, absolute) {
      let to;

      path = path || '';
      if (this._usePushState) {
        to = (!absolute ? this._getRoot() + '/' : '') + path.replace(/^\/+/, '/');
        to = to.replace(/([^:])(\/{2,})/g, '$1/');
        history[this._historyAPIUpdateMethod]({}, '', to);
        this.resolve();
      } else if (typeof window !== 'undefined') {
        path = path.replace(new RegExp('^' + this._hash), '');
        if (path[0] !== '/') {
          path = '/' + path;
        }
        window.location.href = window.location.href.replace(/#$/, '').replace(new RegExp(this._hash + '.*$'), '') + this._hash + path;
      }
      return this;
    },

    on: function on() {
      const _this = this;
      let _len = arguments.length;
      const args = new Array(_len);

      for (let key = 0; key < _len; key++) {
        args[key] = arguments[key];
      }

      if (typeof args[0] === 'function') {
        _this._defaultHandler = { handler: args[0], hooks: args[1] };
      } else if (args.length >= 2) {
        _this._add(args[0], args[1], args[2]);
      }

      return this;
    },

    off: function off(handler) {
      if (this._defaultHandler !== null && handler === this._defaultHandler.handler) {
        this._defaultHandler = null;
      } else if (this._notFoundHandler !== null && handler === this._notFoundHandler.handler) {
        this._notFoundHandler = null;
      }
      this._routes = this._routes.reduce(function (result, r) {
        if (r.handler !== handler) {
          result.push(r);
        }
        return result;
      }, []);
      return this;
    },

    notFound: function notFound(handler, hooks) {
      this._notFoundHandler = { handler: handler, hooks: hooks };
      return this;
    },

    resolve: function resolve(current) {
      const _this = this;

      let handler, m;
      let url = (current || this._cLoc()).replace(this._getRoot(), '');

      if (this._useHash) {
        url = url.replace(new RegExp('^\/' + this._hash), '/');
      }

      const GETParameters = extractGETParameters(current || this._cLoc());
      const onlyURL = getOnlyURL(url, this._useHash, this._hash);

      if (this._paused) {
        return false;
      }

      if (this._lastRouteResolved && onlyURL === this._lastRouteResolved.url && GETParameters === this._lastRouteResolved.query) {
        if (this._lastRouteResolved.hooks && this._lastRouteResolved.hooks.already) {
          this._lastRouteResolved.hooks.already(this._lastRouteResolved.params);
        }
        return false;
      }

      m = match(onlyURL, this._routes);

      if (m) {
        this._callLeave();
        this._lastRouteResolved = {
          url: onlyURL,
          query: GETParameters,
          hooks: m.route.hooks,
          params: m.params,
          name: m.route.name
        };
        handler = m.route.handler;
        manageHooks(function () {
          manageHooks(function () {
            m.route.route instanceof RegExp ? handler.apply(undefined, m.match.slice(1, m.match.length)) : handler(m.params, GETParameters);
          }, m.route.hooks, m.params, _this._genericHooks);
        }, this._genericHooks, m.params);
        return m;
      } else if (this._defaultHandler &&
        (onlyURL === '' || onlyURL === '/' || onlyURL === this._hash || isHashedRoot(onlyURL, this._useHash, this._hash))) {
        manageHooks(function () {
          manageHooks(function () {
            _this._callLeave();
            _this._lastRouteResolved = { url: onlyURL, query: GETParameters, hooks: _this._defaultHandler.hooks };
            _this._defaultHandler.handler(GETParameters);
          }, _this._defaultHandler.hooks);
        }, this._genericHooks);
        return true;
      } else if (this._notFoundHandler) {
        manageHooks(function () {
          manageHooks(function () {
            _this._callLeave();
            _this._lastRouteResolved = { url: onlyURL, query: GETParameters, hooks: _this._notFoundHandler.hooks };
            _this._notFoundHandler.handler(GETParameters);
          }, _this._notFoundHandler.hooks);
        }, this._genericHooks);
      }
      return false;
    },

    destroy: function destroy() {
      this._routes = [];
      this._destroyed = true;
      this._lastRouteResolved = null;
      this._genericHooks = null;
      clearTimeout(this._listeningInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', this._onLocationChange);
        window.removeEventListener('hashchange', this._onLocationChange);
      }
    },

    link: function link(path) {
      return this._getRoot() + path;
    },

    pause: function pause() {
      const status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this._paused = status;
      if (status) {
        this._historyAPIUpdateMethod = 'replaceState';
      } else {
        this._historyAPIUpdateMethod = 'pushState';
      }
    },

    resume: function resume() {
      this.pause(false);
    },

    lastRouteResolved: function lastRouteResolved() {
      return this._lastRouteResolved;
    },

    hooks: function hooks(_hooks) {
      this._genericHooks = _hooks;
    },

    init: function (routes) {
      const _this = this;
      const orderedRoutes = Object.keys(routes).sort(compareUrlDepth);
      orderedRoutes.forEach(function (route) {
        _this.on(route, routes[route]);
      });

      _this.resolve();
      return _this;
    },

    _add: function _add(route) {
      const handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      const hooks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (typeof route === 'string') {
        route = encodeURI(route);
      }
      this._routes.push((typeof handler === 'undefined' ? 'undefined' : _typeof(handler)) === 'object' ? {
        route: route,
        handler: handler.uses,
        name: handler.as,
        hooks: hooks || handler.hooks
      } : { route: route, handler: handler, hooks: hooks });

      return this._add;
    },

    _getRoot: function _getRoot() {
      if (this.root !== null) {
        return window.location.origin + this.root;
      }

      this.root = root(this._cLoc().split('?')[0], this._routes);
      return this.root;
    },

    _listen: function _listen() {
      const _this = this;
      // use popstate for modern browsers
      if (_this._usePushState) {
        window.addEventListener('popstate', _this._onLocationChange);
      } else if (isHashChangeAPIAvailable()) {
        window.addEventListener('hashchange', _this._onLocationChange);
      }
      // fallback for very old browser which don't support both hashchange and popstate
      else {
        let cached = _this._cLoc();
        let current = void 0;

        const _check = function check() {
          current = _this._cLoc();
          if (cached !== current) {
            cached = current;
            _this.resolve();
          }
          _this._listeningInterval = setTimeout(_check, 50);
        };

        _check();
      }
    },

    _cLoc: function _cLoc() {
      if (typeof window !== 'undefined') {
        if (typeof window.__NAVIGO_WINDOW_LOCATION_MOCK__ !== 'undefined') {
          return window.__NAVIGO_WINDOW_LOCATION_MOCK__;
        }
        return clean(window.location.href);
      }
      return '';
    },

    _callLeave: function _callLeave() {
      const lastRouteResolved = this._lastRouteResolved;

      if (lastRouteResolved && lastRouteResolved.hooks && lastRouteResolved.hooks.leave) {
        lastRouteResolved.hooks.leave(lastRouteResolved.params);
      }
    }
  };

  G.registerAddOnProvider('galaxy/router', function (scope, module) {
    return {
      create: function () {
        if (module.systemId === 'system') {
          return new SimpleRouter(window.location.pathname, true, '#!');
        } else {
          const router = new SimpleRouter(window.location.pathname + '#!/' + module.id, true, '#!');

          scope.on('module.destroy', function () {
            router.destroy();
          });

          return router;
        }
      },
      finalize: function () { }
    };
  });

})(Galaxy);
/* global Galaxy */
'use strict';

(function (G) {
  G.registerAddOnProvider('galaxy/view', function (scope) {
    return {
      /**
       *
       * @return {Galaxy.View}
       */
      create: function () {
        return new Galaxy.View(scope);
      },
      finalize: function () {
      }
    };
  });
})(Galaxy);
