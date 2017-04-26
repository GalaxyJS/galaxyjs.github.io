/* global Galaxy, Node */

(function (root) {

  root.Galaxy = new System();

  /** The main class of the GalaxyJS. window.galaxy is an instance of this class.
   *
   * @returns {Galaxy.GalaxySystem}
   */
  Galaxy.GalaxySystem = System;

  var importedLibraries = {};

  /**
   *
   * @constructor
   */
  function System () {
    this.stateKey = '#';
    this.bootModule = null;
    this.modules = {};
    this.onLoadQueue = [];
    this.notYetStarted = [];
    this.onModuleLoaded = {};
    this.modulesHashes = {};
    this.hashChecker = null;
    this.firstTime = false;
    this.addOnProviders = [];
    this.inited = false;
    this.app = null;
  }

  System.prototype.on = function (id, handler) {
    this.app.on.call(this.app, id, handler);
  };

  System.prototype.start = function () {
    var _this = this;

    if (!_this.inited) {
      throw new Error('Galaxy is not initialized');
    }

    var detect = function () {
      if (_this.app.oldHash !== window.location.hash || _this.app.newListenerAdded) {
        var oldParsedHash = _this.parseHash(_this.app.oldHash);
        var parsedHash = _this.parseHash(window.location.hash);

        _this.setModuleHashValue(parsedHash.navigation, parsedHash.params, parsedHash.hash);
        // If the user changes only the app(#) parameter in the url, 
        // then the old hash of the requested module would be considered instead of the value of the url
        // if user make more changes, then the old hash of the requested module will be ignored and url value will be taken
        if (oldParsedHash.params[ '#' ] !== parsedHash.params[ '#' ]) {
          var temp = Galaxy.utility.clone(parsedHash.params);
          delete oldParsedHash.params[ '#' ];
          delete temp[ '#' ];

          if (JSON.stringify(temp) === JSON.stringify(oldParsedHash.params) && JSON.stringify(temp) !== '{}') {
            return Galaxy.app.setParam('#', parsedHash.params[ '#' ]);
          } else {
            Galaxy.modulesHashes[ parsedHash.params[ '#' ] ] = parsedHash.hash;
          }
        }

        _this.app.hashChanged(parsedHash.navigation, parsedHash.params, parsedHash.hash, parsedHash.navigation[ _this.app.stateKey ]); // Galaxy
        _this.app.oldHash = parsedHash.hash;
        _this.app.newListenerAdded = false;
      }
    };

    detect();
    clearInterval(this.hashChecker);
    this.hashChecker = setInterval(function () {
      detect();
    }, 50);
  };

  System.prototype.setModuleHashValue = function (navigation, parameters, hashValue, init) {
    var nav = parameters[ '#' ];

    if (!nav) {
      return hashValue;
    }

    if (Galaxy.modulesHashes[ nav ] && Galaxy.app.activeModule !== Galaxy.modules[ 'system/' + nav ] &&
      Galaxy.app.activeModule && Galaxy.app.activeModule.stateKey === '#') {
      return Galaxy.modulesHashes[ nav ];
      // When the navigation path is changed
    } else if (!this.firstTime) {
      // first time indicates that the page is (re)loaded and the window.location.hash should be set
      // as the module hash value for the module which is specified by app parameter in the hash value.
      // Other modules get default hash value
      Galaxy.modulesHashes[ nav ] = hashValue;
      this.firstTime = true;
      return Galaxy.modulesHashes[ nav ];
    } else if (!Galaxy.modulesHashes[ nav ]) {
      // When the module does not exist 
      Galaxy.modulesHashes[ nav ] = '#' + nav;
      return Galaxy.modulesHashes[ nav ];
    } else if (Galaxy.modulesHashes[ nav ]) {
      // When the hash parameters value is changed from the browser url bar or originated from url bar
      Galaxy.modulesHashes[ nav ] = hashValue;
    }
    return hashValue;
  };

  System.prototype.parseHash = function (hash) {
    var navigation = {};
    var params = {};
    var paramters = hash.replace(/^#([^&]*)\/?/igm, function (m, v) {
      navigation[ '#' ] = v.split('/').filter(Boolean);
      params[ '#' ] = v;
      return '';
    });

    paramters.replace(/([^&]*)=([^&]*)/g, function (m, k, v) {
      navigation[ k ] = v.split('/').filter(Boolean);
      params[ k ] = v;
    });

    return {
      hash: hash,
      navigation: navigation,
      params: params
    };
  };

  var CONTENT_PARSERS = {};

  CONTENT_PARSERS[ 'text/html' ] = function (content) {
    var scripts = [];
    var imports = [];

    var raw = Galaxy.utility.parseHTML(content);
    //var scripts = raw.filter("script").remove();
    var html = raw.filter(function (e) {
      if (e.nodeType === Node.ELEMENT_NODE) {
        var scriptTags = Array.prototype.slice.call(e.querySelectorAll('script'));

        scriptTags.forEach(function (tag) {
          scripts.push(tag.innerHTML);
          tag.parentNode.removeChild(tag);
        });
      }

      if (e.tagName && e.tagName.toLowerCase() === 'script') {
        scripts.push(e.innerHTML);
        return false;
      }

      if (e.tagName && e.tagName.toLowerCase() === 'import') {
        imports.push({
          name: e.getAttribute('name'),
          from: e.getAttribute('from'),
          fresh: e.hasAttribute('fresh')
        });

        return false;
      }

      return true;
    });

    var temp = document.createElement('div');
    for (var i = 0, len = html.length; i < len; i++) {
      html[ i ] = temp.appendChild(html[ i ]);
    }
    document.getElementsByTagName('body')[ 0 ].appendChild(temp);
    var uiView = temp.querySelectorAll('ui-view-outlet,[ui-view]');
    temp.parentNode.removeChild(temp);

    return {
      html: html,
      imports: imports,
      views: uiView,
      script: scripts.join('\n')
    };
  };

  var javascriptParser = function (content) {
    return {
      html: [],
      imports: [],
      views: [],
      script: content
    };
  };

  CONTENT_PARSERS[ 'text/javascript' ] = javascriptParser;
  CONTENT_PARSERS[ 'application/javascript' ] = javascriptParser;

  System.prototype.parseModuleContent = function (module, content, contentType) {
    var parser = CONTENT_PARSERS[ contentType.toLowerCase() ];
    if (parser) {
      return parser(content);
    } else {
      console.error('Resource is not a valid html file:', module.url, contentType);

      return {
        html: [],
        imports: [],
        views: [],
        script: ''
      };
    }
  };

  System.prototype.uiViewDecorator = function (node) {
    return node;
  };

  System.prototype.compileModuleContent = function (module, moduleContent, invokers, onDone) {
    var _this = this;
    var scopeUIViews = {};
    Array.prototype.forEach.call(moduleContent.views, function (node, i) {

      scopeUIViews[ node.getAttribute('ui-view') || node.getAttribute('name') ||
      'view_' + i ] = _this.uiViewDecorator(node);
    });

    var scope = new Galaxy.GalaxyScope(module, moduleContent.html, scopeUIViews);
    module = new Galaxy.GalaxyModule(module, scope);
    Galaxy.modules[ module.systemId ] = module;
    module.addOnProviders = [];

    var imports = Array.prototype.slice.call(moduleContent.imports, 0);
    var scriptContent = moduleContent.script || '';

    // extract imports from the source code
    scriptContent = scriptContent.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
    moduleContent.script = scriptContent.replace(/Scope\.import\(['|"](.*)['|"]\)\;/gm, function (match, path) {
      var query = path.match(/([\S]+)/gm);
      imports.push({
        url: query[ query.length - 1 ],
        fresh: query.indexOf('new') !== -1
      });

      return 'Scope.imports[\'' + query[ query.length - 1 ] + '\']';
    });

    if (imports.length) {
      var importsCopy = imports.slice(0);
      imports.forEach(function (item, i) {
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

          doneImporting(module, scope, importsCopy, moduleContent);
        } else if (importedLibraries[ item.url ] && !item.fresh) {
          doneImporting(module, scope, importsCopy, moduleContent);
        } else {
          Galaxy.load({
            name: item.name,
            url: item.url,
            fresh: item.fresh,
            parentScope: scope,
            invokers: invokers,
            temporary: true
          }, function (loaded) {
            doneImporting(module, scope, importsCopy, moduleContent);
          });
        }
      });

      return false;
    }

    onDone(module, scope, moduleContent);

    function doneImporting (module, scope, imports, moduleContent) {
      imports.splice(imports.indexOf(module.url) - 1, 1);

      if (imports.length === 0) {
        // This will load the original initilizer
        onDone(module, scope, moduleContent);
      }
    }
  };

  System.prototype.load = function (module, onDone) {
    var _this = this;
    module.id = module.id || 'noid-' + (new Date()).valueOf() + '-' + Math.round(performance.now());
    module.systemId = module.parentScope ? module.parentScope.systemId + '/' + module.id : module.id;

    Galaxy.onModuleLoaded[ module.systemId ] = onDone;
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
        window.requestAnimationFrame(function () {
          ol.call(_this, moduleExist, moduleExist.scope.html);
          delete Galaxy.onModuleLoaded[ module.systemId ];
        });
      }

      return;
    }

    if (Galaxy.onLoadQueue[ module.systemId ]) {
      return;
    }

    Galaxy.onLoadQueue[ module.systemId ] = true;

    fetch(module.url + '?' + Galaxy.utility.serialize(module.params || {})).then(function (response) {
      var contentType = response.headers.get('content-type').split(';')[ 0 ] || 'text/html';
      response.text().then(function (htmlText) {
        var parsedContent = _this.parseModuleContent(module, htmlText, contentType);
        window.requestAnimationFrame(function () {
          _this.compileModuleContent(module, parsedContent, invokers, moduleLoaded);
        });
      });
    });

    function moduleLoaded (module, scope, filtered) {
      for (var item in importedLibraries) {
        if (importedLibraries.hasOwnProperty(item)) {
          var asset = importedLibraries[ item ];
          if (asset.module) {
            scope.imports[ asset.name ] = asset.module;
          }
        }
      }

      var html = document.createDocumentFragment();

      scope.html.forEach(function (item) {
        html.appendChild(item);
      });

      scope.html = html;
      html._scope = scope;
      var currentComponentScripts = filtered.script;
      delete filtered.script;

      module.scope = scope;

      var componentScript = new Function('Scope', currentComponentScripts);
      componentScript.call(null, scope);

      module.addOnProviders.forEach(function (item) {
        item.post();
      });

      delete module.addOnProviders;

      var htmlNodes = [];
      for (var i = 0, len = html.childNodes.length; i < len; i++) {
        htmlNodes.push(html.childNodes[ i ]);
      }

      scope.html = htmlNodes;
      if (!importedLibraries[ module.url ]) {
        importedLibraries[ module.url ] = {
          name: module.name || module.url,
          module: scope.export
        };
      } else if (module.fresh) {
        importedLibraries[ module.url ].module = scope.export;
      } else {
        scope.imports[ module.name ] = importedLibraries[ module.url ].module;
      }

      var currentModule = Galaxy.modules[ module.systemId ];
      if (module.temporary || scope._doNotRegister) {
        delete scope._doNotRegister;
        currentModule = {
          id: module.id,
          scope: scope
        };
      }

      if ('function' === typeof (Galaxy.onModuleLoaded[ module.systemId ])) {
        Galaxy.onModuleLoaded[ module.systemId ].call(this, currentModule, scope.html);
        delete Galaxy.onModuleLoaded[ module.systemId ];
      }

      delete Galaxy.onLoadQueue[ module.systemId ];
    }
  };

  System.prototype.setURLHash = function (hash) {
    hash = hash.replace(/^#\/?/igm, '');
    var navigation = {};
    var params = {};
    hash.replace(/([^&]*)=([^&]*)/g, function (m, k, v) {
      navigation[ k ] = v.split('/').filter(Boolean);
      params[ k ] = v;
    });

  };

  System.prototype.getHashParam = function (key, hashName) {
    var asNumber = parseFloat(this.app.params[ key ]);
    return asNumber || this.app.params[ key ] || null;
  };

  System.prototype.getHashNav = function (key, hashName) {
    return this.app.navigation[ key ] || [];
  };

  /** Set parameters for app/nav. if app/nav was not in parameters, then set paraters for current app/nav
   *
   * @param {Object} parameters
   * @param {Boolean} replace if true it overwrites last url history otherwise it create new url history
   * @param {Boolean} clean clean all the existing parameters
   * @returns {undefined}
   */
  System.prototype.setHashParameters = function (parameters, replace, clean) {
    var newParams = Galaxy.utility.clone(parameters);
    this.lastHashParams = parameters;
    var hashValue = window.location.hash;
    var nav = parameters[ '#' ];

    if (nav && !Galaxy.modulesHashes[ nav ]) {
      Galaxy.modulesHashes[ nav ] = hashValue = '#' + nav;

    } else if (nav && Galaxy.modulesHashes[ nav ]) {
      hashValue = Galaxy.modulesHashes[ nav ];

    }

    var newHash = '';
    hashValue = hashValue.replace(/^#([^&]*)\/?/igm, function (m, v) {
      if (newParams[ '#' ] !== null && typeof newParams[ '#' ] !== 'undefined') {
        newHash += '#' + newParams[ '#' ] + '&';

        delete newParams[ '#' ];
      } else if (!newParams.hasOwnProperty('#') && !clean) {
        newHash += '#' + v + '&';
      }
    });

    hashValue.replace(/([^&]*)=([^&]*)/g, function (m, k, v) {
      if (newParams[ k ] !== null && typeof newParams[ k ] !== 'undefined') {
        newHash += k + '=' + newParams[ k ];
        newHash += '&';

        delete newParams[ k ];
      } else if (!newParams.hasOwnProperty(k) && !clean) {
        newHash += k + '=' + v;
        newHash += '&';
      }
    });

    for (var key in newParams) {
      if (newParams.hasOwnProperty(key)) {
        var value = newParams[ key ];
        if (key && value) {
          newHash += key + '=' + value + '&';
        }
      }
    }

    newHash = newHash.replace(/\&$/, '');

    if (replace) {
      window.location.replace(('' + window.location).split('#')[ 0 ] + newHash);
    } else {
      window.location.hash = newHash.replace(/\&$/, '');
    }
  };

  System.prototype.setParamIfNull = function (param, value) {
    this.app.setParamIfNull(param, value);
  };

  System.prototype.getModuleAddOnProvider = function (name) {
    return this.addOnProviders.filter(function (service) {
      return service.name === name;
    })[ 0 ];
  };

  System.prototype.getModulesByAddOnId = function (addOnId) {
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

  System.prototype.registerAddOnProvider = function (name, handler) {
    if (typeof handler !== 'function') {
      throw 'Addon provider should be a function';
    }

    this.addOnProviders.push({
      name: name,
      handler: handler
    });
  };

  System.prototype.init = function (mods) {
    if (this.inited) {
      throw new Error('Galaxy is initialized already');
    }

    this.bootModule = new Galaxy.GalaxyModule({
      id: 'system',
      systemId: 'system',
      domain: this
    }, null);

    this.app = new Galaxy.GalaxyStateHandler(this.bootModule);
    this.app.oldHash = window.location.hash;
    this.app.params = this.parseHash(window.location.hash).params;
    this.app.init(mods);
    this.app.started = true;
    this.app.active = true;
    this.inited = true;
  };

  System.prototype.boot = function (bootModule, onDone) {
    var _this = this;
    _this.init();

    bootModule.domain = this;
    bootModule.id = 'system';

    _this.load(bootModule, function (module) {
      // Replace galaxy temporary  bootModule with user specified bootModule
      _this.bootModule = module;
      onDone.call(null, module);
      // Start galaxy
      _this.start();
      _this.app = _this.bootModule.addOns[ 'galaxy/scope-state' ] || _this.app;
    });
  };

}(this));


