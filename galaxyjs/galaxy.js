/* global Galaxy, nanoajax, Node */

(function () {
  Galaxy = new System();
  Galaxy.GalaxySystem = System;

  var entities = {};
  var importedLibraries = {};
  function System() {
    this.stateKey = 'app';
    this.registry = {};
    this.modules = {};
    this.activities = {};
    this.uiTemplates = {};
    this.onLoadQueue = [];
    this.notYetStarted = [];
    this.activeRequests = {};
    this.onModuleLoaded = {};
    this.services = {};
    this.modulesHashes = {};
    this.hashChecker = null;
    this.firstTime = false;
    this.scopeServices = [];
    this.inited = false;
    this.app = null;
  }

  System.prototype.state = function (id, handler) {
    //return this.app.module(id, object, false);
    var module, modulePath, moduleNavigation;
    var domain = this;
    if (!domain) {
      throw "Domain can NOT be null";
    }
    id = this.app.id + '/' + id;

    //if forceReload is true, then init the module again
    if (!handler/* && this.modules[id]*/) {
      // Add the module to notYetStarted list so it can be started by startLastLoadedModule method
      domain.notYetStarted.push(id);
      return domain.modules[id];
    }

    if (domain.modules[id]) {
      return domain.modules[id];
    }

    if (typeof (handler) === "function") {
      module = Galaxy.utility.extend(true, {}, Galaxy.module.create());
      module.domain = domain;
      module.id = id;
      module.stateId = id.replace('system/', '');

      handler.call(null, module);
    } else {
      module = Galaxy.utility.extend(true, {}, Galaxy.module.create(), handler || {});
      module.domain = domain;
      module.id = id;
      module.stateId = id.replace('system/', '');
    }

    modulePath = domain.app.navigation[module.stateKey] ? domain.app.navigation[module.stateKey] : [];
    moduleNavigation = Galaxy.utility.extend(true, {}, domain.app.navigation);
    moduleNavigation[module.stateKey] = modulePath.slice(id.split("/").length - 1);

    domain.modules[id] = module;
    domain.notYetStarted.push(id);

    // Set module hash for this module when its inited
    // module hash will be set in the hashChanged method as well
    // if current navigation path is equal to this module id
    //module.hash = Galaxy.modulesHashes[id.replace("system/", "")] = module.stateKey + "=" + id.replace("system/", "");

    module.init(moduleNavigation, domain.app.params);

    return module;
  };

  System.prototype.newStateHandler = function (scope, handler) {
    var app = this.getHashParam('app');

    if (app.indexOf(scope._stateId) === 0) {
      return this.state(scope._stateId, handler);
    } else {
      scope._doNotRegister = true;
    }

    return null;
  };

  System.prototype.on = function (id, handler) {
    this.app.on.call(this.app, id, handler);
  };

  System.prototype.start = function () {
    var _this = this;

    if (!_this.inited) {
      throw new Error('Galaxy is not initialized');
    }

    var detect = function () {
      if (_this.app.oldHash !== window.location.hash || _this.app.newListener) {
        var parsedHash = _this.parseHash(window.location.hash);

        _this.setModuleHashValue(parsedHash.navigation, parsedHash.params, parsedHash.hash);
        _this.app.hashChanged(parsedHash.navigation, parsedHash.params, parsedHash.hash, parsedHash.navigation[_this.app.stateKey]); // Galaxy
        _this.app.oldHash = '#' + parsedHash.hash;
        _this.app.newListener = false;
      }
    };

    detect();
    clearInterval(this.hashChecker);
    this.hashChecker = setInterval(function () {
      detect();
    }, 50);
  };

  System.prototype.parseHash = function (hash) {
    var navigation = {};
    var params = {};
    hash = hash.replace(/^#\/?/igm, '');

    hash.replace(/([^&]*)=([^&]*)/g, function (m, k, v) {
      navigation[k] = v.split("/").filter(Boolean);
      params[k] = v;
    });

    return {
      hash: hash,
      navigation: navigation,
      params: params
    };
  };

  System.prototype.init = function (mods) {
    if (this.inited) {
      throw new Error('Galaxy is initialized already');
    }

    this.app = Galaxy.utility.extend(true, {}, Galaxy.module.create());
    this.app.domain = this;
    this.app.stateKey = this.stateKey;
    this.app.id = 'system';
    this.app.installModules = mods || [];
    this.app.init({}, {}, 'system');
    var parsedHash = this.parseHash(window.location.hash);
    this.app.oldHash = window.location.hash;
    this.app.params = parsedHash.params;
    this.inited = true;
  };

  var CONTENT_PARSERS = {};

  CONTENT_PARSERS['text/html'] = function (content) {
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
      html[i] = temp.appendChild(html[i]);
    }
    document.getElementsByTagName('body')[0].appendChild(temp);
    var uiView = temp.querySelectorAll('ui-view,[ui-view]');
    temp.parentNode.removeChild(temp);

    return {
      html: html,
      imports: imports,
      views: uiView,
      script: scripts.join('\n')
    };
  };

  CONTENT_PARSERS['text/javascript'] = function (content) {
    return {
      html: [],
      imports: [],
      views: [],
      script: content
    };
  };

  System.prototype.parseModuleContent = function (module, content, contentType) {
    var parser = CONTENT_PARSERS[contentType];
    if (parser) {
      return parser(content);
    } else {
      console.log('Resource is not a valid html file:', module.url, contentType);

      return {
        html: [],
        imports: [],
        views: [],
        script: ''
      };
    }
  };

  System.prototype.load = function (module, onDone) {
    var _this = this;
    module.id = module.id || (new Date()).valueOf() + '-' + performance.now();

    Galaxy.onModuleLoaded['system/' + module.id] = onDone;
    var moduleExist = Galaxy.modules['system/' + module.id];

    var invokers = [module.url];

    if (module.invokers) {
      if (module.invokers.indexOf(module.url) !== -1) {
        throw new Error('circular dependencies: \n' + module.invokers.join('\n') + '\nwanna load: ' + module.url);
      }

      invokers = module.invokers;
      invokers.push(module.url);
    }

    if (moduleExist) {
      //console.log('module exist: ', module.id);
      if ('function' === typeof (Galaxy.onModuleLoaded['system/' + module.id])) {
        window.requestAnimationFrame(function () {
          Galaxy.onModuleLoaded['system/' + module.id].call(this, moduleExist, moduleExist.scope.html);
          delete Galaxy.onModuleLoaded['system/' + module.id];
        });
      }

      return;
    }

    if (Galaxy.onLoadQueue["system/" + module.id]) {
      return;
    }

    Galaxy.onLoadQueue["system/" + module.id] = true;

    nanoajax.ajax({
      method: 'GET',
      url: module.url,
      body: Galaxy.utility.serialize(module.params || {})
    }, function (code, response, meta) {
      var contentType = (meta.getResponseHeader('content-type').split(';')[0] + '').trim() || 'text/html';
      
      var parsedContent = _this.parseModuleContent(module, response, contentType);

      window.requestAnimationFrame(function () {
        compile(parsedContent);
      });
    });

    function compile(moduleContent) {
      var scopeUIViews = {};
      Array.prototype.forEach.call(moduleContent.views, function (node, i) {
        var uiViewName = node.getAttribute('ui-view');
//        var key = uiViewName.replace(/([A-Z])|(\-)|(\s)/g, function ($1) {
//          return "_" + (/[A-Z]/.test($1) ? $1.toLowerCase() : '');
//        });

        scopeUIViews[uiViewName || 'view_' + i] = node;
      });

      var scope = {
        _moduleId: 'system/' + module.id,
        _stateId: module.id,
        parentScope: module.scope || null,
        html: moduleContent.html,
        views: scopeUIViews,
        imports: {}
      };

//        console.log(parsedContent.imports);
      var imports = Array.prototype.slice.call(moduleContent.imports, 0);
      //var importsOfScope = {};
      var scriptContent = moduleContent.script || '';

      // extract imports from the source code
      scriptContent = scriptContent.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
      moduleContent.script = scriptContent.replace(/Scope\.import\(['|"](.*)['|"]\)\;/gm, function (match, path) {
        var query = path.match(/([\S]+)/gm);
        imports.push({
          url: query[query.length - 1],
          fresh: query.indexOf('new') !== -1
        });

        return "Scope.imports['" + query[query.length - 1] + "']";
      });

//       console.log('Libraries to be imported: ', JSON.stringify(imports));

      if (imports.length) {
        var importsCopy = imports.slice(0);
        imports.forEach(function (item, i) {

          var scopeService = Galaxy.getScopeService(item.url);
          if (scopeService) {
            importedLibraries[item.url] = {
              name: item.url,
              module: scopeService.handler.call(null, moduleContent)
            };

            doneImporting(module, scope, importsCopy, moduleContent);
          } else if (importedLibraries[item.url] && !item.fresh) {
            doneImporting(module, scope, importsCopy, moduleContent);
          } else {
            Galaxy.load({
              id: (new Date()).valueOf() + '-' + performance.now(),
              name: item.name,
              url: item.url,
              fresh: item.fresh,
              scope: scope,
              invokers: invokers,
              temprory: true
            }, function (loaded) {
              doneImporting(module, scope, importsCopy, moduleContent);
            });
          }
        });

        return false;
      }

      moduleLoaded(module, scope, moduleContent);
    }

    function doneImporting(module, scope, imports, moduleContent) {
      imports.splice(imports.indexOf(module.url) - 1, 1);

      if (imports.length === 0) {
        // This will load the original initilizer
        moduleLoaded(module, scope, moduleContent);
      }
    }

    function moduleLoaded(module, scope, filtered) {
      for (var item in importedLibraries) {
        if (importedLibraries.hasOwnProperty(item)) {
          var asset = importedLibraries[item];
          scope.imports[asset.name] = asset.module;
        }
      }

      var html = document.createDocumentFragment();

      scope.html.forEach(function (item) {
        html.appendChild(item);
      });

      scope.html = html;
      html._scope = scope;
//      debugger;

      var currentComponentScripts = filtered.script;
      delete filtered.script;

      var componentScript = new Function('Scope', currentComponentScripts);

      componentScript.call(null, scope);
      var htmlNodes = [];

      for (var i = 0, len = html.childNodes.length; i < len; i++) {
        htmlNodes.push(html.childNodes[i]);
      }
      scope.html = htmlNodes;

      if (!importedLibraries[module.url]) {
        importedLibraries[module.url] = {
          name: module.name || module.url,
          module: scope.export
        };
      } else if (module.fresh) {
        importedLibraries[module.url].module = scope.export;
      } else {
        scope.imports[module.name] = importedLibraries[module.url].module;
      }
//        delete scope.export;

      var currentModule = Galaxy.modules['system/' + module.id];

      if (module.temprory || scope._doNotRegister) {
//          console.log('do not register', module.id);
        delete scope._doNotRegister;
        currentModule = {};
      } else if (!currentModule) {
//          console.log('empty', module.id);
        currentModule = Galaxy.modules['system/' + module.id] = {};
      }

      currentModule.scope = scope;

      if ('function' === typeof (Galaxy.onModuleLoaded['system/' + module.id])) {
        //console.log('immidiate load: ', currentModule, Galaxy.onModuleLoaded);
        Galaxy.onModuleLoaded['system/' + module.id].call(this, currentModule, scope.html);
        delete Galaxy.onModuleLoaded['system/' + module.id];
      }

      delete Galaxy.onLoadQueue['system/' + module.id];
    }
  };

  System.prototype.setURLHash = function (hash) {
    //var hash = hash;
    hash = hash.replace(/^#\/?/igm, '');

    var navigation = {};
    var params = {};
    hash.replace(/([^&]*)=([^&]*)/g, function (m, k, v) {
      navigation[k] = v.split("/").filter(Boolean);
      params[k] = v;
    });

  };

  System.prototype.getHashParam = function (key, hashName) {
    var asNumber = parseFloat(this.app.params[key]);
    return asNumber || this.app.params[key] || null;
  };

  System.prototype.getHashNav = function (key, hashName) {
    return this.app.navigation[key] || [
    ];
  };

  System.prototype.setModuleHashValue = function (navigation, parameters, hashValue, init) {
    var nav = parameters[this.stateKey];

    if (!nav) {
      return;
    }

    if (Galaxy.modulesHashes[nav] && Galaxy.app.activeModule !== Galaxy.modules["system/" + nav] && Galaxy.app.activeModule && Galaxy.app.activeModule.stateKey === 'app') {
      //window.location.hash = Galaxy.modulesHashes[nav];
      // When the navigation path is changed
      //alert(Galaxy.modulesHashes[nav] + " YES " + nav);
    } else if (!this.firstTime) {
      // first time indicates that the page is (re)loaded and the window.location.hash should be set
      // as the module hash value for the module which is specified by app parameter in the hash value.
      // Other modules get default hash value
      Galaxy.modulesHashes[nav] = hashValue;
      this.firstTime = true;
      //alert("first time: " + Galaxy.modulesHashes[nav] + " " + hashValue);
    } else if (!Galaxy.modulesHashes[nav]) {
      // When the module does not exist 
      Galaxy.modulesHashes[nav] = "app=" + nav;
      //alert(Galaxy.modulesHashes[nav] + " default hash");
    } else if (Galaxy.modulesHashes[nav]) {
      // When the hash parameters value is changed from the browser url bar or originated from url bar
      Galaxy.modulesHashes[nav] = hashValue;
    }
  };

  /** Set parameters for app/nav. if app/nav was not in parameters, then set paraters for current app/nav
   * 
   * @param {type} parameters
   * @param {type} replace if true it overwrites last url history otherwise it create new url history
   * @param {type} clean clean all the existing parameters
   * @returns {undefined}
   */
  System.prototype.setHashParameters = function (parameters, replace, clean) {
    var newParams = Galaxy.utility.clone(parameters);
    this.lastHashParams = parameters;
    var hashValue = window.location.hash;
    //var originHash = hashValue;
    var nav = parameters["app"];
    if (nav && !Galaxy.modulesHashes[nav]) {
      //console.log(hashValue, nav)
      Galaxy.modulesHashes[nav] = hashValue = "app=" + nav;

    } else if (nav && Galaxy.modulesHashes[nav]) {
      //console.log(hashValue, nav , Galaxy.modulesHashes[nav]);
      //alert("---------");
      hashValue = Galaxy.modulesHashes[nav];
    }
    //console.log(parameters, nav, Galaxy.modulesHashes[nav]);

    if (hashValue.indexOf("#") !== -1) {
      hashValue = hashValue.substring(1);
    }
    var pairs = hashValue.split("&");
    var newHash = "#";
    var and = false;

    hashValue.replace(/([^&]*)=([^&]*)/g, function (m, k, v) {
      if (newParams[k] !== null && typeof newParams[k] !== 'undefined') {
        newHash += k + "=" + newParams[k];
        newHash += '&';
        and = true;
        delete newParams[k];
      } else if (!newParams.hasOwnProperty(k) && !clean) {
        newHash += k + "=" + v;
        newHash += '&';
        and = true;
      }
    });
    // New keys
    for (var key in newParams) {
      if (newParams.hasOwnProperty(key)) {
        var value = newParams[key];

        if (key && value) {
          newHash += key + "=" + value + "&";
        }
      }
    }

    newHash = newHash.replace(/\&$/, '');

    if (replace) {
      window.location.replace(('' + window.location).split('#')[0] + newHash);
    } else {
      window.location.hash = newHash.replace(/\&$/, '');
    }
  };

  System.prototype.setParamIfNull = function (param, value) {
    this.app.setParamIfNull(param, value);
  };

  System.prototype.loadDependecies = function (dependecies) {
    for (var key in dependecies) {

    }
  };

  System.prototype.getScopeService = function (name) {
    return this.scopeServices.filter(function (service) {
      return service.name === name;
    })[0];
  };

  System.prototype.registerScopeService = function (name, handler) {
    if (typeof handler !== 'function') {
      throw 'scope service should be a function';
    }

    this.scopeServices.push({
      name: name,
      handler: handler
    });
  };

  System.prototype.boot = function (bootModule, onDone) {
    var _this = this;
    _this.init();

    _this.load(bootModule, function (module) {
      onDone.call(null, module);
      _this.start();
    });
  };

}());


/* global Galaxy, TweenLite, Node */

(function (galaxy) {
  galaxy.GalaxyUI = GalaxyUI;
  galaxy.ui = new galaxy.GalaxyUI();

  function GalaxyUI() {
    this.DEFAULTS = {
      animationDuration: 1
    };

    this.COMPONENT_STRUCTURE = {
      el: null,
      events: {},
      on: function (event, handler) {
        this.events[event] = handler;
      },
      trigger: function (event) {
        if (this.events[event])
          this.events[event].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    };

    this.body = document.getElementsByTagName('body')[0];
  }

  GalaxyUI.prototype.utility = {
    viewRegex: /\{\{([^\{\}]*)\}\}/g
  };

  // Simply replace {{key}} with its value in the template string and returns it
  GalaxyUI.prototype.utility.populate = function (template, data) {
    template = template.replace(this.viewRegex, function (match, key) {
      //eval make it possible to reach nested objects
      return eval("data." + key) || "";
    });
    return template;
  };

  GalaxyUI.prototype.utility.hasClass = function (element, className) {
    if (element.classList)
      return  element.classList.contains(className);
    else
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
  };

  GalaxyUI.prototype.utility.addClass = function (el, className) {
    if (!el)
      return;

    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  };

  GalaxyUI.prototype.utility.removeClass = function (el, className) {
    if (!el)
      return;

    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  };

  GalaxyUI.prototype.utility.toTreeObject = function (element) {
    var jsTree = {
      _: element,
      _children: []
    };
    var indexIndicator = {};
    for (var index in element.childNodes) {
      var node = element.childNodes[index];

      if (node.nodeType === Node.ELEMENT_NODE) {
        var key = node.nodeName.toLowerCase();
        if (indexIndicator[key]) {
          indexIndicator[key]++;
          jsTree[key + '_' + indexIndicator[key]] = galaxy.ui.utility.toTreeObject(node);
        } else {
          indexIndicator[key] = 1;
          jsTree[node.nodeName.toLowerCase()] = galaxy.ui.utility.toTreeObject(node);
        }

        jsTree._children.push(node);
      }
    }

    return jsTree;
  };

  GalaxyUI.prototype.utility.getContentHeight = function (element, withPaddings) {
    var height = 0;
    var logs = [];
    var children = element.children;

    for (var index = 0, length = children.length; index < length; index++) {
      if (children[index].__ui_neutral) {
        continue;
      }

      var cs = window.getComputedStyle(children[index], null);

      if (cs.position === 'absolute') {
        continue;
      }

      //var dimension = children[index].getBoundingClientRect();
      var dimension = children[index].offsetTop + children[index].offsetHeight;
      var marginBottom = parseInt(cs.marginBottom || 0);

      height = dimension + marginBottom > height ? dimension + marginBottom : height;
    }

    if (withPaddings) {
      height += parseInt(window.getComputedStyle(element).paddingBottom || 0);
    }

    return height;
  };

  GalaxyUI.prototype.setContent = function (parent, nodes) {
    var parentNode = parent;
    if (typeof parent === 'string') {
      parentNode = document.querySelector(parent);
    }

    if (!parentNode) {
      throw new Error('parent element can not be null: ' + parent+'\r\n try to set ui-view on your target element and refrence it via Scope.views');
    }
    
    var children = Array.prototype.slice.call(parentNode.childNodes);

    children.forEach(function (child) {
      parentNode.removeChild(child);
    });

    if (!nodes.hasOwnProperty('length')) {
      nodes = [nodes];
    }

    for (var i = 0, len = nodes.length; i < len; i++) {
      var item = nodes[i];
      parentNode.appendChild(item);
    }
  };



  GalaxyUI.prototype.clone = function (obj) {
    var target = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i))
      {
        target[i] = obj[i];
      }
    }
    return target;
  };

  GalaxyUI.prototype.getCenterPoint = function (rect) {
    var pos = document.activeElement.getBoundingClientRect();
    return         {
      left: rect.left + (rect.width / 2),
      top: rect.top + (rect.height / 2)
    };
  };

  GalaxyUI.prototype.animations = {};
}(Galaxy));
/* global Galaxy */

