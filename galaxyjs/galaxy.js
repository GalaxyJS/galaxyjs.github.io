/* global Galaxy, Promise */

(function (root) {
  root.Galaxy = new Core();

  /** The main class of the GalaxyJS. window.galaxy is an instance of this class.
   *
   * @returns {Galaxy.GalaxySystem}
   */
  Galaxy.GalaxyCore = Core;

  var importedLibraries = {};

  function Core () {
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
      var obj = arguments[ i ];

      if (!obj)
        continue;

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[ key ] instanceof Array)
            out[ key ] = this.extend(out[ key ] || [], obj[ key ]);
          else if (typeof obj[ key ] === 'object' && obj[ key ] !== null)
            out[ key ] = this.extend(out[ key ] || {}, obj[ key ]);
          else
            out[ key ] = obj[ key ];
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
        // Start galaxy
        // _this.app = _this.bootModule.addOns[ 'galaxy/scope-state' ] || _this.app;
      });
    });

    return promise;
  };

  Core.prototype.convertToURIString = function (obj, prefix) {
    var _this = this;
    var str = [], p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + '[' + p + ']' : p, v = obj[ p ];
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

      root.Galaxy.onModuleLoaded[ module.systemId ] = resolve;
      var moduleExist = Galaxy.modules[ module.systemId ];

      var invokers = [ module.url ];
      if (module.invokers) {
        if (module.invokers.indexOf(module.url) !== -1) {
          throw new Error('circular dependencies: \n' + module.invokers.join('\n') + '\nwanna load: ' + module.url);
        }

        invokers = module.invokers;
        invokers.push(module.url);
      }

      if (moduleExist) {
        var ol = Galaxy.onModuleLoaded[ module.systemId ];
        if ('function' === typeof (ol)) {
          ol(moduleExist);
          delete Galaxy.onModuleLoaded[ module.systemId ];
        }

        return;
      }

      if (Galaxy.onLoadQueue[ module.systemId ]) {
        return;
      }

      Galaxy.onLoadQueue[ module.systemId ] = true;

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
          url: query[ query.length - 1 ],
          fresh: query.indexOf('new') !== -1
        });

        return 'Scope.imports[\'' + query[ query.length - 1 ] + '\']';
      });

      var scope = new Galaxy.GalaxyScope(moduleMetaData,
        moduleMetaData.parentScope ? moduleMetaData.parentScope.element || _this.rootElement : _this.rootElement);
      var view = new Galaxy.GalaxyView(scope);
      // Create module from moduleMetaData
      var module = new Galaxy.GalaxyModule(moduleMetaData, moduleContent, scope, view);
      Galaxy.modules[ module.systemId ] = module;

      if (imports.length) {
        var importsCopy = imports.slice(0);
        imports.forEach(function (item) {
          var moduleAddOnProvider = Galaxy.getModuleAddOnProvider(item.url);
          if (moduleAddOnProvider) {
            var providerStages = moduleAddOnProvider.handler.call(null, scope, module);
            var addOnInstance = providerStages.pre();
            importedLibraries[ item.url ] = {
              name: item.url,
              module: addOnInstance
            };

            module.registerAddOn(item.url, addOnInstance);
            module.addOnProviders.push(providerStages);

            doneImporting(module, importsCopy);
          } else if (importedLibraries[ item.url ] && !item.fresh) {
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
        var asset = importedLibraries[ item ];
        if (asset.module) {
          module.scope.imports[ asset.name ] = asset.module;
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

    if (!importedLibraries[ module.url ]) {
      importedLibraries[ module.url ] = {
        name: module.name || module.url,
        module: module.scope.export
      };
    } else if (module.fresh) {
      importedLibraries[ module.url ].module = module.scope.export;
    } else {
      module.scope.imports[ module.name ] = importedLibraries[ module.url ].module;
    }

    var currentModule = Galaxy.modules[ module.systemId ];
    if (module.temporary || module.scope._doNotRegister) {
      delete module.scope._doNotRegister;
      currentModule = {
        id: module.id,
        scope: module.scope
      };
    }

    if ('function' === typeof (Galaxy.onModuleLoaded[ module.systemId ])) {
      Galaxy.onModuleLoaded[ module.systemId ](currentModule);
      delete Galaxy.onModuleLoaded[ module.systemId ];
    }

    delete Galaxy.onLoadQueue[ module.systemId ];
  };

  Core.prototype.getModuleAddOnProvider = function (name) {
    return this.addOnProviders.filter(function (service) {
      return service.name === name;
    })[ 0 ];
  };

  Core.prototype.getModulesByAddOnId = function (addOnId) {
    var modules = [];
    var module;

    for (var moduleId in this.modules) {
      module = this.modules[ moduleId ];
      if (this.modules.hasOwnProperty(moduleId) && module.addOns.hasOwnProperty(addOnId)) {
        modules.push({
          addOn: module.addOns[ addOnId ],
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

/* global Galaxy */

(function () {
  /**
   *
   * @returns {Galaxy.GalaxyModule}
   */
  Galaxy.GalaxyModule = GalaxyModule;

  /**
   *
   * @param {Object} module
   * @param {Galaxy.GalaxyScope} scope
   * @constructor
   */
  function GalaxyModule (module, source, scope, view) {
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
}());

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

/* global Galaxy */

(function () {
  /**
   *
   * @returns {Galaxy.GalaxyScope}
   */
  Galaxy.GalaxyScope = GalaxyScope;

  function GalaxyScope (module, element) {
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
    Galaxy.load(module, onDone);
  };

  GalaxyScope.prototype.loadModuleInto = function (module, view) {
    if (module.url.indexOf('./') === 0) {
      module.url = this.path + module.url.substr(2);
    }

    this.load(module, function (module) {
      Galaxy.ui.setContent(view, module.scope.html);

      module.start();
    });
  };

}());

/* global Galaxy */

(function () {

  function BoundProperty (view) {
    this.view = view;
    this.hosts = [];
    this.value = null;
  }

  BoundProperty.prototype.setValue = function (attributeName, value) {
    var _this = this;
    _this.hosts.forEach(function (node) {
      if (_this.view.mutator[ attributeName ]) {
        _this.view.root.setPropertyForNode(node, attributeName, _this.view.mutator[ attributeName ].call(node, value));
      } else {
        _this.view.root.setPropertyForNode(node, attributeName, value);
      }
    });
  };

  /**
   *
   * @returns {Galaxy.GalaxyView}
   */
  Galaxy.GalaxyView = GalaxyView;

  /**
   *
   * @param {Galaxy.GalaxyScope} scope
   * @constructor
   */
  function GalaxyView (scope) {
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
  GalaxyView.prototype.append = function (nodeSchema, nodeScopeData, parentNode, n2) {
    var _this = this;
    if (nodeSchema instanceof Array) {
      nodeSchema.forEach(function (nodeSchema) {
        _this.append(nodeSchema, nodeScopeData, parentNode);
      });
    } else if (nodeSchema !== null && typeof(nodeSchema) === 'object') {
      var node = document.createElement(nodeSchema.t || 'div');
      var nodePlaceholder = document.createComment(node.tagName);
      node.__galaxyView__ = {
        root: _this,
        scope: {},
        mutator: {},
        node: node,
        nodeSchema: nodeSchema,
        _template: false,
        toTemplate: function () {
          this.placeholder.nodeValue = JSON.stringify(this.nodeSchema, null, 2);
          this._template = true;
        },
        placeholder: nodePlaceholder,
        _hosts: [],
        addHost: function (item) {
          this._hosts.push(item);
        },
        _inDOM: true,
        setInDOM: function (flag) {
          this._inDOM = flag;
          if (flag && !node.parentNode && !this._template) {
            node.__galaxyView__.placeholder.parentNode.insertBefore(node, node.__galaxyView__.placeholder.nextSibling);
          } else if (!flag && node.parentNode) {
            node.parentNode.removeChild(node);
          }
        },
        destroy: function () {
          if (this._inDOM) {
            node.parentNode.removeChild(this.placeholder);
            node.parentNode.removeChild(node);
          } else {
            this.placeholder.parentNode.removeChild(this.placeholder);
          }

          var nodeIndexInTheHost = -1;
          this._hosts.forEach(function (host) {
            nodeIndexInTheHost = host.indexOf(node);
            if (nodeIndexInTheHost !== -1) {
              host.splice(nodeIndexInTheHost, 1);
            }
          });

          this._hosts = [];
        }
      };

      parentNode.appendChild(node.__galaxyView__.placeholder);

      if (!node.__galaxyView__.hasOwnProperty('reactive')) {
        Object.defineProperty(node.__galaxyView__, 'reactive', {
          enumerable: true,
          configurable: false,
          value: {}
        });
      }

      var parentScopeData = nodeScopeData;

      if (nodeSchema[ 'mutator' ]) {
        node.__galaxyView__.mutator = nodeSchema[ 'mutator' ];
      }

      if (nodeSchema[ 'reactive' ]) {
        parentScopeData = _this.addReactiveBehaviors(node, nodeSchema, nodeScopeData, nodeSchema[ 'reactive' ]);
      }

      for (var attributeName in nodeSchema) {
        if (attributeName === 'reactive') {
          continue;
        }

        var attributeValue = nodeSchema[ attributeName ];
        var bind = null;

        switch (typeof(attributeValue)) {
          case 'string':
            bind = attributeValue.match(/^\[\s*([^\[\]]*)\s*\]$/);
            break;
          case 'function':
            bind = [ 0, attributeValue ];
            break;
          default:
            bind = null;
        }

        if (bind) {
          _this.makeBinding(node, nodeScopeData, attributeName, bind[ 1 ]);
        } else {
          _this.setPropertyForNode(node, attributeName, decodeURI(attributeValue));
        }
      }

      if (!node.__galaxyView__._template) {
        if (node.__galaxyView__._inDOM) {
          parentNode.appendChild(node);
        }

        _this.append(nodeSchema.children, parentScopeData, node);
      }

      return node;
    }
  };

  GalaxyView.prototype.addReactiveBehaviors = function (node, nodeSchema, nodeScopeData, behaviors) {
    var allScopeData = Object.assign({}, nodeScopeData);

    for (var key in behaviors) {
      var behavior = GalaxyView.REACTIVE_BEHAVIORS[ key ];

      if (behavior) {
        node.__galaxyView__.scope[ key ] = allScopeData;
        var value = behaviors[ key ];
        var matches = behavior.regex ? value.match(behavior.regex) : value;

        node.__galaxyView__.reactive[ key ] = (function (BEHAVIOR, MATCHES, BEHAVIOR_SCOPE_DATA) {
          return function (_galaxyView, _value) {
            return BEHAVIOR.onApply.call(this, _galaxyView, _value, MATCHES, BEHAVIOR_SCOPE_DATA);
          };
        })(behavior, matches, allScopeData);

        behavior.bind.call(this, node.__galaxyView__, nodeScopeData, matches);
      }
    }

    return allScopeData;
  };

  GalaxyView.prototype.setPropertyForNode = function (node, attributeName, value) {
    if (attributeName.indexOf('reactive_') === 0) {
      var reactiveBehaviorName = attributeName.substring(9);
      if (node.__galaxyView__.reactive[ reactiveBehaviorName ]) {
        node.__galaxyView__.reactive[ reactiveBehaviorName ].call(this, node.__galaxyView__, value);
      }

      return;
    }

    var property = GalaxyView.NODE_SCHEMA_PROPERTY_MAP[ attributeName ];
    if (!property) {
      return;
    }

    value = property.parser ? property.parser(value) : value;

    switch (property.type) {
      case 'attr':
        node.setAttribute(attributeName, value);
        break;

      case 'prop':
        node[ property.name ] = value;
        break;
    }
  };

  GalaxyView.prototype.makeBinding = function (node, dataHostObject, attributeName, propertyValue) {
    var _this = this;

    if (typeof dataHostObject !== 'object') {
      return;
    }

    var propertyName = propertyValue;
    var childProperty = null;

    if (typeof propertyValue === 'function') {
      propertyName = '[mutator]';
      dataHostObject[ propertyName ] = dataHostObject[ propertyName ] || [];
      dataHostObject[ propertyName ].push({
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

    var referenceName = '[' + propertyName + ']';
    if (!dataHostObject.hasOwnProperty(referenceName)) {
      Object.defineProperty(dataHostObject, referenceName, {
        enumerable: false,
        configurable: false,
        value: new BoundProperty(node.__galaxyView__)
      });
    }

    var initValue = dataHostObject[ propertyName ];

    // if (!dataHostObject[ referenceName ]) {
    var enumerable = true;

    if (propertyName === 'length' && dataHostObject instanceof Array) {
      propertyName = '_length';
      enumerable = false;
    }

    Object.defineProperty(dataHostObject, propertyName, {
      get: function () {
        return dataHostObject[ referenceName ].value;
      },
      set: function (newValue) {
        if (dataHostObject[ referenceName ].value !== newValue) {
          _this.setValueFor(dataHostObject, attributeName, propertyName, newValue);
        }

        dataHostObject[ referenceName ].value = newValue;
      },
      enumerable: enumerable,
      configurable: true
    });

    // }

    if (dataHostObject[ referenceName ]) {
      if (dataHostObject[ referenceName ].hosts.indexOf(node) === -1 && !childProperty) {
        dataHostObject[ referenceName ].hosts.push(node);
        node.__galaxyView__.addHost(dataHostObject[ referenceName ].hosts);
        // node.__galaxyView__.binds = dataHostObject._binds[ propertyName ];
      }

      // if (typeof(initValue) !== 'undefined') {
      //   dataHostObject[ propertyName ] = initValue;
      // }
      dataHostObject[ referenceName ].value = initValue;
    }

    if (childProperty) {
      _this.makeBinding(node, dataHostObject[ propertyName ] || {}, attributeName, childProperty);
    } else if (typeof dataHostObject === 'object') {
      _this.setValueFor(dataHostObject, attributeName, propertyName, initValue);
    }
  };

  GalaxyView.prototype.setValueFor = function (hostObject, attributeName, propertyName, value) {
    if (value instanceof Array) {
      this.setArrayValue(hostObject, attributeName, propertyName, value);
    } else {
      this.setSingleValue(hostObject, attributeName, propertyName, value);
    }
  };

  GalaxyView.prototype.setSingleValue = function (hostObject, attributeName, propertyName, value) {
    var boundProperty = hostObject[ '[' + propertyName + ']' ];
    if (boundProperty) {
      boundProperty.setValue(attributeName, value);
    }
  };

  GalaxyView.prototype.setArrayValue = function (hostObject, attributeName, propertyName, value) {
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

    var throttle = null;

    var boundProperty = hostObject[ '[' + propertyName + ']' ];

    methods.forEach(function (method) {
      var original = arrayProto[ method ];
      Object.defineProperty(value, method, {
        value: function () {
          var arr = this;
          var i = arguments.length;
          var args = new Array(i);
          while (i--) {
            args[ i ] = arguments[ i ];
          }
          var result = original.apply(this, args);

          clearTimeout(throttle);
          throttle = setTimeout(function () {
            if (arr.hasOwnProperty('_length')) {
              arr._length = arr.length;
            }

            boundProperty.setValue(attributeName, value);
          }, 0);

          return result;
        },
        writable: true,
        configurable: true
      });
    });

    boundProperty.setValue(attributeName, value);

  };
}());

/* global Galaxy */

(function () {
  Galaxy.GalaxyView.REACTIVE_BEHAVIORS[ 'for' ] = {
    regex: /^([\w]*)\s+in\s+([^\s\n]+)$/,
    bind: function (galaxyView, nodeScopeData, matches) {
      galaxyView.toTemplate();
      this.makeBinding(galaxyView.node, nodeScopeData, 'reactive_for', matches[ 2 ]);
    },
    onApply: function (galaxyView, value, matches, nodeScopeData) {
      var oldItems = galaxyView.forItems || [];
      var newItems = [];
      oldItems.forEach(function (node) {
        node.__galaxyView__.destroy();
      });

      // var newNodeSchema2 = JSON.parse(JSON.stringify(galaxyView.nodeSchema));
      var newNodeSchema = Galaxy.extend({}, galaxyView.nodeSchema);


      delete newNodeSchema.reactive.for;
      var parentNode = galaxyView.placeholder.parentNode;

      for (var index in value) {
        var itemDataScope = Object.assign({}, nodeScopeData);
        itemDataScope[ matches[ 1 ] ] = value[ index ];
        newItems.push(this.append(newNodeSchema, itemDataScope, parentNode));
      }

      galaxyView.forItems = newItems;
    }
  };
})();


/* global Galaxy */

(function () {

  Galaxy.GalaxyView.REACTIVE_BEHAVIORS[ 'if' ] = {
    regex: null,
    bind: function (galaxyView, nodeScopeData, matches) {
      this.makeBinding(galaxyView.node, nodeScopeData, 'reactive_if', matches);
    },
    onApply: function (galaxyView, value) {
      if (value) {
        galaxyView.setInDOM(true);
      } else {
        galaxyView.setInDOM(false);
      }
    }
  };
})();


/* global Galaxy */

(function () {
  /**
   *
   * @returns {Galaxy.GalaxyView.ReactiveBehavior}
   */
  Galaxy.GalaxyView.ReactiveBehavior = ReactiveBehavior;

  function ReactiveBehavior (node, schema, scopeData, matches) {
    this.node = node;
    this.schema = schema;
    this.scopeData = scopeData;
    this.matches = matches;
  }
});