/* global Galaxy, TweenLite, Node */

(function (galaxy) {
  galaxy.GalaxyUI = GalaxyUI;
  galaxy.ui = new galaxy.GalaxyUI();

  function GalaxyUI () {
  }

  GalaxyUI.prototype.setContent = function (parent, nodes) {
    var parentNode = parent;
    if (typeof parent === 'string') {
      parentNode = document.querySelector(parent);
    }

    if (!parentNode) {
      throw new Error('parent element can not be null: ' + parent +
        '\r\n try to set ui-view on your target element and reference it via Scope.views');
    }

    if (!nodes.hasOwnProperty('length')) {
      nodes = [ nodes ];
    }

    var item = null, i = 0, len = 0;
    var children = [];
    var tweens = [];
    if (parentNode.tagName.toLowerCase() === 'ui-view-outlet' && parentNode.parentNode) {
      children = parentNode.childNodesReferences || [];
      children.forEach(function (child) {
        if (nodes.indexOf(child) !== -1) {
          return;
        }

        tweens = TweenLite.getTweensOf(child);
        tweens.forEach(function (item) {
          item.progress(1);
        });

        if (child.parentNode) {
          parentNode.parentNode.removeChild(child);
        }
      });

      parentNode.childNodesReferences = nodes;
      var next = parentNode.nextSibling;
      for (i = 0, len = nodes.length; i < len; i++) {
        item = nodes[ i ];
        parentNode.parentNode.insertBefore(item, next);
        next = item.nextSibling;
      }
    } else {
      children = Array.prototype.slice.call(parentNode.childNodes);

      children.forEach(function (child) {
        if (nodes.indexOf(child) !== -1) {
          return;
        }

        tweens = TweenLite.getTweensOf(child);
        tweens.forEach(function (item) {
          item.progress(1);
        });

        parentNode.removeChild(child);
      });

      for (i = 0, len = nodes.length; i < len; i++) {
        item = nodes[ i ];
        parentNode.appendChild(item);
      }
    }
  };

  GalaxyUI.prototype.clone = function (obj) {
    var target = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        target[ i ] = obj[ i ];
      }
    }
    return target;
  };

  GalaxyUI.prototype.getCenterPoint = function (rect) {
    // var pos = document.activeElement.getBoundingClientRect();
    return {
      left: rect.left + (rect.width / 2),
      top: rect.top + (rect.height / 2)
    };
  };

  // ------ utility ------ //

  GalaxyUI.prototype.utility = {
    layoutPositions: [
      'fixed',
      'absolute',
      'relative'
    ]
  };

  GalaxyUI.prototype.utility.toTreeObject = function (element) {
    var jsTree = {
      _: element,
      _children: []
    };
    var indexIndicator = {};
    for (var index in element.childNodes) {
      var node = element.childNodes[ index ];

      if (node.nodeType === Node.ELEMENT_NODE) {
        var key = node.nodeName.toLowerCase();
        if (indexIndicator[ key ]) {
          indexIndicator[ key ]++;
          jsTree[ key + '_' + indexIndicator[ key ] ] = galaxy.ui.utility.toTreeObject(node);
        } else {
          indexIndicator[ key ] = 1;
          jsTree[ node.nodeName.toLowerCase() ] = galaxy.ui.utility.toTreeObject(node);
        }

        jsTree._children.push(node);
      }
    }

    return jsTree;
  };

  GalaxyUI.prototype.utility.getContentHeight = function (element, withPaddings) {
    var height = 0;
    var children = element.children;
    var elementCSS = window.getComputedStyle(element, null);

    if (GalaxyUI.prototype.utility.layoutPositions.indexOf(elementCSS.position) === -1) {
      element.style.position = 'relative';
    }

    for (var index = 0, length = children.length; index < length; index++) {
      if (children[ index ].__ui_neutral) {
        continue;
      }

      var cs = window.getComputedStyle(children[ index ], null);

      if (cs.position === 'absolute') {
        continue;
      }

      var dimension = children[ index ].offsetTop + children[ index ].offsetHeight;
      var marginBottom = parseInt(cs.marginBottom || 0);

      height = dimension + marginBottom > height ? dimension + marginBottom : height;
    }

    if (withPaddings) {
      height += parseInt(window.getComputedStyle(element).paddingBottom || 0);
    }

    element.style.position = '';

    return height;
  };

  GalaxyUI.prototype.utility.findParent = function (node, name) {
    var parent = node.parentNode;
    if (parent) {
      if (parent.nodeName.toUpperCase() === name.toUpperCase()) {
        return parent;
      }

      return GalaxyUI.prototype.utility.findParent(parent, name);
    }

    return null;
  };

  // ------ animations ------ //
  GalaxyUI.prototype.animations = {};
}(Galaxy));

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
  function GalaxyModule(module, scope) {
    this.id = module.id;
    this.systemId = module.systemId;
    this.url = module.url || null;
    this.addOns = module.addOns || {};
    this.domain = module.domain;
    this.scope = scope;
  }

  GalaxyModule.prototype.init = function () {
    for (var key in this.addOns) {
      var addOn = this.addOns[key];
      if (typeof addOn.onModuleInit === 'function') {
        addOn.onModuleInit();
      }
    }
  };

  GalaxyModule.prototype.start = function () {
    for (var key in this.addOns) {
      var addOn = this.addOns[key];
      if (typeof addOn.onModuleStart === 'function') {
        addOn.onModuleStart();
      }
    }
  };

  GalaxyModule.prototype.registerAddOn = function (id, object) {
    this.addOns[id] = object;
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

  function GalaxyScope (module, html, views) {
    this.systemId = module.systemId;
    this.parentScope = module.parentScope || null;
    this.html = html;
    this.views = views;
    this.imports = {};

    var urlParser = document.createElement('a');
    urlParser.href = module.url;
    var myRegexp = /([^\t\n]+)\//g;
    var match = myRegexp.exec(urlParser.pathname);
    this.path = match[ 0 ];
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
  /**
   *
   * @returns {Galaxy.GalaxyStateHandler}
   */
  Galaxy.GalaxyStateHandler = GalaxyStateHandler;

  /**
   *
   * @param {Galaxy.GalaxyModule} module
   * @constructor
   */
  function GalaxyStateHandler (module) {
    this.module = module;
    this.id = module.id;
    this.systemId = module.systemId;
    this.domain = module.domain;
    this.inited = false;
    this.started = false;
    this.active = false;
    this.newListenerAdded = false;
    this.stateKey = '#';
    this.navigation = {};
    this.params = {};
    this.hashListeners = [];
    this.globalHashListeners = [];
    this.data = {};
    this.html = '';
    this.oldHash = '';

    // Life cycle
    this.onInit = null;
    this.onStart = null;
    this.onStop = null;
  }

  GalaxyStateHandler.prototype.onModuleStart = function () {
    if (('system/' + this.domain.app.getParam(this.stateKey)).indexOf(this.module.systemId) === 0) {
      this.start();
    }
  };

  GalaxyStateHandler.prototype.init = function () {
    this.inited = true;
    this.trigger('onInit');
  };

  GalaxyStateHandler.prototype.start = function () {
    this.started = true;
    this.active = true;
    this.trigger('onStart');
    //this.triggerEvent('start');
    // if (('system/' + this.domain.app.params[this.stateKey]).indexOf(this.id) <= -1) {
    //   console.log(this.domain.app.params[this.stateKey]);
    //   throw new Error('Could not find module `' + this.id + '` by state key `' + this.stateKey + '`');
    // }
    var newNav = Galaxy.utility.extend(true, {}, this.domain.app.navigation);
    var st = 'system/' + this.domain.app.params[ this.stateKey ];
    var napPath = st.indexOf(this.systemId) === 0 ? st.substr(this.systemId.length).split('/').filter(Boolean) : [];

    newNav[ this.stateKey ] = napPath;

    this.navigation = {};
    this.params = {};
    // Empty navigation and params before call the hashChanged method at the starting phase.
    // This will force the module to call all its event handlers
    //console.log("Module started: " + this.id, n, p);

    // This code is commented because its bug prone
    // hashChanged should be called only when the module params are inited with valid data
    // in other word start should be called after hashChanged
    // this.hashChanged(newNav, params, this.hash, this.domain.getHashNav(this.stateKey));

    var index = this.domain.notYetStarted.indexOf(this.systemId);
    if (index > -1) {
      this.domain.notYetStarted.splice(index, 1);
    }
    this.domain.app.newListenerAdded = true;
  };

  GalaxyStateHandler.prototype.dispose = function () {
  };

  /** Register an state handler with the specified id
   *
   * @param {String} id
   * @param {Function} handler
   */
  GalaxyStateHandler.prototype.on = function (id, handler) {
    this.hashListeners.push({ id: id, handler: handler });
    this.newListenerAdded = true;
  };

  /** Register an state handler globaly with the specified id.
   * Global state handlers will be called even if the mudole is not active
   *
   * @param {String} id
   * @param {Function} handler
   */
  GalaxyStateHandler.prototype.onGlobal = function (id, handler) {
    this.globalHashListeners.push({ id: id, handler: handler });
  };

  GalaxyStateHandler.prototype.getNav = function (key) {
    return this.domain.getHashNav(key);
  };

  GalaxyStateHandler.prototype.setNav = function (value, key) {
    var pathKey = key || '#';
    var pathValue = value === null || value === undefined ? '' : value;

    this.setParam(pathKey, (this.systemId + '/').replace('system/', '') + pathValue);
  };

  GalaxyStateHandler.prototype.getParam = function (key) {
    return this.domain.getHashParam(key);
  };

  /**
   *
   * @param {string} key Name of the parameter
   * @param {string} value Value of the parameter
   * @param {boolean} replace
   */
  GalaxyStateHandler.prototype.setParam = function (key, value, replace) {
    var paramObject = {};
    paramObject[ key ] = value;
    this.domain.setHashParameters(paramObject, replace);
  };

  /** Set value for param if the parameter does not exist in hash
   *
   * @param {String} param
   * @param {String} value
   * @returns {undefined}
   */
  GalaxyStateHandler.prototype.setParamIfNull = function (param, value) {
    if (!this.domain.getHashParam(param)) {
      var paramObject = {};
      paramObject[ param ] = value;
      this.domain.setHashParameters(paramObject, true);
    }
  };

  /** Set value for param if the current value of param is not equal to the passed value
   *
   * @param {staring} param
   * @param {staring} value
   * @returns {undefined}
   */
  GalaxyStateHandler.prototype.setParamIfNot = function (param, value) {
    if (this.domain.getHashParam(param) !== value) {
      var paramObject = {};
      paramObject[ param ] = value;
      this.domain.setHashParameters(paramObject, true);
    }
  };

  /**
   * Call the event function if exist and pass the args to it
   *
   * @param {String} event
   * @param {Array} args
   * @returns {undefined}
   */
  GalaxyStateHandler.prototype.trigger = function (event, args) {
    if (typeof (this[ event ]) === 'function') {
      this[ event ].apply(this, args);
    }
  };

  GalaxyStateHandler.prototype.hashChanged = function (navigation, params, hashValue, fullNav) {
    var _this = this;
    if (_this.started === false) {
      return;
    }

    var moduleNavigation = navigation;
    var fullNavPath = params[ _this.stateKey ];
    var modulesWithStateHandler = this.domain.getModulesByAddOnId('galaxy/scope-state');

    modulesWithStateHandler.forEach(function (item) {
      if (('system/' + fullNavPath).indexOf(item.module.systemId) !== 0 &&
        item.addOn.active) {
        item.addOn.trigger('onStop');
        item.addOn.active = false;
      }
      else if (item.module.systemId === 'system/' + fullNavPath && item.addOn.active) {
        _this.domain.app.activeModule = item.addOn;
      }
    });

    this.hashHandler.call(this, navigation, params);
    var allNavigation = Galaxy.utility.extend({}, this.navigation, navigation);

    var tempNav = _this.navigation;

    _this.navigation = navigation;
    _this.params = params;

    var currentNav = null, i = 0, len = 0, id = null;

    if (this.domain.app.activeModule && this.domain.app.activeModule.systemId === _this.systemId && this.active) {
      for (id in allNavigation) {
        var stateHandlers = _this.hashListeners.filter(function (item) {
          return item.id === id;
        });

        if (stateHandlers.length) {
          currentNav = navigation[ id ];
          if (tempNav[ id ]) {
            if (currentNav && currentNav.join('/') === tempNav[ id ].join('/')) {
              continue;
            }
          }

          var parameters = [];
          parameters.push(null);
          if (currentNav) {
            parameters[ 0 ] = currentNav.join('/');
            for (i = 0, len = currentNav.length; i < len; i++) {
              parameters.push(Galaxy.utility.isNumber(currentNav[ i ]) ?
                parseFloat(currentNav[ i ]) :
                currentNav[ i ]);
            }
          }

          stateHandlers.forEach(function (item) {
            item.handler.apply(_this, parameters);
          });
        }
      }
    } else if (this.active) {
      var stateKeyNavigationValue = navigation[ _this.stateKey ];
      var keyStateHandlers = _this.hashListeners.filter(function (item) {
        return item.id === _this.stateKey;
      });

      //if navHandler is null call sub module navHandler
      if (keyStateHandlers.length && stateKeyNavigationValue) {
        var currentKeyValue = tempNav[ _this.stateKey ] ? tempNav[ _this.stateKey ].join('/') : [];

        if (currentKeyValue !== stateKeyNavigationValue.join('/')) {
          var args = [];
          args.push(stateKeyNavigationValue);

          for (i = 0, len = stateKeyNavigationValue.length; i < len; ++i) {
            //i is always valid index in the arguments object
            args.push(stateKeyNavigationValue[ i ]);
          }

          keyStateHandlers.forEach(function (item) {
            item.handler.apply(_this, args);
          });
        }
      }

      this.domain.app.activeModule = null;
    }

    for (id in allNavigation) {
      var globalStateHandlers = _this.globalHashListeners.filter(function (item) {
        return item.id === id;
      });

      if (globalStateHandlers.length) {
        currentNav = navigation[ id ];
        if (tempNav[ id ]) {
          if (currentNav && currentNav.join('/') === tempNav[ id ].join('/')) {
            continue;
          }
        }

        parameters = [];
        parameters.push(null);
        if (currentNav) {
          parameters[ 0 ] = currentNav.join('/');
          for (i = 0; i < currentNav.length; i++) {
            parameters.push(Galaxy.utility.isNumber(currentNav[ i ]) ?
              parseFloat(currentNav[ i ]) :
              currentNav[ i ]);
          }
        }

        globalStateHandlers.forEach(function (item) {
          item.handler.apply(_this, parameters);
        });
      }
    }

    var domainActiveModule = this.domain.app.activeModule;
    if (!domainActiveModule && navigation[ _this.stateKey ] && navigation[ _this.stateKey ].length) {
      var path = 'system';
      for (i = 0, len = navigation[ _this.stateKey ].length; i < len; i++) {
        path += '/' + navigation[ _this.stateKey ][ i ];
        if (_this.domain.modules[ path ] && _this.domain.modules[ path ].addOns[ 'galaxy/scope-state' ]) {
          domainActiveModule = _this.domain.app.activeModule = _this.domain.modules[ path ].addOns[ 'galaxy/scope-state' ];
          if (domainActiveModule.started) {
            domainActiveModule.active = true;
          } else {
            domainActiveModule.start();
          }
          moduleNavigation = Galaxy.utility.extend(true, {}, navigation);
          moduleNavigation[ _this.stateKey ] = fullNav.slice(domainActiveModule.systemId.split('/').length -
            1);
          // Call module level events handlers
          domainActiveModule.hashChanged(moduleNavigation, this.params, hashValue, fullNav);
        }
      }
    } else if (domainActiveModule &&
      domainActiveModule.systemId === this.systemId + '/' + navigation[ this.stateKey ][ 0 ]) {
      moduleNavigation = Galaxy.utility.extend(true, {}, navigation);
      moduleNavigation[ _this.stateKey ] = fullNav.slice(domainActiveModule.systemId.split('/').length - 1);
      // Call module level events handlers
      domainActiveModule.hashChanged(moduleNavigation, this.params, hashValue, fullNav);
    }
  };

  /**
   *
   * @param {Object} module
   * @callback {callback} onDone
   */
  GalaxyStateHandler.prototype.loadModule = function (module, onDone) {
    Galaxy.loadModule(module, onDone, this.scope);
  };

  /**
   *
   * @param {Object} nav
   * @param {Object} params
   */
  GalaxyStateHandler.prototype.hashHandler = function (nav, params) { };

})();