(function () {
  Galaxy.GalaxyHelpers = Helpers;
  Galaxy.helpers = new Galaxy.GalaxyHelpers();

  function Helpers() {

  }

  Helpers.prototype.loadModuleInto = function (module, element) {   
    Galaxy.load(module, function (module) {
      Galaxy.ui.setContent(element, module.scope.html);

      if (module.start) {
        module.start();
      }
    });
  };
})();
/* global Galaxy */

(function (galaxy) {
  galaxy.GalaxyModule = GalaxyModule;
  galaxy.module = new galaxy.GalaxyModule();

  function GalaxyModule() {

  }

  GalaxyModule.prototype.create = function () {
    return {
      domain: null,
      inited: false,
      started: false,
      active: false,
      stateKey: 'app',
      navigation: {},
      params: {},
      html: "",
      installModules: [],
      binds: {},
      newListener: false,
      installModulesOnInit: function (modules) {
        this.installModules = modules;
      },
      onInit: null,
      onStart: null,
      onStop: null,
      init: function (navigations, params, html) {
        var _this = this;
        this.inited = true;
        this.trigger('onInit');
        //this.triggerEvent('init');

        this.installModules.forEach(function (lib) {
          _this.domain.loadModule(lib);
        });
      },
      start: function () {
        this.started = true;
        this.active = true;
        this.trigger('onStart');
        //this.triggerEvent('start');
        if (('system/' + this.domain.app.params[this.stateKey]).indexOf(this.id) <= -1) {
          console.log(this.domain.app.params[this.stateKey]);
          throw new Error('Could not find module `' + this.id + '` by state key `' + this.stateKey + '`');
        }
        var newNav = galaxy.utility.extend(true, {}, this.domain.app.navigation);
        var st = 'system/' + this.domain.app.params[this.stateKey];
        var napPath = st.indexOf(this.id) === 0 ? st.substr(this.id.length).split('/').filter(Boolean) : [];

        newNav[this.stateKey] = napPath;
        var nav = newNav;
        var params = this.domain.app.params;
        this.navigation = {};
        this.params = {};
        // Empty navigation and params before call the hashChanged method at the starting phase.
        // This will force the module to call all its event handlers
        //console.log("Module started: " + this.id, n, p);

        // This code is commented because its bug prone
        // hashChanged should be called only when the module params are inited with valid data
        // in other word start should be called after hashChanged
        this.hashChanged(nav, params, this.hash, this.domain.getHashNav(this.stateKey));
        //console.log(this.id , )

        var index = this.domain.notYetStarted.indexOf(this.id);
        if (index > -1) {
          this.domain.notYetStarted.splice(index, 1);
        }
      },
      dispose: function () {
      },
      hashListeners: [],
      globalHashListeners: [],
      data: {},
      /** Register an state hanlder with the specified id
       * 
       * @param {String} id
       * @param {Function} handler
       */
      on: function (id, handler) {
        this.hashListeners.push({id: id, handler: handler});
        this.newListener = true;
      },
      /** Register an state handler globaly with the specified id.
       * Global state handlers will be called even if the mudole is not active
       * 
       * @param {String} id
       * @param {Function} handler
       */
      onGlobal: function (id, handler) {
        this.globalHashListeners.push({id: id, handler: handler});
      },
      getNav: function (key) {
        return this.domain.getHashNav(key);
      },
      setNav: function (value, key) {
        var pathKey = key || 'app';
        var pathValue = value === null || value === undefined ? '' : value;

        this.setParam(pathKey, (this.id + '/').replace('system/', '') + pathValue);
      },
      getParam: function (key) {
        return this.domain.getHashParam(key);
      },
      /**
       * 
       * @param {string} key Name of the parameter
       * @param {string} value Value of the parameter
       * @param {boolean} replace
       */
      setParam: function (key, value, replace) {
        var paramObject = {};
        paramObject[key] = value;
        this.domain.setHashParameters(paramObject, replace);
      },
      setParamIfNull: function (param, value) {
        if (!this.domain.getHashParam(param)) {
          var paramObject = {};
          paramObject[param] = value;
          this.domain.setHashParameters(paramObject, true);
        }
      },
      setParamIfNot: function (param, value) {
        if (this.domain.getHashParam(param) !== value) {
          var paramObject = {};
          paramObject[param] = value;
          this.domain.setHashParameters(paramObject, true);
        }
      },
      /**
       * 
       * @param {string} event name of module internal event
       * @param {function} action the action that bind one to one to the specified event
       * @returns {void}
       */
      bind: function (event, action) {
        if ('string' === typeof (event) && 'function' === typeof (action)) {
          this.binds[event] = action;
        }
      },
      stage: function (event, action) {
        if ('string' === typeof (event) && 'function' === typeof (action)) {
          this.binds[event] = action;
        }
      },
      /**
       * Call the event function if exist and pass the args to it
       * 
       * @param {String} event
       * @param {Array} args
       * @returns {undefined}
       */
      trigger: function (event, args) {
        if (typeof (this[event]) === 'function') {
          this[event].apply(this, args);
        }
      },
      hashChanged: function (navigation, params, hashValue, fullNav) {
        var _this = this;
        var moduleNavigation = navigation;

        var fullNavPath = params[_this.stateKey];

        if (this.id === 'system/' + fullNavPath/* && Galaxy.app.activeModule !== this*/) {
          this.domain.app.activeModule = this;
          this.domain.app.activeModule.active = true;
        } else if (!this.solo) {
          if (this.domain.app.activeModule && this.domain.app.activeModule.active) {
            this.domain.app.activeModule.trigger('onStop');
          }
          this.domain.app.activeModule = null;
          this.active = false;
        }

        this.hashHandler.call(this, navigation, params);
        var allNavigations = galaxy.utility.extend({}, this.navigation, navigation);

        var tempNav = _this.navigation;

        _this.navigation = navigation;
        _this.params = params;

        if (this.domain.app.activeModule && this.active && this.domain.app.activeModule.id === _this.id) {
          for (var key in allNavigations) {
            if (allNavigations.hasOwnProperty(key)) {
              var stateHandlers = _this.hashListeners.filter(function (item) {
                return item.id === key;
              });

              if (stateHandlers.length) {
                if (tempNav[key]) {
                  var currentKeyValue = tempNav[key].join('/');
                  if (navigation[key] && currentKeyValue === navigation[key].join('/')) {
                    continue;
                  }
                }

                var parameters = [];
                parameters.push(null);
                var navigationValue = navigation[key];
                if (navigationValue) {
                  parameters[0] = navigationValue.join('/');
                  for (var i = 0; i < navigationValue.length; i++) {
                    var arg = galaxy.utility.isNumber(navigationValue[i]) ? parseFloat(navigationValue[i]) : navigationValue[i];

                    parameters.push(arg);
                  }
                }

                stateHandlers.forEach(function (item) {
                  item.handler.apply(_this, parameters);
                });
              }
            }
          }
        } else if (!this.active) {
          var keyStateHandlers = _this.hashListeners.filter(function (item) {
            return item.id === _this.stateKey;
          });

          var stateKeyNavigationValue = navigation[_this.stateKey];

          //if navHandler is null call sub module navHandler
          if (keyStateHandlers.length && stateKeyNavigationValue) {
            var currentKeyValue = tempNav[_this.stateKey] ? tempNav[_this.stateKey].join('/') : [];

            if (currentKeyValue !== stateKeyNavigationValue.join('/')) {
              var args = [];
              args.push(stateKeyNavigationValue);

              for (var i = 0, len = stateKeyNavigationValue.length; i < len; ++i) {
                //i is always valid index in the arguments object
                args.push(stateKeyNavigationValue[i]);
              }

              keyStateHandlers.forEach(function (item) {
                item.handler.apply(_this, args);
              });
            }
          }
        }

        for (var key in allNavigations) {
          if (allNavigations.hasOwnProperty(key)) {
            var globalStateHandlers = _this.globalHashListeners.filter(function (item) {
              return item.id === key;
            });

            if (globalStateHandlers.length) {
              if (tempNav[key]) {
                var currentKeyValue = tempNav[key].join('/');
                if (navigation[key] && currentKeyValue === navigation[key].join('/')) {
                  continue;
                }
              }

              parameters = [];
              parameters.push(null);

              navigationValue = navigation[key];
              if (navigationValue) {
                parameters[0] = navigationValue.join('/');
                for (var i = 0; i < navigationValue.length; i++) {
                  var arg = galaxy.utility.isNumber(navigationValue[i]) ? parseFloat(navigationValue[i]) : navigationValue[i];

                  parameters.push(arg);
                }
              }

              globalStateHandlers.forEach(function (item) {
                item.handler.apply(_this, parameters);
              });
            }
          }
        }

        //if (this.stateKey && navigation[this.stateKey] && navigation[this.stateKey][0])
        //{
        // Set the app.activeModule according to the current navigation path
        if (navigation[this.stateKey] && this.domain.modules[this.id + '/' + navigation[this.stateKey][0]]) {
          this.activeModule = this.domain.modules[this.id + '/' + navigation[this.stateKey][0]];
        }
        //} else if (!this.solo) {
        //this.activeModule = null;
        //}

        if (this.activeModule && this.activeModule.id === this.id + '/' + navigation[this.stateKey][0])
        {
          // Remove first part of navigation in order to force activeModule to only react to events at its level and higher 
          moduleNavigation = galaxy.utility.extend(true, {}, navigation);
          moduleNavigation[this.stateKey] = fullNav.slice(this.activeModule.id.split('/').length - 1);
          // Call module level events handlers
          this.activeModule.hashChanged(moduleNavigation, this.params, hashValue, fullNav);
        }
      },
      loadModule: function (module, onDone) {
        galaxy.loadModule(module, onDone, this.scope);
      },
      hashHandler: function (nav, params) {}
    };
  };

})(Galaxy);
// https://github.com/yanatan16/nanoajax
!function(t,e){function n(t){return t&&e.XDomainRequest&&!/MSIE 1/.test(navigator.userAgent)?new XDomainRequest:e.XMLHttpRequest?new XMLHttpRequest:void 0}function o(t,e,n){t[e]=t[e]||n}var r=["responseType","withCredentials","timeout","onprogress"];t.ajax=function(t,a){function s(t,e){return function(){c||(a(void 0===f.status?t:f.status,0===f.status?"Error":f.response||f.responseText||e,f),c=!0)}}var u=t.headers||{},i=t.body,d=t.method||(i?"POST":"GET"),c=!1,f=n(t.cors);f.open(d,t.url,!0);var l=f.onload=s(200);f.onreadystatechange=function(){4===f.readyState&&l()},f.onerror=s(null,"Error"),f.ontimeout=s(null,"Timeout"),f.onabort=s(null,"Abort"),i&&(o(u,"X-Requested-With","XMLHttpRequest"),e.FormData&&i instanceof e.FormData||o(u,"Content-Type","application/x-www-form-urlencoded"));for(var p,m=0,v=r.length;v>m;m++)p=r[m],void 0!==t[p]&&(f[p]=t[p]);for(var p in u)f.setRequestHeader(p,u[p]);return f.send(i),f},e.nanoajax=t}({},function(){return this}());
/* global Galaxy */

