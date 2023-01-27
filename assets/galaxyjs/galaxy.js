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
    this.bootModule = null;
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
          const v = obj[i];
          if (v instanceof Promise) {
            clone[i] = v;
          } else if (typeof (v) === 'object' && v !== null) {
            if (i === 'animations' && v && typeof v === 'object') {
              clone[i] = v;
            } else {
              clone[i] = Galaxy.clone(v);
            }
          } else {
            clone[i] = v;
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

      bootModule.id = 'root';

      if (!_this.rootElement) {
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

        if (!module.id) {
          module.id = module.path.indexOf('/') === 0 ? module.path.substring(1) : module.path /*+ '-' + (new Date()).valueOf() + '-' + Math.round(performance.now())*/;
        }
        module.systemId = module.parentScope ? module.parentScope.systemId + '/' + module.id : module.id;

        let invokers = [module.path];
        if (module.invokers) {
          if (module.invokers.indexOf(module.path) !== -1) {
            throw new Error('circular dependencies: \n' + module.invokers.join('\n') + '\nwant to load: ' + module.path);
          }

          invokers = module.invokers;
          invokers.push(module.path);
        }

        let url = module.path /*+ '?' + _this.convertToURIString(module.params || {})*/;
        // if (module.params) debugger
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
                // params: item.params,
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
          if (output) {
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

/* global Galaxy */
Galaxy.Observer = /** @class */ (function () {
  const defProp = Object.defineProperty;

  Observer.notify = function (obj, key, value) {
    const observers = obj.__observers__;

    if (observers !== undefined) {
      observers.forEach(function (observer) {
        observer.notify(key, value);
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
     */
    notify: function (key, value) {
      const _this = this;

      if (_this.subjectsActions.hasOwnProperty(key)) {
        _this.subjectsActions[key].call(_this.context, value);
      }

      _this.allSubjectAction.forEach(function (action) {
        action.call(_this.context, key, value);
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
    const _data = _this.element.data ? Galaxy.View.bindSubjectsToData(_this.element, _this.element.data, _this.parentScope, true) : {};
    defProp(_this, 'data', {
      enumerable: true,
      configurable: true,
      get: function () {
        return _data;
      },
      set: function (value) {
        Object.assign(_data, value);
      }
    });

    /**
     * @property {{
     *   'galaxy/view': Galaxy.View,
     *   'galaxy/router': Galaxy.Router,
     *   [libId]: any
     * }} __imports__
     */

    defProp(_this, '__imports__', {
      value: {},
      writable: false,
      enumerable: false,
      configurable: false
    });

    _this.on('module.destroy', this.destroy.bind(_this));
  }



  Scope.prototype = {
    /**
     *
     * @param {string} id ID string which is going to be used for importing
     * @param {Object} instance The assigned object to this id
     */
    inject: function (id, instance) {
      this.__imports__[id] = instance;
    },
    /**
     *
     * @param {('galaxy/view' | 'galaxy/router' | string)} libId Path or id of the addon you want to import
     * @return {(Galaxy.View | Galaxy.Router | any)}
     */
    import: function (libId) {
      // if the id starts with `./` then we will replace it with the current scope path.
      if (libId.indexOf('./') === 0) {
        libId = libId.replace('./', this.uri.path);
      }


      return this.__imports__[libId];
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

    kill: function () {
      throw Error('Scope.kill() should not be invoked at the runtime');
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
Galaxy.View = /** @class */(function (G) {
  const defProp = Object.defineProperty;
  const objKeys = Object.keys;
  const arrConcat = Array.prototype.concat.bind([]);
  // Extracted from MDN
  const validTagNames = [
    'text',
    'comment',
    //
    'a',
    'abbr',
    'acronym',
    'address',
    'applet',
    'area',
    'article',
    'aside',
    'audio',
    'b',
    'base',
    'basefont',
    'bdi',
    'bdo',
    'bgsound',
    'big',
    'blink',
    'blockquote',
    'body',
    'br',
    'button',
    'canvas',
    'caption',
    'center',
    'cite',
    'code',
    'col',
    'colgroup',
    'content',
    'data',
    'datalist',
    'dd',
    'decorator',
    'del',
    'details',
    'dfn',
    'dir',
    'div',
    'dl',
    'dt',
    'element',
    'em',
    'embed',
    'fieldset',
    'figcaption',
    'figure',
    'font',
    'footer',
    'form',
    'frame',
    'frameset',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hgroup',
    'hr',
    'html',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'isindex',
    'kbd',
    'keygen',
    'label',
    'legend',
    'li',
    'link',
    'listing',
    'main',
    'map',
    'mark',
    'marquee',
    'menu',
    'menuitem',
    'meta',
    'meter',
    'nav',
    'nobr',
    'noframes',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'option',
    'output',
    'p',
    'param',
    'plaintext',
    'pre',
    'progress',
    'q',
    'rp',
    'rt',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'shadow',
    'small',
    'source',
    'spacer',
    'span',
    'strike',
    'strong',
    'style',
    'sub',
    'summary',
    'sup',
    'table',
    'tbody',
    'td',
    'template',
    'textarea',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'track',
    'tt',
    'u',
    'ul',
    'var',
    'video',
    'wbr',
    'xmp'
  ];

  function apply_node_dataset(node, value) {
    if (typeof value === 'object' && value !== null) {
      const stringifyValue = {};
      for (const key in value) {
        const val = value[key];
        if (typeof val === 'object') {
          stringifyValue[key] = JSON.stringify(val);
        } else {
          stringifyValue[key] = val;
        }
      }
      Object.assign(node.dataset, stringifyValue);
    } else {
      node.dataset = null;
    }
  }

  //------------------------------

  Array.prototype.createDataMap = function (keyPropertyName, valuePropertyName) {
    const map = {};
    for (let i = 0, len = this.length; i < len; i++) {
      const item = this[i];
      map[item[keyPropertyName]] = item[valuePropertyName];
    }

    return map;
  };

  View.EMPTY_CALL = function EMPTY_CALL() {
  };

  View.GET_MAX_INDEX = function () {
    return '@' + performance.now();
  };

  View.BINDING_SYNTAX_REGEX = new RegExp('^<([^\\[\\]<>]*)>\\s*([^\\[\\]<>]*)\\s*$|^=\\s*([^\\[\\]<>]*)\\s*$');

  /**
   *
   * @typedef {Object} Galaxy.View.BlueprintProperty
   * @property {string} [key]
   * @property {'attr'|'prop'|'reactive'|'event'} [type]
   * @property {Function} [getConfig]
   * @property {Function} [install]
   * @property {Function} [beforeActivate]
   * @property {Function} [getSetter]
   * @property {Function} [update]
   */

  View.REACTIVE_BEHAVIORS = {
    data: true
  };

  View.COMPONENTS = {};
  /**
   *
   * @type {{[property: string]: Galaxy.View.BlueprintProperty}}
   */
  View.NODE_BLUEPRINT_PROPERTY_MAP = {
    tag: {
      type: 'none'
    },
    props: {
      type: 'none'
    },
    children: {
      type: 'none'
    },
    data_3: {
      type: 'none',
      key: 'data',
    },
    data_8: {
      type: 'none',
      key: 'data',
    },
    // dataset: {
    //   type: 'prop',
    //   update: (vn, value) => {
    //     if (typeof value === 'object' && value !== null) {
    //       Object.assign(vn.node.dataset, value);
    //     } else {
    //       vn.node.dataset = null;
    //     }
    //   }
    // },
    html: {
      type: 'prop',
      key: 'innerHTML'
    },
    data: {
      type: 'reactive',
      key: 'data',
      getConfig: function (scope, value) {
        if (value !== null && (typeof value !== 'object' || value instanceof Array)) {
          throw new Error('data property should be an object with explicits keys:\n' + JSON.stringify(this.blueprint, null, '  '));
        }

        return {
          reactiveData: null,
          subjects: value,
          scope: scope
        };
      },
      install: function (config) {
        if (config.scope.data === config.subjects) {
          throw new Error('It is not allowed to use Scope.data as data value');
        }

        if (!this.blueprint.module) {
          config.reactiveData = G.View.bindSubjectsToData(this, config.subjects, config.scope, true);
          const observer = new G.Observer(config.reactiveData);
          observer.onAll((key, value) => {
            apply_node_dataset(this.node, config.reactiveData);
          });

          return;
        }

        Object.assign(this.data, config.subjects);
        return false;
      },
      update: function (config, value, expression) {
        if (expression) {
          value = expression();
        }

        if (config.subjects === value) {
          value = config.reactiveData;
        }

        apply_node_dataset(this.node, value);
      }
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

  // let opt_count = 0;
  // const _next_batch = function (_jump, dirty) {
  //   if (dirty) {
  //     return _jump();
  //   }
  //
  //   if (opt_count > 233) {
  //     opt_count = 0;
  //     // console.log(performance.now());
  //     return requestAnimationFrame(() => {
  //       if (dirty) {
  //         return _jump();
  //       }
  //
  //       if (this.length) {
  //         this.shift()(_next_batch.bind(this, _jump));
  //       } else {
  //         _jump();
  //       }
  //     });
  //   }
  //
  //   opt_count++;
  //   if (this.length) {
  //     this.shift()(_next_batch.bind(this, _jump));
  //   } else {
  //     _jump();
  //   }
  // };

  /**
   *
   * @param data
   * @param {string} properties
   * @return {*}
   */
  function safe_property_lookup(data, properties) {
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

    return target === undefined ? null : target;
  }

  const dom_manipulation_table = View.DOM_MANIPLATION = {};
  const create_order = [], destroy_order = [];
  let dom_manipulation_order = [];
  let manipulation_done = true, dom_manipulations_dirty = false;
  let diff = 0, preTS = 0, too_many_jumps;

  const next_action = function (_jump, dirty) {
    if (dirty) {
      return _jump();
    }

    if (this.length) {
      this.shift()(next_action.bind(this, _jump));
    } else {
      _jump();
    }
  };

  const next_batch_body = function () {
    if (this.length) {
      let key = this.shift();
      let batch = dom_manipulation_table[key];
      if (!batch.length) {
        return next_batch.call(this);
      }

      next_action.call(batch, next_batch.bind(this), dom_manipulations_dirty);
    } else {
      manipulation_done = true;
      preTS = 0;
      diff = 0;
    }
  };

  const next_batch = function () {
    if (dom_manipulations_dirty) {
      dom_manipulations_dirty = false;
      diff = 0;
      return next_batch.call(dom_manipulation_order);
    }

    const now = performance.now();
    preTS = preTS || now;
    diff = diff + (now - preTS);
    preTS = now;

    if (diff > 2) {
      diff = 0;
      if (too_many_jumps) {
        clearTimeout(too_many_jumps);
        too_many_jumps = null;
      }

      too_many_jumps = setTimeout((ts) => {
        preTS = ts;
        next_batch_body.call(this);
      });
    } else {
      next_batch_body.call(this);
    }
  };

  function comp_asc(a, b) {
    return a > b;
  }

  function comp_desc(a, b) {
    return a < b;
  }

  function binary_search(array, key, _fn) {
    let start = 0;
    let end = array.length - 1;
    let index = 0;

    while (start <= end) {
      let middle = Math.floor((start + end) / 2);
      let midVal = array[middle];

      if (_fn(key, midVal)) {
        // continue searching to the right
        index = start = middle + 1;
      } else {
        // search searching to the left
        index = middle;
        end = middle - 1;
      }
    }

    return index;
  }

  function pos_asc(array, el) {
    if (el < array[0]) {
      return 0;
    }

    if (el > array[array.length - 1]) {
      return array.length;
    }

    return binary_search(array, el, comp_asc);
  }

  function pos_desc(array, el) {
    if (el > array[0]) {
      return 0;
    }

    if (el < array[array.length - 1]) {
      return array.length;
    }

    return binary_search(array, el, comp_desc);
  }

  function add_dom_manipulation(index, act, order, search) {
    if (dom_manipulation_table.hasOwnProperty(index)) {
      dom_manipulation_table[index].push(act);
    } else {
      dom_manipulation_table[index] = [act];
      order.splice(search(order, index), 0, index);
    }
  }

  let last_dom_manipulation_id;

  function update_dom_manipulation_order() {
    if (last_dom_manipulation_id) {
      clearTimeout(last_dom_manipulation_id);
      last_dom_manipulation_id = null;
    }

    dom_manipulation_order = arrConcat(destroy_order, create_order);
    last_dom_manipulation_id = setTimeout(() => {
      if (manipulation_done) {
        manipulation_done = false;
        next_batch.call(dom_manipulation_order);
      }
    });
  }

  // function update_on_animation_frame() {
  //   if (last_dom_manipulation_id) {
  //     clearTimeout(last_dom_manipulation_id);
  //     last_dom_manipulation_id = null;
  //   }
  //
  //   dom_manipulation_order = arrConcat(destroy_order, create_order);
  //   last_dom_manipulation_id = setTimeout(() => {
  //     if (manipulation_done) {
  //       manipulation_done = false;
  //       next_batch.call(dom_manipulation_order);
  //     }
  //   });
  // }
  //
  // function update_on_timeout() {
  //   if (last_dom_manipulation_id) {
  //     cancelAnimationFrame(last_dom_manipulation_id);
  //     last_dom_manipulation_id = null;
  //   }
  //
  //   dom_manipulation_order = arrConcat(destroy_order, create_order);
  //   last_dom_manipulation_id = requestAnimationFrame(() => {
  //     if (manipulation_done) {
  //       manipulation_done = false;
  //       next_batch.call(dom_manipulation_order);
  //     }
  //   });
  // }

  /**
   *
   * @param {string} index
   * @param {Function} action
   * @memberOf Galaxy.View
   * @static
   */
  View.DESTROY_IN_NEXT_FRAME = function (index, action) {
    dom_manipulations_dirty = true;
    add_dom_manipulation('<' + index, action, destroy_order, pos_desc);
    update_dom_manipulation_order();
  };

  /**
   *
   * @param {string} index
   * @param {Function} action
   * @memberOf Galaxy.View
   * @static
   */
  View.CREATE_IN_NEXT_FRAME = function (index, action) {
    dom_manipulations_dirty = true;
    add_dom_manipulation('>' + index, action, create_order, pos_asc);
    update_dom_manipulation_order();
  };

  /**
   *
   * @param {Array<Galaxy.View.ViewNode>} toBeRemoved
   * @param {boolean} hasAnimation
   * @memberOf Galaxy.View
   * @static
   */
  View.DESTROY_NODES = function (toBeRemoved, hasAnimation) {
    let remove = null;

    for (let i = 0, len = toBeRemoved.length; i < len; i++) {
      remove = toBeRemoved[i];
      remove.destroy(hasAnimation);
    }
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} viewNode
   * @param value
   * @param name
   */
  View.setAttr = function setAttr(viewNode, value, name) {
    if (value !== null && value !== undefined && value !== false) {
      viewNode.node.setAttribute(name, value === true ? '' : value);
    } else {
      viewNode.node.removeAttribute(name);
    }
  };

  View.setProp = function setProp(viewNode, value, name) {
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

  const arg_default_value = /=\s*'<>(.*)'|=\s*"<>(.*)"/m;
  const function_head = /^\(\s*([^)]+?)\s*\)|^function.*\(\s*([^)]+?)\s*\)/m;
  /**
   *
   * @param {string|Array} value
   * @return {{propertyKeys: *[], isExpression: boolean, expressionFn: null}}
   */
  View.getBindings = function (value) {
    let allProperties = null;
    let propertyKeys = [];
    let propertyValues = [];
    let isExpression = false;
    const valueType = typeof (value);
    let handler = null;

    if (valueType === 'string') {
      const props = value.match(View.BINDING_SYNTAX_REGEX);
      if (props) {
        allProperties = [value];
      }
    } else if (valueType === 'function') {
      const matches = value.toString().match(function_head);
      if (matches) {
        const args = matches[1] || matches [2];
        propertyValues = args.split(',').map(a => {
          const argDef = a.match(arg_default_value);
          return argDef ? '<>' + (argDef[1] || argDef[2]) : undefined;
        });
        allProperties = propertyValues.slice();
        handler = value;
        isExpression = true;
      }
    } else {
      allProperties = null;
    }

    if (allProperties) {
      propertyKeys = allProperties.filter(pkp => {
        return typeof pkp === 'string' && pkp.indexOf('<>') === 0;
      });

      // allProperties.forEach(p => {
      //   if(typeof p === 'string' && p.indexOf('<>') === 0) {
      //     const key = p.replace(/<>/g, '')
      //     propertyKeys.push(p);
      //     propertyValues.push('_prop(scope, "' + key + '")');
      //   } else {
      //     propertyValues.push('_var["' + key + '"]');
      //   }
      // });
    }

    return {
      propertyKeys: propertyKeys ? propertyKeys.map(function (name) {
        return name.replace(/<>/g, '');
      }) : null,
      propertyValues: propertyValues,
      handler: handler,
      isExpression: isExpression,
      expressionFn: null
    };
  };

  View.propertyLookup = function (data, key) {
    key = key.split('.');
    let firstKey = key[0];
    const original = data;
    let target = data;
    let temp = data;
    let nestingLevel = 0;
    let parent;
    if (data[firstKey] === undefined) {
      while (temp.__parent__) {
        parent = temp.__parent__;
        if (parent.hasOwnProperty(firstKey)) {
          target = parent;
          break;
        }

        if (nestingLevel++ >= 1000) {
          throw Error('Maximum nested property lookup has reached `' + firstKey + '`\n' + data);
        }

        temp = parent;
      }

      // if the property is not found in the parents then return the original object as the context
      if (target[firstKey] === undefined) {
        return original;
      }
    }

    return target;
  };

  /**
   *
   * @param data
   * @param absoluteKey
   * @returns {Galaxy.View.ReactiveData}
   */
  View.propertyRDLookup = function (data, absoluteKey) {
    const keys = absoluteKey.split('.');
    const li = keys.length - 1;
    let target = data;
    keys.forEach(function (p, i) {
      target = View.propertyLookup(target, p);

      if (i !== li) {
        if (!target[p]) {
          const rd = target.__rd__.refs.filter(ref => ref.shadow[p])[0];
          target = rd.shadow[p].data;
        } else {
          target = target[p];
        }
      }
    });

    return target.__rd__;
  };

  View.EXPRESSION_ARGS_FUNC_CACHE = {};

  View.createArgumentsProviderFn = function (propertyValues) {
    const id = propertyValues.join();

    if (View.EXPRESSION_ARGS_FUNC_CACHE[id]) {
      return View.EXPRESSION_ARGS_FUNC_CACHE[id];
    }

    let functionContent = 'return [';
    let middle = [];
    for (let i = 0, len = propertyValues.length; i < len; i++) {
      const val = propertyValues[i];
      if (typeof val === 'string') {
        if (val.indexOf('<>this.') === 0) {
          middle.push('_prop(this.data, "' + val.replace('<>this.', '') + '")');
        } else if (val.indexOf('<>') === 0) {
          middle.push('_prop(scope, "' + val.replace(/<>/g, '') + '")');
        }
      } else {
        middle.push('_var[' + i + ']');
      }
    }
    functionContent += middle.join(',') + ']';

    const func = new Function('scope, _prop , _var', functionContent);
    View.EXPRESSION_ARGS_FUNC_CACHE[id] = func;

    return func;
  };

  View.createExpressionFunction = function (host, scope, handler, keys, values) {
    if (!values[0]) {
      if (host instanceof G.View.ViewNode) {
        values[0] = host.data;
      } else {
        values[0] = scope;
      }
    }

    const getExpressionArguments = G.View.createArgumentsProviderFn(values);

    return function () {
      let args = [];
      try {
        args = getExpressionArguments.call(host, scope, safe_property_lookup, values);
      } catch (ex) {
        console.error('Can\'t find the property: \n' + keys.join('\n'), '\n\nIt is recommended to inject the parent object instead' +
          ' of its property.\n\n', scope, '\n', ex);
      }

      return handler.apply(host, args);
    };
  };

  /**
   *
   * @param bindings
   * @param target
   * @param scope
   * @returns {Function|boolean}
   */
  View.getExpressionFn = function (bindings, target, scope) {
    if (!bindings.isExpression) {
      return false;
    }

    if (bindings.expressionFn) {
      return bindings.expressionFn;
    }

    // Generate expression arguments
    try {
      bindings.expressionFn = G.View.createExpressionFunction(target, scope, bindings.handler, bindings.propertyKeys, bindings.propertyValues);
      return bindings.expressionFn;
    } catch (exception) {
      throw Error(exception.message + '\n', bindings.propertyKeys);
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
    const propertyKeys = bindings.propertyKeys;
    const expressionFn = View.getExpressionFn(bindings, root, scopeData);

    let propertyScopeData = scopeData;
    let propertyKey = null;
    let childPropertyKeyPath = null;
    let initValue = null;
    let propertyKeyPathItems = [];
    for (let i = 0, len = propertyKeys.length; i < len; i++) {
      propertyKey = propertyKeys[i];
      childPropertyKeyPath = null;

      propertyKeyPathItems = propertyKey.split('.');
      if (propertyKeyPathItems.length > 1) {
        propertyKey = propertyKeyPathItems[0];
        childPropertyKeyPath = propertyKeyPathItems.slice(1).join('.');
      }

      if (!hostReactiveData && scopeData /*&& !(scopeData instanceof G.Scope)*/) {
        if ('__rd__' in scopeData) {
          hostReactiveData = scopeData.__rd__;
        } else {
          hostReactiveData = new G.View.ReactiveData(null, scopeData, scopeData instanceof Galaxy.Scope ? scopeData.systemId : 'child');
        }
      }
      // When the scopeData is a childScopeData
      // But developer should still be able to access parent/root scopeData
      if (propertyKeyPathItems[0] === 'data' && scopeData && scopeData.hasOwnProperty('__scope__') &&
        propertyKey === 'data') {
        hostReactiveData = null;
      }

      // If the property name is `this` and its index is zero, then it is pointing to the ViewNode.data property
      if (propertyKeyPathItems[0] === 'this' && propertyKey === 'this' && root instanceof G.View.ViewNode) {
        propertyKey = propertyKeyPathItems[1];
        bindings.propertyKeys = propertyKeyPathItems.slice(2);
        childPropertyKeyPath = null;
        hostReactiveData = new G.View.ReactiveData('data', root.data, 'this');
        propertyScopeData = View.propertyLookup(root.data, propertyKey);
      } else if (propertyScopeData) {
        // Look for the property host object in scopeData hierarchy
        propertyScopeData = View.propertyLookup(propertyScopeData, propertyKey);
      }

      initValue = propertyScopeData;
      if (propertyScopeData !== null && typeof propertyScopeData === 'object') {
        initValue = propertyScopeData[propertyKey];
      }

      let reactiveData;
      if (initValue instanceof Object) {
        reactiveData = new G.View.ReactiveData(propertyKey, initValue, hostReactiveData || scopeData.__scope__.__rd__);
      } else if (childPropertyKeyPath) {
        reactiveData = new G.View.ReactiveData(propertyKey, null, hostReactiveData);
      } else if (hostReactiveData) {
        // if the propertyKey is used for a repeat reactive property, then we assume its type is Array.
        hostReactiveData.addKeyToShadow(propertyKey, targetKeyName === 'repeat');
      }

      if (childPropertyKeyPath === null) {
        if (!(target instanceof G.View.ViewNode)) {
          defProp(target, targetKeyName, {
            set: function ref_set(newValue) {
              // console.warn('It is not allowed', hostReactiveData, targetKeyName);
              // Not sure about this part
              // This will provide binding to primitive data types as well.
              if (expressionFn) {
                // console.log(newValue, target[targetKeyName], targetKeyName, propertyKey);
                // console.warn('It is not allowed to set value for an expression', targetKeyName, newValue);
                return;
              }

              if (hostReactiveData.data[propertyKey] === newValue) {
                return;
              }

              hostReactiveData.data[propertyKey] = newValue;
            },
            get: function ref_get() {
              if (expressionFn) {
                return expressionFn();
              }

              return hostReactiveData.data[propertyKey];
            },
            enumerable: true,
            configurable: true
          });
        }

        if (hostReactiveData && scopeData instanceof G.Scope) {
          // If the propertyKey is referring to some local value then there is no error
          if (target instanceof G.View.ViewNode && target.localPropertyNames.has(propertyKey)) {
            return;
          }

          // throw new Error('Binding to Scope direct properties is not allowed.\n' +
          //   'Try to define your properties on Scope.data.{property_name}\n' + 'path: ' + scopeData.uri.parsedURL + '\nProperty name: `' +
          //   propertyKey + '`\n');
        }

        hostReactiveData.addNode(target, targetKeyName, propertyKey, expressionFn);
      }

      if (childPropertyKeyPath !== null) {
        View.makeBinding(target, targetKeyName, reactiveData, initValue, Object.assign({}, bindings, { propertyKeys: [childPropertyKeyPath] }), root);
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
    const keys = objKeys(subjects);
    let attributeName;
    let attributeValue;
    const subjectsClone = cloneSubject ? G.clone(subjects) : subjects;

    let parentReactiveData;
    if (!(data instanceof G.Scope)) {
      parentReactiveData = new G.View.ReactiveData(null, data, 'BSTD');
    }

    for (let i = 0, len = keys.length; i < len; i++) {
      attributeName = keys[i];
      attributeValue = subjectsClone[attributeName];
      const bindings = View.getBindings(attributeValue);
      if (bindings.propertyKeys.length) {
        View.makeBinding(subjectsClone, attributeName, parentReactiveData, data, bindings, viewNode);
        if (viewNode) {
          bindings.propertyKeys.forEach(function (path) {
            try {
              const rd = View.propertyRDLookup(data, path);
              viewNode.finalize.push(() => {
                rd.removeNode(subjectsClone);
              });
            } catch (error) {
              console.error('bindSubjectsToData -> Could not find: ' + path + '\n in', data, error);
            }
          });
        }
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
    const property = View.NODE_BLUEPRINT_PROPERTY_MAP[propertyKey] || { type: 'attr' };
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
    const bpKey = propertyKey + '_' + viewNode.node.nodeType;
    let property = View.NODE_BLUEPRINT_PROPERTY_MAP[bpKey] || View.NODE_BLUEPRINT_PROPERTY_MAP[propertyKey];
    if (!property) {
      property = { type: 'prop' };
      if (!(propertyKey in viewNode.node) && 'setAttribute' in viewNode.node) {
        property = { type: 'attr' };
      }

      View.NODE_BLUEPRINT_PROPERTY_MAP[bpKey] = property;
    }

    property.key = property.key || propertyKey;

    switch (property.type) {
      case 'attr':
      case 'prop':
      case 'reactive':
        View.getPropertySetterForNode(property, viewNode)(value, null);
        break;

      case 'event':
        viewNode.node[propertyKey] = function (event) {
          value.call(viewNode, event, viewNode.data);
        };
        break;
    }
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

    if (scope.element instanceof G.View.ViewNode) {
      _this.container = scope.element;
      // Nested views should inherit components from their parent view
      _this._components = Object.assign({}, scope.element.view._components);
    } else {
      _this.container = new G.View.ViewNode({
        tag: scope.element
      }, null, _this);

      _this.container.setInDOM(true);
    }
  }

  View.prototype = {
    _components: {},
    components: function (map) {
      for (const key in map) {
        const comp = map[key];
        if (typeof comp !== 'function') {
          throw new Error('Component must be type of function: ' + key);
        }

        this._components[key] = comp;
      }
    },

    /**
     *
     * @param {string} key
     * @param blueprint
     * @param {Galaxy.Scope|Object} scopeData
     * @returns {*}
     */
    getComponent: function (key, blueprint, scopeData) {
      let componentScope = scopeData;
      let componentBlueprint = blueprint;
      if (key) {
        if (key in this._components) {
          if (blueprint.props && typeof blueprint.props !== 'object') {
            throw new Error('The `props` must be a literal object.');
          }

          componentScope = View.createChildScope(scopeData);
          Object.assign(componentScope, blueprint.props || {});

          View.bindSubjectsToData(null, componentScope, scopeData);
          componentBlueprint = this._components[key].call(null, componentScope, blueprint, this);
          if (blueprint instanceof Array) {
            throw new Error('A component\'s blueprint can NOT be an array. A component must have only one root node.');
          }
        } else if (validTagNames.indexOf(key) === -1) {
          console.warn('Invalid component/tag: ' + key);
        }
      }

      return {
        blueprint: Object.assign(blueprint, componentBlueprint),
        scopeData: componentScope
      };
    },

    /**
     *
     * @param {{enter?: AnimationConfig, leave?:AnimationConfig}} animations
     * @returns Blueprint
     */
    addTimeline: function (animations) {
      return {
        tag: 'comment',
        text: 'timeline',
        animations
      };
    },

    enterKeyframe: function (onComplete, timeline, durOrPos) {
      let position = undefined;
      let duration = durOrPos || .01;
      if (typeof timeline === 'number') {
        duration = timeline;
        timeline = null;
      } else if (typeof timeline === 'string') {
        position = durOrPos;
        duration = .01;
      }

      return {
        tag: 'comment',
        text: 'keyframe:enter',
        animations: {
          enter: {
            duration,
            timeline,
            position,
            onComplete
          }
        }
      };
    },
    leaveKeyframe: function (onComplete, timeline, durOrPos) {
      let position = undefined;
      let duration = durOrPos || .01;
      if (typeof timeline === 'number') {
        duration = timeline;
        timeline = null;
      } else if (typeof timeline === 'string') {
        position = durOrPos;
        duration = .01;
      }

      return {
        tag: 'comment',
        text: 'keyframe:leave',
        animations: {
          leave: {
            duration,
            timeline,
            position,
            onComplete
          }
        }
      };
    },
    /**
     *
     * @param {Blueprint|Blueprint[]} blueprint
     * @return {Galaxy.View.ViewNode|Array<Galaxy.View.ViewNode>}
     */
    blueprint: function (blueprint) {
      const _this = this;
      return this.createNode(blueprint, _this.scope, _this.container, null);
    },
    /**
     *
     * @param {boolean} [hasAnimation]
     */
    clean: function (hasAnimation) {
      this.container.clean(hasAnimation);
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
          // parent.node.appendChild(node);
          const viewNode = new G.View.ViewNode({ tag: node }, parent, _this);
          parent.registerChild(viewNode, position);
          node.parentNode.removeChild(node);
          View.setPropertyForNode(viewNode, 'animations', {});
          viewNode.setInDOM(true);
        });

        return nodes;
      } else if (typeof blueprint === 'function') {
        return blueprint.call(_this);
      } else if (blueprint instanceof Array) {
        const result = [];
        for (i = 0, len = blueprint.length; i < len; i++) {
          result.push(_this.createNode(blueprint[i], scopeData, parent, null));
        }

        return result;
      } else if (blueprint instanceof Object) {
        const component = _this.getComponent(blueprint.tag, blueprint, scopeData);
        let propertyValue, propertyKey;
        const keys = objKeys(component.blueprint);
        const needInitKeys = [];
        const viewNode = new G.View.ViewNode(component.blueprint, parent, _this, component.scopeData);
        parent.registerChild(viewNode, position);

        // Behaviors installation stage
        for (i = 0, len = keys.length; i < len; i++) {
          propertyKey = keys[i];
          const needValueAssign = View.installPropertyForNode(propertyKey, viewNode, propertyKey, component.scopeData);
          if (needValueAssign === false) {
            continue;
          }

          needInitKeys.push(propertyKey);
        }

        // Value assignment stage
        for (i = 0, len = needInitKeys.length; i < len; i++) {
          propertyKey = needInitKeys[i];
          if (propertyKey === 'children') continue;

          propertyValue = component.blueprint[propertyKey];
          const bindings = View.getBindings(propertyValue);
          if (bindings.propertyKeys.length) {
            View.makeBinding(viewNode, propertyKey, null, component.scopeData, bindings, viewNode);
          } else {
            View.setPropertyForNode(viewNode, propertyKey, propertyValue);
          }
        }

        if (!viewNode.virtual) {
          viewNode.setInDOM(true);
          if (component.blueprint.children) {
            _this.createNode(component.blueprint.children, component.scopeData, viewNode, null);
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
      if (typeof child === 'string' || child.tag === 'comment') return;
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
    let parsedContent = content.replace(/^\/\/.*$/gm, '').replace(/Scope\.import\(['"](.*)['"]\)/gm, function (match, path) {
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

    parsedContent = parsedContent.replace(/Scope\.importAsText\(['"](.*)['"]\)/gm, function (match, path) {
      let query = path.match(/([\S]+)/gm);
      let pathURL = query[query.length - 1] + '#text';
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

    parsedContent = parsedContent.replace(/Scope\.kill\(.*\)/gm, 'return');

    return {
      imports: imports,
      source: parsedContent
    };
  }
})(Galaxy.Module.Content);

/* global Galaxy */
(function (G) {
  G.View.PROPERTY_SETTERS.attr = function (viewNode, property, expression) {
    const attrName = property.key;
    const updateFn = property.update || G.View.setAttr;
    const setter = function A(value) {
      if (value instanceof Promise) {
        const asyncCall = function (asyncValue) {
          updateFn(viewNode, asyncValue, attrName);
        };
        value.then(asyncCall).catch(asyncCall);
      } else if (value instanceof Function) {
        const result = value.call(viewNode, viewNode.data);
        updateFn(viewNode, result, attrName);
      } else {
        updateFn(viewNode, value, attrName);
      }
    };

    if (expression) {
      return function A_EXP() {
        const expressionValue = expression();
        setter(expressionValue);
      };
    }

    return setter;
  };
})(Galaxy);

/* global Galaxy */
(function (G) {
  G.View.PROPERTY_SETTERS.prop = function (viewNode, property, expression) {
    const propName = property.key;
    const updateFn = property.update || G.View.setProp;
    const setter = function P(value) {
      if (value instanceof Promise) {
        const asyncCall = function (asyncValue) {
          updateFn(viewNode, asyncValue, propName);
        };
        value.then(asyncCall).catch(asyncCall);
      } else if (value instanceof Function) {
        const result = value.call(viewNode, viewNode.data);
        updateFn(viewNode, result, propName);
      } else {
        updateFn(viewNode, value, propName);
      }
    };

    if (expression) {
      return function P_EXP() {
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
    return function R(value) {
      return nodeUpdateFn(config, value, expression, scope);
    };
  }
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

    // Object.preventExtensions(this);
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
      id: id || 'Scope',
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


  /**
   * @param {string} id
   * @param {Object} data
   * @param {Galaxy.View.ReactiveData} p
   * @constructor
   * @memberOf Galaxy.View
   */
  function ReactiveData(id, data, p) {
    const parent = p instanceof ReactiveData ? p : scopeBuilder(p);
    this.data = data;
    this.id = parent.id + (id ? '.' + id : '|Scope');
    this.keyInParent = id;
    this.nodesMap = {};
    this.parent = parent;
    this.refs = [];
    this.shadow = {};
    this.nodeCount = -1;

    if (this.data && this.data.hasOwnProperty('__rd__')) {
      this.refs = this.data.__rd__.refs;
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
        if (this.parent.data[id]) {
          // debugger
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

      if (this.data instanceof Galaxy.Scope || this.data.__scope__) {
        this.addKeyToShadow = G.View.EMPTY_CALL;
      }

      if (this.data instanceof Galaxy.Scope) {
        this.walkOnScope(this.data);
      } else {
        this.walk(this.data);
      }
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
          this.sync('length', this.data.length);
          this.sync('changes', this.data.changes);
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

    walkOnScope: function (scope) {
      // this.makeReactiveObject(scope, 'data');
    },
    /**
     *
     * @param data
     * @param {string} key
     * @param shadow
     */
    makeReactiveObject: function (data, key, shadow) {
      let value = data[key];
      if (typeof value === 'function') {
        return;
      }

      const property = Object.getOwnPropertyDescriptor(data, key);
      const getter = property && property.get;
      const setter = property && property.set;

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
              thisRD.sync(key, val);
            } else if (val instanceof Object) {
              thisRD.notifyDown(key);
            }
            return;
          }

          value = val;

          // This means that the property suppose to be an object and there is probably an active binds to it
          // the active bind could be in one of the ref so we have to check all the ref shadows
          if (!thisRD) debugger;
          for (let i = 0, len = thisRD.refs.length; i < len; i++) {
            const ref = thisRD.refs[i];
            if (ref.shadow[key]) {
              ref.makeKeyEnum(key);
              // setData provide downward data flow
              // debugger
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
      this.sync(key, value);
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

      _this.sync('length', arr.length);
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
            thisRD.notify(thisRD.keyInParent, this);

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
      if (this.refs === refs) {
        this.sync(key, value);
        return;
      }

      for (let i = 0, len = this.refs.length; i < len; i++) {
        const ref = this.refs[i];
        if (this === ref) {
          continue;
        }

        ref.notify(key, value, this.refs);
      }

      this.sync(key, value);
      for (let i = 0, len = this.refs.length; i < len; i++) {
        const ref = this.refs[i];
        const keyInParent = ref.keyInParent;
        const refParent = ref.parent;
        ref.parent.notify(keyInParent, refParent.data[keyInParent]);
      }
    },

    notifyDown: function (key) {
      const value = this.data[key];

      for (let i = 0, len = this.refs.length; i < len; i++) {
        const ref = this.refs[i];
        if (this === ref) {
          continue;
        }

        ref.notify(key, value, this.refs);
      }

      this.sync(key, this.data[key]);
    },
    /**
     *
     * @param {string} propertyKey
     * @param {*} value
     */
    sync: function (propertyKey, value) {
      const _this = this;

      const map = _this.nodesMap[propertyKey];
      // const value = _this.data[propertyKey];

      // notify the observers on the data
      G.Observer.notify(_this.data, propertyKey, value);

      if (map) {
        for (let i = 0, len = map.nodes.length; i < len; i++) {
          const node = map.nodes[i];
          const key = map.keys[i];
          _this.syncNode(node, key, value);
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
        _this.sync(keys[i], _this.data[keys[i]]);
      }
    },
    /**
     *
     * @param node
     * @param {string} key
     * @param {*} value
     */
    syncNode: function (node, key, value) {
      // Pass a copy of the ArrayChange to every bound
      if (value instanceof G.View.ArrayChange) {
        value = value.getInstance();
      }

      if (node instanceof G.View.ViewNode) {
        node.setters[key](value);
      } else {
        node[key] = value;
      }

      G.Observer.notify(node, key, value);
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
        // TODO: We either need to return the object to its original state or do nothing
        // debugger
        // delete this.data.__rd__;
        // if (this.data instanceof Array) {
        // delete this.data.live;
        // delete this.data.changes;
        // debugger
        // }
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

/* global Galaxy, Promise */
Galaxy.View.ViewNode = /** @class */ (function (G) {
  const GV = G.View;
  const commentNode = document.createComment('');
  const defProp = Object.defineProperty;
  const EMPTY_CALL = Galaxy.View.EMPTY_CALL;
  const CREATE_IN_NEXT_FRAME = G.View.CREATE_IN_NEXT_FRAME;
  const DESTROY_IN_NEXT_FRAME = G.View.DESTROY_IN_NEXT_FRAME;

  function create_comment(t) {
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
  function create_elem(tagName, parentViewNode) {
    if (tagName === 'svg' || (parentViewNode && parentViewNode.blueprint.tag === 'svg')) {
      return document.createElementNS('http://www.w3.org/2000/svg', tagName);
    }

    if (tagName === 'comment') {
      return document.createComment('ViewNode');
    }

    return document.createElement(tagName);
  }

  // function generate_index(vn) {
  //   if (vn.parent) {
  //     let i = 0;
  //     let node = vn.node;
  //     while ((node = node.previousSibling) !== null) ++i;
  //
  //     if (i === 0 && vn.placeholder.parentNode) {
  //       i = arrIndexOf.call(vn.parent.node.childNodes, vn.placeholder);
  //     }
  //     return vn.parent.index + ',' + ViewNode.createIndex(i);
  //   }
  //
  //   return '0';
  // }

  // const view_node_template = {
  //   blueprint: {},
  //   destroyOrigin: 0,
  //   localPropertyNames: new Set(),
  //   properties: new Set(),
  //   finalize: [],
  //   placeholder: {},
  //   populateLeaveSequence: EMPTY_CALL,
  //   hasBeenDestroyed: EMPTY_CALL,
  //   inDOM: true,
  //   parent: null,
  //   node: null,
  // };
  //
  // function convert_to_simple_view_node(node, index) {
  //   const vn = Object.assign({}, view_node_template, {
  //     // parent: node.parent ? node.parent : node.parentNode ? convert_to_simple_view_node(node.parentNode) : {},
  //     parent: node.parent ? node.parent : { destroyOrigin: 0 },
  //     node: node,
  //     index: index
  //   });
  //
  //   vn.clean = ViewNode.prototype.clean.bind(vn);
  //   vn.prepareLeaveSequence = ViewNode.prototype.prepareLeaveSequence.bind(vn);
  //   vn.getChildNodes = ViewNode.prototype.getChildNodes.bind(vn);
  //   vn.hasAnimation = ViewNode.prototype.hasAnimation.bind(vn);
  //   vn.destroy = ViewNode.prototype.destroy.bind(vn);
  //   node.__vn__ = vn;
  //   return vn;
  // }

  function insert_before(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function remove_child(node, child) {
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

  GV.NODE_BLUEPRINT_PROPERTY_MAP['_render'] = {
    type: 'prop',
    key: '_render',
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
   * @property {function} [_render]
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

  function REMOVE_SELF(destroy) {
    const viewNode = this;

    if (destroy) {
      // Destroy
      viewNode.node.parentNode && remove_child(viewNode.node.parentNode, viewNode.node);
      viewNode.placeholder.parentNode && remove_child(viewNode.placeholder.parentNode, viewNode.placeholder);
      viewNode.garbage.forEach(function (node) {
        REMOVE_SELF.call(node, true);
      });
      viewNode.hasBeenDestroyed();
    } else {
      // Detach
      if (!viewNode.placeholder.parentNode) {
        insert_before(viewNode.node.parentNode, viewNode.placeholder, viewNode.node);
      }

      if (viewNode.node.parentNode) {
        remove_child(viewNode.node.parentNode, viewNode.node);
      }

      viewNode.garbage.forEach(function (node) {
        REMOVE_SELF.call(node, true);
      });
    }

    viewNode.garbage = [];
  }

  /**
   *
   * @param {Blueprint} blueprint
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
      blueprint.tag = blueprint.tag.tagName;
      if (_this.node instanceof Text) {
        _this.populateEnterSequence = EMPTY_CALL;
      }
    } else {
      _this.node = create_elem(blueprint.tag || 'div', parent);
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
    _this.placeholder = create_comment(blueprint.tag || 'div');
    _this.properties = new Set();
    _this.inDOM = false;
    _this.setters = {};
    /** @type {Galaxy.View.ViewNode} */
    _this.parent = parent;
    _this.finalize = [];
    _this.origin = false;
    _this.destroyOrigin = 0;
    _this.transitory = false;
    _this.garbage = [];
    _this.leaveWithParent = false;
    _this.onLeaveComplete = REMOVE_SELF.bind(_this, true);

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
          if (_this.blueprint._render) {
            _this.blueprint._render.call(_this, _this.data);
          }
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

    _this.destroyed = new Promise(function (done) {
      _this.hasBeenDestroyed = function () {
        _this.destroyed.resolved = true;
        if (_this.blueprint._destroy) {
          _this.blueprint._destroy.call(_this, _this.data);
        }
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
      let original = this.parent;
      let targetGarbage = this.garbage;
      // Find the garbage of the origin if
      while (original.transitory) {
        if (original.blueprint.hasOwnProperty('if') && !this.blueprint.hasOwnProperty('if')) {
          targetGarbage = original.garbage;
        }
        if (original.parent && original.parent.transitory) {
          original = original.parent;
        } else {
          break;
        }
      }
      targetGarbage.push(this);
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
      this.placeholder.nodeValue = JSON.stringify(this.blueprint, (k, v) => {
        return k === 'children' ? '<children>' : k === 'animations' ? '<animations>' : v;
      }, 2);
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

    /**
     *
     * @param {boolean} flag
     */
    setInDOM: function (flag) {
      const _this = this;
      if (_this.blueprint.renderConfig.renderDetached) {
        _this.blueprint.renderConfig.renderDetached = false;
        CREATE_IN_NEXT_FRAME(_this.index, (_next) => {
          _this.hasBeenRendered();
          _next();
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
          insert_before(_this.placeholder.parentNode, _this.node, _this.placeholder.nextSibling);
        }

        if (_this.placeholder.parentNode) {
          remove_child(_this.placeholder.parentNode, _this.placeholder);
        }

        CREATE_IN_NEXT_FRAME(_this.index, (_next) => {
          _this.hasBeenRendered();
          _this.populateEnterSequence();
          _next();
        });
      } else if (!flag && _this.node.parentNode) {
        _this.origin = true;
        _this.transitory = true;
        const defaultPopulateLeaveSequence = _this.populateLeaveSequence;
        const children = _this.getChildNodes();
        _this.prepareLeaveSequence(_this.hasAnimation(children), children);
        DESTROY_IN_NEXT_FRAME(_this.index, (_next) => {
          _this.populateLeaveSequence(REMOVE_SELF.bind(_this, false));
          _this.origin = false;
          _this.transitory = false;
          _this.populateLeaveSequence = defaultPopulateLeaveSequence;
          _next();
        });
      }
    },

    setVisibility: function (flag) {
      const _this = this;
      _this.visible = flag;

      if (flag && !_this.virtual) {
        CREATE_IN_NEXT_FRAME(_this.index, (_next) => {
          _this.node.style.display = null;
          _this.populateEnterSequence();
          _next();
        });
      } else if (!flag && _this.node.parentNode) {
        _this.origin = true;
        _this.transitory = true;
        DESTROY_IN_NEXT_FRAME(_this.index, (_next) => {
          _this.populateHideSequence();
          _this.origin = false;
          _this.transitory = false;
          _next();
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

    snapshot: function (animations) {
      const rect = this.node.getBoundingClientRect();
      const node = this.node.cloneNode(true);
      const style = {
        margin: '0',
        width: rect.width + 'px',
        height: rect.height + ' px',
        top: rect.top + 'px',
        left: rect.left + 'px',
        position: 'fixed',
      };
      Object.assign(node.style, style);

      return {
        tag: node,
        style: style
      };
    },

    hasAnimation: function (children) {
      if (this.populateLeaveSequence && this.populateLeaveSequence !== EMPTY_CALL) {
        return true;
      }

      for (let i = 0, len = children.length; i < len; i++) {
        const node = children[i];
        if (node.hasAnimation(node.getChildNodes())) {
          return true;
        }
      }

      return false;
    },

    prepareLeaveSequence: function (hasAnimation, children) {
      const _this = this;

      if (hasAnimation) {
        if (_this.populateLeaveSequence === EMPTY_CALL && _this.origin) {
          _this.populateLeaveSequence = function () {
            REMOVE_SELF.call(_this, false);
          };
        } else if (_this.populateLeaveSequence !== EMPTY_CALL && !_this.origin) {
          // Children with leave animation should not get removed from dom for visual purposes.
          // Since their this node already has a leave animation and eventually will be removed from dom.
          // this is not the case for when this node is being detached by if
          // const children = _this.getChildNodes();
          for (let i = 0, len = children.length; i < len; i++) {
            children[i].onLeaveComplete = EMPTY_CALL;
          }
        }
      } else {
        _this.populateLeaveSequence = function () {
          REMOVE_SELF.call(_this, !_this.origin);
        };
      }
    },

    destroy: function (hasAnimation) {
      const _this = this;
      _this.transitory = true;
      // if(!_this.parent)debugger;
      if (_this.parent.destroyOrigin === 0) {
        _this.destroyOrigin = 1;
      } else {
        _this.destroyOrigin = 2;
      }

      if (_this.inDOM) {
        const children = _this.getChildNodes();
        hasAnimation = hasAnimation || _this.hasAnimation(children);
        _this.prepareLeaveSequence(hasAnimation, children);
        _this.clean(hasAnimation, children);
      }

      _this.properties.forEach((reactiveData) => reactiveData.removeNode(_this));

      let len = _this.finalize.length;
      for (let i = 0; i < len; i++) {
        _this.finalize[i].call(_this);
      }

      DESTROY_IN_NEXT_FRAME(_this.index, (_next) => {
        _this.populateLeaveSequence(_this.destroyOrigin === 2 ? EMPTY_CALL : _this.onLeaveComplete);
        _this.localPropertyNames.clear();
        _this.properties.clear();
        _this.finalize = [];
        _this.inDOM = false;
        _this.inputs = {};
        _this.view = null;
        _this.parent = null;
        Reflect.deleteProperty(_this.blueprint, 'node');
        _next();
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
    clean: function (hasAnimation, children) {
      children = children || this.getChildNodes();
      GV.DESTROY_NODES(children, hasAnimation);

      DESTROY_IN_NEXT_FRAME(this.index, (_next) => {
        let len = this.finalize.length;
        for (let i = 0; i < len; i++) {
          this.finalize[i].call(this);
        }
        this.finalize = [];
        _next();
      });
    },

    createNext: function (act) {
      CREATE_IN_NEXT_FRAME(this.index, act);
    },

    get index() {
      const parent = this.parent;

      // This solution is very performant but might not be reliable
      if (parent) {
        let prevNode = this.placeholder.parentNode ? this.placeholder.previousSibling : this.node.previousSibling;
        if (prevNode) {
          if (!prevNode.hasOwnProperty('__index__')) {
            let i = 0;
            let node = this.node;
            while ((node = node.previousSibling) !== null) ++i;
            prevNode.__index__ = i;
          }
          this.node.__index__ = prevNode.__index__ + 1;
        } else {
          this.node.__index__ = 0;
        }

        return parent.index + ',' + ViewNode.createIndex(this.node.__index__);
      }

      // This solution is much more reliable however it's very slow
      // if (parent) {
      //   let i = 0;
      //   let node = this.node;
      //   while ((node = node.previousSibling) !== null) ++i;
      //   // i = arrIndexOf.call(parent.node.childNodes, node);
      //
      //   if (i === 0 && this.placeholder.parentNode) {
      //     i = arrIndexOf.call(parent.node.childNodes, this.placeholder);
      //   }
      //   return parent.index + ',' + ViewNode.createIndex(i);
      // }

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

/* global Galaxy, gsap */
(function (G) {
  if (!window.gsap) {
    G.setupTimeline = function () {};
    G.View.NODE_BLUEPRINT_PROPERTY_MAP['animations'] = {
      type: 'prop',
      key: 'animations',
      /**
       *
       * @param {Galaxy.View.ViewNode} viewNode
       * @param animationDescriptions
       */
      update: function (viewNode, animationDescriptions) {
        if (animationDescriptions.enter && animationDescriptions.enter.onComplete) {
          viewNode.populateEnterSequence = animationDescriptions.enter.onComplete;
        }
        viewNode.populateLeaveSequence = (onComplete) => {
          onComplete();
        };
      }
    };

    window.gsap = {
      to: function (node, props) {
        return requestAnimationFrame(() => {
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
     * @param animations
     */
    update: function (viewNode, animations) {
      if (viewNode.virtual || !animations) {
        return;
      }

      const enter = animations.enter;
      if (enter) {
        viewNode.populateEnterSequence = function () {
          process_enter_animation(this, enter);
        };
      }

      const leave = animations.leave;
      if (leave) {
        // We need an empty enter animation in order to have a proper behavior for if
        if (!enter && viewNode.blueprint.if) {
          console.warn('The following node has `if` and a `leave` animation but does NOT have a `enter` animation.' +
            '\nThis can result in unexpected UI behavior.\nTry to define a `enter` animation that negates the leave animation to prevent unexpected behavior\n\n');
          console.warn(viewNode.node);
        }

        viewNode.populateLeaveSequence = function (finalize) {
          const active = AnimationMeta.parseStep(viewNode, leave.active);
          if (active === false) {
            return leave_with_parent.call(viewNode, finalize);
          }

          const withParentResult = AnimationMeta.parseStep(viewNode, leave.withParent);
          viewNode.leaveWithParent = withParentResult === true;
          const _node = this.node;
          if (gsap.getTweensOf(_node).length) {
            gsap.killTweensOf(_node);
          }

          if (withParentResult) {
            // if the leaveWithParent flag is there, then apply animation only to non-transitory nodes
            const parent = this.parent;
            if (parent.transitory) {
              // We dump _node, so it gets removed when the leave's animation's origin node is detached.
              // This fixes a bug where removed elements stay in DOM if the cause of the leave animation is a 'if'
              return this.dump();
            }
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

        // Hide timeline is the same as leave timeline.
        // The only difference is that hide timeline will add `display: 'none'` to the node at the end
        viewNode.populateHideSequence = viewNode.populateLeaveSequence.bind(viewNode, () => {
          viewNode.node.style.display = 'none';
        });
      } else {
        // By default, imitate leave with parent behavior
        viewNode.populateLeaveSequence = leave_with_parent.bind(viewNode);
      }

      const viewNodeCache = viewNode.cache;
      if (viewNodeCache.class && viewNodeCache.class.observer) {
        viewNode.rendered.then(function () {
          const classes = viewNodeCache.class.observer.context;

          // Apply final state for class animations
          for (const key in classes) {
            const type = Boolean(classes[key]);
            const animationConfig = get_class_based_animation_config(animations, type, key);
            if (animationConfig) {
              // debugger
              gsap.set(viewNode.node, AnimationMeta.parseStep(viewNode, animationConfig.to));
              // debugger
            }
          }

          viewNodeCache.class.observer.onAll((className) => {
            const addOrRemove = Boolean(classes[className]);
            const animationConfig = get_class_based_animation_config(animations, addOrRemove, className);

            if (animationConfig) {
              kill_tweens_by_class_name(viewNodeCache, className);
              process_class_animation(viewNode, animationConfig, addOrRemove, className);
            }
          });
        });
      }
    }
  };

  /**
   *
   * @param {Galaxy.View.ViewNode} viewNode
   * @param {AnimationConfig} animationConfig
   * @returns {*}
   */
  function process_enter_animation(viewNode, animationConfig) {
    if (animationConfig instanceof Array) {
      animationConfig.forEach((a) => {
        process_enter_animation(viewNode, a);
      });
    } else {
      const _node = viewNode.node;
      if (animationConfig.withParent) {
        // if parent has an enter animation, then ignore viewNode's animation
        // so viewNode can enter with its parent
        if (hasParentEnterAnimation(viewNode)) {
          return gsap.set(_node, AnimationMeta.parseStep(viewNode, animationConfig.to) || {});
        }

        const parent = viewNode.parent;
        // if enter.withParent flag is there, then only apply animation to the nodes are rendered rendered
        if (!parent.rendered.resolved) {
          return;
        }
      }

      if (gsap.getTweensOf(_node).length) {
        gsap.killTweensOf(_node);
      }

      AnimationMeta.installGSAPAnimation(viewNode, 'enter', animationConfig);
    }
  }

  /**
   *
   * @param {Galaxy.View.ViewNode} viewNode
   * @param {AnimationConfig} animationConfig
   * @param {boolean} addOrRemove
   * @param {string} className
   */
  function process_class_animation(viewNode, animationConfig, addOrRemove, className) {
    if (animationConfig instanceof Array) {
      animationConfig.forEach((ac) => {
        process_class_animation(viewNode, ac, addOrRemove, className);
      });
    } else {
      const animationType = get_class_based_animation_type(addOrRemove, className);
      const tweenKey = 'tween:' + className;
      const tweenExist = Boolean(viewNode.cache[tweenKey]);

      if (addOrRemove && (!viewNode.node.classList.contains(className) || tweenExist)) {
        AnimationMeta.setupOnComplete(animationConfig, () => {
          viewNode.node.classList.add(className);
        });
      } else if (!addOrRemove && (viewNode.node.classList.contains(className) || tweenExist)) {
        AnimationMeta.setupOnComplete(animationConfig, () => {
          viewNode.node.classList.remove(className);
        });
      }

      viewNode.cache[tweenKey] = viewNode.cache[tweenKey] || [];
      if (!animationConfig.timeline) {
        viewNode.cache[tweenKey].push(AnimationMeta.installGSAPAnimation(viewNode, animationType, animationConfig));
      }
    }
  }

  function kill_tweens_by_class_name(list, className) {
    const key = 'tween:' + className;
    if (!list[key]) return;

    list[key].forEach(t => t.kill());
    Reflect.deleteProperty(list, key);
  }

  function get_class_based_animation_type(type, key) {
    return type ? 'add:' + key : 'remove:' + key;
  }

  /**
   *
   * @param {*} animations
   * @param {boolean} type
   * @param {string} key
   * @returns {*}
   */
  function get_class_based_animation_config(animations, type, key) {
    const animationKey = get_class_based_animation_type(type, key);
    return animations[animationKey];
  }

  function leave_with_parent(finalize) {
    if (gsap.getTweensOf(this.node).length) {
      gsap.killTweensOf(this.node);
    }

    if (this.parent.transitory) {
      this.dump();
    } else {
      finalize();
    }
  }

  G.View.AnimationMeta = AnimationMeta;

  /**
   *
   * @typedef {Object} AnimationConfig
   * @property {boolean} [withParent]
   * @property {string} [timeline]
   * @property {string[]} [labels]
   * @property {Promise} [await]
   * @property {string|number} [startPosition]
   * @property {string|number} [positionInParent]
   * @property {string|number} [position]
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

    if (to) {
      to = Object.assign({}, to);
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
        duration: 0,
        onComplete: onComplete
      });
    } else {
      tween = gsap.to(node, {
        duration: 0,
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
      return step.call(node, node.data);
    }

    return {...step};
  };

  AnimationMeta.setupOnComplete = function (description, onComplete) {
    if (description.onComplete) {
      const userDefinedOnComplete = description.onComplete;
      description.onComplete = function () {
        userDefinedOnComplete();
        onComplete();
      };
    } else {
      description.onComplete = () => {
        onComplete();
      };
    }
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
      to = Object.assign(to || {}, { overwrite: 'none' });
    }
    /** @type {AnimationConfig} */
    const newConfig = Object.assign({}, descriptions);
    newConfig.from = from;
    newConfig.to = to;
    let timelineName = newConfig.timeline;

    if (newConfig.timeline instanceof Function) {
      timelineName = newConfig.timeline.call(viewNode);
    }

    let parentAnimationMeta = null;
    if (timelineName) {
      const animationMeta = new AnimationMeta(timelineName);
      // By calling 'addTo' first, we can provide a parent for the 'animationMeta.timeline'
      if (newConfig.addTo) {
        parentAnimationMeta = new AnimationMeta(newConfig.addTo);

        const children = parentAnimationMeta.timeline.getChildren(false);
        if (children.indexOf(animationMeta.timeline) === -1) {
          parentAnimationMeta.timeline.add(animationMeta.timeline, parentAnimationMeta.parsePosition(newConfig.positionInParent));
        }
        // animationMeta.addTo(parentAnimationMeta, newConfig.positionInParent);
      }

      // Make sure the await step is added to highest parent as long as that parent is not the 'gsap.globalTimeline'
      if (newConfig.await && animationMeta.awaits.indexOf(newConfig.await) === -1) {
        let parentTimeline = animationMeta.timeline;
        // console.log(parentTimeline.getChildren(false));
        while (parentTimeline.parent !== gsap.globalTimeline) {
          if (!parentTimeline.parent) return;
          parentTimeline = parentTimeline.parent;
        }

        animationMeta.awaits.push(newConfig.await);

        // The pauseTween will be removed from the parentTimeline by GSAP the moment the pause is hit
        const pauseTween = parentTimeline.addPause(newConfig.position, () => {
          if (viewNode.transitory || viewNode.destroyed.resolved) {
            return parentTimeline.resume();
          }

          newConfig.await.then(removeAwait);
        }).recent();

        const removeAwait = ((_pause) => {
          const index = animationMeta.awaits.indexOf(newConfig.await);
          if (index !== -1) {
            animationMeta.awaits.splice(index, 1);
            // Do not remove the pause if it is already executed
            if (_pause._initted) {
              parentTimeline.resume();
            } else {
              const children = parentTimeline.getChildren(false);
              if (children.indexOf(_pause) !== -1) {
                parentTimeline.remove(_pause);
              }
            }
          }
        }).bind(null, pauseTween);
        // We don't want the animation wait for await, if this `viewNode` is destroyed before await gets a chance
        // to be resolved. Therefore, we need to remove await.
        viewNode.finalize.push(() => {
          // if the element is removed before await is resolved, then make sure the element stays hidden
          if (animationMeta.awaits.indexOf(newConfig.await) !== -1 && viewNode.node.style) {
            viewNode.node.style.display = 'none';
          }
          removeAwait();
        });
      }

      // The first tween of an animation type(enter or leave) should use startPosition
      if (animationMeta.type && animationMeta.type !== type && (newConfig.position && newConfig.position.indexOf('=') !== -1)) {
        newConfig.position = newConfig.startPosition;
      }

      animationMeta.type = type;
      const tween = animationMeta.add(viewNode, newConfig, finalize);

      // In the case where the addToAnimationMeta.timeline has no child then animationMeta.timeline would be
      // its only child and we have to resume it if it's not playing
      if (newConfig.addTo && parentAnimationMeta) {
        if (!parentAnimationMeta.started /*&& parentAnimationMeta.name !== '<user-defined>'*/) {
          parentAnimationMeta.started = true;
          parentAnimationMeta.timeline.resume();
        }
      }

      return tween;
    } else {
      return AnimationMeta.createSimpleAnimation(viewNode, newConfig, finalize);
    }
  };

  const TIMELINE_SETUP_MAP = {};
  G.setupTimeline = function (name, labels) {
    TIMELINE_SETUP_MAP[name] = labels;
    const animationMeta = AnimationMeta.ANIMATIONS[name];
    if (animationMeta) {
      animationMeta.setupLabels(labels);
    }
  };
  Galaxy.TIMELINE_SETUP_MAP = TIMELINE_SETUP_MAP;

  /**
   *
   * @param {string} name
   * @class
   */
  function AnimationMeta(name) {
    const _this = this;
    if (name && typeof name !== 'string') {
      if (name.__am__) {
        return name.__am__;
      }

      const onComplete = name.eventCallback('onComplete') || Galaxy.View.EMPTY_CALL;

      _this.name = '<user-defined>';
      _this.timeline = name;
      _this.timeline.__am__ = this;
      _this.timeline.eventCallback('onComplete', function () {
        onComplete.call(_this.timeline);
        _this.onCompletesActions.forEach((action) => {
          action(_this.timeline);
        });
        _this.nodes = [];
        _this.awaits = [];
        _this.children = [];
        _this.onCompletesActions = [];
      });
      _this.parsePosition = (p) => p;
      _this.addTo = (tl) => {
        throw new Error('You can not use addTo with a custom timeline: ' + tl);
      };
    } else {
      const exist = AnimationMeta.ANIMATIONS[name];
      if (exist) {
        if (!exist.timeline.getChildren().length && !exist.timeline.isActive()) {
          exist.timeline.clear(false);
          exist.timeline.invalidate();
        }
        return exist;
      }

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
      _this.timeline.data = { name };
      _this.labelCounter = 0;
      _this.labelsMap = {};

      const labels = TIMELINE_SETUP_MAP[name];
      if (labels) {
        _this.setupLabels(labels);
      }

      AnimationMeta.ANIMATIONS[name] = this;
    }

    _this.type = null;
    _this.onCompletesActions = [];
    _this.started = false;
    _this.configs = {};
    _this.children = [];
    _this.nodes = [];
    _this.awaits = [];
  }

  AnimationMeta.prototype = {
    setupLabels: function (labels) {
      for (const label in labels) {
        const newLabel = 'label_' + this.labelCounter++;
        const position = labels[label];
        this.labelsMap[label] = newLabel;
        this.timeline.addLabel(newLabel, typeof position === 'number' ? '+=' + position : position);
      }
    },
    parsePosition: function (p) {
      let position = this.labelsMap[p] || p;
      let label = null;
      if (position) {
        if (position.indexOf('+=') !== -1) {
          const parts = position.split('+=');
          label = parts[0];
        } else if (position.indexOf('-=') !== -1) {
          const parts = position.split('-=');
          label = parts[0];
        }
      }

      if (label && label !== '<' && label !== '>') {
        position = position.replace(label, this.labelsMap[label]);
      }
      return position;
    },
    addOnComplete: function (action) {
      this.onCompletesActions.push(action);
    },
    addTo(parentAnimationMeta, positionInParent) {
      const children = parentAnimationMeta.timeline.getChildren(false);
      if (children.indexOf(this.timeline) === -1) {
        parentAnimationMeta.timeline.add(this.timeline, parentAnimationMeta.parsePosition(positionInParent));
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

      if (config.from && config.to) {
        const to = AnimationMeta.createStep(config.to, config.onStart, config.onComplete, viewNode);
        tween = gsap.fromTo(viewNode.node, config.from, to);
      } else if (config.from) {
        const from = AnimationMeta.createStep(config.from, config.onStart, config.onComplete, viewNode);
        tween = gsap.from(viewNode.node, from);
      } else {
        const to = AnimationMeta.createStep(config.to, config.onStart, config.onComplete, viewNode);
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

      const position = this.parsePosition(config.position);
      const tChildren = _this.timeline.getChildren(false);
      const firstChild = tChildren[0];

      if (tChildren.length === 0) {
        _this.timeline.add(tween, (position && position.indexOf('=') === -1) ? position : null);
      } else if (tChildren.length === 1 && !firstChild.hasOwnProperty('timeline') && firstChild.getChildren(false).length === 0) {
        // This fix a bug where if the 'enter' animation has addTo, then the 'leave' animation is ignored
        _this.timeline.clear(false);
        _this.timeline.add(tween, position);
      } else {
        _this.timeline.add(tween, position);
      }

      if (!_this.started && _this.name !== '<user-defined>') {
        _this.started = true;
        _this.timeline.resume();
      }

      return tween;
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
      const id = bindings.propertyKeys[0].split('.').pop();
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

          const nativeValue = nativeNode.hasAttribute('value') ? nativeNode.value : true;
          if (value instanceof Array) {
            nativeNode.checked = value.indexOf(nativeValue) !== -1;
          } else {
            nativeNode.checked = value === nativeValue;
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

      // when value is an object
      const viewNode = this;
      const reactiveClasses = config.reactiveClasses = G.View.bindSubjectsToData(viewNode, config.subjects, config.scope, true);
      const observer = config.observer = new G.Observer(reactiveClasses);
      const animations = viewNode.blueprint.animations || {};
      const gsapExist  = !!window.gsap.config;
      if (viewNode.blueprint.renderConfig.applyClassListAfterRender) {
        viewNode.rendered.then(() => {
          // ToDo: Don't know why this is here. It looks redundant
          // applyClasses(viewNode, reactiveClasses);
          observer.onAll((k) => {
            if (gsapExist && (animations['add:' + k] || animations['remove:' + k])) {
              return;
            }
            applyClasses(viewNode, reactiveClasses);
          });
        });
      } else {
        observer.onAll((k) => {
          if (gsapExist && (animations['add:' + k] || animations['remove:' + k])) {
            return;
          }
          applyClasses(viewNode, reactiveClasses);
        });
      }

      return true;
    },
    /**
     *
     * @param config
     * @param value
     * @param expression
     * @this {Galaxy.View.ViewNode}
     */
    update: function (config, value, expression) {
      if (this.virtual) {
        return;
      }

      /** @type Galaxy.View.ViewNode */
      const viewNode = this;
      const node = viewNode.node;

      if (expression) {
        value = expression();
      }

      if (typeof value === 'string' || value === null || value === undefined) {
        return node.className = value;
      } else if (value instanceof Array) {
        return node.className = value.join(' ');
      }

      if (config.subjects === value) {
        value = config.reactiveClasses;
      }

      // when value is an object
      if (viewNode.blueprint.renderConfig.applyClassListAfterRender) {
        viewNode.rendered.then(() => {
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
    const currentClasses = viewNode.node.className || [];
    const newClasses = getClasses(classes);
    if (JSON.stringify(currentClasses) === JSON.stringify(newClasses)) {
      return;
    }

    G.View.CREATE_IN_NEXT_FRAME(viewNode.index, (_next) => {
      viewNode.node.className = newClasses.join(' ');
      _next();
    });
  }
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
    update: function (viewNode, value, attr) {
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

      G.View.setAttr(viewNode, value ? '' : null, attr);
    }
  };
})(Galaxy);


/* global Galaxy */
(function (G) {
  G.View.REACTIVE_BEHAVIORS['if'] = true;
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['if'] = {
    type: 'reactive',
    key: 'if',
    getConfig: function () {
      return {
        throttleId: 0,
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
     * @param expression
     */
    update: function (config, value, expression) {
      if (config.throttleId !== 0) {
        window.clearTimeout(config.throttleId);
        config.throttleId = 0;
      }

      if (expression) {
        value = expression();
      }

      value = Boolean(value);

      if (!this.rendered.resolved && !value) {
        this.blueprint.renderConfig.renderDetached = true;
      }

      // setTimeout is called before requestAnimationTimeFrame
      config.throttleId = setTimeout(() => {
        this.rendered.then(() => {
          // this.node.setAttribute('data-if', value);
          if (this.inDOM !== value) {
            this.setInDOM(value);
          }
        });
      });
    }
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
    update: function handleModule(config, newModuleMeta, expression) {
      const _this = this;

      if (expression) {
        newModuleMeta = expression();
      }

      if (newModuleMeta === undefined) {
        return;
      }

      if (typeof newModuleMeta !== 'object') {
        return console.error('module property only accept objects as value', newModuleMeta);
      }

      if (newModuleMeta && config.moduleMeta && newModuleMeta.path === config.moduleMeta.path) {
        return;
      }

      if (!newModuleMeta || newModuleMeta !== config.moduleMeta) {
        G.View.DESTROY_IN_NEXT_FRAME(_this.index, (_next) => {
          clean_content(_this);
          _next();
        });
      }

      if (!_this.virtual && newModuleMeta && newModuleMeta.path && newModuleMeta !== config.moduleMeta) {
        G.View.CREATE_IN_NEXT_FRAME(_this.index, (_next) => {
          module_loader.call(null, _this, config, newModuleMeta, _next);
        });
      }
      config.moduleMeta = newModuleMeta;
    }
  };

  const EMPTY_CALL = Galaxy.View.EMPTY_CALL;

  /**
   *
   * @param {Galaxy.View.ViewNode} viewNode
   */
  function clean_content(viewNode) {
    const children = viewNode.getChildNodes();
    for (let i = 0, len = children.length; i < len; i++) {
      const vn = children[i];
      if (vn.populateLeaveSequence === EMPTY_CALL) {
        vn.populateLeaveSequence = function (finalize) {
          finalize();
        };
      }
    }

    viewNode.clean(true);

    // G.View.DESTROY_IN_NEXT_FRAME(viewNode.index, (_next) => {
    //   let len = viewNode.finalize.length;
    //   for (let i = 0; i < len; i++) {
    //     viewNode.finalize[i].call(viewNode);
    //   }
    //   viewNode.finalize = [];
    //   _next();
    // });
  }

  function module_loader(viewNode, cache, moduleMeta, _next) {
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

    currentScope.load(moduleMeta, {
      element: viewNode
    }).then(function (module) {
      cache.module = module;
      viewNode.node.setAttribute('module', module.path);
      module.start();
      _next();
    }).catch(function (response) {
      console.error(response);
      _next();
    });
  }
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
  const DESTROY_NODES = G.View.DESTROY_NODES;

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
        trackBy: value.trackBy,
        onComplete: value.onComplete
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
        if (bindings.propertyKeys.length) {
          View.makeBinding(viewNode, 'repeat', undefined, config.scope, bindings, viewNode);
          bindings.propertyKeys.forEach((path) => {
            try {
              const rd = View.propertyRDLookup(config.scope, path);
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
     * @param value
     * @param {Function} expression
     */
    update: function (config, value, expression) {
      let changes = null;
      if (expression) {
        value = expression();
        if (value === null || value === undefined) {
          return;
        }

        if (value instanceof G.View.ArrayChange) {
          changes = value;
        } else if (value instanceof Array) {
          const initialChanges = new G.View.ArrayChange();
          initialChanges.original = value;
          initialChanges.type = 'reset';
          initialChanges.params = value;
          changes = value.changes = initialChanges;
        } else if (value instanceof Object) {
          const output = Object.entries(value).map(([key, value]) => ({ key, value }));
          const initialChanges = new G.View.ArrayChange();
          initialChanges.original = output;
          initialChanges.type = 'reset';
          initialChanges.params = output;
          changes = value.changes = initialChanges;
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
        if (value instanceof G.View.ArrayChange) {
          changes = value;
        } else if (value instanceof Array) {
          changes = value.changes;
        } else if (value instanceof Object) {
          const output = Object.entries(value).map(([key, value]) => ({ key, value }));
          changes = new G.View.ArrayChange();
          changes.original = output;
          changes.type = 'reset';
          changes.params = output;
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
      // if(node.blueprint.animations && node.blueprint.animations.enter && node.blueprint.animations.enter.timeline === 'dots')debugger;
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

      DESTROY_NODES(hasBeenRemoved, hasAnimation);
      return newChanges;
    } else if (changes.type === 'reset') {
      const nodesToBeRemoved = config.nodes.slice(0);
      config.nodes = [];
      DESTROY_NODES(nodesToBeRemoved, hasAnimation);
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

      if (config.onComplete) {
        // debugger
        View.CREATE_IN_NEXT_FRAME(viewNode.index, (_next) => {
          config.onComplete(nodes);
          _next();
        });
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
        const id = bindings.propertyKeys[0].split('.').pop();
        const nativeNode = viewNode.node;
        nativeNode.addEventListener('change', (event) => {
          // if (scopeReactiveData.data[id] && !nativeNode.value) {
          //   nativeNode.value = scopeReactiveData.data[id];
          // }
        });
        // const bindings = G.View.getBindings(viewNode.blueprint.selected);
        // const id = bindings.propertyKeys[0].split('.').pop();
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
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['style_3'] = {
    type: 'prop',
    key: 'style'
  };
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['style_8'] = {
    type: 'prop',
    key: 'style'
  };
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
     * @param expression
     * @this {Galaxy.View.ViewNode}
     */
    update: function (config, value, expression) {
      if (this.virtual) {
        return;
      }

      const _this = this;
      const node = _this.node;

      if (expression) {
        value = expression();
      }

      if (typeof value === 'string') {
        return node.style = value;
      } else if (value instanceof Array) {
        return node.style = value.join(';');
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
          node.style[key] = val.call(node.__vn__, node.__vn__.data);
        } else {
          node.style[key] = val;
        }
      }
    } else {
      node.style = value;
    }
  }
})(Galaxy);


/* global Galaxy */
(function (G) {
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['text_3'] = {
    type: 'prop',
    key: 'nodeValue'
  };
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['text_8'] = {
    type: 'prop',
    key: 'nodeValue'
  };
  G.View.NODE_BLUEPRINT_PROPERTY_MAP['text'] = {
    type: 'prop',
    key: 'text',
    /**
     *
     * @param {Galaxy.View.ViewNode} viewNode
     * @param value
     */
    update: function (viewNode, value) {
      let textValue = typeof value === 'undefined' || value === null ? '' : value;
      if (textValue instanceof Object) {
        textValue = JSON.stringify(textValue);
      }

      const nativeNode = viewNode.node;
      const textNode = nativeNode['<>text'];
      if (textNode) {
        textNode.nodeValue = textValue;
      } else {
        const tn = nativeNode['<>text'] = document.createTextNode(textValue);
        nativeNode.insertBefore(tn, nativeNode.firstChild);
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
    beforeActivate: function valueUtil(viewNode, scopeReactiveData, prop, expression) {
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
      const id = bindings.propertyKeys[0].split('.').pop();
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
      } else if (nativeNode.type === 'number' || nativeNode.type === 'range') {
        nativeNode.addEventListener('input', createNumberHandler(nativeNode, scopeReactiveData, id));
      } else {
        nativeNode.addEventListener('input', createHandler(scopeReactiveData, id));
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
        throttleId: 0,
      };
    },
    install: function () {
      return true;
    },
    update: function (config, value, expression) {
      if (config.throttleId !== 0) {
        window.clearTimeout(config.throttleId);
        config.throttleId = 0;
      }
      /** @type {Galaxy.View.ViewNode} */
      if (expression) {
        value = expression();
      }

      // setTimeout is called before requestAnimationTimeFrame
      config.throttleId = window.setTimeout(() => {
        this.rendered.then(() => {
          if (this.visible !== value) {
            this.setVisibility(value);
          }
        });
      });
    }
  };
})(Galaxy);


/* global Galaxy */
Galaxy.registerAddOnProvider('galaxy/router', function (scope, module) {
  return {
    create: function () {
      const router = new Galaxy.Router(scope, module);
      if (module.systemId !== 'root') {
        scope.on('module.destroy', () => router.destroy());
      }

      scope.router = router.data;

      return router;
    },
    start: function () { }
  };
});

/* global Galaxy */
Galaxy.Router = /** @class */ (function (G) {
  Router.PARAMETER_NAME_REGEX = new RegExp(/[:*](\w+)/g);
  Router.PARAMETER_NAME_REPLACEMENT = '([^/]+)';
  Router.BASE_URL = '/';
  Router.currentPath = {
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

  Router.mainListener = function (e) {
    Router.currentPath.update();
  };

  Router.prepareRoute = function (routeConfig, parentScopeRouter, fullPath) {
    if (routeConfig instanceof Array) {
      const routes = routeConfig.map((r) => Router.prepareRoute(r, parentScopeRouter, fullPath));
      if (parentScopeRouter) {
        parentScopeRouter.activeRoute.children = routes;
      }

      return routes;
    }

    return {
      ...routeConfig,
      fullPath: fullPath + routeConfig.path,
      active: false,
      hidden: routeConfig.hidden || Boolean(routeConfig.redirectTo) || false,
      viewports: routeConfig.viewports || {},
      parent: parentScopeRouter ? parentScopeRouter.activeRoute : null,
      children: routeConfig.children || []
    };
  };

  window.addEventListener('popstate', Router.mainListener);

  /**
   *
   * @param {Galaxy.Scope} scope
   * @param {Galaxy.Module} module
   * @constructor
   * @memberOf Galaxy
   */
  function Router(scope, module) {
    const _this = this;
    _this.config = {
      baseURL: Router.BASE_URL
    };
    _this.scope = scope;
    _this.module = module;

    // Find active parent router
    _this.parentRouterScope = scope.parentScope;

    // ToDo: bug
    if (_this.parentRouterScope && (!_this.parentRouterScope.router || !_this.parentRouterScope.router.activeRoute)) {
      let ps = _this.parentRouterScope;
      while (!ps.router || !ps.router.activeRoute) {
        ps = ps.parentScope;
      }
      _this.config.baseURL = ps.router.activePath;
      _this.parentRouterScope = null;
    }

    _this.path = _this.parentRouterScope && _this.parentRouterScope.router ? _this.parentRouterScope.router.activeRoute.path : '/';
    _this.fullPath = this.config.baseURL === '/' ? this.path : this.config.baseURL + this.path;
    _this.parentRoute = null;

    _this.oldURL = '';
    _this.resolvedRouteValue = null;
    _this.resolvedDynamicRouteValue = null;

    _this.routesMap = null;
    _this.data = {
      routes: [],
      activeRoute: null,
      activePath: null,
      activeModule: null,
      viewports: {
        main: null,
      },
      parameters: _this.parentRouterScope && _this.parentRouterScope.router ? _this.parentRouterScope.router.parameters : {}
    };
    _this.onTransitionFn = Galaxy.View.EMPTY_CALL;

    _this.viewports = {
      main: {
        tag: 'div',
        module: '<>router.activeModule'
      }
    };

    Object.defineProperty(this, 'urlParts', {
      get: function () {
        return _this.oldURL.split('/').slice(1);
      },
      enumerable: true
    });

    if (module.id === 'root') {
      Router.currentPath.update();
    }
  }

  Router.prototype = {
    setup: function (routeConfigs) {
      this.routes = Router.prepareRoute(routeConfigs, this.parentRouterScope ? this.parentRouterScope.router : null, this.fullPath === '/' ? '' : this.fullPath);
      if (this.parentRouterScope && this.parentRouterScope.router) {
        this.parentRoute = this.parentRouterScope.router.activeRoute;
      }

      this.routes.forEach(route => {
        const viewportNames = route.viewports ? Object.keys(route.viewports) : [];
        viewportNames.forEach(vp => {
          if (vp === 'main' || this.viewports[vp]) return;

          this.viewports[vp] = {
            tag: 'div',
            module: '<>router.viewports.' + vp
          };
        });
      });

      this.data.routes = this.routes;

      return this;
    },

    start: function () {
      this.listener = this.detect.bind(this);
      window.addEventListener('popstate', this.listener);
      this.detect();
    },

    /**
     *
     * @param {string} path
     * @param {boolean} replace
     */
    navigateToPath: function (path, replace) {
      if (path.indexOf('/') !== 0) {
        throw new Error('Path argument is not starting with a `/`\nplease use `/' + path + '` instead of `' + path + '`');
      }

      if (path.indexOf(this.config.baseURL) !== 0) {
        path = this.config.baseURL + path;
      }

      const currentPath = window.location.pathname;
      if (currentPath === path /*&& this.resolvedRouteValue === path*/) {
        return;
      }

      setTimeout(() => {
        if (replace) {
          history.replaceState({}, '', path);
        } else {
          history.pushState({}, '', path);
        }

        dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      });
    },

    navigate: function (path, replace) {
      if (path.indexOf(this.path) !== 0) {
        path = this.path + path;
      }

      this.navigateToPath(path, replace);
    },

    navigateToRoute: function (route, replace) {
      let path = route.path;
      if (route.parent) {
        path = route.parent.path + route.path;
      }

      this.navigate(path, replace);
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

      // if (this.config.baseURL !== '/') {
      //   normalizedHash = normalizedHash.replace(this.config.baseURL, '');
      // }
      return normalizedHash.replace(this.fullPath, '/').replace('//', '/') || '/';
    },

    onTransition: function (handler) {
      this.onTransitionFn = handler;
      return this;
    },

    findMatchRoute: function (routes, hash, parentParams) {
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
        _this.resolvedRouteValue = null;

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
        // debugger
        if (_this.resolvedRouteValue === routeValue) {
          // static routes don't have parameters
          return Object.assign(_this.data.parameters, _this.createClearParameters());
        }
        _this.resolvedDynamicRouteValue = null;
        _this.resolvedRouteValue = routeValue;

        if (staticRoutes.redirectTo) {
          return this.navigate(staticRoutes.redirectTo, true);
        }
        matchCount++;

        return _this.callRoute(staticRoutes, normalizedHash, _this.createClearParameters(), parentParams);
      }

      if (matchCount === 0) {
        console.warn('No associated route has been found', hash);
      }
    },

    callRoute: function (route, hash, params, parentParams) {
      const activeRoute = this.data.activeRoute;
      const activePath = this.data.activePath;

      this.onTransitionFn.call(this, activePath, route.path, activeRoute, route);
      if (!route.redirectTo) {
        if (activeRoute) {
          activeRoute.active = false;

          if (typeof activeRoute.onLeave === 'function') {
            activeRoute.onLeave.call(null, activePath, route.path, activeRoute, route);
          }
        }

        route.active = true;
      }

      if (typeof route.onEnter === 'function') {
        route.onEnter.call(null, activePath, route.path, activeRoute, route);
      }

      this.data.activeRoute = route;
      this.data.activePath = route.path;

      if (typeof route.handle === 'function') {
        return route.handle.call(this, params, parentParams);
      } else {
        // console.log(route.viewports, this.data.viewports)
        const allViewports = this.data.viewports;
        for (const key in allViewports) {
          let value = route.viewports[key] || null;
          if (typeof value === 'string') {
            value = {
              path: value
            };
          }

          if (key === 'main') {
            this.data.activeModule = value;
          }

          this.data.viewports[key] = value;
        }

        // for (const key in route.viewports) {
        //   let value = route.viewports[key] || null;
        //   if (typeof value === 'string') {
        //     value = {
        //       path: value
        //     };
        //   }
        //
        //   if (key === 'main') {
        //     this.data.activeModule = value;
        //   }
        //
        //   this.data.viewports[key] = value;
        // }

        G.View.CREATE_IN_NEXT_FRAME(G.View.GET_MAX_INDEX(), (_next) => {
          Object.assign(this.data.parameters, params);
          _next();
        });
      }

      return false;
    },

    createClearParameters: function () {
      const clearParams = {};
      const keys = Object.keys(this.data.parameters);
      keys.forEach(k => clearParams[k] = undefined);
      return clearParams;
    },

    extractDynamicRoutes: function (routesPath) {
      return routesPath.map(function (route) {
        const paramsNames = [];

        // Find all the parameters names in the route
        let match = Router.PARAMETER_NAME_REGEX.exec(route);
        while (match) {
          paramsNames.push(match[1]);
          match = Router.PARAMETER_NAME_REGEX.exec(route);
        }

        if (paramsNames.length) {
          return {
            id: route,
            paramNames: paramsNames,
            paramFinderExpression: new RegExp(route.replace(Router.PARAMETER_NAME_REGEX, Router.PARAMETER_NAME_REPLACEMENT))
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
      const pathname = window.location.pathname;
      const hash = pathname ? pathname.substring(-1) !== '/' ? pathname + '/' : pathname : '/';
      // const hash = pathname || '/';
      const path = this.config.baseURL === '/' ? this.path : this.config.baseURL + this.path;

      if (hash.indexOf(path) === 0) {
        if (hash !== this.oldURL) {
          this.oldURL = hash;
          this.findMatchRoute(this.routes, hash, {});
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

  return Router;
})(Galaxy);

/* global Galaxy */
Galaxy.registerAddOnProvider('galaxy/view', function (scope) {
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