/* global Galaxy */

(function (galaxy) {
  var addOnId = 'galaxy/scope-state';
  galaxy.registerAddOnProvider(addOnId, function (scope, module) {
    var stateModule = module.addOns[ addOnId ] || new Galaxy.GalaxyStateHandler(module);

    return {
      pre: function () {
        return stateModule;
      },
      post: function () {
        stateModule.init();
      }
    };
  });
})(Galaxy);

/* global Galaxy */

(function (galaxy) {
  galaxy.utility = {
    clone: function (source) {
      if (null === source || 'object' !== typeof source)
        return source;
      var copy = source.constructor();
      for (var property in source) {
        if (source.hasOwnProperty(property)) {
          copy[ property ] = source[ property ];
        }
      }

      return copy;
    },
    extend: function (out) {
      var isDeep = false;
      //out = out || {};

      if (out === true) {
        isDeep = true;
        out = {};
      }

      for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[ i ];

        if (!obj)
          continue;

        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (typeof obj[ key ] === 'object' && isDeep) {
              if (Array.isArray(obj[ key ])) {
                out[ key ] = galaxy.utility.extend([], obj[ key ]);
              } else {
                out[ key ] = galaxy.utility.extend({}, obj[ key ]);
              }
            } else {
              out[ key ] = obj[ key ];
            }
          }
        }
      }

      return out;
    },
    installModuleStateHandlers: function (module, states) {
      for (var state in states) {
        module.on(state, states[ state ]);
      }
    },
    getProperty: function (obj, propString) {
      if (!propString)
        return obj;

      var prop, props = propString.split('.');

      for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
        prop = props[ i ];

        var candidate = obj[ prop ];
        if (candidate !== undefined) {
          obj = candidate;
        } else {
          break;
        }
      }

      return obj[ props[ i ] ];
    },
    isHTML: function (str) {
      var element = document.createElement('div');
      element.innerHTML = str;
      for (var c = element.childNodes, i = c.length; i--;) {
        if (c[ i ].nodeType === 1)
          return true;
      }
      return false;
    },
    decorate: function (hostObject) {
      return {
        'with': function (behavior) {
          Array.prototype.unshift.call(arguments, hostObject);
          return behavior.apply(null, arguments);
        }
      };
    },
    withHost: function (hostObject) {
      return {
        behave: function (behavior) {
          if (typeof behavior !== 'function') {
            throw 'Behavior is not a function: ' + behavior;
          }

          return function () {
            Array.prototype.unshift.call(arguments, hostObject);

            return behavior.apply(null, arguments);
          };
        }
      };
    },
    isNumber: function (o) {
      return !isNaN(o - 0) && o !== null && o !== '' && o !== false;
    },
    parseHTML: function (htmlString) {
      var container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.opacity = '0';

      container.innerHTML = htmlString;

      document.querySelector('body').appendChild(container);
      document.querySelector('body').removeChild(container);

      return Array.prototype.slice.call(container.childNodes);
    },
    serialize: function (obj, prefix) {
      var str = [], p;
      for (p in obj) {
        if (obj.hasOwnProperty(p)) {
          var k = prefix ? prefix + '[' + p + ']' : p, v = obj[ p ];
          str.push((v !== null && typeof v === 'object') ?
            galaxy.utility.serialize(v, k) :
            encodeURIComponent(k) + '=' + encodeURIComponent(v));
        }
      }
      return str.join('&');
    }
  };
})(Galaxy);
