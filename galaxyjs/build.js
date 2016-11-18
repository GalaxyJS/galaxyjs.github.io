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
    var detect = function () {
      if (_this.app.oldHash !== window.location.hash/* || self.app.newHandler*/) {
        var hashValue = window.location.hash;
        var navigation = {};
        var params = {};

        hashValue = hashValue.replace(/^#\/?/igm, '');

        hashValue.replace(/([^&]*)=([^&]*)/g, function (m, k, v) {
          navigation[k] = v.split("/").filter(Boolean);
          params[k] = v;
        });

        _this.setModuleHashValue(navigation, params, hashValue);
        _this.app.hashChanged(navigation, params, hashValue, navigation[_this.app.stateKey]); // Galaxy
        _this.app.oldHash = '#' + hashValue;
      }
    };

    detect();
    clearInterval(this.hashChecker);
    this.hashChecker = setInterval(function () {
      detect();
    }, 50);
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

  System.prototype.init = function (mods) {
    this.app = Galaxy.utility.extend(true, {}, Galaxy.module.create());
    this.app.domain = this;
    this.app.stateKey = this.stateKey;
    this.app.id = 'system';
    this.app.installModules = mods || [];
    this.app.init({}, {}, 'system');
  };

  System.prototype.parseContent = function (raw, module) {
    var scripts = [];
    var imports = [];
    if (!Galaxy.utility.isHTML(raw)) {
      console.log('Resource is not a valid html file:', module.url);

      return {
        html: [],
        imports: [],
        views: [],
        script: ''
      };
    }

    var raw = Galaxy.utility.parseHTML(raw);
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

//        if (e.tagName && e.tagName.toLowerCase() === 'link') {
//          return false;
//        }

      return true;
    });
    var templates = {};
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
        Galaxy.onModuleLoaded['system/' + module.id].call(this, moduleExist, moduleExist.scope.html);
        delete Galaxy.onModuleLoaded['system/' + module.id];
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
    }, function (code, response) {
      var parsedContent = Galaxy.parseContent(response, module);

      setTimeout(function () {
        compile(parsedContent);
      }, 1);
    });

    function compile(moduleContent) {
      var scopeUIViews = {};
      Array.prototype.forEach.call(moduleContent.views, function (node, i) {
        var uiViewName = node.getAttribute('ui-view');
        var key = uiViewName.replace(/([A-Z])|(\-)|(\s)/g, function ($1) {
          return "_" + (/[A-Z]/.test($1) ? $1.toLowerCase() : '');
        });

        scopeUIViews[key || 'view_' + i] = node;
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

//  System.prototype.passToScopeServices = function (module) {
//    var result = {
//      names: [],
//      services: []
//    };
//
//    this.scopeServices.forEach(function (service) {
//      result.names.push(service.name);
//      result.services.push(service.handler.call(null, module));
//    });
//
//    return result;
//  };
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
    var children = Array.prototype.slice.call(parent.childNodes);

    children.forEach(function (child) {
      parent.removeChild(child);
    });

    if (!nodes.hasOwnProperty('length')) {
      nodes = [nodes];
    }

    for (var i = 0, len = nodes.length; i < len; i++) {
      var item = nodes[i];
      parent.appendChild(item);
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
/* global TweenLite, Galaxy */

(function () {

})();
/* global xtag, Galaxy */

(function (galaxy) {
  GalaxyAnimation = {
    CONFIG: {
      baseDuration: .5,
      staggerDuration: .05
    },
    effects: {}
  };

  var Animation = {
    lifecycle: {
      created: function () {
        var element = this;
        element.xtag.effects = [];
        element.xtag.registeredAnimations = [];
        this.xtag.cachedAnimations = this.getAttribute('effects');
      },
      attributeChanged: function (attrName, oldValue, newValue) {
      },
      inserted: function () {
        if (this.xtag.cachedAnimations && !this.xtag.effects.length) {
          this.setAttribute('effects', this.xtag.cachedAnimations);
          this.xtag.cachedAnimations = null;
          this.prepare();
        }
      },
      removed: function () {
        this.xtag.cachedAnimations = xtag.clone(this.xtag.effects).join(',');
        this.xtag.effects = [];
        this.prepare();
      }
    },
    accessors: {
      effects: {
        attribute: {
        },
        set: function (value) {
          var element = this;
          if (typeof value === 'string') {
            this.xtag.effects = value.split(/[\s,]+/).filter(Boolean);
          } else {
            this.xtag.effects = [];
          }

          element.prepare();
        },
        get: function () {
          return this.xtag.effects;
        }
      }
    },
    events: {
    },
    methods: {
      prepare: function () {
        var element = this;
        this.xtag.effects.forEach(function (item) {
          if (element.xtag.registeredAnimations.indexOf(item) !== -1) {
            return null;
          }

          if (!GalaxyAnimation.effects[item]) {
            return console.warn('spirit animation not found:', item);
          }

          GalaxyAnimation.effects[item].register(element);
          element.xtag.registeredAnimations.push(item);
        });

        this.xtag.registeredAnimations = this.xtag.registeredAnimations.filter(function (item) {
          if (element.xtag.effects.indexOf(item) === -1) {
            GalaxyAnimation.effects[item].deregister(element);
            return false;
          }

          return true;
        });
      }
    }
  };

  xtag.register('galaxy-animation', Animation);
})(Galaxy);
/* global xtag */

(function () {
  var Field = {
    lifecycle: {
      created: function () {
        var element = this;
        var input = this.querySelectorAll('input, textarea, select');
        if (input.length > 1) {
          console.warn('Only one input field is allowed inside system-field', this);
        }

        element.xtag._input = this.querySelectorAll('input, textarea, select')[0];

//        element.setEmptiness = function () {
//          if (element.xtag._input.value || element.xtag._input.type === 'file') {
//            element.removeAttribute('empty');
//          } else {
//            element.setAttribute('empty', '');
//          }
//        };

        if (element.xtag._input) {
          element.setEmptiness();

          element.xtag._input.addEventListener('focus', function () {
            element.setAttribute('focus', '');
            element.setEmptiness();
          });

          element.xtag._input.addEventListener('blur', function () {
            element.removeAttribute('focus');
          });

          element.xtag._input.onchange = function (e) {
            element.setEmptiness();
          };

          element.xtag._input.addEventListener('input', function (e) {
            element.setEmptiness();
          });
        }
      },
      inserted: function () {
        var tag = this;
        tag.xtag.observer = setInterval(function () {
          if (tag.xtag._input.value !== tag.xtag.oldValue) {
            tag.setEmptiness();
            tag.xtag.oldValue = tag.xtag._input.value;
          }
        }, 250);

        tag.setEmptiness();
      },
      removed: function () {
        clearInterval(this.xtag.observer);
      }
    },
    accessors: {
    },
    events: {
    },
    methods: {
      setEmptiness: function () {
        var element = this;

        if (element.xtag._input.value || element.xtag._input.type === 'file') {
          element.removeAttribute('empty');
        } else {
          element.setAttribute('empty', '');
        }
      }
    }
  };

  xtag.register('system-field', Field);
})();
/* global Galaxy, xtag */

(function () {
  var FloatMenu = {
    lifecycle: {
      created: function () {
        var _this = this;
        _this.xtag.indicator = _this.querySelector('[indicator]') || _this.getElementsByTagName('div')[0];
        _this.xtag.actionsContainer = _this.querySelector('[actions]') || _this.getElementsByTagName('div')[1];

        var expand = function (e) {
          e.stopPropagation();
          e.preventDefault();

          if (!_this.expanded) {
            _this.expand();
            window.addEventListener('touchstart', contract);
          }
        };

        var contract = function (e) {
          e.stopPropagation();
          e.preventDefault();

          if (_this.expanded) {
            _this.contract();
          }

          window.removeEventListener('touchstart', contract);
        };

        //_this.xtag.indicator.addEventListener('mouseenter', expand);
        //_this.xtag.indicator.addEventListener('touchstart', expand);

        _this.addEventListener('mouseenter', expand);
        _this.addEventListener('touchstart', expand);

        _this.addEventListener('mouseleave', contract);

        this.style.position = 'absolute';
        this.xtag.originClassName = this.className;

        this.xtag.observer = new MutationObserver(function (mutations) {
          if (_this.xtag.actionsContainer.children.length) {
            _this.on();
          } else {
            _this.off();
          }
        });
      },
      inserted: function () {
        var _this = this;

        _this.xtag.observer.observe(_this.xtag.actionsContainer, {
          attributes: false,
          childList: true,
          characterData: false
        });

        if (_this.children.length) {
          _this.on();
        } else {
          _this.off();
        }
      },
      removed: function () {
        this.off(true);
      }
    },
    accessors: {
      position: {
        attribute: {}
      },
      parent: {
        attribute: {}
      },
      onAttached: {
        attribute: {},
        set: function (value) {
          this.xtag.onAttached = value;
        },
        get: function (value) {
          return this.xtag.onAttached;
        }
      }
    },
    methods: {
      expand: function () {
        if (this.expanded)
          return;

        this.expanded = true;
        Galaxy.ui.utility.addClass(this, 'expand');
      },
      contract: function () {
        this.expanded = false;
        Galaxy.ui.utility.removeClass(this, 'expand');
      },
      on: function (flag) {
        Galaxy.ui.utility.removeClass(this, 'off');
      },
      off: function (flag) {
        Galaxy.ui.utility.addClass(this, 'off');
      },
      clean: function () {
        this.innerHTML = "";
      }
    },
    events: {}
  };

  xtag.register('system-float-menu', FloatMenu);
})();
/* global xtag */

(function () {
  var InputJson = {
    lifecycle: {
      created: function () {
        this.xtag.elementType = 'input';
        this.xtag.allFields = [];
        this.xtag.fields = [];
        this.xtag.lastField = this.createField('', '');
        this.xtag.active = this.xtag.lastField;

        this.elementType = this.xtag.elementType;

        this.updateFieldsCount();
      }
    },
    methods: {
      createField: function (nameValue, valueValue) {
        var jsonInput = this;
        var name = document.createElement('input');
        name.value = nameValue;
        name.className = 'name';
        name.placeholder = 'name';

        var value = document.createElement('input');
        if ('object' === typeof valueValue) {
          value = document.createElement('system-input-json');
        }
        value.value = valueValue;
        value.className = 'value';
        value.placeholder = 'value';
        value.elementType = '';

        var field = document.createElement('p');

        name.addEventListener('keyup', function (e) {
          jsonInput.updateFieldsCount();
        });

        name.addEventListener('focus', function (e) {
          jsonInput.xtag.active = field;
        });

        value.addEventListener('keyup', function (e) {
          jsonInput.updateFieldsCount();
        });

        value.addEventListener('focus', function (e) {
          jsonInput.xtag.active = field;
        });

        field._name = name;
        field.appendChild(name);
        field.appendChild(value);

        this.xtag.allFields.push({
          name: name,
          value: value,
          field: field
        });

        this.appendChild(field);

        return {
          name: name,
          value: value,
          field: field
        };
      },
      updateFieldsCount: function () {
        var jsonInput = this;
        var newFields = [];
        this.xtag.fields = [];
        this.xtag.allFields.forEach(function (item) {
          if (!item.name.value && (!item.value.value || Object.keys(item.value.value).length === 0) && item.field.parentNode && item.field !== jsonInput.xtag.lastField.field) {
            item.field.parentNode.removeChild(item.field);
            return;
          }

          if (item.value.nodeName === 'INPUT' && item.value.value === '{}') {
            var json = document.createElement('system-input-json');
            json.className = 'value';
            item.field.replaceChild(json, item.value);
            item.value = json;
            json.focus();
          }

          if (item.field !== jsonInput.xtag.lastField.field) {
            jsonInput.xtag.fields.push(item);
          }

          newFields.push(item);
        });

        this.xtag.allFields = newFields;

        if (!jsonInput.xtag.lastField.name || jsonInput.xtag.lastField.name.value) {
          jsonInput.xtag.lastField = this.createField('', '');
        }

        if (jsonInput.xtag.active && jsonInput.xtag.active.parentNode) {
          jsonInput.xtag.active.focus();
        } else {
          jsonInput.xtag.lastField.name.focus();
        }
      },
      focus: function () {
        this.xtag.allFields[this.xtag.allFields.length - 1].name.focus();
      }
    },
    accessors: {
      value: {
        set: function (data) {
          var jsonInput = this;

          if (jsonInput.xtag.allFields)
            jsonInput.xtag.allFields.forEach(function (item) {
              if (item.field.parentNode)
                item.field.parentNode.removeChild(item.field);
            });

          jsonInput.xtag.allFields = [];
          jsonInput.xtag.fields = [];

          if ('string' === typeof data)
            data = JSON.parse(data);

          if ('object' !== typeof data) {
            return;
          }

          if (Object.keys(data).length === 0) {
            jsonInput.xtag.lastField = jsonInput.createField('', '');
            jsonInput.xtag.allFields.push(jsonInput.xtag.lastField);
          } else {
            for (var key in data) {
              if (data.hasOwnProperty(key)) {
                jsonInput.xtag.lastField = jsonInput.createField(key, data[key]);
                jsonInput.xtag.allFields.push(jsonInput.xtag.lastField);
              }
            }

            jsonInput.xtag.lastField = {};
          }

          jsonInput.updateFieldsCount();
        },
        get: function () {
          var value = {};
          this.xtag.fields.forEach(function (item) {
            if (item.name.value !== '') {
              value[item.name.value] = item.value.value;
            }
          });

          return value;
        }
      },
      elementType: {
        attribute: {},
        set: function (value) {
          this.xtag.elementType = value;
        },
        get: function () {
          return this.xtag.elementType;
        }
      }
    }
  };

  xtag.register('system-input-json', InputJson);
})();
/* global xtag, Galaxy */

(function () {
  var List = {
    lifecycle: {
      created: function () {
        this.template = this.innerHTML;
        this.xtag.selectedStyle = 'selected';
        this.xtag.action = '[item]';
        this.innerHTML = "";
        this.links = {};
        this.data = [];
        this.value = -1;
      },
      inserted: function () {
      },
      attributeChanged: function (attrName, oldValue, newValue) {
      }
    },
    methods: {
      render: function (data, action) {
        //var data = this.data;
        this.innerHTML = "";
        var selectableItem = null;
        for (var i = 0, len = data.length; i < len; i++) {
          //data[i]._itemIndex = i;
          var item = xtag.createFragment(Galaxy.ui.utility.populate(this.template, data[i]));
          if (action) {
            selectableItem = xtag.query(item, action)[0];

            if (selectableItem) {
              selectableItem.dataset.index = i;
              selectableItem.setAttribute('item', '');

              if (data[i].id) {
                this.links[data[i].id] = selectableItem;
              }

              this.links[i] = selectableItem;
            }
          }

          this.appendChild(item);
        }
      },
      selectItem: function (i, element) {
        var oldItem = this.links[this.xtag.value];
        if (oldItem) {
          Galaxy.ui.utility.removeClass(oldItem, this.xtag.selectedStyle);
        }

        var newItem = this.links[i];
        if (this.data[i].id) {
          newItem = this.links[this.data[i].id];
        }

        Galaxy.ui.utility.addClass(newItem, this.xtag.selectedStyle);

        xtag.fireEvent(this, 'item-selected', {
          detail: {
            index: i,
            data: this.xtag.data[i],
            element: element
          }
        });
      }
    },
    accessors: {
      data: {
        set: function (value) {
          var element = this;

          this.value = -1;
          if ("object" !== typeof value) {
            this.xtag.data = [];
            value = [];
          }

          var toRender = value;

          this.xtag.data = value;

          if (this.onSetData) {
            this.onSetData(toRender);
          }

          this.render(toRender, this.xtag.action);
        },
        get: function () {
          return this.xtag.data;
        }
      },
      onSetData: {
        attribute: {
          validate: function (value) {
            this.xtag.onSetData = value;
            return '[ function ]';
          }
        },
        set: function (value) {
        },
        get: function (value) {
          return this.xtag.onSetData;
        }
      },
      selectedStyle: {
        attribute: {},
        set: function (value) {
          this.xtag.selectedStyle = value;
        },
        get: function () {
          return this.xtag.selectedStyle;
        }
      },
      value: {
        attribute: {},
        set: function (value, oldValue) {
          if (value === oldValue) {
            return;
          }

          value = parseInt(value);

          if (value > -1 && /*value !== this.xtag.value && */this.xtag.data.length) {
            this.selectItem(value, this.links[value]);
          }

          this.xtag.value = value;


        },
        get: function () {
          return this.xtag.value;
        }
      },
      action: {
        attribute: {},
        set: function (value) {
          this.xtag.action = value;
        },
        get: function () {
          return this.xtag.action;
        }
      }
    },
    events: {
      "click:delegate([item])": function (e) {
        e.preventDefault();
        e.currentTarget.value = this.dataset.index;
      },
      "tap:delegate([item])": function (e) {
        e.preventDefault();
        e.currentTarget.value = this.dataset.index;
      }
    }
  };

  xtag.register('system-list', List);
})();

(function () {
  var SortableList = {
    lifecycle: {
      created: function () {
        this.xtag.placeHolder = document.createElement("li");
        this.xtag.placeHolder.className += "placeholder";

        this.xtag.glass = document.createElement("div");
        this.xtag.glass.style.position = "absolute";
        this.xtag.glass.style.width = "100%";
        this.xtag.glass.style.height = "100%";

        this.style.overflow = "hidden";
        this.isValidParent = function () {
          return true;
        };
        this.onDrop = function () {
        };
      },
      inserted: function () {

      },
      removed: function () {

      }
    },
    events: {
      mousedown: function (event) {
        //console.log("down");
      },
      "mousedown:delegate(.handle)": function (e) {
        var dim = this.getBoundingClientRect();
        e.currentTarget.xtag.initDragPosition = {
          x: e.pageX - dim.left,
          y: e.pageY - dim.top
        };

        var draggedItem = this;
        while (draggedItem.tagName.toLowerCase() !== "li") {
          draggedItem = draggedItem.parentNode;
        }

        var diDimension = draggedItem.getBoundingClientRect();
        e.currentTarget.xtag.draggedItem = draggedItem;
        draggedItem.style.position = "fixed";
        draggedItem.style.width = diDimension.width + "px";
        draggedItem.style.height = diDimension.height + "px";
        e.currentTarget.xtag.glass.width = diDimension.width + "px";
        e.currentTarget.xtag.glass.height = diDimension.height + "px";
        draggedItem.appendChild(e.currentTarget.xtag.glass);
        Galaxy.ui.utility.addClass(draggedItem, "dragged");

        //console.log(e, draggedItem);
        e.stopPropagation();
        e.preventDefault();
      },
      "mouseup:delegate(.handle)": function (e) {
        e.stopPropagation();
        e.preventDefault();
      },
      mousemove: function (event) {
        if (!this.xtag.draggedItem)
          return;

        var groups = this.querySelectorAll("ul");
        var groupDim = [
        ];
        for (var i = 0, len = groups.length; i < len; i++) {
          groupDim.push(groups[i].getBoundingClientRect());
        }

        var parent = null;
        var index = 0;
        var indexElement = null;

        for (var i = groupDim.length - 1; i >= 0; i--) {
          var parentDim = groupDim[i];
          if (event.pageX > parentDim.left && event.pageX < parentDim.right && event.pageY > parentDim.top && event.pageY < parentDim.bottom) {
            parent = groups[i];
            //indexElement = parent.lastChild;
            var children = parent.childNodes || [
            ];
            var childElements = [
            ];
            //index = childElements.length;
            for (var n = 0; n < children.length; n++) {
              if (children[n].tagName.toLowerCase() !== "li" || children[n] === this.xtag.draggedItem /*|| children[n].className === "placeholder"*/)
                continue;
              childElements.push(children[n]);
            }
            //console.log(childElements)
            var extra = {
              height: 0,
              left: 0
            };
            for (n = childElements.length - 1; n >= 0; n--) {
              if (childElements[n].className === "placeholder") {
                //extra = childElements[n].getBoundingClientRect();
                //console.log(extra.height)
                continue;
              }

              var childDim = childElements[n].getBoundingClientRect();

              if (event.pageY > childDim.top && event.pageY < childDim.top + (childDim.height / 2) /*&& event.pageY + extra.height < childDim.bottom - (childDim.height / 2)*/) {
                index = n;
                indexElement = childElements[index] /*|| parent.firstChild*/;
                //console.log("above", index);
                //console.log(childDim, event.pageY, n)
                break;
              } else if (event.pageY >= childDim.top + (childDim.height / 2) /*&& event.pageY < childDim.bottom*/) {
                index = n + 1;
                indexElement = childElements[index];
                //console.log("lower", index);
                //console.log(childDim, event.pageY, n)
                break;
              } else {
                indexElement = this.xtag.tempIndexElement;
                //console.log(extra, event.pageY)
              }
              //console.log(extra)
              //extra.height = 0;
              //extra.top = 0;
            }
            break;
          }
        }

        this.xtag.draggedItem.style.left = event.pageX - this.xtag.initDragPosition.x + "px";
        this.xtag.draggedItem.style.top = event.pageY - this.xtag.initDragPosition.y + "px";

        if (parent && (this.xtag.tempParent !== parent || this.xtag.tempIndexElement !== indexElement)) {
          this.xtag.tempParent = parent;
          this.xtag.tempIndex = index;
          this.xtag.tempIndexElement = indexElement;
          if (this.isValidParent(this.xtag.draggedItem, parent, this.xtag.tempIndex)) {
            //console.log(indexElement)
            if (indexElement && indexElement.parentNode === parent)
              parent.insertBefore(this.xtag.placeHolder, indexElement);
            else if (!indexElement)
              parent.insertBefore(this.xtag.placeHolder, indexElement);
          }
        }
      },
      mouseup: function (event) {
        //console.log("up");
        if (this.xtag.draggedItem) {
          this.xtag.draggedItem.style.position = "";
          this.xtag.draggedItem.style.width = "";
          this.xtag.draggedItem.style.height = "";
          this.xtag.draggedItem.style.left = "";
          this.xtag.draggedItem.style.top = "";
          this.xtag.draggedItem.removeChild(this.xtag.glass);
          Galaxy.ui.utility.removeClass(this.xtag.draggedItem, "dragged");

          if (this.xtag.placeHolder.parentNode) {
            this.onDrop(this.xtag.draggedItem, this.xtag.tempParent, this.xtag.tempIndex);
            this.xtag.placeHolder.parentNode.replaceChild(this.xtag.draggedItem, this.xtag.placeHolder);
          }

          this.xtag.draggedItem = null;
          this.xtag.tempParent = null;
          this.xtag.tempIndex = null;
        }
        event.preventDefault();
        event.stopPropagation();
      }

    }
  };

  xtag.register('system-sortable-list', SortableList);
})();
(function () {
  var SwitchButton = {
    lifecycle: {
      created: function () {
        this.xtag.active = false;
      },
      inserted: function () {
      },
      removed: function () {
      },
      attributeChanged: function (attrName, oldValue, newValue) {

      }
    },
    accessors: {
      name: {
        attribute: {}
      },
      module: {
        attribute: {}
      },
      active: {
        attribute: {
          //boolean: true
        },
        set: function (value) {
          xtag.fireEvent(this, 'switched', {
            detail: {
              active: Boolean(value)
            },
            bubbles: true,
            cancelable: true
          });
          this.xtag.active = Boolean(value);
        },
        get: function () {
          return this.xtag.active;
        }
      }
    },
    events: {
      click: function (event) {
        if (this.xtag.active) {
          event.currentTarget.removeAttribute('active');
        } else {
          event.currentTarget.setAttribute('active', 'true');
        }
      }
    }
  };

  xtag.register('system-button-switch', SwitchButton);
})();
/* global xtag */

(function () {
  var UITemplate = {
    lifecycle: {
      created: function () {
        this.xtag.validate = false;
        this.xtag.show = true;

        if (!this.name) {
          throw "system-ui-view missing the `name` attribute";
        }

        this.xtag.placeholder = document.createComment(' ' + this.module + '/' + this.name + ' ');
      },
      inserted: function () {
        if (this.xtag.validate) {
          this.xtag.originalParent = this.parentNode;
          return;
        }

        this.xtag.originalParent = this.parentNode;
        if (this.xtag.showWhenAdded) {
          this.xtag.showWhenAdded = null;
          this.show();
          return;
        }
      },
      removed: function () {
        this.xtag.validate = false;
      }
    },
    methods: {
      show: function () {
        this.xtag.validate = true;
        this.xtag.shouldBeShown = true;
        if (!this.xtag.originalParent) {
          this.xtag.showAsSoonAsAdded = true;
          return;
        }
        if (this.xtag.placeholder.parentNode)
          this.xtag.originalParent.replaceChild(this, this.xtag.placeholder);
      },
      hide: function () {
        this.xtag.originalParent = this.parentNode;
        this.xtag.originalParent.replaceChild(this.xtag.placeholder, this);
      }
    },
    accessors: {
      name: {
        attribute: {}
      },
      module: {
        attribute: {}
      },
      validate: {
        attribute: {},
        set: function (value) {
          this.xtag.validate = value;
        },
        get: function (value) {
          return this.xtag.validate;
        }
      }
    }
  };

  xtag.register('system-ui-view', UITemplate);
})();