(function (galaxy) {
  galaxy.utility = {
    clone: function (source) {
      if (null === source || "object" !== typeof source)
        return source;
      var copy = source.constructor();
      for (var property in source) {
        if (source.hasOwnProperty(property)) {
          copy[property] = source[property];
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
        var obj = arguments[i];

        if (!obj)
          continue;

        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && isDeep) {
              if (Array.isArray(obj[key])) {
                out[key] = galaxy.utility.extend([], obj[key]);
              } else {
                out[key] = galaxy.utility.extend({}, obj[key]);
              }
            } else {
              out[key] = obj[key];
            }
          }
        }
      }

      return out;
    },
    installModuleStateHandlers: function (module, states) {
      for (var state in states) {
        module.on(state, states[state]);
      }
    },
    getProperty: function (obj, propString) {
      if (!propString)
        return obj;

      var prop, props = propString.split('.');

      for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
        prop = props[i];

        var candidate = obj[prop];
        if (candidate !== undefined) {
          obj = candidate;
        } else {
          break;
        }
      }

      return obj[props[i]];
    },
    isHTML: function (str) {
      var element = document.createElement('div');
      element.innerHTML = str;
      for (var c = element.childNodes, i = c.length; i--; ) {
        if (c[i].nodeType === 1)
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
      }
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
      return !isNaN(o - 0) && o !== null && o !== "" && o !== false;
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
          var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
          str.push((v !== null && typeof v === "object") ?
                  serialize(v, k) :
                  encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
      }
      return str.join("&");
    }
  };
})(Galaxy);