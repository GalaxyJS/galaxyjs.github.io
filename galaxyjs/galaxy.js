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

(function (self) {
  if (typeof self.CustomEvent === 'function') {
    return false;
  }

  function CustomEvent(event, params) {
    params = params || {bubbles: false, cancelable: false, detail: undefined};
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = self.Event.prototype;

  self.CustomEvent = CustomEvent;
})(typeof self !== 'undefined' ? self : this);

(function (self) {
  self.Reflect = self.Reflect || {
    deleteProperty: function (target, propertyKey) {
      delete target[propertyKey];
    }
  };
})(typeof self !== 'undefined' ? self : this);

/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.ES6Promise = factory());
}(typeof self !== 'undefined' ? self : this, (function () { 'use strict';

  function objectOrFunction(x) {
    let type = typeof x;
    return x !== null && (type === 'object' || type === 'function');
  }

  function isFunction(x) {
    return typeof x === 'function';
  }



  let _isArray = void 0;
  if (Array.isArray) {
    _isArray = Array.isArray;
  } else {
    _isArray = function (x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  }

  let isArray = _isArray;

  let len = 0;
  let vertxNext = void 0;
  let customSchedulerFn = void 0;

  let asap = function asap(callback, arg) {
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

  let browserWindow = typeof window !== 'undefined' ? window : undefined;
  let browserGlobal = browserWindow || {};
  let BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  let isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

  // test for web worker but not in IE10
  let isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

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
    let iterations = 0;
    let observer = new BrowserMutationObserver(flush);
    let node = document.createTextNode('');
    observer.observe(node, { characterData: true });

    return function () {
      node.data = iterations = ++iterations % 2;
    };
  }

  // web worker
  function useMessageChannel() {
    let channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function () {
      return channel.port2.postMessage(0);
    };
  }

  function useSetTimeout() {
    // Store setTimeout reference so es6-promise will be unaffected by
    // other code modifying setTimeout (like sinon.useFakeTimers())
    let globalSetTimeout = setTimeout;
    return function () {
      return globalSetTimeout(flush, 1);
    };
  }

  var queue = new Array(1000);
  function flush() {
    for (let i = 0; i < len; i += 2) {
      let callback = queue[i];
      let arg = queue[i + 1];

      callback(arg);

      queue[i] = undefined;
      queue[i + 1] = undefined;
    }

    len = 0;
  }

  function attemptVertx() {
    try {
      let vertx = Function('return this')().require('vertx');
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
    let parent = this;

    let child = new this.constructor(noop);

    if (child[PROMISE_ID] === undefined) {
      makePromise(child);
    }

    let _state = parent._state;


    if (_state) {
      let callback = arguments[_state - 1];
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
    let Constructor = this;

    if (object && typeof object === 'object' && object.constructor === Constructor) {
      return object;
    }

    let promise = new Constructor(noop);
    resolve(promise, object);
    return promise;
  }

  var PROMISE_ID = Math.random().toString(36).substring(2);

  function noop() {}

  let PENDING = void 0;
  let FULFILLED = 1;
  let REJECTED = 2;

  function selfFulfillment() {
    return new TypeError('You cannot resolve a promise with itself');
  }

  function cannotReturnOwn() {
    return new TypeError('A promises callback cannot return that same promise.');
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
      let sealed = false;
      let error = tryThen(then$$1, thenable, function (value) {
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
      if (then$$1 === undefined) {
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
      let then$$1 = void 0;
      try {
        then$$1 = value.then;
      } catch (error) {
        reject(promise, error);
        return;
      }
      handleMaybeThenable(promise, value, then$$1);
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
    let _subscribers = parent._subscribers;
    let length = _subscribers.length;


    parent._onerror = null;

    _subscribers[length] = child;
    _subscribers[length + FULFILLED] = onFulfillment;
    _subscribers[length + REJECTED] = onRejection;

    if (length === 0 && parent._state) {
      asap(publish, parent);
    }
  }

  function publish(promise) {
    let subscribers = promise._subscribers;
    let settled = promise._state;

    if (subscribers.length === 0) {
      return;
    }

    let child = void 0,
      callback = void 0,
      detail = promise._result;

    for (let i = 0; i < subscribers.length; i += 3) {
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

  function invokeCallback(settled, promise, callback, detail) {
    let hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

    if (hasCallback) {
      try {
        value = callback(detail);
      } catch (e) {
        succeeded = false;
        error = e;
      }

      if (promise === value) {
        reject(promise, cannotReturnOwn());
        return;
      }
    } else {
      value = detail;
    }

    if (promise._state !== PENDING) {
      // noop
    } else if (hasCallback && succeeded) {
      resolve(promise, value);
    } else if (succeeded === false) {
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

  let id = 0;
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

  let Enumerator = function () {
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
      for (let i = 0; this._state === PENDING && i < input.length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
      let c = this._instanceConstructor;
      let resolve$$1 = c.resolve;


      if (resolve$$1 === resolve$1) {
        let _then = void 0;
        let error = void 0;
        let didError = false;
        try {
          _then = entry.then;
        } catch (e) {
          didError = true;
          error = e;
        }

        if (_then === then && entry._state !== PENDING) {
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof _then !== 'function') {
          this._remaining--;
          this._result[i] = entry;
        } else if (c === Promise$1) {
          let promise = new c(noop);
          if (didError) {
            reject(promise, error);
          } else {
            handleMaybeThenable(promise, entry, _then);
          }
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
      let promise = this.promise;


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
      let enumerator = this;

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
    let Constructor = this;

    if (!isArray(entries)) {
      return new Constructor(function (_, reject) {
        return reject(new TypeError('You must pass an array to race.'));
      });
    } else {
      return new Constructor(function (resolve, reject) {
        let length = entries.length;
        for (let i = 0; i < length; i++) {
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
    let Constructor = this;
    let promise = new Constructor(noop);
    reject(promise, reason);
    return promise;
  }

  function needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  function needsNew() {
    throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');
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

  var Promise$1 = function () {
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
      let promise = this;
      let constructor = promise.constructor;

      if (isFunction(callback)) {
        return promise.then(function (value) {
          return constructor.resolve(callback()).then(function () {
            return value;
          });
        }, function (reason) {
          return constructor.resolve(callback()).then(function () {
            throw reason;
          });
        });
      }

      return promise.then(callback, callback);
    };

    return Promise;
  }();

  Promise$1.prototype.then = then;
  Promise$1.all = all;
  Promise$1.race = race;
  Promise$1.resolve = resolve$1;
  Promise$1.reject = reject$1;
  Promise$1._setScheduler = setScheduler;
  Promise$1._setAsap = setAsap;
  Promise$1._asap = asap;

  /*global self*/
  function polyfill() {
    let local = void 0;

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

    let P = local.Promise;

    if (P) {
      let promiseToString = null;
      try {
        promiseToString = Object.prototype.toString.call(P.resolve());
      } catch (e) {
        // silently ignored
      }

      if (promiseToString === '[object Promise]' && !P.cast) {
        return;
      }
    }

    local.Promise = Promise$1;
  }

  // Strange compat..
  Promise$1.polyfill = polyfill;
  Promise$1.Promise = Promise$1;

  return Promise$1;

})));


/* global Galaxy, Promise */
'use strict';
/*!
 * GalaxyJS
 * Eeliya Rasta
 * Released under the MIT License.
 */

/**
 * @exports Galaxy
 */
window.Galaxy = window.Galaxy || /** @class */(function () {
  const AsyncFunction = Object.getPrototypeOf(async function () {
  }).constructor;
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

  const cachedModules = {};
  Core.cm = cachedModules;

  /**
   *
   * @constructor
   */
  function Core() {
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
          if (obj[i] instanceof Promise) {
            clone[i] = obj[i];
          } else if (typeof (obj[i]) === 'object' && obj[i] !== null) {
            clone[i] = Galaxy.clone(obj[i]);
          } else {
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

      bootModule.id = 'system';

      if (!bootModule.element) {
        throw new Error('element property is mandatory');
      }

      return new Promise(function (resolve, reject) {
        _this.load(bootModule).then(function (module) {
          // Replace galaxy temporary bootModule with user specified bootModule
          _this.bootModule = module;
          resolve(module);
        }).catch(function (error) {
          console.error('Something went wrong', error);
          reject();
        });
      });
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
      if (!module) {
        throw new Error('Module meta data or constructor is missing');
      }

      const _this = this;
      return new Promise(function (resolve, reject) {
        if (module.hasOwnProperty('constructor') && typeof module.constructor === 'function') {
          module.path = module.id = 'internal/' + (new Date()).valueOf() + '-' + Math.round(performance.now());
          module.systemId = module.parentScope ? module.parentScope.systemId + '/' + module.id : module.id;

          return _this.compileModuleContent(module, module.constructor, []).then(function (compiledModule) {
            return _this.executeCompiledModule(compiledModule).then(resolve);
          });
        }

        module.id = module.id || 'noid-' + (new Date()).valueOf() + '-' + Math.round(performance.now());
        module.systemId = module.parentScope ? module.parentScope.systemId + '/' + module.id : module.id;

        let invokers = [module.path];
        if (module.invokers) {
          if (module.invokers.indexOf(module.path) !== -1) {
            throw new Error('circular dependencies: \n' + module.invokers.join('\n') + '\nwant to load: ' + module.path);
          }

          invokers = module.invokers;
          invokers.push(module.path);
        }

        let url = module.path + '?' + _this.convertToURIString(module.params || {});
        // contentFetcher makes sure that any module gets loaded from network only once unless cache property is present
        let contentFetcher = Galaxy.moduleContents[url];
        if (!contentFetcher || module.fresh) {
          Galaxy.moduleContents[url] = contentFetcher = fetch(url).then((response) => {
            if (!response.ok) {
              console.error(response.statusText, url);
              return reject(response.statusText);
            }

            return response;
          }).catch(reject);
        }

        contentFetcher = contentFetcher.then(response => {
          const contentType = module.contentType || response.headers.get('content-type');
          return response.clone().text().then(content => {
            return new Galaxy.Module.Content(contentType, content, module);
          });
        });

        contentFetcher
          .then(moduleContent => _this.compileModuleContent(module, moduleContent, invokers))
          .then(compiledModule => _this.executeCompiledModule(compiledModule))
          .then(resolve)
          .catch(reject);
      });
    },

    /**
     *
     * @param {Object} moduleMetaData
     * @param moduleConstructor
     * @param invokers
     * @returns {Promise<Galaxy.Module>}
     */
    compileModuleContent: function (moduleMetaData, moduleConstructor, invokers) {
      const _this = this;
      return new Promise(function (resolve, reject) {
        const doneImporting = function (module, imports) {
          imports.splice(imports.indexOf(module.path) - 1, 1);

          if (imports.length === 0) {
            // This will load the original initializer
            resolve(module);
          }
        };

        if (typeof moduleConstructor === 'function') {
          moduleConstructor = new Galaxy.Module.Content('function', moduleConstructor, moduleMetaData);
        }

        const parsedContent = Galaxy.Module.Content.parse(moduleConstructor);
        const imports = parsedContent.imports;
        const source = parsedContent.source;

        const scope = new Galaxy.Scope(moduleMetaData, moduleMetaData.element || _this.rootElement);
        // Create module from moduleMetaData
        const module = new Galaxy.Module(moduleMetaData, source, scope);
        if (imports.length) {
          const importsCopy = imports.slice(0);
          imports.forEach(function (item) {
            const moduleAddOnProvider = Galaxy.getModuleAddOnProvider(item.path);
            // Module is an addon
            if (moduleAddOnProvider) {
              const providerStages = moduleAddOnProvider.handler.call(null, scope, module);
              const addOnInstance = providerStages.create();
              module.registerAddOn(item.path, addOnInstance);
              module.addOnProviders.push(providerStages);

              doneImporting(module, importsCopy);
            }
            // Module is already loaded and we don't need a new instance of it (Singleton)
            else if (cachedModules[item.path] && !item.fresh) {
              doneImporting(module, importsCopy);
            }
            // Module is not loaded
            else {
              if (item.path.indexOf('./') === 0) {
                item.path = scope.uri.path + item.path.substr(2);
              }

              Galaxy.load({
                name: item.name,
                path: item.path,
                fresh: item.fresh,
                contentType: item.contentType,
                parentScope: scope,
                invokers: invokers
              }).then(function () {
                doneImporting(module, importsCopy);
              });
            }
          });

          return;
        }

        resolve(module);
      });
    },

    /**
     *
     * @param {Galaxy.Module}  module
     * @return {Promise<any>}
     */
    executeCompiledModule: function (module) {
      return new Promise(function (resolve, reject) {
        try {
          for (let item in module.addOns) {
            module.scope.inject(item, module.addOns[item]);
          }

          for (let item in cachedModules) {
            if (cachedModules.hasOwnProperty(item)) {
              const asset = cachedModules[item];
              if (asset.module) {
                module.scope.inject(asset.id, asset.module);
              }
            }
          }


          const source = module.source;
          const moduleSource = typeof source === 'function' ?
            source :
            new AsyncFunction('Scope', ['// ' + module.id + ': ' + module.path, source].join('\n'));
          const output = moduleSource.call(null, module.scope);

          const proceed = () => {
            Reflect.deleteProperty(module, 'source');

            module.addOnProviders.forEach(item => item.start());

            Reflect.deleteProperty(module, 'addOnProviders');

            const id = module.path;
            // if the module export has _temp then do not cache the module
            if (module.scope.export._temp) {
              module.scope.parentScope.inject(id, module.scope.export);
            } else if (!cachedModules[id]) {
              cachedModules[id] = {
                id: id,
                module: module.scope.export
              };
            }

            const currentModule = module;
            currentModule.init();
            return resolve(currentModule);
          };

          // if the function is not async, output would be undefined
          if(output) {
            output.then(proceed);
          } else {
            proceed();
          }
        } catch (error) {
          console.error(error.message + ': ' + module.path);
          console.warn('Search for es6 features in your code and remove them if your browser does not support them, e.g. arrow function');
          console.error(error);
          reject();
          throw new Error(error);
        }
      });
    },

    getModuleAddOnProvider: function (name) {
      return this.addOnProviders.filter((service) => {
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
Galaxy.Module = /** @class */ (function () {

  /**
   *
   * @param {Object} module
   * @param {string} source
   * @param {Galaxy.Scope} scope
   * @constructor
   * @memberOf Galaxy
   */
  function Module(module, source, scope) {
    this.id = module.id;
    this.systemId = module.systemId;
    this.source = source;
    this.path = module.path || null;
    this.importId = module.importId || module.path;
    this.addOns = module.addOns || {};
    this.addOnProviders = [];
    this.scope = scope;
  }

  Module.prototype = {
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

  return Module;
})();

Galaxy.Module.Content = /** @class */ (function () {
  const parsers = {};

  /**
   *
   * @param {Galaxy.Module.Content} ModuleContent
   * @returns {*}
   */
  Content.parse = function (ModuleContent) {
    const safeType = (ModuleContent.type || '').split(';')[0];
    const parser = parsers[safeType];

    if (parser) {
      return parser.call(null, ModuleContent.content, ModuleContent.metaData);
    }

    return parsers['default'].call(null, ModuleContent.content, ModuleContent.metaData);
  };

  /**
   *
   * @param {string} type
   * @param {function} parser
   */
  Content.registerParser = function (type, parser) {
    parsers[type] = parser;
  };

  /**
   *
   * @param {string} type
   * @param {*} content
   * @param {*} metaData
   * @constructor
   * @memberOf Galaxy.Module
   */
  function Content(type, content, metaData) {
    this.type = type;
    this.content = content;
    this.metaData = metaData;
  }

  Content.prototype = {};

  return Content;
})();

(function (GMC) {
  GMC.registerParser('text/css', parser);

  const hosts = {};

  function getHostId(id) {
    if (hosts.hasOwnProperty(id)) {
      return hosts[id];
    }
    const index = Object.keys(hosts).length;
    const ids = {
      host: 'gjs-host-' + index,
      content: 'gjs-content-' + index,
    };

    hosts[id] = ids;

    return ids;
  }

  function rulesForCssText(styleContent) {
    const doc = document.implementation.createHTMLDocument(''),
      styleElement = document.createElement('style');

    styleElement.textContent = styleContent;
    // the style will only be parsed once it is added to a document
    doc.body.appendChild(styleElement);

    return styleElement;
  }

  function applyContentAttr(children, ids) {
    if (!(children instanceof Array) && children !== null && children !== undefined) {
      children = [children];
    }

    children.forEach((child) => {
      if (child.tag === 'comment') return;
      child[ids.content] = '';

      if (child.children) {
        applyContentAttr(child.children, ids);
      }
    });
  }

  function parser(content) {
    return {
      imports: [],
      source: async function (Scope) {
        const ids = getHostId(Scope.systemId);
        const cssRules = rulesForCssText(content);
        const hostSuffix = '[' + ids.host + ']';
        // const contentSuffix = '[' + ids.content + ']';
        const parsedCSSRules = [];
        const host = /(:host)/g;
        const selector = /([^\s+>~,]+)/g;
        const selectorReplacer = function (item) {
          if (item === ':host') {
            return item;
          }

          return item /*+ contentSuffix*/;
        };

        Array.prototype.forEach.call(cssRules.sheet.cssRules, function (css) {
          let selectorText = css.selectorText.replace(selector, selectorReplacer);

          css.selectorText = selectorText.replace(host, hostSuffix);
          parsedCSSRules.push(css.cssText);
        });
        const parsedCSSText = parsedCSSRules.join('\n');

        Scope.export = {
          _temp: true,
          tag: 'style',
          type: 'text/css',
          id: Scope.systemId,
          text: parsedCSSText,
          _create() {
            const parent = this.parent;
            parent.node.setAttribute(ids.host, '');
            const children = parent.blueprint.children || [];
            applyContentAttr(children, ids);
          }
        };
      }
    };
  }
})(Galaxy.Module.Content);

(function (GMC) {
  GMC.registerParser('default', parser);

  function parser(content) {
    return {
      imports: [],
      source: async function as_text(scope) {
        scope.export = content;
      }
    };
  }
})(Galaxy.Module.Content);

(function (GMC) {
  GMC.registerParser('function', parser);

  function parser(content, metaData) {
    const unique = [];
    let imports = metaData.imports ? metaData.imports.slice(0) : [];
    imports = imports.map(function (item) {
      if (unique.indexOf(item) !== -1) {
        return null;
      }

      unique.push(item);
      return { path: item };
    }).filter(Boolean);

    return {
      imports: imports,
      source: content
    };
  }
})(Galaxy.Module.Content);

(function (GMC) {
  GMC.registerParser('application/javascript', parser);

  function parser(content) {
    const imports = [];
    const unique = [];
    let parsedContent = content.replace(/Scope\.import\(['|"](.*)['|"]\);/gm, function (match, path) {
      let query = path.match(/([\S]+)/gm);
      let pathURL = query[query.length - 1];
      if (unique.indexOf(pathURL) !== -1) {
        return 'Scope.import(\'' + pathURL + '\')';
      }

      unique.push(pathURL);
      imports.push({
        path: pathURL,
        fresh: query.indexOf('new') === 0,
        contentType: null
      });

      return 'Scope.import(\'' + pathURL + '\')';
    });

    parsedContent = parsedContent.replace(/Scope\.importAsText\(['|"](.*)['|"]\);/gm, function (match, path) {
      let query = path.match(/([\S]+)/gm);
      let pathURL = query[query.length - 1];
      if (unique.indexOf(pathURL) !== -1) {
        return 'Scope.import(\'' + pathURL + '\')';
      }

      unique.push(pathURL);
      imports.push({
        path: pathURL,
        fresh: true,
        contentType: 'text/plain'
      });

      return 'Scope.import(\'' + pathURL + '\')';
    });

    return {
      imports: imports,
      source: parsedContent
    };
  }
})(Galaxy.Module.Content);

/* global Galaxy */
Galaxy.Scope = /** @class */ (function () {
  const defProp = Object.defineProperty;

  /**
   *
   * @param {Object} module
   * @param element
   * @constructor
   * @memberOf Galaxy
   */
  function Scope(module, element) {
    const _this = this;
    _this.systemId = module.systemId;
    _this.parentScope = module.parentScope || null;
    _this.element = element || null;
    _this.export = {};
    _this.uri = new Galaxy.GalaxyURI(module.path);
    _this.eventHandlers = {};
    _this.observers = [];
    _this.data = {};

    defProp(_this, '__imports__', {
      value: {},
      writable: false,
      enumerable: false,
      configurable: false
    });

    defProp(_this, 'inputs', {
      enumerable: true,
      configurable: false,
      get: function () {
        return _this.element.inputs;
      }
    });

    _this.on('module.destroy', this.destroy.bind(this));
  }

  Scope.prototype = {
    /**
     *
     * @param {string} id ID string which is going to be used for importing
     * @param {Object} instance The assigned object to this id
     */
    inject: function (id, instance) {
      this['__imports__'][id] = instance;
    },
    /**
     *
     * @param {string} libId Path or id of the addon you want to import
     * @return {*}
     */
    import: function (libId) {
      // if the id starts with `./` then we will replace it with the current scope path.
      if (libId.indexOf('./') === 0) {
        libId = libId.replace('./', this.uri.path);
      }

      return this['__imports__'][libId];
    },
    /**
     *
     */
    destroy: function () {
      this.data = null;
      this.observers.forEach(function (observer) {
        observer.remove();
      });
    },
    /**
     *
     * @param {*} moduleMeta
     * @param {*} config
     * @returns {*}
     */
    load: function (moduleMeta, config) {
      const newModuleMetaData = Object.assign({}, moduleMeta, config || {});

      if (newModuleMetaData.path.indexOf('./') === 0) {
        newModuleMetaData.path = this.uri.path + moduleMeta.path.substr(2);
      }

      newModuleMetaData.parentScope = this;
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

  return Scope;
})();

/* global Galaxy */
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

    this.parsedURL = urlParser.href;
    this.path = match ? match[0] : '/';
    this.base = window.location.pathname;
    this.protocol = urlParser.protocol;
  }

  return GalaxyURI;
})();

/* global Galaxy */
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

    const __observers__ = '__observers__';
    if (!this.context.hasOwnProperty(__observers__)) {
      defProp(context, __observers__, {
        value: [],
        writable: true,
        configurable: true
      });
    }

    this.context[__observers__].push(this);
  }

  Observer.prototype = {
    remove: function () {
      const observers = this.context.__observers__;
      const index = observers.indexOf(this);
      if (index !== -1) {
        observers.splice(index, 1);
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
Galaxy.View = /** @class */(function (G) {
  const defProp = Object.defineProperty;

  //------------------------------

  Array.prototype.createComputable = function (f) {
    const reactive = this.slice();
    reactive.push(f);
    return reactive;
  };

  Array.prototype.createDataMap = function (keyPropertyName, valuePropertyName) {
    const map = {};
    for (let i = 0, len = this.length; i < len; i++) {
      const item = this[i];
      map[item[keyPropertyName]] = item[valuePropertyName];
    }

    return map;
  };

  View.EMPTY_CALL = function () {
  };
  View.BINDING_SYNTAX_REGEX = new RegExp('^<([^\\[\\]\<\>]*)>\\s*([^\\[\\]\<\>]*)\\s*$|^=\\s*([^\\[\\]<>]*)\\s*$');

  /**
   *
   * @typedef {Object} Galaxy.View.BlueprintProperty
   * @property {string} [key]
   * @property {'attr'|'prop'|'reactive'} [type]
   * @property {Function} [getConfig]
   * @property {Function} [install]
   * @property {Function} [beforeActivate]
   * @property {Function} [getSetter]
   * @property {Function} [update]
   */

  View.REACTIVE_BEHAVIORS = {};

  View.COMPONENTS = {};
  /**
   *
   * @type {{[property: string]: Galaxy.View.BlueprintProperty}}
   */
  View.NODE_BLUEPRINT_PROPERTY_MAP = {
    tag: {
      type: 'none'
    },
    children: {
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
    html: {
      type: 'prop',
      key: 'innerHTML'
    },
    nodeValue: {
      type: 'prop',
    },
    scrollTop: {
      type: 'prop',
    },
    scrollLeft: {
      type: 'prop',
    },
    disabled: {
      type: 'attr',
    },
    onchange: {
      type: 'event'
    },
    onclick: {
      type: 'event'
    },
    ondblclick: {
      type: 'event'
    },
    onmouseover: {
      type: 'event'
    },
    onmouseout: {
      type: 'event'
    },
    onkeydown: {
      type: 'event'
    },
    onkeypress: {
      type: 'event'
    },
    onkeyup: {
      type: 'event'
    },
    onmousedown: {
      type: 'event'
    },
    onmouseup: {
      type: 'event'
    },
    onload: {
      type: 'event'
    },
    onabort: {
      type: 'event'
    },
    onerror: {
      type: 'event'
    },
    onfocus: {
      type: 'event'
    },
    onblur: {
      type: 'event'
    },
    onreset: {
      type: 'event'
    },
    onsubmit: {
      type: 'event'
    },
  };

  View.PROPERTY_SETTERS = {
    'none': function () {
      return View.EMPTY_CALL;
    }
  };

  /**
   *
   * @param {Array<Galaxy.View.ViewNode>} toBeRemoved
   * @param {boolean} hasAnimation
   * @memberOf Galaxy.View
   * @static
   */
  View.destroyNodes = function (toBeRemoved, hasAnimation) {
    let remove = null;

    for (let i = 0, len = toBeRemoved.length; i < len; i++) {
      remove = toBeRemoved[i];
      remove.destroy(hasAnimation);
    }
  };

  View.TO_BE_DESTROYED = {};
  View.LAST_FRAME_ID = null;
  /**
   *
   * @param {string} index
   * @param {Function} action
   * @memberOf Galaxy.View
   * @static
   */
  View.DESTROY_IN_NEXT_FRAME = function (index, action) {
    if (View.LAST_FRAME_ID) {
      cancelAnimationFrame(View.LAST_FRAME_ID);
      View.LAST_FRAME_ID = null;
    }

    const target = View.TO_BE_DESTROYED[index] || [];
    target.push(action);
    View.TO_BE_DESTROYED[index] = target;

    View.LAST_FRAME_ID = requestAnimationFrame(() => {
      const keys = Object.keys(View.TO_BE_DESTROYED).sort().reverse();
      keys.forEach((key) => {
        const batch = View.TO_BE_DESTROYED[key];
        if (!batch) {
          return;
        }

        let action;
        while (batch.length) {
          action = batch.shift();
          action();
        }
      });
    });
  };

  View.TO_BE_CREATED = {};
  View.LAST_CREATE_FRAME_ID = null;
  /**
   *
   * @param {string} index
   * @param {Function} action
   * @memberOf Galaxy.View
   * @static
   */
  View.CREATE_IN_NEXT_FRAME = function (index, action) {
    if (View.LAST_CREATE_FRAME_ID) {
      cancelAnimationFrame(View.LAST_CREATE_FRAME_ID);
      View.LAST_CREATE_FRAME_ID = null;
    }

    const target = View.TO_BE_CREATED[index] || [];
    const c = {a: action};
    target.push(c);
    View.TO_BE_CREATED[index] = target;

    View.LAST_CREATE_FRAME_ID = requestAnimationFrame(() => {
      const keys = Object.keys(View.TO_BE_CREATED).sort();
      keys.forEach((key) => {
        const batch = View.TO_BE_CREATED[key];
        if (!batch) {
          return;
        }
        while (batch.length) {
          const c = batch.shift();
          c.a();
        }
      });
    });

    return () => {
      c.a = View.EMPTY_CALL;
    };
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} viewNode
   * @param value
   * @param oldValue
   * @param name
   */
  View.setAttr = function setAttr(viewNode, value, oldValue, name) {
    if (value !== null && value !== undefined && value !== false) {
      viewNode.node.setAttribute(name, value === true ? '' : value);
    } else {
      viewNode.node.removeAttribute(name);
    }
  };

  View.setProp = function setProp(viewNode, value, oldValue, name) {
    viewNode.node[name] = value;
  };

  View.createChildScope = function (parent) {
    let result = {};

    defProp(result, '__parent__', {
      enumerable: false,
      value: parent
    });

    defProp(result, '__scope__', {
      enumerable: false,
      value: parent.__scope__ || parent
    });

    return result;
  };

  /**
   *
   * @param {string|Array} value
   * @return {{propertyKeysPaths: *[], isExpression: boolean, expressionFn: null}}
   */
  View.getBindings = function (value) {
    let allProperties = null;
    let propertyKeyPaths = null;
    let propertyVariables = [];
    let isExpression = false;
    const type = typeof (value);
    let handler = null;

    if (type === 'string') {
      const props = value.match(View.BINDING_SYNTAX_REGEX);
      if (props) {
        allProperties = ['<>' + props[2]];
        if (props[2].indexOf('!') === 0) {
          allProperties = ['<>' + props[2].slice(1)];
          propertyVariables = allProperties;
          handler = (a) => {
            return !a;
          };
          propertyVariables.push(handler);
          isExpression = true;
        }
      } else {
        allProperties = null;
      }
    } else if (value instanceof Array && typeof value[value.length - 1] === 'function') {
      propertyVariables = value;
      allProperties = value.slice(0);
      handler = allProperties.pop();
      isExpression = true;
    } else if (value instanceof Function && value.watch) {
      propertyVariables = value;
      allProperties = value.watch.slice(0);
      handler = value;
      isExpression = true;
    } else {
      allProperties = null;
    }

    if (allProperties) {
      propertyKeyPaths = allProperties.filter(pkp => {
        return typeof pkp === 'string' && pkp.indexOf('<>') === 0;
      });
    }

    return {
      propertyKeysPaths: propertyKeyPaths ? propertyKeyPaths.map(function (name) {
        return name.replace(/<>/g, '');
      }) : null,
      propertyVariables: propertyVariables,
      handler: handler,
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

    if (target instanceof G.View.ArrayChange) {
      return target.getInstance();
    }

    return target;
  };

  View.propertyLookup = function (data, properties) {
    properties = properties.split('.');
    let property = properties[0];
    const original = data;
    let target = data;
    let temp = data;
    let nestingLevel = 0;
    let parent;
    if (data[property] === undefined) {
      while (temp.__parent__) {
        parent = temp.__parent__;
        if (parent.hasOwnProperty(property)) {
          target = parent;
          break;
        }

        if (nestingLevel++ >= 1000) {
          throw console.error('Maximum nested property lookup has reached `' + property + '`', data);
        }

        temp = parent;
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
          const rd = target.__rd__.refs.filter(function (ref) {
            return ref.shadow[p];
          })[0];
          target = rd.shadow[p].data;
          // target = target.__rd__.shadow[p].data;
        } else {
          target = target[p];
        }
      }
    });

    return target.__rd__;
  };

  View.EXPRESSION_ARGS_FUNC_CACHE = {};

  View.createExpressionArgumentsProvider = function (properties, variables) {
    const id = properties.join();

    if (View.EXPRESSION_ARGS_FUNC_CACHE[id]) {
      return View.EXPRESSION_ARGS_FUNC_CACHE[id];
    }

    let functionContent = 'return [';
    let middle = '';
    for (let i = 0, len = variables.length; i < len - 1; i++) {
      const variable = variables[i];
      if (typeof variable === 'string' && variable.indexOf('<>') === 0) {
        middle += 'lookUpFn(scope, "' + variable.replace(/<>/g, '') + '"),';
      } else {
        middle += 'vars[' + i + '],';
      }
    }
    // Take care of variables that contain square brackets like '[variable_name]'
    // for the convenience of the programmer
    functionContent += middle.substring(0, middle.length - 1) + ']';

    const func = new Function('lookUpFn, scope, vars', functionContent);
    View.EXPRESSION_ARGS_FUNC_CACHE[id] = func;

    return func;
  };

  View.createExpressionFunction = function (host, handler, scope, properties, vairables) {
    const getExpressionArguments = G.View.createExpressionArgumentsProvider(properties, vairables);

    const fn = function () {
      let args = [];
      try {
        args = getExpressionArguments.call(host, G.View.safePropertyLookup, scope, vairables);
      } catch (ex) {
        console.error('Can\'t find the property: \n' + properties.join('\n'), '\n\nIt is recommended to inject the parent object instead' +
          ' of its property.\n\n', scope, '\n', ex);
      }

      return handler.apply(host, args);
    };

    fn.getArgs = function () {
      return getExpressionArguments.call(host, G.View.safePropertyLookup, scope, properties);
    };

    return fn;
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

    const properties = bindings.propertyKeysPaths;

    // Generate expression arguments
    try {
      bindings.expressionFn = G.View.createExpressionFunction(target, bindings.handler, scope, properties, bindings.propertyVariables);
      return bindings.expressionFn;
    } catch (exception) {
      throw console.error(exception.message + '\n', properties);
    }
  };

  /**
   *
   * @param {Galaxy.View.ViewNode | Object} target
   * @param {String} targetKeyName
   * @param {Galaxy.View.ReactiveData} hostReactiveData
   * @param {Galaxy.View.ReactiveData} scopeData
   * @param {Object} bindings
   * @param {Galaxy.View.ViewNode | undefined} root
   */
  View.makeBinding = function (target, targetKeyName, hostReactiveData, scopeData, bindings, root) {
    const propertyKeysPaths = bindings.propertyKeysPaths;
    const expressionFn = bindings.expressionFn || View.prepareExpression(root, targetKeyName, scopeData, bindings);

    let value = scopeData;
    let propertyKey = null;
    let childPropertyKeyPath = null;
    let initValue = null;
    let propertyKeyPathItems = [];
    for (let i = 0, len = propertyKeysPaths.length; i < len; i++) {
      propertyKey = propertyKeysPaths[i];
      childPropertyKeyPath = null;

      propertyKeyPathItems = propertyKey.split('.');
      if (propertyKeyPathItems.length > 1) {
        propertyKey = propertyKeyPathItems[0];
        childPropertyKeyPath = propertyKeyPathItems.slice(1).join('.');
      }

      if (!hostReactiveData && scopeData && !(scopeData instanceof G.Scope)) {
        if (scopeData.hasOwnProperty('__rd__')) {
          hostReactiveData = scopeData.__rd__;
        } else {
          hostReactiveData = new G.View.ReactiveData(targetKeyName, scopeData, null);
        }
      }
      // When the node belongs to a nested repeat, the scopeData would refer to the for item data
      // But developer should still be able to access root scopeData
      if (propertyKeyPathItems[0] === 'data' && scopeData && scopeData.hasOwnProperty('__scope__') &&
        propertyKey === 'data') {
        hostReactiveData = null;
      }

      // If the property name is `this` and its index is zero, then it is pointing to the ViewNode.data property
      if (propertyKeyPathItems[0] === 'this' && propertyKey === 'this' && root instanceof G.View.ViewNode) {
        propertyKey = propertyKeyPathItems[1];
        bindings.propertyKeysPaths = propertyKeyPathItems.slice(2);
        childPropertyKeyPath = null;
        hostReactiveData = new G.View.ReactiveData('data', root.data);
        value = View.propertyLookup(root.data, propertyKey);
      } else if (value) {
        value = View.propertyLookup(value, propertyKey);
      }

      initValue = value;
      if (value !== null && typeof value === 'object') {
        initValue = value[propertyKey];
      }

      let reactiveData;
      if (initValue instanceof Object) {
        reactiveData = new G.View.ReactiveData(propertyKey, initValue, hostReactiveData);
      } else if (childPropertyKeyPath) {
        reactiveData = new G.View.ReactiveData(propertyKey, null, hostReactiveData);
      } else if (hostReactiveData) {
        // if the propertyKey is used for a repeat reactive property, then we assume its type is Array.
        hostReactiveData.addKeyToShadow(propertyKey, targetKeyName === 'repeat');
      }

      if (childPropertyKeyPath === null) {
        if (!(target instanceof G.View.ViewNode)) {
          defProp(target, targetKeyName, {
            // set: function (newValue) {
            // console.warn('It is not allowed', parentReactiveData.id, targetKeyName);
            // value[propertyKeyPath] = newValue;
            // },
            get: function ref() {
              if (expressionFn) {
                return expressionFn();
              }

              return hostReactiveData.data[propertyKey];
            },
            enumerable: true,
            configurable: true
          });
        }

        // The parentReactiveData would be empty when the developer is trying to bind to a direct property of Scope
        if (!hostReactiveData && scopeData instanceof G.Scope) {
          // If the propertyKey is referring to some local value then there is no error
          if (target instanceof G.View.ViewNode && target.localPropertyNames.has(propertyKey)) {
            return;
          }

          throw new Error('Binding to Scope direct properties is not allowed.\n' +
            'Try to define your properties on Scope.data.{property_name}\n' + 'path: ' + scopeData.uri.parsedURL + '\nProperty name: `' +
            propertyKey + '`\n');
        }

        hostReactiveData.addNode(target, targetKeyName, propertyKey, expressionFn);
      }

      if (childPropertyKeyPath !== null) {
        View.makeBinding(target, targetKeyName, reactiveData, initValue, {
          propertyKeysPaths: [childPropertyKeyPath],
          propertyVariables: bindings.propertyVariables,
          isExpression: false,
          expressionFn: expressionFn
        }, root);
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
    const subjectsClone = cloneSubject ? G.clone(subjects)/*Object.assign({}, subjects)*/ : subjects;

    let parentReactiveData;
    if (!(data instanceof G.Scope)) {
      parentReactiveData = new G.View.ReactiveData('@', data);
    }

    for (let i = 0, len = keys.length; i < len; i++) {
      attributeName = keys[i];
      attributeValue = subjectsClone[attributeName];

      const bindings = View.getBindings(attributeValue);

      if (bindings.propertyKeysPaths) {
        View.makeBinding(subjectsClone, attributeName, parentReactiveData, data, bindings, viewNode);
        bindings.propertyKeysPaths.forEach(function (path) {
          try {
            const rd = View.propertyScopeLookup(data, path);
            viewNode.finalize.push(() => {
              rd.removeNode(subjectsClone);
            });
          } catch (error) {
            console.error('Could not find: ' + path + '\n', error);
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
   * @param {string} blueprintKey
   * @param {Galaxy.View.ViewNode} node
   * @param {string} key
   * @param scopeData
   * @return boolean
   */
  View.installPropertyForNode = function (blueprintKey, node, key, scopeData) {
    if (blueprintKey in View.REACTIVE_BEHAVIORS) {
      const reactiveProperty = View.NODE_BLUEPRINT_PROPERTY_MAP[blueprintKey];
      const data = reactiveProperty.getConfig.call(node, scopeData, node.blueprint[key]);
      if (data !== undefined) {
        node.cache[key] = data;
      }

      return reactiveProperty.install.call(node, data);
    }

    return true;
  };

  /**
   *
   * @param viewNode
   * @param {string} propertyKey
   * @param {Galaxy.View.ReactiveData} scopeProperty
   * @param expression
   */
  View.activatePropertyForNode = function (viewNode, propertyKey, scopeProperty, expression) {
    /**
     *
     * @type {Galaxy.View.BlueprintProperty}
     */
    const property = View.NODE_BLUEPRINT_PROPERTY_MAP[propertyKey] || {type: 'attr'};
    property.key = property.key || propertyKey;
    if (typeof property.beforeActivate !== 'undefined') {
      property.beforeActivate(viewNode, scopeProperty, propertyKey, expression);
    }

    viewNode.setters[propertyKey] = View.getPropertySetterForNode(property, viewNode, scopeProperty, expression);
  };

  /**
   *
   * @param {Galaxy.View.BlueprintProperty} blueprintProperty
   * @param {Galaxy.View.ViewNode} viewNode
   * @param [scopeProperty]
   * @param {Function} [expression]
   * @returns {Galaxy.View.EMPTY_CALL|(function())}
   */
  View.getPropertySetterForNode = function (blueprintProperty, viewNode, scopeProperty, expression) {
    // if viewNode is virtual, then the expression should be ignored
    if (blueprintProperty.type !== 'reactive' && viewNode.virtual) {
      return View.EMPTY_CALL;
    }

    // This is the lowest level where the developer can modify the property setter behavior
    // By defining 'createSetter' for the property you can implement your custom functionality for setter
    if (typeof blueprintProperty.getSetter !== 'undefined') {
      return blueprintProperty.getSetter(viewNode, blueprintProperty, blueprintProperty, expression);
    }

    return View.PROPERTY_SETTERS[blueprintProperty.type](viewNode, blueprintProperty, expression);
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} viewNode
   * @param {string} propertyKey
   * @param {*} value
   */
  View.setPropertyForNode = function (viewNode, propertyKey, value) {
    const property = View.NODE_BLUEPRINT_PROPERTY_MAP[propertyKey] || {type: 'attr'};
    property.key = property.key || propertyKey;
    // View.getPropertySetterForNode(property, viewNode)(value, null);

    switch (property.type) {
      case 'attr':
      case 'prop':
      case 'reactive':
        View.getPropertySetterForNode(property, viewNode)(value, null);
        break;

      case 'event':
        viewNode.node[propertyKey] = value.bind(viewNode);
        break;
    }
  };

  /**
   *
   * @param {string} key
   * @param blueprint
   * @param {Galaxy.Scope|Object} scopeData
   * @param {Galaxy.View} view
   * @returns {*}
   */
  View.getComponent = function (key, blueprint, scopeData, view) {
    if (key && key in View.COMPONENTS) {
      return View.COMPONENTS[key](blueprint, scopeData, view);
    }

    return blueprint;
  };

  /**
   *
   * @param {Galaxy.Scope} scope
   * @constructor
   * @memberOf Galaxy
   */
  function View(scope) {
    const _this = this;
    _this.scope = scope;
    _this.config = {
      cleanContainer: false
    };

    if (scope.element instanceof G.View.ViewNode) {
      _this.container = scope.element;
    } else {
      _this.container = new G.View.ViewNode({
        tag: scope.element
      }, null, _this);

      _this.container.hasBeenRendered();
    }
  }

  View.prototype = {
    enterKeyframe: function (onComplete, sequence, duration) {
      if (typeof onComplete === 'string') {
        duration = sequence;
        sequence = onComplete;
        onComplete = View.EMPTY_CALL;
      }

      return {
        tag: 'comment',
        nodeValue: 'keyframe:enter',
        animations: {
          enter: {
            duration: duration || 0,
            sequence,
            onComplete
          }
        }
      };
    },
    leaveKeyframe: function (onComplete, sequence, duration) {
      return {
        tag: 'comment',
        nodeValue: 'keyframe:leave',
        animations: {
          enter: {
            duration: duration || 0,
            sequence,
            onComplete
          }
        }
      };
    },
    init: function (blueprint) {
      const _this = this;

      if (_this.config.cleanContainer) {
        _this.container.node.innerHTML = '';
      }

      return this.createNode(blueprint, _this.scope, _this.container, null);
    },
    dispatchEvent: function (event) {
      this.container.dispatchEvent(event);
    },
    /**
     *
     * @param {Object} blueprint
     * @param {Object} scopeData
     * @param {Galaxy.View.ViewNode} parent
     * @param {Node|Element|null} position
     * @return {Galaxy.View.ViewNode|Array<Galaxy.View.ViewNode>}
     */
    createNode: function (blueprint, scopeData, parent, position) {
      const _this = this;
      let i = 0, len = 0;
      if (typeof blueprint === 'string') {
        const content = document.createElement('div');
        content.innerHTML = blueprint;
        const nodes = Array.prototype.slice.call(content.childNodes);
        nodes.forEach(function (node) {
          parent.node.appendChild(node);
        });

        return nodes;
      } else if (typeof blueprint === 'function') {
        return blueprint();
      } else if (blueprint instanceof Array) {
        const result = [];
        for (i = 0, len = blueprint.length; i < len; i++) {
          result.push(_this.createNode(blueprint[i], scopeData, parent, null));
        }

        return result;
      } else if (blueprint instanceof Object) {
        // blueprint = View.getComponent(blueprint.tag, blueprint, scopeData, _this);
        let propertyValue, propertyKey;
        const keys = Object.keys(blueprint);
        const needInitKeys = [];
        const viewNode = new G.View.ViewNode(blueprint, parent, _this, scopeData);
        parent.registerChild(viewNode, position);

        // Behaviors installation stage
        for (i = 0, len = keys.length; i < len; i++) {
          propertyKey = keys[i];
          const needValueAssign = View.installPropertyForNode(propertyKey, viewNode, propertyKey, scopeData);
          if (needValueAssign === false) {
            continue;
          }

          needInitKeys.push(propertyKey);
        }

        // Value assignment stage
        for (i = 0, len = needInitKeys.length; i < len; i++) {
          propertyKey = needInitKeys[i];
          if (propertyKey === 'children') continue;

          propertyValue = blueprint[propertyKey];
          const bindings = View.getBindings(propertyValue);
          if (bindings.propertyKeysPaths) {
            View.makeBinding(viewNode, propertyKey, null, scopeData, bindings, viewNode);
          } else {
            View.setPropertyForNode(viewNode, propertyKey, propertyValue);
          }
        }

        if (!viewNode.virtual) {
          viewNode.setInDOM(true);
          if (blueprint.children) {
            _this.createNode(blueprint.children, scopeData, viewNode, null);
          }
        }

        return viewNode;
      } else {
        throw Error('blueprint can not be null');
      }
    }
  };

  return View;
})(Galaxy);

/* global Galaxy */
Galaxy.View.ReactiveData = /** @class */ (function (G) {
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
  const scopeBuilder = function (id) {
    return {
      id: '{Scope}',
      shadow: {},
      data: {},
      notify: function () {
      },
      notifyDown: function () {
      },
      sync: function () {
      },
      makeReactiveObject: function () {
      },
      addKeyToShadow: function () {
      }
    };
  };

  const getKeys = function (obj) {
    if (obj instanceof Array) {
      const keys = ['length'];
      if (obj.hasOwnProperty('changes')) {
        keys.push('changes');
      }
      return keys;
    } else {
      return Object.keys(obj);
    }
  };

  ReactiveData.UPDATE_DIRECTION_TOP_DOWN = 1;
  ReactiveData.UPDATE_DIRECTION_BOTTOM_UP = 2;

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
    this.oldValue = {};
    this.nodeCount = -1;

    if (this.data && this.data.hasOwnProperty('__rd__')) {
      this.refs = this.data.__rd__.refs;
      // if (this.id === '{Scope}.data.products') debugger;
      const refExist = this.getRefById(this.id);
      if (refExist) {
        // Sometimes an object is already reactive, but its parent is dead, meaning all references to it are lost
        // In such a case that parent con be replace with a live parent
        if (refExist.parent.isDead) {
          refExist.parent = parent;
        }

        this.fixHierarchy(id, refExist);
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
        // TODO: Don't know if this is a proper fix
        if (this.parent.data[id]) {
          new ReactiveData(id, this.parent.data[id], this.parent);
        } else {
          this.parent.makeReactiveObject(this.parent.data, id, true);
        }
      }

      if (!Object.isExtensible(this.data)) {
        return;
      }

      defProp(this.data, '__rd__', {
        enumerable: false,
        configurable: true,
        value: this
      });

      this.walk(this.data);
    }

    this.fixHierarchy(id, this);
  }

  ReactiveData.prototype = {
    get isDead() {
      return this.nodeCount === 0 && this.refs.length === 1 && this.refs[0] === this;
    },
    // If parent data is an array, then this would be an item inside the array
    // therefore its keyInParent should NOT be its index in the array but the
    // array's keyInParent. This way we redirect each item in the array to the
    // array's reactive data
    fixHierarchy: function (id, refrence) {
      if (this.parent.data instanceof Array) {
        this.keyInParent = this.parent.keyInParent;
      } else {
        this.parent.shadow[id] = refrence;
      }
    },
    setData: function (data) {
      this.removeMyRef();

      if (!(data instanceof Object)) {
        this.data = {};

        for (let key in this.shadow) {
          // Cascade changes down to all children reactive data
          if (this.shadow[key] instanceof ReactiveData) {
            this.shadow[key].setData(data);
          } else {
            // changes should only propagate downward
            this.notifyDown(key);
            // Reflect.deleteProperty(this.shadow, key);
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

      this.setupShadowProperties(getKeys(this.data));
    },
    /**
     *
     * @param data
     */
    walk: function (data) {
      if (data instanceof Node) return;

      if (data instanceof Array) {
        this.makeReactiveArray(data);
      } else if (data instanceof Object) {
        for (let key in data) {
          this.makeReactiveObject(data, key);
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
      const property = Object.getOwnPropertyDescriptor(data, key);
      const getter = property && property.get;
      const setter = property && property.set;
      let value = data[key];

      defProp(data, key, {
        get: function () {
          return getter ? getter.call(data) : value;
        },
        set: function (val) {
          const thisRD = data.__rd__;
          setter && setter.call(data, val);
          if (value === val) {
            // If value is array, then sync should be called so nodes that are listening to array itself get updated
            if (val instanceof Array) {
              thisRD.sync(key);
            } else if (val instanceof Object) {
              thisRD.notifyDown(key);
            }
            return;
          }

          thisRD.oldValue[key] = value;
          value = val;

          // This means that the property suppose to be an object and there is probably an active binds to it
          // the active bind could be in one of the ref so we have to check all the ref shadows
          for (let i = 0, len = thisRD.refs.length; i < len; i++) {
            const ref = thisRD.refs[i];
            if (ref.shadow[key]) {
              ref.makeKeyEnum(key);
              // setData provide downward data flow
              ref.shadow[key].setData(val);
            }
          }

          thisRD.notify(key, value);
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
      this.oldValue[key] = value;
    },
    /**
     *
     * @param arr
     * @returns {*}
     */
    makeReactiveArray: function (arr) {
      /**
       *
       * @type {Galaxy.View.ReactiveData}
       * @private
       */
      const _this = this;

      if (arr.hasOwnProperty('changes')) {
        return arr.changes.init;
      }

      const initialChanges = new G.View.ArrayChange();

      initialChanges.original = arr;
      initialChanges.type = 'reset';
      initialChanges.params = arr;
      for (let i = 0, len = initialChanges.params.length; i < len; i++) {
        const item = initialChanges.params[i];
        if (item !== null && typeof item === 'object') {
          new ReactiveData(initialChanges.original.indexOf(item), item, _this);
        }
      }

      _this.sync('length');
      initialChanges.init = initialChanges;
      defProp(arr, 'changes', {
        enumerable: false,
        configurable: true,
        value: initialChanges
      });

      // We override all the array methods which mutate the array
      ARRAY_MUTATOR_METHODS.forEach(function (method) {
        const originalMethod = ARRAY_PROTO[method];
        defProp(arr, method, {
          value: function () {
            const thisRD = this.__rd__;
            let i = arguments.length;
            const args = new Array(i);
            while (i--) {
              args[i] = arguments[i];
            }

            const returnValue = originalMethod.apply(this, args);
            const changes = new G.View.ArrayChange();
            const _original = changes.original = arr;
            changes.type = method;
            changes.params = args;
            changes.returnValue = returnValue;
            changes.init = initialChanges;

            switch (method) {
              case 'push':
              case 'reset':
              case 'unshift':
                for (let i = 0, len = changes.params.length; i < len; i++) {
                  const item = changes.params[i];
                  if (item !== null && typeof item === 'object') {
                    new ReactiveData(_original.indexOf(item), item, thisRD);
                  }
                }
                break;

              case 'pop':
              case 'shift':
                if (returnValue !== null && typeof returnValue === 'object' && '__rd__' in returnValue) {
                  returnValue.__rd__.removeMyRef();
                }
                break;

              case 'splice':
                changes.params.slice(2).forEach(function (item) {
                  if (item !== null && typeof item === 'object') {
                    new ReactiveData(_original.indexOf(item), item, thisRD);
                  }
                });
                break;
            }

            // if (method === 'push' || method === 'reset' || method === 'unshift') {
            //   for (let i = 0, len = changes.params.length; i < len; i++) {
            //     const item = changes.params[i];
            //     if (item !== null && typeof item === 'object') {
            //       new ReactiveData(changes.original.indexOf(item), item, thisRD);
            //     }
            //   }
            // } else if (method === 'pop' || method === 'shift') {
            //   if (returnValue !== null && typeof returnValue === 'object' && returnValue.hasOwnProperty('__rd__')) {
            //     returnValue.__rd__.removeMyRef();
            //   }
            // } else if (method === 'splice') {
            //   changes.params.slice(2).forEach(function (item) {
            //     if (item !== null && typeof item === 'object') {
            //       new ReactiveData(changes.original.indexOf(item), item, thisRD);
            //     }
            //   });
            // }

            defProp(arr, 'changes', {
              enumerable: false,
              configurable: true,
              value: changes
            });
            thisRD.notifyDown('length');
            thisRD.notifyDown('changes');
            thisRD.notify(thisRD.keyInParent);

            return returnValue;
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
     * @param {any} value
     * @param refs
     */
    notify: function (key, value, refs) {
      const _this = this;

      if (this.refs === refs) {
        _this.sync(key, value);
        return;
      }

      for (let i = 0, len = _this.refs.length; i < len; i++) {
        const ref = _this.refs[i];
        if (_this === ref) {
          continue;
        }

        ref.notify(key, value, _this.refs);
      }

      _this.sync(key, value);
      for (let i = 0, len = _this.refs.length; i < len; i++) {
        const ref = _this.refs[i];
        ref.parent.notify(ref.keyInParent, null, value);
      }
    },

    notifyDown: function (key) {
      const _this = this;

      for (let i = 0, len = _this.refs.length; i < len; i++) {
        const ref = _this.refs[i];
        if (_this === ref) {
          continue;
        }

        ref.notify(key, _this.refs);
      }

      _this.sync(key);
    },
    /**
     *
     * @param {string} propertyKey
     */
    sync: function (propertyKey) {
      const _this = this;

      const map = _this.nodesMap[propertyKey];
      const oldValue = _this.oldValue[propertyKey];
      const value = _this.data[propertyKey];

      // notify the observers on the data
      G.Observer.notify(_this.data, propertyKey, value, oldValue);

      if (map) {
        for (let i = 0, len = map.nodes.length; i < len; i++) {
          const node = map.nodes[i];
          const key = map.keys[i];
          _this.syncNode(node, key, value, oldValue);
        }
      }
    },
    /**
     *
     */
    syncAll: function () {
      const _this = this;
      const keys = objKeys(_this.data);
      for (let i = 0, len = keys.length; i < len; i++) {
        _this.sync(keys[i]);
      }
    },
    /**
     *
     * @param node
     * @param {string} key
     * @param {*} value
     * @param {*} oldValue
     */
    syncNode: function (node, key, value, oldValue) {
      // Pass a copy of the ArrayChange to every bound
      if (value instanceof G.View.ArrayChange) {
        value = value.getInstance();
      }

      if (node instanceof G.View.ViewNode) {
        node.setters[key](value, oldValue);
      } else {
        node[key] = value;
      }

      G.Observer.notify(node, key, value, oldValue);
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
      if (!this.data || !this.data.hasOwnProperty('__rd__')) return;
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
        const nextOwner = this.refs[0];
        defProp(this.data, '__rd__', {
          enumerable: false,
          configurable: true,
          value: nextOwner
        });

        this.refs = [this];
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
     * @param {Galaxy.View.ViewNode} node
     * @param {string} nodeKey
     * @param {string} dataKey
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

      if (this.nodeCount === -1) this.nodeCount = 0;

      const index = map.nodes.indexOf(node);
      // Check if the node with the same property already exist
      // Ensure that same node with different property bind can exist
      if (index === -1 || map.keys[index] !== nodeKey) {
        this.nodeCount++;
        if (node instanceof G.View.ViewNode && !node.setters[nodeKey]) {
          node.registerActiveProperty(nodeKey, this, expression);
        }

        map.keys.push(nodeKey);
        map.nodes.push(node);

        let initValue = this.data[dataKey];
        // if the value is a instance of Array, then we should set its change property to its initial state
        if (initValue instanceof Array && initValue.changes) {
          // initValue.changes = initValue.changes.init;
          defProp(initValue, 'changes', {
            enumerable: false,
            configurable: true,
            value: initValue.changes.init
          });
        }
        // We need initValue for cases where ui is bound to a property of an null object
        // TODO: This line seem obsolete
        // if ((initValue === null || initValue === undefined) && this.shadow[dataKey]) {
        //   initValue = {};
        // }

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
      for (let i = 0, len = this.refs.length; i < len; i++) {
        this.removeNodeFromRef(this.refs[i], node);
      }
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
          this.nodeCount--;
        }
      }
    },
    /**
     *
     * @param {string} key
     * @param {boolean} isArray
     */
    addKeyToShadow: function (key, isArray) {
      // Don't empty the shadow object if it exist
      if (!this.shadow[key]) {
        if (isArray) {
          this.shadow[key] = new ReactiveData(key, [], this);
        } else {
          this.shadow[key] = null;
        }
      }

      if (!this.data.hasOwnProperty(key)) {
        this.makeReactiveObject(this.data, key, false);
      }
    },
    /**
     *
     */
    setupShadowProperties: function (keys) {
      for (let key in this.shadow) {
        // Only reactive properties should be added to data
        if (this.shadow[key] instanceof ReactiveData) {
          if (!this.data.hasOwnProperty(key)) {
            this.makeReactiveObject(this.data, key, true);
          }
          this.shadow[key].setData(this.data[key]);
        } else if (keys.indexOf(key) === -1) {
          // This will make sure that UI is updated properly
          // for properties that has been removed from data
          this.sync(key);
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

})(Galaxy);

/* global Galaxy */
Galaxy.View.ArrayChange = /** @class */ (function (G) {
  let lastId = 0;

  function ArrayChange() {
    this.id = lastId++;
    if (lastId > 100000000) {
      lastId = 0;
    }
    this.init = null;
    this.original = null;
    // this.snapshot = [];
    this.returnValue = null;
    this.params = [];
    this.type = 'reset';

    Object.preventExtensions(this);
  }

  ArrayChange.prototype = {
    getInstance: function () {
      const instance = new G.View.ArrayChange();
      instance.init = this.init;
      instance.original = this.original;
      instance.params = this.params.slice(0);
      instance.type = this.type;

      return instance;
    }
  };

  return ArrayChange;
})(Galaxy);

/* global Galaxy, Promise */
Galaxy.View.ViewNode = /** @class */ (function (G) {
  const GV = G.View;
  const commentNode = document.createComment('');
  const defProp = Object.defineProperty;
  const EMPTY_CALL = Galaxy.View.EMPTY_CALL;
  const CREATE_IN_NEXT_FRAME = G.View.CREATE_IN_NEXT_FRAME;
  const DESTROY_IN_NEXT_FRAME = G.View.DESTROY_IN_NEXT_FRAME;

  function createComment(t) {
    const n = commentNode.cloneNode();
    n.textContent = t;
    return n;
  }

  /**
   *
   * @param {string} tagName
   * @param {Galaxy.View.ViewNode} parentViewNode
   * @returns {HTMLElement|Comment}
   */
  function createElem(tagName, parentViewNode) {
    if (tagName === 'svg' || (parentViewNode && parentViewNode.blueprint.tag === 'svg')) {
      return document.createElementNS('http://www.w3.org/2000/svg', tagName);
    }

    if (tagName === 'comment') {
      return document.createComment('ViewNode');
    }

    return document.createElement(tagName);
  }

  function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild(node, child) {
    node.removeChild(child);
  }

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

  const arrIndexOf = Array.prototype.indexOf;
  const arrSlice = Array.prototype.slice;

  //------------------------------

  GV.NODE_BLUEPRINT_PROPERTY_MAP['node'] = {
    type: 'attr'
  };

  GV.NODE_BLUEPRINT_PROPERTY_MAP['_create'] = {
    type: 'prop',
    key: '_create',
    getSetter: () => EMPTY_CALL
  };

  GV.NODE_BLUEPRINT_PROPERTY_MAP['_destroy'] = {
    type: 'prop',
    key: '_destroy',
    getSetter: () => EMPTY_CALL
  };

  GV.NODE_BLUEPRINT_PROPERTY_MAP['renderConfig'] = {
    type: 'prop',
    key: 'renderConfig'
  };

  /**
   *
   * @typedef {Object} RenderConfig
   * @property {boolean} [applyClassListAfterRender] - Indicates whether classlist applies after the render.
   * @property {boolean} [renderDetached] - Make the node to be rendered in a detached mode.
   */

  /**
   * @typedef {Object} Blueprint
   * @property {RenderConfig} [renderConfig]
   * @property {string} [tag]
   * @property {function} [_create]
   * @property {function} [_destroy]
   */

  /**
   *
   * @type {RenderConfig}
   */
  ViewNode.GLOBAL_RENDER_CONFIG = {
    applyClassListAfterRender: false,
    renderDetached: false
  };

  /**
   *
   * @param blueprints
   * @memberOf Galaxy.View.ViewNode
   * @static
   */
  ViewNode.cleanReferenceNode = function (blueprints) {
    if (blueprints instanceof Array) {
      blueprints.forEach(function (node) {
        ViewNode.cleanReferenceNode(node);
      });
    } else if (blueprints instanceof Object) {
      __node__.value = null;
      defProp(blueprints, 'node', __node__);
      ViewNode.cleanReferenceNode(blueprints.children);
    }
  };

  ViewNode.createIndex = function (i) {
    if (i < 0) return '0';
    if (i < 10) return i + '';

    let r = '9';
    let res = i - 10;
    while (res >= 10) {
      r += '9';
      res -= 10;
    }

    return r + res;
  };

  ViewNode.REMOVE_SELF = function (destroy) {
    const viewNode = this;
    if (destroy) {
      // Destroy
      viewNode.node.parentNode && removeChild(viewNode.node.parentNode, viewNode.node);
      viewNode.placeholder.parentNode && removeChild(viewNode.placeholder.parentNode, viewNode.placeholder);
      viewNode.hasBeenDestroyed();
    } else {
      // Detach
      if (!viewNode.placeholder.parentNode) {
        insertBefore(viewNode.node.parentNode, viewNode.placeholder, viewNode.node);
      }

      if (viewNode.node.parentNode) {
        removeChild(viewNode.node.parentNode, viewNode.node);
      }

      viewNode.garbage.forEach(function (node) {
        ViewNode.REMOVE_SELF.call(node, true);
      });
      viewNode.garbage = [];
    }
  };

  /**
   *
   * @param blueprint
   * @param {Galaxy.View.ViewNode} parent
   * @param {Galaxy.View} view
   * @param {any} nodeData
   * @constructor
   * @memberOf Galaxy.View
   */
  function ViewNode(blueprint, parent, view, nodeData) {
    const _this = this;
    _this.view = view;
    /** @type {Node|Element|*} */
    if (blueprint.tag instanceof Node) {
      _this.node = blueprint.tag;
    } else {
      _this.node = createElem(blueprint.tag || 'div', parent);
    }

    /**
     *
     * @type {Blueprint}
     */
    _this.blueprint = blueprint;
    _this.data = nodeData instanceof Galaxy.Scope ? {} : nodeData;
    _this.localPropertyNames = new Set();
    _this.inputs = {};
    _this.virtual = false;
    _this.visible = true;
    _this.placeholder = createComment(blueprint.tag || 'div');
    _this.properties = new Set();
    _this.inDOM = false;
    _this.setters = {};
    /** @type {Galaxy.View.ViewNode} */
    _this.parent = parent;
    _this.finalize = _this.blueprint._destroy ? [_this.blueprint._destroy] : [];
    _this.origin = false;
    _this.transitory = false;
    _this.garbage = [];
    _this.leaveWithParent = false;
    _this.onLeaveComplete = ViewNode.REMOVE_SELF.bind(_this, true);

    const cache = {};
    defProp(_this, 'cache', {
      enumerable: false,
      configurable: false,
      value: cache
    });

    _this.rendered = new Promise(function (done) {
      if (_this.node.style) {
        _this.hasBeenRendered = function () {
          _this.rendered.resolved = true;
          _this.node.style.removeProperty('display');
          done();
        };
      } else {
        _this.hasBeenRendered = function () {
          _this.rendered.resolved = true;
          done();
        };
      }
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

    /**
     *
     * @type {RenderConfig}
     */
    _this.blueprint.renderConfig = Object.assign({}, ViewNode.GLOBAL_RENDER_CONFIG, blueprint.renderConfig || {});

    __node__.value = this.node;
    defProp(_this.blueprint, 'node', __node__);

    referenceToThis.value = this;
    if (!_this.node.__vn__) {
      defProp(_this.node, '__vn__', referenceToThis);
      defProp(_this.placeholder, '__vn__', referenceToThis);
    }

    if (_this.blueprint._create) {
      _this.blueprint._create.call(_this, _this.data);
    }
  }

  ViewNode.prototype = {
    onLeaveComplete: null,

    dump: function () {
      this.parent.garbage = this.parent.garbage.concat(this.garbage);
      this.parent.garbage.push(this);
      this.garbage = [];
    },
    query: function (selectors) {
      return this.node.querySelector(selectors);
    },

    dispatchEvent: function (event) {
      this.node.dispatchEvent(event);
    },

    cloneBlueprint: function () {
      const blueprintClone = Object.assign({}, this.blueprint);
      ViewNode.cleanReferenceNode(blueprintClone);

      defProp(blueprintClone, 'mother', {
        value: this.blueprint,
        writable: false,
        enumerable: false,
        configurable: false
      });

      return blueprintClone;
    },

    virtualize: function () {
      this.placeholder.nodeValue = JSON.stringify(this.blueprint, null, 2);
      this.virtual = true;
      this.setInDOM(false);
    },

    populateEnterSequence: function () {
      this.node.style.display = null;
    },

    populateLeaveSequence: EMPTY_CALL,

    populateHideSequence: function () {
      this.node.style.display = 'none';
    },

    detach: function () {
      if (this.node.parentNode) {
        removeChild(this.node.parentNode, this.node);
      }
    },

    /**
     *
     * @param {boolean} flag
     */
    setInDOM: function (flag) {
      const _this = this;
      if (_this.blueprint.renderConfig.renderDetached) {
        _this.blueprint.renderConfig.renderDetached = false;
        CREATE_IN_NEXT_FRAME(_this.index, () => {
          _this.hasBeenRendered();
        });
        return;
      }

      _this.inDOM = flag;
      if (_this.virtual) return;

      if (flag) {
        if (_this.node.style) {
          _this.node.style.setProperty('display', 'none');
        }

        if (!_this.node.parentNode) {
          insertBefore(_this.placeholder.parentNode, _this.node, _this.placeholder.nextSibling);
        }

        if (_this.placeholder.parentNode) {
          removeChild(_this.placeholder.parentNode, _this.placeholder);
        }

        _this.hasBeenInserted();
        CREATE_IN_NEXT_FRAME(_this.index, () => {
          _this.hasBeenRendered();
          _this.populateEnterSequence();
        });
      } else if (!flag && _this.node.parentNode) {
        _this.origin = true;
        _this.transitory = true;
        const defaultPopulateLeaveSequence = _this.populateLeaveSequence;
        _this.prepareLeaveSequence(_this.hasAnimation());
        DESTROY_IN_NEXT_FRAME(_this.index, () => {
          _this.populateLeaveSequence(ViewNode.REMOVE_SELF.bind(_this, false));
          _this.origin = false;
          _this.transitory = false;
          _this.populateLeaveSequence = defaultPopulateLeaveSequence;
        });
      }
    },

    setVisibility: function (flag) {
      const _this = this;
      _this.visible = flag;

      if (flag && !_this.virtual) {
        CREATE_IN_NEXT_FRAME(_this.index, () => {
          _this.node.style.display = null;
          _this.populateEnterSequence();
        });
      } else if (!flag && _this.node.parentNode) {
        _this.origin = true;
        _this.transitory = true;
        DESTROY_IN_NEXT_FRAME(_this.index, () => {
          _this.populateHideSequence();
          _this.origin = false;
          _this.transitory = false;
        });
      }
    },

    /**
     *
     * @param {Galaxy.View.ViewNode} childNode
     * @param position
     */
    registerChild: function (childNode, position) {
      this.node.insertBefore(childNode.placeholder, position);
    },

    createNode: function (blueprint, localScope) {
      this.view.createNode(blueprint, localScope, this);
    },

    /**
     * @param {string} propertyKey
     * @param {Galaxy.View.ReactiveData} reactiveData
     * @param {Function} expression
     */
    registerActiveProperty: function (propertyKey, reactiveData, expression) {
      this.properties.add(reactiveData);
      GV.activatePropertyForNode(this, propertyKey, reactiveData, expression);
    },

    hasAnimation: function () {
      const children = this.getChildNodes();

      if (this.populateLeaveSequence && this.populateLeaveSequence !== EMPTY_CALL) {
        return true;
      }

      for (let i = 0, len = children.length; i < len; i++) {
        const node = children[i];
        if (node.leaveWithParent) {
          return true;
        }

        if (node.hasAnimation()) {
          return true;
        }
      }

      return false;
    },

    prepareLeaveSequence: function (hasAnimation) {
      const _this = this;
      if (hasAnimation) {
        if (_this.populateLeaveSequence === EMPTY_CALL && _this.origin) {
          _this.populateLeaveSequence = function () {
            ViewNode.REMOVE_SELF.call(_this, false);
          };
        } else if (_this.populateLeaveSequence !== EMPTY_CALL && !_this.origin) {
          // Children with leave animation should not get removed from dom for visual purposes.
          // Since their this node already has a leave animation and eventually will be removed from dom.
          // this is not the case for when this node is being detached by $if
          const children = _this.getChildNodes();
          for (let i = 0, len = children.length; i < len; i++) {
            children[i].onLeaveComplete = EMPTY_CALL;
          }
        }
      } else {
        _this.populateLeaveSequence = function () {
          ViewNode.REMOVE_SELF.call(_this, !_this.origin);
        };
      }
    },

    destroy: function (hasAnimation) {
      const _this = this;
      _this.transitory = true;

      if (_this.inDOM) {
        _this.prepareLeaveSequence(hasAnimation || _this.hasAnimation());
        _this.clean(hasAnimation);
      }

      _this.properties.forEach((reactiveData) => {
        reactiveData.removeNode(_this);
      });

      _this.finalize.forEach(act => act.call(_this));

      DESTROY_IN_NEXT_FRAME(_this.index, () => {
        if (_this.inDOM) {
          _this.populateLeaveSequence(_this.onLeaveComplete);
        }

        _this.localPropertyNames.clear();
        _this.properties.clear();
        _this.finalize = [];
        _this.inDOM = false;
        _this.blueprint.node = undefined;
        _this.inputs = {};
      });
    },

    getChildNodes: function () {
      const nodes = [];
      const cn = arrSlice.call(this.node.childNodes, 0);
      for (let i = cn.length - 1; i >= 0; i--) {
        // All the nodes that are ViewNode
        const node = cn[i];
        if ('__vn__' in node) {
          nodes.push(node['__vn__']);
        }
      }

      return nodes;
    },

    /**
     *
     */
    clean: function (hasAnimation) {
      GV.destroyNodes(this.getChildNodes(), hasAnimation);
    },

    get index() {
      if (this.parent) {
        const childNodes = this.parent.node.childNodes;
        let i = -1;
        const node = this.node;
        for (let counter = 0, len = childNodes.length; counter < len; counter++) {
          if (childNodes[counter] === node) {
            i = counter;
            break;
          }
        }
        if (i === -1) {
          i = arrIndexOf.call(childNodes, this.placeholder);
        }
        return this.parent.index + '.' + ViewNode.createIndex(i);
      }

      return '0';
    },

    get anchor() {
      if (this.inDOM) {
        return this.node;
      }

      return this.placeholder;
    }
  };

  return ViewNode;

})(Galaxy);

/* global Galaxy */
(function (G) {
  G.View.PROPERTY_SETTERS.attr = function (viewNode, property, expression) {
    const attrName = property.key;
    const updateFn = property.update || G.View.setAttr;
    const setter = function A(value, oldValue) {
      if (value instanceof Promise) {
        const asyncCall = function (asyncValue) {
          updateFn(viewNode, asyncValue, oldValue, attrName);
        };
        value.then(asyncCall).catch(asyncCall);
      } else if (value instanceof Function) {
        const result = value.call(viewNode, viewNode.data);
        updateFn(viewNode, result, value.oldResult, attrName);
        value.oldResult = value;
      } else {
        updateFn(viewNode, value, oldValue, attrName);
      }
    };

    if (expression) {
      return function (none, oldValue) {
        const expressionValue = expression(none);
        setter(expressionValue, oldValue);
      };
    }

    return setter;
  };
})(Galaxy);

/* global Galaxy */
(function (G) {
  G.View.PROPERTY_SETTERS.prop = function (viewNode, property, expression) {
    const propName = property.key;
    if (!propName) {
      console.error(property);
      throw new Error('PROPERTY_SETTERS.prop: property.name is mandatory in order to create property setter');
    }

    const updateFn = property.update || G.View.setProp;
    const setter = function P(value, oldValue) {
      if (value instanceof Promise) {
        const asyncCall = function (asyncValue) {
          updateFn(viewNode, asyncValue, oldValue, propName);
        };
        value.then(asyncCall).catch(asyncCall);
      } else if (value instanceof Function) {
        const result = value.call(viewNode, viewNode.data);
        updateFn(viewNode, result, oldValue, propName);
        value.oldResult = value;
      } else {
        updateFn(viewNode, value, oldValue, propName);
      }
    };

    if (expression) {
      return function () {
        const expressionValue = expression();
        setter(expressionValue);
      };
    }

    return setter;
  };
})(Galaxy);

/* global Galaxy */
(function (G) {
  G.View.PROPERTY_SETTERS.reactive = function (viewNode, property, expression, scope) {
    const propertyName = property.key;
    const updateFn = property.update;
    const config = viewNode.cache[propertyName];

    return createReactiveFunction(updateFn, viewNode, config, expression, scope);
  };

  function createReactiveFunction(updateFn, vn, config, expression, scope) {
    const nodeUpdateFn = updateFn.bind(vn);
    return function R(value, oldValue) {
      return nodeUpdateFn(config, value, oldValue, expression, scope);
    };
  }
})(Galaxy);

/* global Galaxy, gsap */
(function (G) {
  if (!window.gsap) {
    G.View.NODE_BLUEPRINT_PROPERTY_MAP['animations'] = {
      type: 'prop',
      key: 'animations',
      /**
       *
       * @param {Galaxy.View.ViewNode} viewNode
       * @param value
       */
      update: function (viewNode, value) {
        if (value.enter && value.enter.onComplete) {
          viewNode.populateEnterSequence = value.enter.onComplete;
        }
        viewNode.populateLeaveSequence = (onComplete) => {
          onComplete();
        };
      }
    };

    window.gsap = {
      to: function (node, props) {
        requestAnimationFrame(() => {
          if (typeof node === 'string') {
            node = document.querySelector(node);
          }

          const style = node.style;
          if (style) {
            const keys = Object.keys(props);
            for (let i = 0, len = keys.length; i < len; i++) {
              const key = keys[i];
              const value = props[key];
              switch (key) {
                case 'duration':
                case 'ease':
                  break;

                case 'opacity':
                case 'z-index':
                  style.setProperty(key, value);
                  break;

                case 'scrollTo':
                  node.scrollTop = typeof value.y === 'string' ? document.querySelector(value.y).offsetTop : value.y;
                  node.scrollLeft = typeof value.x === 'string' ? document.querySelector(value.x).offsetLeft : value.x;
                  break;

                default:
                  style.setProperty(key, typeof value === 'number' && value !== 0 ? value + 'px' : value);
              }
            }
          } else {
            Object.assign(node, props);
          }
        });
      },
    };


    console.info('%cPlease load GSAP - GreenSock in order to activate animations', 'color: yellowgreen; font-weight: bold;');
    console.info('%cYou can implement most common animations by loading the following resources', 'color: yellowgreen;');
    console.info('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/gsap.min.js');
    console.info('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/ScrollToPlugin.min.js');
    console.info('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/EasePack.min.js\n\n');
    return;
  }

  function hasParentEnterAnimation(viewNode) {
    if (!viewNode.parent) return false;

    const parent = viewNode.parent;
    if (parent.blueprint.animations && parent.blueprint.animations.enter && gsap.getTweensOf(parent.node).length) {
      return true;
    }

    return hasParentEnterAnimation(viewNode.parent);
  }

  G.View.NODE_BLUEPRINT_PROPERTY_MAP['animations'] = {
    type: 'prop',
    key: 'animations',
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param value
     */
    update: function (viewNode, value) {
      if (viewNode.virtual || !value) {
        return;
      }

      const enter = value.enter;
      if (enter) {
        viewNode.populateEnterSequence = function () {
          if (enter.withParent) {
            // if parent has a enter animation, then ignore this node's animation
            // so this node enters with its parent
            if (hasParentEnterAnimation(this)) {
              return;
            }

            const parent = this.parent;
            // if enter.withParent flag is there, then only apply animation to the nodes are rendered rendered
            if (!parent.rendered.resolved) {
              return;
            }
          }

          const _node = this.node;
          if (gsap.getTweensOf(_node).length) {
            gsap.killTweensOf(_node);
          }

          AnimationMeta.installGSAPAnimation(this, 'enter', enter);
        };
      }

      const leave = value.leave;
      if (leave) {
        // We need an empty enter animation in order to have a proper behavior for $if
        if (!enter && viewNode.blueprint.$if) {
          console.warn('The following node has `$if` and a `leave` animation but does NOT have a `enter` animation.' +
            '\nThis can result in unexpected UI behavior.\nTry to define a `enter` animation that negates the leave animation to prevent unexpected behavior\n\n');
          console.warn(viewNode.node);
        }

        viewNode.leaveWithParent = leave.withParent === true;
        viewNode.populateLeaveSequence = function (finalize) {
          const _node = this.node;
          if (leave.withParent) {
            // if the leaveWithParent flag is there, then apply animation only to non-transitory nodes
            const parent = this.parent;

            if (parent.transitory) {
              if (gsap.getTweensOf(_node).length) {
                gsap.killTweensOf(_node);
              }

              // We dump this _viewNode so it gets removed when the leave animation origin node is detached.
              // This fixes a bug where removed elements stay in DOM if the cause of the leave animation is a $if
              return this.dump();
            }
          }

          if (gsap.getTweensOf(_node).length) {
            gsap.killTweensOf(_node);
          }

          // in the case which the _viewNode is not visible, then ignore its animation
          const rect = _node.getBoundingClientRect();
          if (rect.width === 0 ||
            rect.height === 0 ||
            _node.style.opacity === '0' ||
            _node.style.visibility === 'hidden') {
            gsap.killTweensOf(_node);
            return finalize();
          }

          AnimationMeta.installGSAPAnimation(this, 'leave', leave, finalize);
        };

        // Hide sequence is the same as leave sequence.
        // The only difference is that hide sequence will add `display: 'none'` to the node at the end
        viewNode.populateHideSequence = viewNode.populateLeaveSequence.bind(viewNode, () => {
          viewNode.node.style.display = 'none';
        });
      } else {
        // it works and I don't know why
        viewNode.populateLeaveSequence = function (finalize) {
          if (gsap.getTweensOf(this.node).length) {
            gsap.killTweensOf(this.node);
          }
          // console.log(this.blueprint.$if,finalize)
          if (this.blueprint.hasOwnProperty('$if')) {
            finalize();
          }


          // AnimationMeta.installGSAPAnimation(this, 'leave', {
          //   // sequence: 'DESTROY',
          //   duration: 0
          // }, onComplete);
        };
      }

      if (viewNode.cache.class && viewNode.cache.class.observer) {
        viewNode.rendered.then(function () {
          viewNode.cache.class.observer.onAll((key) => {

          });
        });
      }
    }
  };

  G.View.AnimationMeta = AnimationMeta;

  /**
   *
   * @typedef {Object} AnimationConfig
   * @property {string} [sequence]
   * @property {Promise} [await]
   * @property {string|number} [positionInParent]
   * @property {string|number} [position]
   * @property {number} [duration]
   * @property {object} [from]
   * @property {object} [to]
   * @property {string} [addTo]
   * @property {Function} [onStart]
   * @property {Function} [onComplete]
   */

  AnimationMeta.ANIMATIONS = {};
  AnimationMeta.TIMELINES = {};

  AnimationMeta.createSimpleAnimation = function (viewNode, config, finalize) {
    finalize = finalize || G.View.EMPTY_CALL;
    const node = viewNode.node;
    let from = AnimationMeta.parseStep(viewNode, config.from);
    let to = AnimationMeta.parseStep(viewNode, config.to);
    const duration = AnimationMeta.parseStep(viewNode, config.duration) || 0;

    if (to) {
      to = Object.assign({}, to);
      to.duration = duration;
      to.onComplete = finalize;

      if (config.onComplete) {
        const userDefinedOnComplete = config.onComplete;
        to.onComplete = function () {
          userDefinedOnComplete();
          finalize();
        };
      }
    }

    let tween;
    if (from && to) {
      tween = gsap.fromTo(node, from, to);
    } else if (from) {
      from = Object.assign({}, from);
      from.duration = duration;
      from.onComplete = finalize;

      if (config.onComplete) {
        const userDefinedOnComplete = config.onComplete;
        from.onComplete = function () {
          userDefinedOnComplete();
          finalize();
        };
      }

      tween = gsap.from(node, from);
    } else if (to) {
      tween = gsap.to(node, to);
    } else if (config.onComplete) {
      const userDefinedOnComplete = config.onComplete;
      const onComplete = function () {
        userDefinedOnComplete();
        finalize();
      };

      tween = gsap.to(node, {
        duration: duration,
        onComplete: onComplete
      });
    } else {
      tween = gsap.to(node, {
        duration: duration,
        onComplete: finalize
      });
    }

    return tween;
  };

  /**
   *
   * @param stepDescription
   * @param onStart
   * @param onComplete
   * @param viewNode
   * @return {*}
   */
  AnimationMeta.createStep = function (stepDescription, onStart, onComplete, viewNode) {
    const step = Object.assign({}, stepDescription);
    step.callbackScope = viewNode;
    step.onStart = onStart;
    step.onComplete = onComplete;

    return step;
  };
  /**
   *
   * @param {Galaxy.View.ViewNode} node
   * @param {Object|Function} step
   * @return {*}
   */
  AnimationMeta.parseStep = function (node, step) {
    if (step instanceof Function) {
      return step.call(node);
    }

    return step;
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} viewNode
   * @param {'enter'|'leave'|'class-add'|'class-remove'} type
   * @param {AnimationConfig} descriptions
   * @param {Function} [finalize]
   */
  AnimationMeta.installGSAPAnimation = function (viewNode, type, descriptions, finalize) {
    const from = AnimationMeta.parseStep(viewNode, descriptions.from);
    let to = AnimationMeta.parseStep(viewNode, descriptions.to);

    if (type !== 'leave' && to) {
      to.clearProps = to.hasOwnProperty('clearProps') ? to.clearProps : 'all';
    }

    if (type.indexOf('add:') === 0 || type.indexOf('remove:') === 0) {
      to = Object.assign(to || {}, {overwrite: 'none'});
    }
    /** @type {AnimationConfig} */
    const newConfig = Object.assign({}, descriptions);
    newConfig.from = from;
    newConfig.to = to;
    let sequenceName = newConfig.sequence;

    if (newConfig.sequence instanceof Function) {
      sequenceName = newConfig.sequence.call(viewNode);
    }

    let parentAnimationMeta = null;
    if (sequenceName) {
      const animationMeta = new AnimationMeta(sequenceName);

      // if(sequenceName === 'dots')debugger;
      // viewNode.index;
      // By calling 'addTo' first, we can provide a parent for the 'animationMeta.timeline'
      if (newConfig.addTo) {
        parentAnimationMeta = new AnimationMeta(newConfig.addTo);
        const children = parentAnimationMeta.timeline.getChildren(false);
        if (children.indexOf(animationMeta.timeline) === -1) {
          parentAnimationMeta.timeline.add(animationMeta.timeline, newConfig.positionInParent);
        }
      }

      // Make sure the await step is added to highest parent as long as that parent is not the 'gsap.globalTimeline'
      if (newConfig.await && animationMeta.awaits.indexOf(newConfig.await) === -1) {
        let parentTimeline = animationMeta.timeline;

        while (parentTimeline.parent !== gsap.globalTimeline) {
          if (!parentTimeline.parent) return;
          parentTimeline = parentTimeline.parent;
        }

        // parent.add(() => {-
        parentTimeline.addPause(newConfig.position, () => {
          if (viewNode.transitory || viewNode.destroyed.resolved) {
            return parentTimeline.resume();
          }

          // parent.pause();
          animationMeta.awaits.push(newConfig.await);
          const removeAwait = () => {
            const index = animationMeta.awaits.indexOf(newConfig.await);
            if (index !== -1) {
              animationMeta.awaits.splice(index, 1);
            }
            parentTimeline.resume();
          };
          // We don't want the animation wait for the await, if this `viewNode` is destroyed before await gets a chance
          // to be resolved. Therefore, we need to remove await.
          viewNode.finalize.push(removeAwait);

          newConfig.await.then(removeAwait);
          // }, newConfig.position);
        });


      }

      animationMeta.add(viewNode, newConfig, finalize);

      // In the case where the addToAnimationMeta.timeline has no child then animationMeta.timeline would be
      // its only child and we have to resume it if it's not playing
      if (newConfig.addTo && parentAnimationMeta) {
        // const addToAnimationMeta = new AnimationMeta(newConfig.addTo);
        if (!parentAnimationMeta.started) {
          parentAnimationMeta.started = true;
          parentAnimationMeta.timeline.resume();
        }
      }
    } else {
      AnimationMeta.createSimpleAnimation(viewNode, newConfig, finalize);
    }
  };

  /**
   *
   * @param {string} name
   * @class
   */
  function AnimationMeta(name) {
    if (AnimationMeta.ANIMATIONS[name]) {
      return AnimationMeta.ANIMATIONS[name];
    }

    const _this = this;
    _this.name = name;
    _this.timeline = gsap.timeline({
      autoRemoveChildren: true,
      smoothChildTiming: false,
      paused: true,
      onComplete: function () {
        _this.onCompletesActions.forEach((action) => {
          action(_this.timeline);
        });
        _this.nodes = [];
        _this.awaits = [];
        _this.children = [];
        _this.onCompletesActions = [];
        AnimationMeta.ANIMATIONS[name] = null;
      }
    });
    _this.timeline.data = {name};
    _this.onCompletesActions = [];
    _this.started = false;
    _this.configs = {};
    _this.children = [];
    _this.nodes = [];
    _this.awaits = [];
    _this.timelinesMap = [];

    AnimationMeta.ANIMATIONS[name] = this;
  }

  AnimationMeta.prototype = {
    addOnComplete: function (action) {
      this.onCompletesActions.push(action);
    },
    addTo(sequenceName, pip) {
      const parent = new AnimationMeta(sequenceName);
      const children = parent.timeline.getChildren(false);
      if (children.indexOf(this.timeline) === -1) {
        parent.timeline.add(this.timeline, pip);
      }
    },

    /**
     *
     * @param viewNode
     * @param config {AnimationConfig}
     * @param finalize
     */
    add: function (viewNode, config, finalize) {
      const _this = this;
      let tween = null;
      let duration = config.duration;
      if (duration instanceof Function) {
        duration = config.duration.call(viewNode);
      }

      if (config.from && config.to) {
        const to = AnimationMeta.createStep(config.to, config.onStart, config.onComplete, viewNode);
        to.duration = duration || 0;
        tween = gsap.fromTo(viewNode.node, config.from, to);
      } else if (config.from) {
        const from = AnimationMeta.createStep(config.from, config.onStart, config.onComplete, viewNode);
        from.duration = duration || 0;
        tween = gsap.from(viewNode.node, from);
      } else {
        const to = AnimationMeta.createStep(config.to, config.onStart, config.onComplete, viewNode);
        to.duration = duration || 0;
        tween = gsap.to(viewNode.node, to);
      }

      if (finalize) {
        if (tween.vars.onComplete) {
          const userDefinedOnComplete = tween.vars.onComplete;
          return function () {
            userDefinedOnComplete.apply(this, arguments);
            finalize();
          };
        } else {
          tween.vars.onComplete = finalize;
        }
      }

      const tChildren = _this.timeline.getChildren(false);
      const firstChild = tChildren[0];
      if (tChildren.length === 0) {
        _this.timeline.add(tween);
      }
      // This fix a bug where if the enter animation has addTo, then the leave animation is ignored
      else if (tChildren.length === 1 && !firstChild.hasOwnProperty('timeline') && firstChild.getChildren(false).length === 0) {
        _this.timeline.clear();
        _this.timeline.add(tween, config.position || '+=0');
      } else {
        _this.timeline.add(tween, config.position || '+=0');
      }

      if (!_this.started) {
        _this.started = true;
        _this.timeline.resume();
      }
    }
  };
})(Galaxy);

/* global Galaxy */
(function (G) {
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['checked'] = {
    type: 'prop',
    key: 'checked',
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param {Galaxy.View.ReactiveData} scopeReactiveData
     * @param prop
     * @param {Function} expression
     */
    beforeActivate : function (viewNode, scopeReactiveData, prop, expression) {
      if (!scopeReactiveData) {
        return;
      }

      if (expression && viewNode.blueprint.tag === 'input') {
        throw new Error('input.checked property does not support binding expressions ' +
          'because it must be able to change its data.\n' +
          'It uses its bound value as its `model` and expressions can not be used as model.\n');
      }

      const bindings = G.View.getBindings(viewNode.blueprint.checked);
      const id = bindings.propertyKeysPaths[0].split('.').pop();
      const nativeNode = viewNode.node;
      nativeNode.addEventListener('change', function () {
        if (/\[\]$/.test(nativeNode.name) && nativeNode.type !== 'radio') {
          const data = scopeReactiveData.data[id];
          // if the node does not have value attribute, then we take its default value into the account
          // The default value for checkbox is 'on' but we translate that to true
          const value = nativeNode.hasAttribute('value') ? nativeNode.value : true;
          if (data instanceof Array) {
            if (data.indexOf(value) === -1) {
              data.push(value);
            } else {
              data.splice(data.indexOf(value), 1);
            }
          } else {
            scopeReactiveData.data[id] = [value];
          }
        }
        // if node has a value, then its value will be assigned according to its checked state
        else if (nativeNode.hasAttribute('value')) {
          scopeReactiveData.data[id] = nativeNode.checked ? nativeNode.value : null;
        }
        // if node has no value, then checked state would be its value
        else {
          scopeReactiveData.data[id] = nativeNode.checked;
        }
      });
    },
    update: function (viewNode, value) {
      const nativeNode = viewNode.node;
      viewNode.rendered.then(function () {
        if (/\[\]$/.test(nativeNode.name)) {
          if (nativeNode.type === 'radio') {
            console.error('Inputs with type `radio` can not provide array as a value.');
            return console.warn('Read about radio input at: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio');
          }

          const nodeValue = nativeNode.hasAttribute('value') ? nativeNode.value : true;
          if (value instanceof Array) {
            nativeNode.checked = value.indexOf(nodeValue) !== -1;
          } else {
            nativeNode.checked = value === nodeValue;
          }
        } else if (nativeNode.hasAttribute('value')) {
          nativeNode.checked = value === nativeNode.value;
        } else {
          nativeNode.checked = value;
        }
      });
    }
  };
})(Galaxy);


/* global Galaxy */
(function (G) {
  G.View.REACTIVE_BEHAVIORS['class'] = true;
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['class'] = {
    type: 'reactive',
    key: 'class',
    getConfig: function (scope, value) {
      return {
        scope,
        subjects: value,
        reactiveClasses: null,
        observer: null,
      };
    },
    install: function (config) {
      if (this.virtual || config.subjects === null || config.subjects instanceof Array || typeof config.subjects !== 'object') {
        return true;
      }

      const viewNode = this;
      // when value is an object
      const reactiveClasses = config.reactiveClasses = G.View.bindSubjectsToData(viewNode, config.subjects, config.scope, true);
      const observer = config.observer = new G.Observer(reactiveClasses);
      if (viewNode.blueprint.renderConfig.applyClassListAfterRender) {
        viewNode.rendered.then(function () {
          applyClasses(viewNode, reactiveClasses);
          observer.onAll((key, value, oldValue) => {
            applyClasses(viewNode, reactiveClasses);
          });
        });
      } else {
        observer.onAll((key, value, oldValue) => {
          applyClasses(viewNode, reactiveClasses);
        });
      }

      return true;
    },
    /**
     *
     * @param config
     * @param value
     * @param oldValue
     * @param expression
     * @this {Galaxy.View.ViewNode}
     */
    update: function (config, value, oldValue, expression) {
      if (this.virtual) {
        return;
      }

      /** @type Galaxy.View.ViewNode */
      const viewNode = this;
      const node = viewNode.node;

      if (expression) {
        value = expression();
      }

      if (typeof value === 'string') {
        return node.setAttribute('class', value);
      } else if (value instanceof Array) {
        return node.setAttribute('class', value.join(' '));
      } else if (value === null || value === undefined) {
        return node.removeAttribute('class');
      }

      if (config.subjects === value) {
        value = config.reactiveClasses;
      }

      // when value is an object
      if (viewNode.blueprint.renderConfig.applyClassListAfterRender) {
        viewNode.rendered.then(function () {
          applyClasses(viewNode, value);
        });
      } else {
        applyClasses(viewNode, value);
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

  function applyClasses(viewNode, classes) {
    const currentClasses = viewNode.node.getAttribute('class') || [];
    const newClasses = getClasses(classes);
    if (JSON.stringify(currentClasses) === JSON.stringify(newClasses)) {
      return;
    }

    viewNode.node.setAttribute('class', newClasses.join(' '));
  }
})(Galaxy);


/* global Galaxy */
(function (G) {
  G.View.REACTIVE_BEHAVIORS['content'] = true;
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['content'] = {
    type: 'reactive',
    key: 'content',
    getConfig: function () {
      this.virtualize();
      return {
        module: null
      };
    },
    install: function (data) {
      return false;
    },
    update: function (cache, selector, oldSelector, expression) {
      // if (scope.element.blueprint.children && scope.element.blueprint.hasOwnProperty('module')) {
      //   // this.domManipulationSequence.next(function (done) {
      //   let allContent = scope.element.blueprint.children;
      //   let parentViewNode = this.parent;
      //   allContent.forEach(function (content) {
      //     if (selector === '*' || selector.toLowerCase() === content.node.tagName.toLowerCase()) {
      //       content.__node__.galaxyViewNode.refreshBinds(scope);
      //       parentViewNode.registerChild(content.__node__.galaxyViewNode, this.placeholder);
      //       content.__node__.galaxyViewNode.setInDOM(true);
      //     }
      //   });
      //
      //   // done();
      //   // });
      // }
    }
  };
})(Galaxy);


/* global Galaxy */
(function (G) {
  /**
   *
   * @type {Galaxy.View.BlueprintProperty}
   */
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['disabled'] = {
    type: 'attr',
    key: 'disabled',
    update: function (viewNode, value, oldValue, attr) {
      viewNode.rendered.then(() => {
        if (viewNode.blueprint.tag.toLowerCase() === 'form') {
          const children = viewNode.node.querySelectorAll('input, textarea, select, button');

          if (value) {
            Array.prototype.forEach.call(children, input => input.setAttribute('disabled', ''));
          } else {
            Array.prototype.forEach.call(children, input => input.removeAttribute('disabled'));
          }
        }
      });

      G.View.setAttr(viewNode, value ? '' : null, oldValue, attr);
    }
  };
})(Galaxy);


/* global Galaxy */
(function (G) {
  G.View.REACTIVE_BEHAVIORS['$if'] = true;
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['$if'] = {
    type: 'reactive',
    key: '$if',
    getConfig: function () {
      return {
        throttleId: null,
      };
    },
    install: function (config) {
      return true;
    },
    /**
     *
     * @this Galaxy.View.ViewNode
     * @param config
     * @param value
     * @param oldValue
     * @param expression
     */
    update: function (config, value, oldValue, expression) {
      // if (config.throttleId) {
      //   window.cancelAnimationFrame(config.throttleId);
      //   config.throttleId = 0;
      // }

      const viewNode = this;
      if (expression) {
        value = expression();
      }

      if (!viewNode.rendered.resolved && !value) {
        viewNode.blueprint.renderConfig.renderDetached = true;
      }

      // config.throttleId = window.requestAnimationFrame(() => {
      viewNode.rendered.then(() => {
        if (viewNode.inDOM !== value) {
          viewNode.setInDOM(value);
        }
      });
      // });
    }
  };

})(Galaxy);


/* global Galaxy */
(function (G) {
  G.View.REACTIVE_BEHAVIORS['inputs'] = true;
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['inputs'] = {
    type: 'reactive',
    key: 'inputs',
    /**
     *
     * @this {Galaxy.View.ViewNode}
     * @param value
     * @param scope
     */
    getConfig: function (scope, value) {
      if (value !== null && typeof value !== 'object') {
        throw console.error('inputs property should be an object with explicits keys:\n', JSON.stringify(this.blueprint, null, '  '));
      }

      return {
        subjects: value,
        scope: scope
      };
    },
    /**
     *
     * @this {Galaxy.View.ViewNode}
     * @param config
     * @return {boolean}
     */
    install: function (config) {
      if (this.virtual) {
        return false;
      }

      this.inputs = G.View.bindSubjectsToData(this, config.subjects, config.scope, true);

      return false;
    },
    update: function (cache, value, oldValue, context) { }
  };
})(Galaxy);

/* global Galaxy */
(function (G) {
  G.View.REACTIVE_BEHAVIORS['module'] = true;
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['module'] = {
    type: 'reactive',
    key: 'module',
    getConfig: function (scope) {
      return {
        module: null,
        moduleMeta: null,
        scope: scope
      };
    },
    install: function () {
      return true;
    },
    update: function handleModule(config, moduleMeta, oldModuleMeta, expression) {
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

      if (moduleMeta && oldModuleMeta && moduleMeta.path === oldModuleMeta.path) {
        return;
      }

      if (!_this.virtual && moduleMeta && moduleMeta.path && moduleMeta !== config.moduleMeta) {
        // G.View.CREATE_IN_NEXT_FRAME(_this.index, () => {
        _this.rendered.then(function () {
          cleanModuleContent(_this);
          moduleLoaderGenerator(_this, config, moduleMeta)();
        });
        // });
      } else if (!moduleMeta) {
        cleanModuleContent(_this);
      }
      config.moduleMeta = moduleMeta;
    }
  };

  function cleanModuleContent(viewNode) {
    const children = viewNode.getChildNodes();
    children.forEach(vn => {
      if (vn.populateLeaveSequence === Galaxy.View.EMPTY_CALL) {
        vn.populateLeaveSequence = function (finalize) {
          // G.View.AnimationMeta.installGSAPAnimation(vn, 'leave', {
          //   // sequence: 'DESTROY',
          //   onComplete: finalize,
          //   duration: 0
          // }, finalize);
          finalize();
        };
      }
    });

    viewNode.clean(true);
  }

  const moduleLoaderGenerator = function (viewNode, cache, moduleMeta) {
    return function () {
      if (cache.module) {
        cache.module.destroy();
      }
      // Check for circular module loading
      const tempURI = new G.GalaxyURI(moduleMeta.path);
      let moduleScope = cache.scope;
      let currentScope = cache.scope;

      while (moduleScope) {
        // In the case where module is a part of repeat, cache.scope will be NOT an instance of Scope
        // but its __parent__ is
        if (!(currentScope instanceof G.Scope)) {
          currentScope = new G.Scope({
            systemId: 'repeat-item',
            path: cache.scope.__parent__.uri.parsedURL,
            parentScope: cache.scope.__parent__
          });
        }

        if (tempURI.parsedURL === currentScope.uri.parsedURL) {
          return console.error('Circular module loading detected and stopped. \n' + currentScope.uri.parsedURL + ' tries to load itself.');
        }

        moduleScope = moduleScope.parentScope;
      }

      G.View.CREATE_IN_NEXT_FRAME(viewNode.index, () => {
        currentScope.load(moduleMeta, {
          element: viewNode
        }).then(function (module) {
          cache.module = module;
          viewNode.node.setAttribute('module', module.systemId);
          module.start();
        }).catch(function (response) {
          console.error(response);
        });
      });
    };
  };
})(Galaxy);


/* global Galaxy */
(function (G) {
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['on'] = {
    type: 'prop',
    key: 'on',
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param events
     */
    update: function (viewNode, events) {
      if (events !== null && typeof events === 'object') {
        for (let name in events) {
          if (events.hasOwnProperty(name)) {
            const handler = function (event) {
              return events[name].call(viewNode, event, viewNode.data);
            };
            viewNode.node.addEventListener(name, handler, false);
            viewNode.finalize.push(() => {
              viewNode.node.removeEventListener(name, handler, false);
            });
          }
        }
      }
    }
  };
})(Galaxy);

/* global Galaxy */
(function (G) {
  const View = G.View;
  const CLONE = G.clone;
  const DESTROY_NODES = G.View.destroyNodes;

  View.REACTIVE_BEHAVIORS['repeat'] = true;
  View.NODE_BLUEPRINT_PROPERTY_MAP['repeat'] = {
    type: 'reactive',
    key: 'repeat',
    getConfig: function (scope, value) {
      this.virtualize();

      return {
        changeId: null,
        previousActionId: null,
        nodes: [],
        data: value.data,
        as: value.as,
        indexAs: value.indexAs || '_index',
        oldChanges: {},
        positions: [],
        trackMap: [],
        scope: scope,
        trackBy: value.trackBy
      };
    },

    /**
     *
     * @param config Value return by getConfig
     */
    install: function (config) {
      const viewNode = this;

      if (config.data) {
        if (config.as === 'data') {
          throw new Error('`data` is an invalid value for repeat.as property. Please choose a different value.`');
        }
        viewNode.localPropertyNames.add(config.as);
        viewNode.localPropertyNames.add(config.indexAs);

        const bindings = View.getBindings(config.data);
        if (bindings.propertyKeysPaths) {
          View.makeBinding(viewNode, 'repeat', undefined, config.scope, bindings, viewNode);
          bindings.propertyKeysPaths.forEach((path) => {
            try {
              const rd = View.propertyScopeLookup(config.scope, path);
              viewNode.finalize.push(() => {
                rd.removeNode(viewNode);
              });
            } catch (error) {
              console.error('Could not find: ' + path + '\n', error);
            }
          });
        } else if (config.data instanceof Array) {
          const setter = viewNode.setters['repeat'] = View.getPropertySetterForNode(G.View.NODE_BLUEPRINT_PROPERTY_MAP['repeat'], viewNode, config.data, null, config.scope);
          const value = new G.View.ArrayChange();
          value.params = config.data;
          config.data.changes = value;
          setter(config.data);
        }
      }

      return false;
    },

    /**
     *
     * @this {Galaxy.View.ViewNode}
     * @param config The value returned by getConfig
     * @param array
     * @param oldChanges
     * @param {Function} expression
     */
    update: function (config, array, oldChanges, expression) {
      let changes = null;
      if (expression) {
        array = expression();
        if (array === null || array === undefined) {
          return;
        }

        if (array instanceof G.View.ArrayChange) {
          changes = array;
        } else if (array instanceof Array) {
          const initialChanges = new G.View.ArrayChange();
          initialChanges.original = array;
          initialChanges.type = 'reset';
          initialChanges.params = array;
          changes = array.changes = initialChanges;
        } else {
          changes = {
            type: 'reset',
            params: []
          };
        }

        // if (!(changes instanceof Galaxy.View.ArrayChange)) {
        //   debugger;
        //   throw new Error('repeat: Expression has to return an ArrayChange instance or null \n' + config.watch.join(' , ') + '\n');
        // }
      } else {
        if (array instanceof G.View.ArrayChange) {
          changes = array;
        } else if (array instanceof Array) {
          changes = array.changes;
        }
      }

      if (changes && !(changes instanceof G.View.ArrayChange)) {
        return console.warn('%crepeat %cdata is not a type of ArrayChange' +
          '\ndata: ' + config.data +
          '\n%ctry \'' + config.data + '.changes\'\n', 'color:black;font-weight:bold', null, 'color:green;font-weight:bold');
      }

      if (!changes || typeof changes === 'string') {
        changes = {
          id: 0,
          type: 'reset',
          params: []
        };
      }

      const node = this;
      if (changes.id === config.changeId) {
        return;
      }

      // Only cancel previous action if the type of new and old changes is reset
      // if (changes.type === 'reset' && changes.type === config.oldChanges.type && config.previousActionId) {
      //   cancelAnimationFrame(config.previousActionId);
      // }

      config.changeId = changes.id;
      config.oldChanges = changes;
      // if(node.blueprint.animations && node.blueprint.animations.enter && node.blueprint.animations.enter.sequence === 'dots')debugger;
      // node.index;
      //  config.previousActionId = requestAnimationFrame(() => {
      //   prepareChanges(node, config, changes).then(finalChanges => {
      //     processChanges(node, config, finalChanges);
      //   });
      // });
      processChanges(node, config, prepareChanges(node, config, changes));
    }
  };

  function prepareChanges(viewNode, config, changes) {
    const hasAnimation = viewNode.blueprint.animations && viewNode.blueprint.animations.leave;
    const trackByKey = config.trackBy;
    if (trackByKey && changes.type === 'reset') {
      let newTrackMap;
      if (trackByKey === true) {
        newTrackMap = changes.params.map(item => {
          return item;
        });
      } else if (typeof trackByKey === 'string') {

        newTrackMap = changes.params.map(item => {
          return item[trackByKey];
        });
      }

      // list of nodes that should be removed
      const hasBeenRemoved = [];
      config.trackMap = config.trackMap.filter(function (id, i) {
        if (newTrackMap.indexOf(id) === -1 && config.nodes[i]) {
          hasBeenRemoved.push(config.nodes[i]);
          return false;
        }
        return true;
      });

      const newChanges = new G.View.ArrayChange();
      newChanges.init = changes.init;
      newChanges.type = changes.type;
      newChanges.original = changes.original;
      newChanges.params = changes.params;
      newChanges.__rd__ = changes.__rd__;
      if (newChanges.type === 'reset' && newChanges.params.length) {
        newChanges.type = 'push';
      }

      config.nodes = config.nodes.filter(function (node) {
        return hasBeenRemoved.indexOf(node) === -1;
      });

      DESTROY_NODES(hasBeenRemoved.reverse(), hasAnimation);
      return newChanges;
    } else if (changes.type === 'reset') {
      const nodesToBeRemoved = config.nodes.slice(0);
      config.nodes = [];
      DESTROY_NODES(nodesToBeRemoved.reverse(), hasAnimation);
      const newChanges = Object.assign({}, changes);
      newChanges.type = 'push';
      return newChanges;
    }

    return changes;
  }

  function processChanges(viewNode, config, changes) {
    const parentNode = viewNode.parent;
    // const positions = config.positions;
    const positions = [];
    const placeholders = [];
    const nodeScopeData = config.scope;
    const trackMap = config.trackMap;
    const as = config.as;
    const indexAs = config.indexAs;
    const nodes = config.nodes;
    const trackByKey = config.trackBy;
    const templateBlueprint = viewNode.cloneBlueprint();
    Reflect.deleteProperty(templateBlueprint, 'repeat');

    let defaultPosition = nodes.length ? nodes[nodes.length - 1].anchor.nextSibling : viewNode.placeholder.nextSibling;
    let newItems = [];
    let onEachAction;
    if (trackByKey === true) {
      onEachAction = function (vn, p, d) {
        trackMap.push(d);
        this.push(vn);
        // positions.push(vn.anchor.nextSibling);
      };
    } else {
      onEachAction = function (vn, p, d) {
        trackMap.push(d[config.trackBy]);
        this.push(vn);
        // positions.push(vn.anchor.nextSibling);
      };
    }

    if (changes.type === 'push') {
      newItems = changes.params;
    } else if (changes.type === 'unshift') {
      defaultPosition = nodes[0] ? nodes[0].anchor : defaultPosition;
      newItems = changes.params;

      if (trackByKey === true) {
        onEachAction = function (vn, p, d) {
          trackMap.unshift(d);
          this.unshift(vn);
        };
      } else {
        onEachAction = function (vn, p, d) {
          trackMap.unshift(d[trackByKey]);
          this.unshift(vn);
        };
      }
    } else if (changes.type === 'splice') {
      const changeParams = changes.params.slice(0, 2);
      const removedItems = Array.prototype.splice.apply(nodes, changeParams);
      DESTROY_NODES(removedItems.reverse(), viewNode.blueprint.animations && viewNode.blueprint.animations.leave);
      Array.prototype.splice.apply(trackMap, changeParams);

      const startingIndex = changes.params[0];
      newItems = changes.params.slice(2);
      for (let i = 0, len = newItems.length; i < len; i++) {
        const index = i + startingIndex;
        positions.push(index);
        placeholders.push(nodes[index] ? nodes[index].anchor : defaultPosition);
      }

      if (trackByKey === true) {
        onEachAction = function (vn, p, d) {
          trackMap.splice(p, 0, d);
          this.splice(p, 0, vn);
        };
      } else {
        onEachAction = function (vn, p, d) {
          trackMap.splice(p, 0, d[trackByKey]);
          this.splice(p, 0, vn);
        };
      }
    } else if (changes.type === 'pop') {
      const lastItem = nodes.pop();
      lastItem && lastItem.destroy();
      trackMap.pop();
    } else if (changes.type === 'shift') {
      const firstItem = nodes.shift();
      firstItem && firstItem.destroy();
      trackMap.shift();
    } else if (changes.type === 'sort' || changes.type === 'reverse') {
      nodes.forEach(function (viewNode) {
        viewNode.destroy();
      });

      config.nodes = [];
      newItems = changes.original;
      Array.prototype[changes.type].call(trackMap);
    }

    const view = viewNode.view;
    if (newItems instanceof Array) {
      const newItemsCopy = newItems.slice(0);
      // let vn;
      if (trackByKey) {
        if (trackByKey === true) {
          for (let i = 0, len = newItems.length; i < len; i++) {
            const newItemCopy = newItemsCopy[i];
            const index = trackMap.indexOf(newItemCopy);
            if (index !== -1) {
              config.nodes[index].data._index = index;
              continue;
            }

            // const itemDataScope = createItemDataScope(nodeScopeData, as, newItemCopy);
            // const cns = CLONE(templateBlueprint);
            // itemDataScope[indexAs] = trackMap.length;
            //
            // vn = view.createNode(cns, itemDataScope, parentNode, placeholdersPositions[i] || defaultPosition, node);
            // onEachAction.call(nodes, vn, positions[i], itemDataScope[as]);

            createNode(view, templateBlueprint, nodeScopeData, as, newItemCopy, indexAs, i, parentNode, placeholders[i] || defaultPosition, onEachAction, nodes, positions);
          }
        } else {
          for (let i = 0, len = newItems.length; i < len; i++) {
            const newItemCopy = newItemsCopy[i];
            const index = trackMap.indexOf(newItemCopy[trackByKey]);
            if (index !== -1) {
              config.nodes[index].data._index = index;
              continue;
            }

            // const itemDataScope = createItemDataScope(nodeScopeData, as, newItemCopy);
            // const cns = CLONE(templateBlueprint);
            // itemDataScope[indexAs] = trackMap.length;
            //
            // vn = view.createNode(cns, itemDataScope, parentNode, placeholdersPositions[i] || defaultPosition, node);
            // onEachAction.call(nodes, vn, positions[i], itemDataScope[as]);
            createNode(view, templateBlueprint, nodeScopeData, as, newItemCopy, indexAs, i, parentNode, placeholders[i] || defaultPosition, onEachAction, nodes, positions);
          }
        }
      } else {
        for (let i = 0, len = newItems.length; i < len; i++) {
          // const itemDataScope = createItemDataScope(nodeScopeData, as, newItemsCopy[i]);
          // const cns = CLONE(templateBlueprint);
          // itemDataScope[indexAs] = i;
          //
          // vn = view.createNode(cns, itemDataScope, parentNode, placeholdersPositions[i] || defaultPosition, node);
          // onEachAction.call(nodes, vn, positions[i], itemDataScope[as]);
          createNode(view, templateBlueprint, nodeScopeData, as, newItemsCopy[i], indexAs, i, parentNode, placeholders[i] || defaultPosition, onEachAction, nodes, positions);
        }
      }

    }
  }

  function createItemDataScope(nodeScopeData, as, itemData) {
    const itemDataScope = View.createChildScope(nodeScopeData);
    itemDataScope[as] = itemData;
    return itemDataScope;
  }

  function createNode(view, templateBlueprint, nodeScopeData, as, newItemsCopy, indexAs, i, parentNode, position, onEachAction, nodes, positions) {
    const itemDataScope = createItemDataScope(nodeScopeData, as, newItemsCopy);
    const cns = CLONE(templateBlueprint);
    itemDataScope[indexAs] = i;

    const vn = view.createNode(cns, itemDataScope, parentNode, position);
    onEachAction.call(nodes, vn, positions[i], itemDataScope[as]);
  }
})(Galaxy);


/* global Galaxy */
(function (G) {
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['selected'] = {
    type: 'prop',
    key: 'selected',
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param {Galaxy.View.ReactiveData} scopeReactiveData
     * @param prop
     * @param {Function} expression
     */
    beforeActivate : function (viewNode, scopeReactiveData, prop, expression) {
      if (!scopeReactiveData) {
        return;
      }

      if (expression && viewNode.blueprint.tag === 'select') {
        throw new Error('select.selected property does not support binding expressions ' +
          'because it must be able to change its data.\n' +
          'It uses its bound value as its `model` and expressions can not be used as model.\n');
      }

      // Don't do anything if the node is an option tag
      if (viewNode.blueprint.tag === 'select') {
        const bindings = G.View.getBindings(viewNode.blueprint.selected);
        const id = bindings.propertyKeysPaths[0].split('.').pop();
        const nativeNode = viewNode.node;
        nativeNode.addEventListener('change', (event) => {
          // if (scopeReactiveData.data[id] && !nativeNode.value) {
          //   nativeNode.value = scopeReactiveData.data[id];
          // }
        });
        // const bindings = G.View.getBindings(viewNode.blueprint.selected);
        // const id = bindings.propertyKeysPaths[0].split('.').pop();
        // const nativeNode = viewNode.node;

        // const unsubscribe = viewNode.stream.filter('dom').filter('childList').subscribe(function () {
        //   if (scopeReactiveData.data[id] && !nativeNode.value) {
        //     nativeNode.value = scopeReactiveData.data[id];
        //   }
        // });
        //
        // viewNode.destroyed.then(unsubscribe);
      }
    },
    update: function (viewNode, value) {
      const nativeNode = viewNode.node;

      viewNode.rendered.then(function () {
        if (nativeNode.value !== value) {
          if (viewNode.blueprint.tag === 'select') {
            nativeNode.value = value;
          } else if (value) {
            nativeNode.setAttribute('selected');
          } else {
            nativeNode.removeAttribute('selected');
          }
        }
      });
    }
  };
})(Galaxy);


/* global Galaxy */
(function (G) {
  G.View.REACTIVE_BEHAVIORS['style'] = true;
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['style'] = {
    type: 'reactive',
    key: 'style',
    getConfig: function (scope, value) {
      return {
        scope: scope,
        subjects: value,
        reactiveStyle: null
      };
    },
    install: function (config) {
      if (this.virtual || config.subjects === null || config.subjects instanceof Array || typeof config.subjects !== 'object') {
        return true;
      }

      const node = this.node;
      const reactiveStyle = config.reactiveStyle = G.View.bindSubjectsToData(this, config.subjects, config.scope, true);
      const observer = new G.Observer(reactiveStyle);
      observer.onAll(() => {
        setStyle(node, reactiveStyle);
      });

      return true;
    },
    /**
     *
     * @param config
     * @param value
     * @param oldValue
     * @param expression
     * @this {Galaxy.View.ViewNode}
     */
    update: function (config, value, oldValue, expression) {
      if (this.virtual) {
        return;
      }

      const _this = this;
      const node = _this.node;

      if (expression) {
        value = expression();
      }

      if (typeof value === 'string') {
        return node.setAttribute('style', value);
      } else if (value instanceof Array) {
        return node.setAttribute('style', value.join(';'));
      }

      if (value instanceof Promise) {
        value.then(function (_value) {
          setStyle(node, _value);
        });
      } else if (value === null) {
        return node.removeAttribute('style');
      }

      if (config.subjects === value) {
        // return setStyle(node, config.reactiveStyle);
        value = config.reactiveStyle;
      }

      setStyle(node, value);
    }
  };

  function setStyle(node, value) {
    if (value instanceof Object) {
      for (let key in value) {
        const val = value[key];
        if (val instanceof Promise) {
          val.then((v) => {
            node.style[key] = v;
          });
        } else if (typeof val === 'function') {
          node.style[key] = val.call(node);
        } else {
          node.style[key] = val;
        }
      }
    } else {
      node.setAttribute('style', value);
    }
  }
})(Galaxy);


/* global Galaxy */
(function (G) {
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['text'] = {
    type: 'prop',
    key: 'text',
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param value
     */
    update: function (viewNode, value) {
      const nativeNode = viewNode.node;
      const textNode = nativeNode['<>text'];
      let textValue = typeof value === 'undefined' || value === null ? '' : value;

      if (textValue instanceof Function) {
        textValue = textValue.call(viewNode, viewNode.data);
      } else if (textValue instanceof Object) {
        textValue = JSON.stringify(textValue);
      }

      if (textNode) {
        textNode.textContent = textValue;
      } else {
        nativeNode['<>text'] = document.createTextNode(textValue);
        nativeNode.insertBefore(nativeNode['<>text'], nativeNode.firstChild);
      }
    }
  };
})(Galaxy);

/* global Galaxy */
(function (G) {
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['value.config'] = {
    type: 'none'
  };

  G.View.NODE_BLUEPRINT_PROPERTY_MAP['value'] = {
    type: 'prop',
    key: 'value',
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param {Galaxy.View.ReactiveData} scopeReactiveData
     * @param prop
     * @param {Function} expression
     */
    beforeActivate : function valueUtil(viewNode, scopeReactiveData, prop, expression) {
      const nativeNode = viewNode.node;
      if (!scopeReactiveData) {
        return;
      }

      if (expression) {
        throw new Error('input.value property does not support binding expressions ' +
          'because it must be able to change its data.\n' +
          'It uses its bound value as its `model` and expressions can not be used as model.\n');
      }

      const bindings = G.View.getBindings(viewNode.blueprint.value);
      const id = bindings.propertyKeysPaths[0].split('.').pop();
      if (nativeNode.tagName === 'SELECT') {
        const observer = new MutationObserver((data) => {
          viewNode.rendered.then(() => {
            // if (!scopeReactiveData.data[id]) {
            //   scopeReactiveData.data[id] = nativeNode.value;
            // } else {
            nativeNode.value = scopeReactiveData.data[id];
            // }
          });
        });
        observer.observe(nativeNode, { childList: true });
        viewNode.finalize.push(() => {
          observer.disconnect();
        });
        nativeNode.addEventListener('change', createHandler(scopeReactiveData, id));
      } else if (nativeNode.type === 'number') {
        nativeNode.addEventListener('input', createNumberHandler(nativeNode, scopeReactiveData, id));
      } else {
        nativeNode.addEventListener('keyup', createHandler(scopeReactiveData, id));
      }
    },
    update: function (viewNode, value) {
      // input field parse the value which has been passed to it into a string
      // that's why we need to parse undefined and null into an empty string
      if (value !== viewNode.node.value || !viewNode.node.value) {
        viewNode.node.value = value === undefined || value === null ? '' : value;
      }
    }
  };

  function createNumberHandler(_node, _rd, _id) {
    return function () {
      _rd.data[_id] = _node.value ? Number(_node.value) : null;
    };
  }

  function createHandler(_rd, _id) {
    return function (event) {
      _rd.data[_id] = event.target.value;
    };
  }
})(Galaxy);


/* global Galaxy */
(function (G) {
  G.View.REACTIVE_BEHAVIORS['visible'] = true;
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['visible'] = {
    type: 'reactive',
    key: 'visible',
    getConfig: function () {
      return {
        throttleId: null,
      };
    },
    install: function () {
      return true;
    },
    update: function (config, value, oldValue, expression) {
      if (config.throttleId) {
        window.cancelAnimationFrame(config.throttleId);
        config.throttleId = 0;
      }
      /** @type {Galaxy.View.ViewNode} */
      const _this = this;
      if (expression) {
        value = expression();
      }

      config.throttleId = window.requestAnimationFrame(() => {
        _this.rendered.then(() => {
          if (_this.visible !== value) {
            _this.setVisibility(value);
          }
        });
      });
    }
  };
})(Galaxy);


(function (G) {
  SimpleRouter.PARAMETER_REGEXP = new RegExp(/[:*](\w+)/g);
  SimpleRouter.REPLACE_VARIABLE_REGEXP = '([^\/]+)';
  SimpleRouter.BASE_URL = '/';
  SimpleRouter.currentPath = {
    handlers: [],
    subscribe: function (handler) {
      this.handlers.push(handler);
      handler(location.pathname);
    },
    update: function () {
      this.handlers.forEach((h) => {
        h(location.pathname);
      });
    }
  };

  SimpleRouter.mainListener = function (e) {
    SimpleRouter.currentPath.update();
  };

  SimpleRouter.prepareRoute = function (routeConfig, parentScope) {
    if (routeConfig instanceof Array) {
      const routes = routeConfig.map((r) => SimpleRouter.prepareRoute(r, parentScope));
      if (parentScope && parentScope.router) {
        parentScope.router.activeRoute.children = routes;
      }

      return routes;
    }

    return {
      ...routeConfig,
      active: false,
      hidden: routeConfig.hidden || Boolean(routeConfig.redirectTo) || false,
      module: routeConfig.module || null,
      parent: parentScope ? parentScope.router.activeRoute : null,
      children: routeConfig.children || []
    };
  };

  window.addEventListener('popstate', SimpleRouter.mainListener);

  function SimpleRouter(scope, module) {
    const _this = this;
    _this.config = {
      baseURL: SimpleRouter.BASE_URL
    };
    _this.scope = scope;
    _this.module = module;
    _this.root = module.id === 'system' ? '/' : scope.parentScope.router.activeRoute.path;
    _this.parentRoute = null;

    _this.oldURL = '';
    _this.resolvedRouteValue = null;
    _this.resolvedDynamicRouteValue = null;

    _this.routesMap = null;
    _this.resolvedRouteHash = {};
    _this.data = {
      routes: [],
      activeRoute: null,
      activePath: null,
      activeModule: null,
      parameters: _this.scope.parentScope && _this.scope.parentScope.router ? _this.scope.parentScope.router.parameters : {}
    };
    _this.viewport = {
      tag: 'main',
      module: '<>router.activeModule'
    };

    Object.defineProperty(this, 'urlParts', {
      get: function () {
        return _this.oldURL.split('/').slice(1);
      },
      enumerable: true
    });

    if (module.id === 'system') {
      SimpleRouter.currentPath.update();
    }
  }

  SimpleRouter.prototype = {
    init: function (routeConfigs) {
      this.routes = SimpleRouter.prepareRoute(routeConfigs, this.scope.parentScope);
      if (this.scope.parentScope && this.scope.parentScope.router) {
        this.parentRoute = this.scope.parentScope.router.activeRoute;
      }
      this.data.routes = this.routes;

      this.listener = this.detect.bind(this);
      window.addEventListener('popstate', this.listener);

      return this;
    },

    start: function () {
      this.detect();
    },

    navigateToPath: function (path) {
      if (path.indexOf('/') !== 0) {
        throw console.error('Path argument is not starting with a `/`\nplease use `/' + path + '` instead of `' + path + '`');
      }

      if (path.indexOf(this.config.baseURL) !== 0) {
        path = this.config.baseURL + path;
      }

      const currentPath = window.location.pathname;
      if (currentPath === path) {
        return;
      }

      history.pushState({}, '', path);
      dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    },

    navigate: function (path) {
      if (path.indexOf(this.root) !== 0) {
        path = this.root + path;
      }

      this.navigateToPath(path);
    },

    navigateToRoute: function (route) {
      let path = route.path;
      if (route.parent) {
        path = route.parent.path + route.path;
      }

      this.navigate(path);
    },

    notFound: function () {

    },

    normalizeHash: function (hash) {
      if (hash.indexOf('#!/') === 0) {
        throw new Error('Please use `#/` instead of `#!/` for you hash');
      }

      let normalizedHash = hash;
      if (hash.indexOf('#/') !== 0) {
        if (hash.indexOf('/') !== 0) {
          normalizedHash = '/' + hash;
        } else if (hash.indexOf('#') === 0) {
          normalizedHash = hash.split('#').join('#/');
        }
      }

      normalizedHash = normalizedHash.replace(this.config.baseURL, '/');
      return normalizedHash.replace(this.root, '/').replace('//', '/') || '/';
    },

    onProceed: function () {

    },

    callMatchRoute: function (routes, hash, parentParams) {
      const _this = this;
      let matchCount = 0;
      const normalizedHash = _this.normalizeHash(hash);

      const routesPath = routes.map(item => item.path);
      const dynamicRoutes = _this.extractDynamicRoutes(routesPath);
      for (let i = 0, len = dynamicRoutes.length; i < len; i++) {
        const dynamicRoute = dynamicRoutes[i];
        const match = dynamicRoute.paramFinderExpression.exec(normalizedHash);
        if (!match) {
          continue;
        }
        matchCount++;

        const params = _this.createParamValueMap(dynamicRoute.paramNames, match.slice(1));
        if (_this.resolvedDynamicRouteValue === hash) {
          return Object.assign(_this.data.parameters, params);
        }
        _this.resolvedDynamicRouteValue = hash;

        const routeIndex = routesPath.indexOf(dynamicRoute.id);
        const pathParameterPlaceholder = dynamicRoute.id.split('/').filter(t => t.indexOf(':') !== 0).join('/');
        const parts = hash.replace(pathParameterPlaceholder, '').split('/');

        const shouldContinue = _this.callRoute(routes[routeIndex], parts.join('/'), params, parentParams);
        if (!shouldContinue) {
          return;
        }
      }

      const staticRoutes = routes.filter(r => dynamicRoutes.indexOf(r) === -1 && normalizedHash.indexOf(r.path) === 0).reduce((a, b) => a.path.length > b.path.length ? a : b);
      if (staticRoutes) {
        const routeValue = normalizedHash.slice(0, staticRoutes.path.length);
        if (_this.resolvedRouteValue === routeValue) {
          // static routes don't have parameters
          return Object.assign(_this.data.parameters, _this.createClearParameters());
        }
        _this.resolvedRouteValue = routeValue;

        if (staticRoutes.redirectTo) {
          return this.navigate(staticRoutes.redirectTo);
        }
        matchCount++;

        return _this.callRoute(staticRoutes, normalizedHash, _this.createClearParameters(), parentParams);
      }

      if (matchCount === 0) {
        console.warn('No associated route has been found', hash);
      }
    },

    callRoute: function (route, hash, params, parentParams) {
      if (!route.redirectTo) {
        if (this.data.activeRoute) {
          this.data.activeRoute.active = false;
        }

        route.active = true;
      }

      this.data.activeRoute = route;
      this.data.activePath = route.path;

      if (typeof route.handle === 'function') {
        return route.handle.call(this, params, parentParams);
      } else {
        this.data.activeModule = route.module;
        this.data.activePath = route.path;
        Object.assign(this.data.parameters, params);
      }

      return false;
    },

    createClearParameters: function() {
      const clearParams = {};
      const keys = Object.keys(this.data.parameters);
      keys.forEach(k => clearParams[k] = undefined);
      return clearParams;
    },

    extractDynamicRoutes: function (routesPath) {
      return routesPath.map(function (route) {
        const paramsNames = [];

        // Find all the parameters names in the route
        let match = SimpleRouter.PARAMETER_REGEXP.exec(route);
        while (match) {
          paramsNames.push(match[1]);
          match = SimpleRouter.PARAMETER_REGEXP.exec(route);
        }

        if (paramsNames.length) {
          return {
            id: route,
            paramNames: paramsNames,
            paramFinderExpression: new RegExp(route.replace(SimpleRouter.PARAMETER_REGEXP, SimpleRouter.REPLACE_VARIABLE_REGEXP))
          };
        }

        return null;
      }).filter(Boolean);
    },

    createParamValueMap: function (names, values) {
      const params = {};
      names.forEach(function (name, i) {
        params[name] = values[i];
      });

      return params;
    },

    detect: function () {
      const hash = window.location.pathname || '/';
      if (hash.indexOf(this.root) === 0) {
        if (hash !== this.oldURL) {
          this.oldURL = hash;
          this.callMatchRoute(this.routes, hash, {});
        }
      }
    },

    getURLParts: function () {
      return this.oldURL.split('/').slice(1);
    },

    destroy: function () {
      if (this.parentRoute) {
        this.parentRoute.children = [];
      }
      window.removeEventListener('popstate', this.listener);
    }
  };

  G.registerAddOnProvider('galaxy/router', function (scope, module) {
    return {
      create: function () {
        const router = new SimpleRouter(scope, module);
        if (module.systemId !== 'system') {
          scope.on('module.destroy', () => router.destroy());
        }

        scope.router = router.data;

        return router;
      },
      start: function () { }
    };
  });

  G.Router = SimpleRouter;

})(Galaxy);

/* global Galaxy */
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
      start: function () {
      }
    };
  });
})(Galaxy);
