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
    // let portal;
    // if (obj instanceof Galaxy.GalaxyView.Portal) {
    //   portal = obj;
    // } else {
    //   portal = obj[G.GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
    // }

    if (observers !== undefined) {
      observers.forEach(function (observer) {
        observer.notify(key, value, oldValue);
      });
    }

    // if (portal !== undefined) {
    //   portal.getParents().forEach(function (reactive) {
    //     // console.info(reactive.portal !== caller);
    //     // TODO: this if could be removed but more test is needed
    //     // if (reactive.portal !== caller) {
    //     reactive.reSync();
    //     // }
    //   });
    // }
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
    debugger;
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

  GalaxyView.toShadow = function (host) {
    defineProp(host, '__shadow__', {
      enumerable: false,
      configurable: true,
      value: true
    });
  };

  GalaxyView.initPortalFor = function (host, isShadow) {
    if (!host.hasOwnProperty(GalaxyView.PORTAL_PROPERTY_IDENTIFIER)) {
      defineProp(host, GalaxyView.PORTAL_PROPERTY_IDENTIFIER, {
        writable: true,
        configurable: true,
        enumerable: false,
        value: new GalaxyView.Portal()
      });

      if (isShadow) {
        GalaxyView.toShadow(host);
      }
    }

    return host[GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
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

  GalaxyView.safePropertyLookup = function (data, properties) {
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

  GalaxyView.propertyScopeLookup = function (data, property) {
    const properties = property.split('.');
    const li = properties.length - 1;
    let target = data;
    properties.forEach(function (p, i) {
      target = GalaxyView.propertyLookup(target, p);

      if (i !== li) {
        target = target[p];
      }
    });

    return target;
  };

  // /**
  //  *
  //  * @param {Array|Object} host
  //  * @param {Galaxy.GalaxyView.ReactiveProperty} parent
  //  */
  // GalaxyView.installParentFor = function (host, parent) {
  //   if (host instanceof Array) {
  //     let i = 0, len = host.length, itemPortal;
  //     for (; i < len; i++) {
  //       itemPortal = GalaxyView.getPortal(host[i]);
  //
  //       if (parent instanceof Galaxy.GalaxyView.Portal) {
  //         parent.parents.forEach(function (p) {
  //           itemPortal.addParent(p, true);
  //         });
  //       } else {
  //         itemPortal.addParent(parent, true);
  //       }
  //     }
  //   } else {
  //     const itemPortal = GalaxyView.getPortal(host);
  //     if (parent instanceof Galaxy.GalaxyView.Portal) {
  //       parent.parents.forEach(function (p) {
  //         itemPortal.addParent(p, true);
  //       });
  //       // itemPortal.parents = parent.parents.slice(0);
  //     } else {
  //       itemPortal.addParent(parent, true);
  //     }
  //   }
  // };
  //
  // /**
  //  *
  //  * @param {Array} list
  //  * @param {Galaxy.GalaxyView.ReactiveProperty} parent
  //  */
  // GalaxyView.uninstallParentFor = function (list, parent) {
  //   let itemPortal;
  //   list.forEach(function (item) {
  //     itemPortal = item[GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
  //     if (parent instanceof Galaxy.GalaxyView.Portal) {
  //       parent.parents.forEach(function (p) {
  //         itemPortal.removeParent(p);
  //       });
  //     } else {
  //       itemPortal.removeParent(parent);
  //     }
  //   });
  // };

  // GalaxyView.getPortal = function (host, parent) {
  //   const portal = host[GalaxyView.PORTAL_PROPERTY_IDENTIFIER] || GalaxyView.initPortalFor(host, true);
  //
  //   if (parent) {
  //     portal.addParent(parent);
  //   }
  //
  //   return portal;
  // };
  //
  // GalaxyView.setPortalFor = function (data, portal) {
  //   if (!data.hasOwnProperty(GalaxyView.PORTAL_PROPERTY_IDENTIFIER)) {
  //     defineProp(data, GalaxyView.PORTAL_PROPERTY_IDENTIFIER, {
  //       writable: true,
  //       configurable: true,
  //       enumerable: false,
  //       value: portal
  //     });
  //   } else {
  //     data[GalaxyView.PORTAL_PROPERTY_IDENTIFIER] = portal;
  //   }
  //
  //   return data[GalaxyView.PORTAL_PROPERTY_IDENTIFIER];
  // };

  GalaxyView.EXPRESSION_ARGS_FUNC_CACHE = {};

  GalaxyView.createExpressionArgumentsProvider = function (variables) {
    const id = variables.join();

    if (GalaxyView.EXPRESSION_ARGS_FUNC_CACHE[id]) {
      return GalaxyView.EXPRESSION_ARGS_FUNC_CACHE[id];
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
    GalaxyView.EXPRESSION_ARGS_FUNC_CACHE[id] = func;

    return func;
  };

  GalaxyView.createExpressionFunction = function (host, handler, variables, scope) {
    let getExpressionArguments = Galaxy.GalaxyView.createExpressionArgumentsProvider(variables);

    return function () {
      let args = [];
      try {
        args = getExpressionArguments.call(host, Galaxy.GalaxyView.safePropertyLookup, scope);
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
   * @param {Galaxy.GalaxyView.ReactiveData} scopeData
   * @param {Object} bindings
   * @param {number} expressionArgumentsCount
   * @param {Galaxy.GalaxyView.ReactiveData} parentReactiveData
   */
  GalaxyView.makeBinding = function (target, targetKeyName, scopeData, bindings, parentReactiveData, expressionArgumentsCount) {
    // if (typeof scopeData !== 'object') {
    //   return;
    // }

    // Create portal for scope data
    // Create reactive property for each property on the scope data
    // Use that property structure to create further bindings

    // let shadow = scopeData;
    let value = scopeData;

    if (!parentReactiveData && !(scopeData instanceof Galaxy.GalaxyScope)) {
      if (scopeData.hasOwnProperty('__rd__')) {
        parentReactiveData = scopeData.__rd__;
        // debugger;
      } else {
        parentReactiveData = new Galaxy.GalaxyView.ReactiveData(targetKeyName, value);
      }
      // debugger;
    }

    // if (scopeData instanceof GalaxyView.ReactiveProperty) {
    //   // shadow = scopeData.structure;
    //   value = scopeData.value;
    // }
    // else if (scopeData.hasOwnProperty(GalaxyView.PORTAL_PROPERTY_IDENTIFIER)) {
    // If scopeData has a portal already, then set that portal as the structure portal
    // GalaxyView.setPortalFor(structure, scopeData[GalaxyView.PORTAL_PROPERTY_IDENTIFIER]);
    // }

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
    // let aliasPropertyName = false;
    let propertyKeyPathItems = [];

    for (let i = 0, len = propertyKeysPaths.length; i < len; i++) {
      propertyKeyPath = propertyKeysPaths[i];
      childPropertyKeyPath = null;
      // aliasPropertyName = false;

      propertyKeyPathItems = propertyKeyPath.split('.');
      if (propertyKeyPathItems.length > 1) {
        propertyKeyPath = propertyKeyPathItems.shift();
        childPropertyKeyPath = propertyKeyPathItems.join('.');
      }

      // let shadowPortal = GalaxyView.getPortal(shadow);
      // structurePortal = GalaxyView.Portal(structure);

      // If the property name is `this` and its index is zero, then it is pointing to the ViewNode.data property
      if (i === 0 && propertyKeyPath === 'this' && target instanceof Galaxy.GalaxyView.ViewNode) {
        i = 1;
        propertyKeyPath = propertyKeyPathItems.shift();
        childPropertyKeyPath = null;
        // aliasPropertyName = 'this.' + propertyKeyPath;
        // shadow = GalaxyView.propertyLookup(target.data, propertyKeyPath);
      } else {
        // shadow = GalaxyView.propertyLookup(shadow, propertyKeyPath);
        // shadowPortal = GalaxyView.getPortal(shadow);
        // structurePortal = GalaxyView.Portal(structure);

        if (value) {
          value = GalaxyView.propertyLookup(value, propertyKeyPath);
        }
      }
      // if (!RD) {
      //   RD = new Galaxy.GalaxyView.ReactiveData(propertyKeyPath, value);
      // }

      initValue = value;
      if (value !== null && typeof value === 'object') {
        initValue = value[propertyKeyPath];
      }

      // let enumerable = true;
      // if (propertyKeyPath === 'length' && value instanceof Array) {
      //   propertyKeyPath = '_length';
      //   aliasPropertyName = 'length';
      //   enumerable = false;
      // }

      /** @type Galaxy.GalaxyView.ReactiveProperty */
        // let reactiveProperty = shadowPortal.props[propertyKeyPath];

      let reactiveData;

      // if (!(initValue instanceof Object) && childPropertyKeyPath) {
      //   initValue = {};
      // }

      if (initValue instanceof Object) {
        reactiveData = new Galaxy.GalaxyView.ReactiveData(propertyKeyPath, initValue, parentReactiveData);
      } else if (childPropertyKeyPath) {
        // debugger;
        reactiveData = new Galaxy.GalaxyView.ReactiveData(propertyKeyPath, null, parentReactiveData);
      } else {
        parentReactiveData.addKeyToShadow(propertyKeyPath);
      }

      // parentReactiveData;
      // debugger;
      // if (typeof reactiveProperty === 'undefined') {
      //   reactiveProperty = GalaxyView.createReactiveProperty(shadow, propertyKeyPath, {
      //     alias: aliasPropertyName,
      //     enumerable: enumerable,
      //     valueScope: value,
      //     initValue: initValue,
      //     parentId: scopeData.id
      //   });
      // }

      // if (scopeData instanceof Galaxy.GalaxyView.ReactiveProperty) {
      //   shadowPortal.addParent(scopeData);
      //
      // }

      if (childPropertyKeyPath === null) {
        if (!(target instanceof Galaxy.GalaxyView.ViewNode)) {
          // target[targetKeyName] = value[propertyKeyPath];
          // debugger;
          defineProp(target, targetKeyName, {
            // set: function (newValue) {
            //   // console.warn('wont work', targetKeyName, value);
            //   // value[propertyKeyPath] = newValue;
            // },
            get: function ref() {
              if (expression) {
                return expression();
              }
              return value[propertyKeyPath];
            },
            enumerable: true,
            configurable: true
          });
        } else {
          // TODO: you can somehow specify the interlink here, then you can implement a process that keeps the top-down data flow
          // reactiveProperty.addNode(target, targetKeyName, expression, scopeData);
        }
        // if(propertyKeyPath === 'people') debugger;
        // reactiveProperty.addNode(target, targetKeyName, expression, scopeData);
        parentReactiveData.addNode(target, targetKeyName, propertyKeyPath, expression, scopeData);
      }

      // if(targetKeyName === 'active' && expression) debugger;

      if (childPropertyKeyPath !== null) {
        // GalaxyView.makeBinding(target, targetKeyName, reactiveProperty, {
        //   propertyKeysPaths: [childPropertyKeyPath],
        //   isExpression: expression
        // }, expressionArgumentsCount, reactiveData);

        GalaxyView.makeBinding(target, targetKeyName, initValue, {
          propertyKeysPaths: [childPropertyKeyPath],
          isExpression: expression
        }, reactiveData, expressionArgumentsCount);
      }
      // Call init value only on the last variable binding,
      // so the expression with multiple arguments get called only once
      else if (expressionArgumentsCount === 1) {
        // reactiveProperty.setValueStructure(structure);
        if (initValue instanceof Array) {
          // GalaxyView.createActiveArray(initValue, reactiveProperty.structure[GalaxyView.PORTAL_PROPERTY_IDENTIFIER], reactiveProperty);
        } else if (typeof value === 'object') {
          // reactiveProperty.initValueFor(target, targetKeyName, initValue);
        }
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
    // let subjectsClone = cloneSubject ? GalaxyView.createClone(subjects) : subjects;
    let subjectsClone = cloneSubject ? Galaxy.clone(subjects) : subjects;

    let rd;
    if (!(data instanceof Galaxy.GalaxyScope)) {
      rd = new Galaxy.GalaxyView.ReactiveData('std', data);
    }

    for (let i = 0, len = keys.length; i < len; i++) {
      attributeName = keys[i];
      attributeValue = subjectsClone[attributeName];

      const bindings = GalaxyView.getBindings(attributeValue);

      if (bindings.propertyKeysPaths) {
        GalaxyView.makeBinding(subjectsClone, attributeName, data, bindings, rd);
      }

      if (attributeValue && typeof attributeValue === 'object' && !(attributeValue instanceof Array)) {
        GalaxyView.bindSubjectsToData(attributeValue, data);
      }
    }

    return subjectsClone;
  };

  GalaxyView.bindSubjectsToData2 = function (viewNode, subjects, data, cloneSubject) {
    let keys = Object.keys(subjects);
    let attributeName;
    let attributeValue;
    // let subjectsClone = cloneSubject ? GalaxyView.createClone(subjects) : subjects;
    let subjectsClone = cloneSubject ? Galaxy.clone(subjects) : subjects;

    let rd;
    if (!(data instanceof Galaxy.GalaxyScope)) {
      rd = new Galaxy.GalaxyView.ReactiveData('std', data);
    }

    for (let i = 0, len = keys.length; i < len; i++) {
      attributeName = keys[i];
      attributeValue = subjectsClone[attributeName];

      const bindings = GalaxyView.getBindings(attributeValue);

      if (bindings.propertyKeysPaths) {
        GalaxyView.makeBinding(subjectsClone, attributeName, data, bindings, rd);
        bindings.propertyKeysPaths.forEach(function (path) {
          let temp = GalaxyView.propertyScopeLookup(data, path);
          viewNode.addDependedObject(temp.__rd__, subjectsClone);
          // viewNode.registerProperty(temp.__rd__);
        });
      }

      if (attributeValue && typeof attributeValue === 'object' && !(attributeValue instanceof Array)) {
        GalaxyView.bindSubjectsToData2(viewNode, attributeValue, data);
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
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param {string} attributeName
   * @param property
   * @returns {Function}
   */
  GalaxyView.createCustomSetter = function (node, attributeName, property) {
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
   * @param {Galaxy.GalaxyView.ViewNode} node
   * @param {string} attributeName
   * @returns {Function}
   */
  GalaxyView.createDefaultSetter = function (node, attributeName) {
    return function (value, oldValue) {
      if (value instanceof Promise) {
        const asyncCall = function (asyncValue) {
          GalaxyView.setAttr(node, attributeName, asyncValue, oldValue);
        };
        value.then(asyncCall).catch(asyncCall);
      } else {
        GalaxyView.setAttr(node, attributeName, value, oldValue);
      }
    };
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

  GalaxyView.PROPERTY_SETTERS = {
    'none': function () {
      return function () {

      };
    }
  };

  GalaxyView.createSetter = function (viewNode, key, scopeProperty, expression) {
    let property = GalaxyView.NODE_SCHEMA_PROPERTY_MAP[key];

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

    return GalaxyView.PROPERTY_SETTERS[property.type](viewNode, key, property, expression);
  };

  GalaxyView.setPropertyForNode = function (viewNode, attributeName, value) {
    const property = GalaxyView.NODE_SCHEMA_PROPERTY_MAP[attributeName] || { type: 'attr' };

    switch (property.type) {
      case 'attr':
        GalaxyView.createDefaultSetter(viewNode, attributeName)(value, null);
        break;

      case 'prop':
        GalaxyView.createPropertySetter(viewNode, property)(value, null);
        break;

      case 'reactive': {
        // const reactiveApply = GalaxyView.createSetter(viewNode, attributeName, null, scopeData);
        if (viewNode.setters[property.name]) {
          value;
          viewNode.node;
          debugger;
          return;
        }
        // if(value instanceof Array) debugger;
        const reactiveApply = GalaxyView.createSetter(viewNode, attributeName, null, null);
        viewNode.setters[property.name] = reactiveApply;

        reactiveApply(value, null);
        break;
      }

      case 'event':
        viewNode.node.addEventListener(attributeName, value.bind(viewNode), false);
        break;

      case 'custom':
        GalaxyView.createCustomSetter(viewNode, attributeName, property)(value, null);
        break;
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ViewNode} parent
   * @param {Object} scopeData
   * @param {Object} nodeSchema
   * @param position
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
      let attributeValue, attributeName;
      const keys = Object.keys(nodeSchema);
      const needInitKeys = [];
      // keys.splice(keys.indexOf('tag'), 1);

      const viewNode = new GalaxyView.ViewNode(nodeSchema);
      parent.registerChild(viewNode, position);

      // Behaviors definition stage
      for (i = 0, len = keys.length; i < len; i++) {
        attributeName = keys[i];
        if (GalaxyView.REACTIVE_BEHAVIORS[attributeName]) {
          const needValueAssign = GalaxyView.installReactiveBehavior(viewNode, attributeName, scopeData);
          if (needValueAssign !== false) {
            needInitKeys.push(attributeName);
          }
        } else {
          needInitKeys.push(attributeName);
        }
      }

      let bindings;
      // Value assignment stage
      for (i = 0, len = needInitKeys.length; i < len; i++) {
        attributeName = needInitKeys[i];
        attributeValue = nodeSchema[attributeName];

        bindings = GalaxyView.getBindings(attributeValue);
        if (bindings.propertyKeysPaths) {
          GalaxyView.makeBinding(viewNode, attributeName, scopeData, bindings);
        } else {
          GalaxyView.setPropertyForNode(viewNode, attributeName, attributeValue);
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
      _this.container = new GalaxyView.ViewNode({
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

Galaxy.GalaxyView.ReactiveData = /** @class */ (function () {
  const GV = Galaxy.GalaxyView;
  const objKeys = Object.keys;
  const defineProp = Object.defineProperty;
  const scopeBuilder = function () {
    return {
      id: 'Scope',
      shadow: {},
      data: {},
      notify: function () {

      },
      sync: function () {

      },
      makeReactiveObject: function () {

      }
    };
  };

  const uninstallRefFor = function (list, ref) {
    let itemRD;
    list.forEach(function (item) {
      itemRD = item.__rd__;
      if (itemRD) {
        itemRD.removeRef(ref);
      }
    });
  };

  /**
   * @param {string} id
   * @param {Object} data
   * @param {Galaxy.GalaxyView.ReactiveData} p
   * @constructor
   * @memberOf Galaxy.GalaxyView
   */
  function ReactiveData(id, data, p) {
    const parent = p || scopeBuilder();
    this.data = data;
    this.id = parent.id + '.' + id;
    // if (p && p.data instanceof Array) {
    //   this.keyInParent = p.keyInParent;
    // } else {
    this.keyInParent = id;
    // }
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
        this.data = {};
        this.parent.makeReactiveObject(this.parent.data, id, true);
      }

      defineProp(this.data, '__rd__', {
        enumerable: false,
        configurable: true,
        value: this
      });

      this.walk(this.data);
    }

    // this.parent.shadow[id] = this.shadow;
    if (this.parent.data instanceof Array) {
      this.keyInParent = this.parent.keyInParent;
    } else {
      this.parent.shadow[id] = this;
    }
  }

  ReactiveData.prototype.setData = function (data) {
    this.removeMyRef(data);

    if (!(data instanceof Object)) {
      this.data = {};
      for (let key in this.shadow) {

        this.notify(key);
      }

      return;
    }

    this.data = data;
    if (data.hasOwnProperty('__rd__')) {
      this.data.__rd__.addRef(this);
      this.refs = this.data.__rd__.refs;

      if (this.data instanceof Array) {
        this.sync('length');
      }
    } else {
      defineProp(this.data, '__rd__', {
        enumerable: false,
        configurable: true,
        value: this
      });

      this.walk(this.data);

    }

    this.setupShadowProperties();
  };

  ReactiveData.prototype.walk = function (data) {
    const _this = this;
    if (data instanceof Array) {
      _this.makeReactiveArray(data);
    } else if (data instanceof Object) {
      for (let key in data) {
        _this.makeReactiveObject(data, key);
      }
    }
  };

  ReactiveData.prototype.makeReactiveObject = function (data, key, shadow) {
    const _this = this;
    let value = data[key];

    defineProp(data, key, {
      get: function () {
        return value;
      },
      set: function (val) {
        // if (key === 'people') {
        //   this;
        //   debugger;
        // }
        // This means that the property suppose to be an object and there probably active binds to it
        if (_this.shadow[key]) {
          // debugger;
          _this.makeKeyEnum(key);
          // setData provide downward data flow
          _this.shadow[key].setData(val);
          // debugger;
        }

        if (value === val) {
          // If value is array, then sync should be called so nodes that are listening to array itself get updated
          if (val instanceof Array) {
            _this.sync(key);
          }
          return;
        }

        _this.oldValue = value;

        value = val;

        // if (value instanceof Array) {
        //   // _this.makeReactiveArray(value);
        //   // _this.update(key, _this.makeReactiveArray(value));
        // } else {
        _this.notify(key);
        // }
      },
      enumerable: !shadow,
      configurable: true
    });

    /*if (value instanceof Array) {
      new Galaxy.GalaxyView.ReactiveData(key, value, this);
      debugger;
      return this.data[key] = value;
    } else */
    if (value instanceof Object) {
      this.data[key] = value;
    } else if (this.shadow[key]) {
      this.shadow[key].setData(value);
    } else {
      this.shadow[key] = null;
    }

    // Update the ui for this key
    // This is for when the makeReactive method has been called by setData
    this.sync(key);
  };

  ReactiveData.prototype.makeReactiveArray = function (value) {
    /**
     *
     * @type {Galaxy.GalaxyView.ReactiveData}
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
      new Galaxy.GalaxyView.ReactiveData(initialChanges.original.indexOf(item), item, _this);
    });

    // debugger;

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

    let i = 0;
    let args;

    _this.sync('length');
    _this.oldValue = Object.assign({}, initialChanges);
    initialChanges.init = initialChanges;
    value.changes = initialChanges;
    _this.makeReactiveObject(value, 'changes');

    methods.forEach(function (method) {
      let original = arrayProto[method];
      defineProp(value, method, {
        value: function () {
          i = arguments.length;
          args = new Array(i);
          while (i--) {
            args[i] = arguments[i];
          }

          const result = original.apply(this, args);
          const changes = {
            original: value,
            type: 'reset',
            params: value
          };

          changes.type = method;
          changes.params = args;
          changes.result = result;
          changes.init = initialChanges;

          if (method === 'push' || method === 'reset' || method === 'unshift') {
            // if (!_this.shadow[key]) {
            //   console.error('no shadow for array')
            //   debugger;
            // }

            changes.params.forEach(function (item) {
              new Galaxy.GalaxyView.ReactiveData(changes.original.indexOf(item), item, _this);
            });

            // debugger;
          }

          _this.sync('length');

          value.changes = changes;
          // debugger;
          // For arrays we have to sync length manually
          // if we use notify here we will get
          // length nodes will be in this ReactiveData object

          // $for nodes will be in parent ReactiveData object
          // _this.parent.update(_this.keyInParent, changes);
          // _this.parent.notify(_this.keyInParent);
          _this.oldValue = Object.assign({}, changes);

          return result;
        },
        writable: false,
        configurable: true
      });
    });

    return initialChanges;
  };

  ReactiveData.prototype.notify = function (key, refs) {
    const _this = this;

    if (this.refs === refs) {

      // console.info('same refs', this.id);
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
    // if (key === 'done' || key === 'items' || key === 'inputs') {
    //   this;
    //   debugger;
    // }
    // this will cause that $for get the array instead of the changes
    _this.parent.notify(_this.keyInParent);
  };

  ReactiveData.prototype.sync = function (key) {
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
  };

  ReactiveData.prototype.syncAll = function () {
    const _this = this;
    const keys = objKeys(this.data);
    keys.forEach(function (key) {
      _this.sync(key);
    });
  };

  ReactiveData.prototype.syncNode = function (node, key, value) {
    if (node instanceof Galaxy.GalaxyView.ViewNode) {
      node.setters[key](value, this.oldValue);
    } else {
      node[key] = value;
    }

    Galaxy.GalaxyObserver.notify(node, key, value, this.oldValue);
  };

  ReactiveData.prototype.update = function (key, changes) {
    const _this = this;

    if (changes) {
      if (changes.type === 'push' || changes.type === 'reset' || changes.type === 'unshift') {
        // if (!_this.shadow[key]) {
        //   console.error('no shadow for array')
        //   debugger;
        // }

        const arrayItemParent = _this.shadow[key];
        changes.params.forEach(function (item) {
          new Galaxy.GalaxyView.ReactiveData(changes.original.indexOf(item), item, arrayItemParent);
        });
        debugger;
      } else if (changes.type === 'shift' || changes.type === 'pop') {
      } else if (changes.type === 'splice' || changes.type === 'reset') {
      }
    }

    this.updateNode(key, changes);
  };

  /**
   *
   * @param key
   * @param changes
   */
  ReactiveData.prototype.updateNode = function (key, changes) {
    const _this = this;
    const map = this.nodesMap[key];

    if (map) {
      let key;
      map.nodes.forEach(function (node, i) {
        key = map.keys[i];
        if (node instanceof Galaxy.GalaxyView.ViewNode) {
          node.setters[key](changes, _this.oldValue);
        } else {
          node[key] = changes.original;
        }

        Galaxy.GalaxyObserver.notify(node, key, changes, _this.oldValue);
      });
    }
  };

  /**
   *
   * @param {Galaxy.GalaxyView.ReactiveData} reactiveData
   */
  ReactiveData.prototype.addRef = function (reactiveData) {
    if (this.refs.indexOf(reactiveData) === -1) {
      this.refs.push(reactiveData);
    }
  };

  ReactiveData.prototype.removeRef = function (reactiveData) {
    const index = this.refs.indexOf(reactiveData);
    if (index !== -1) {
      this.refs.splice(index, 1);
    }
  };

  ReactiveData.prototype.removeMyRef = function (data) {

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
        // debugger
        this.data.__rd__.removeRef(this);

        const nextOriginal = this.refs[0];
        defineProp(this.data, '__rd__', {
          enumerable: false,
          configurable: true,
          value: nextOriginal
        });
        // debugger
        nextOriginal.walk(this.data);
        // debugger
        this.refs = [this];
      }
    }

  };

  ReactiveData.prototype.getRefById = function (id) {
    return this.refs.filter(function (ref) {
      return ref.id === id;
    })[0];
  };

  ReactiveData.prototype.addNode = function (node, nodeKey, dataKey, expression/*, scopeProperty*/) {
    // console.info('rd', nodeKey, dataKey);

    let map = this.nodesMap[dataKey];
    if (!map) {
      map = this.nodesMap[dataKey] = {
        keys: [],
        nodes: []
      };
    }

    let index = map.nodes.indexOf(node);
    // Check if the node with the same property already exist
    // Insure that same node with different property bind can exist
    if (index === -1 || map.keys[index] !== nodeKey) {
      if (node instanceof Galaxy.GalaxyView.ViewNode && !node.setters[nodeKey]) {
        node.installSetter(this, nodeKey, expression);
      }

      map.keys.push(nodeKey);
      map.nodes.push(node);

      let initValue = this.data[dataKey];
      // We need initValue for cases where ui is bound to a property of an null object
      if ((initValue === null || initValue === undefined) && this.shadow[dataKey]) {
        initValue = {};
      }

      // if initValue is a change object,then we have to use its init for nodes that are newly being added
      if (this.data instanceof Array && initValue) {
        initValue = initValue.init;
      }

      this.syncNode(node, nodeKey, initValue);
    }
  };

  ReactiveData.prototype.removeNode = function (node) {
    let map;
    for (let prop in this.nodesMap) {
      map = this.nodesMap[prop];

      let index = -1;
      while ((index = map.nodes.indexOf(node)) !== -1) {
        map.nodes.splice(index, 1);
        map.keys.splice(index, 1);
      }
    }
  };

  ReactiveData.prototype.addKeyToShadow = function (key) {
    this.shadow[key] = null;
  };

  ReactiveData.prototype.setupShadowProperties = function () {
    for (let key in this.shadow) {
      if (!this.data.hasOwnProperty(key)) {
        // debugger
        this.makeReactiveObject(this.data, key, true);
        // debugger;
      } else if (this.shadow[key] instanceof Galaxy.GalaxyView.ReactiveData) {
        // debugger;
        if (!(this.data[key] instanceof Array)) {
          this.shadow[key].setData(this.data[key]);
        }
      }
    }
  };

  ReactiveData.prototype.makeKeyEnum = function (key) {
    const desc = Object.getOwnPropertyDescriptor(this.data, key);
    if (desc && desc.enumerable === false) {
      desc.enumerable = true;
      defineProp(this.data, key, desc);
    }
  };

  return ReactiveData;

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
   * @param schema
   * @param {Node|Element} node
   * @constructor
   * @memberOf Galaxy.GalaxyView
   */
  function ViewNode(schema, node) {
    const _this = this;
    _this.node = node || createElem(schema.tag || 'div');
    _this.schema = schema;
    _this.data = {};
    _this.cache = {};
    // _this.addons = {};
    _this.inputs = {};
    // _this.localScope = {};
    _this.virtual = false;
    _this.placeholder = createComment(schema.tag || 'div');
    _this.properties = [];
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
   * @param {Galaxy.GalaxyView.ReactiveProperty} scopeProperty
   */
  // ViewNode.prototype.installPropertySetter = function (boundProperty, propertyName, expression, scopeProperty) {
  //   const exist = this.properties[boundProperty.name];
  //   if (exist) {
  //     if (exist.indexOf(boundProperty) === -1) {
  //       exist.push(boundProperty);
  //     }
  //   } else {
  //     this.properties[boundProperty.name] = [boundProperty];
  //   }
  //
  //   this.setters[propertyName] = GV.createSetter(this, propertyName, boundProperty, scopeProperty, expression);
  //   if (!this.setters[propertyName]) {
  //     const _this = this;
  //     this.setters[propertyName] = function () {
  //       console.error('No setter for property :', propertyName, '\nNode:', _this);
  //     };
  //   }
  // };

  /**
   * @param {Galaxy.GalaxyView.ReactiveData} reactiveData
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
   * @param {Galaxy.GalaxyView.ReactiveData} reactiveData
   */
  ViewNode.prototype.registerProperty = function (reactiveData) {
    if (this.properties.indexOf(reactiveData) === -1) {
      this.properties.push(reactiveData);
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
   * @param {Galaxy.GalaxyView.ReactiveData} reactiveData
   * @param {Object} item
   */
  ViewNode.prototype.addDependedObject = function (reactiveData, item) {
    this.dependedObjects.push({ reactiveData: reactiveData, item: item });
  };

  // ViewNode.prototype.refreshBinds = function () {
  //   let property, properties = this.properties;
  //   for (let key in properties) {
  //     property = properties[key];
  //
  //     if (property instanceof Array) {
  //       property.forEach(function (item) {
  //         if (item.nodes.indexOf(this) === -1) {
  //           item.nodes.push(this);
  //           item.keys.push(key);
  //         }
  //       });
  //     } else {
  //       if (property.value.nodes.indexOf(this) === -1) {
  //         property.value.nodes.push(this);
  //         property.value.keys.push(key);
  //       }
  //     }
  //   }
  // };

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
    util: function (viewNode, scopeProperty, prop, expression) {
      if (expression && viewNode.schema.tag === 'input') {
        throw new Error('input.checked property does not support binding expressions ' +
          'because it must be able to change its data.\n' +
          'It uses its bound value as its `model` and expressions can not be used as model.\n');
      }

      const bindings = GV.getBindings(viewNode.schema.checked);
      const id = bindings.propertyKeysPaths[0].split('.').pop();
      viewNode.node.addEventListener('change', function () {
        scopeProperty.data[id] = viewNode.node.checked;
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
    util: function (viewNode, scopeProperty, prop, expression) {
      if (expression) {
        throw new Error('input.value property does not support binding expressions ' +
          'because it must be able to change its data.\n' +
          'It uses its bound value as its `model` and expressions can not be used as model.\n');
      }

      const bindings = GV.getBindings(viewNode.schema.value);
      const id = bindings.propertyKeysPaths[0].split('.').pop();
      const nativeNode = viewNode.node;
      if (bindings.modifiers === 'number') {
        nativeNode.addEventListener('keyup', function () {
          scopeProperty.data[id] = nativeNode.value ? Number(nativeNode.value) : null;
        });
      } else {
        nativeNode.addEventListener('keyup', function () {
          scopeProperty.data[id] = nativeNode.value;
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
     * @this {Galaxy.GalaxyView.ViewNode}
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

      // TODO: This should happen in the install
      const clone = GV.bindSubjectsToData2(_this, value, data.scope, true);

      // if (_this.setters.class.hasOwnProperty('data') && clone !== _this.setters.class['data']) {
      //   Galaxy.resetObjectTo(_this.setters.class['data'], clone);
      // } else if (!_this.setters.class.hasOwnProperty('data')) {
      //   _this.setters.class['data'] = clone;
      // }

      node.setAttribute('class', []);
      const observer = new Galaxy.GalaxyObserver(clone);
      // debugger;
      // observer._node = _this.node;
      //
      observer.onAll(function (key, value, oldValue) {
        toggles.call(_this, key, value, oldValue, clone);
      });

      if (_this.schema.renderConfig && _this.schema.renderConfig.applyClassListAfterRender) {
        _this.rendered.then(function () {
          toggles.call(_this, '*', true, false, clone);
        });
      } else {
        toggles.call(_this, '*', true, false, clone);
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
        // debugger
        GV.makeBinding(this, '$for', data.scope, {
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
          GV.makeBinding(this, '$for', data.scope, bindings);
          // debugger;
        }
      }

      return false;
    },
    /**
     *
     * @this {Galaxy.GalaxyView.ViewNode}
     * @param data The return of prepareData
     * @param changes
     * @param oldChanges
     * @param expression
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
    apply: function (data, value, oldValue, expression) {
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

  // function (value, oldValue) {
  //   if (value instanceof Promise) {
  //     const asyncCall = function (asyncValue) {
  //       const newValue = parser ? parser(asyncValue) : asyncValue;
  //       GalaxyView.setAttr(node, attributeName, newValue, oldValue);
  //     };
  //     value.then(asyncCall).catch(asyncCall);
  //   } else {
  //     const newValue = parser ? parser(value) : value;
  //     GalaxyView.setAttr(node, attributeName, newValue, oldValue);
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

Galaxy.GalaxyView.PROPERTY_SETTERS.custom = function (viewNode, attrName, property, expression) {
  const setter = Galaxy.GalaxyView.createCustomSetter(viewNode, attrName, property);

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

      // const reactive = GV.bindSubjectsToData(matches, scope, true);
      return {
        // reactive: reactive,
        subjects: matches,
        scope: scope
      };
    },
    install: function (data) {
      if (this.virtual) {
        return;
      }

      // const reactive = GV.bindSubjectsToData(data.subjects, data.scope, true);
      const reactive = GV.bindSubjectsToData2(this, data.subjects, data.scope, true);
// debugger;
      data.reactive = reactive;

      // if (this.cache.inputs && this.cache.inputs.reactive !== data.reactive) {
      //   Galaxy.resetObjectTo(this.cache.inputs, data);
      // } else if (this.cache.inputs === undefined) {
      //   this.cache.inputs = data;
      // }
      //
      this.inputs = data.reactive;
      // this.addDependedObject(data.reactive);

      return false;
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
