var Ue = Object.defineProperty;
var He = (t, e, n) => e in t ? Ue(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var de = (t, e, n) => He(t, typeof e != "symbol" ? e + "" : e, n);
function xe(t) {
  let e = document.createElement("a");
  e.href = t;
  let s = /\/([^\t\n]+\/)/g.exec(e.pathname);
  this.parsedURL = e.href, this.path = s ? s[1] : "/", this.base = window.location.pathname, this.protocol = e.protocol;
}
class D {
  /**
   * Create an Observer.
   * @param {Object} context - The context to observe.
   */
  constructor(e) {
    this.context = e, this.subjectsActions = {}, this.allSubjectAction = [];
    const n = "__observers__";
    this.context.hasOwnProperty(n) || k(e, n, {
      value: [],
      writable: !0,
      configurable: !0
    }), this.context[n].push(this);
  }
  /**
   * Remove the observer from the context.
   */
  remove() {
    const e = this.context.__observers__, n = e.indexOf(this);
    n !== -1 && e.splice(n, 1);
  }
  /**
   * Notify the observer of a change.
   * @param {string} key - The key that changed.
   * @param {*} value - The new value.
   */
  notify(e, n) {
    this.subjectsActions.hasOwnProperty(e) && this.subjectsActions[e].call(this.context, n), this.allSubjectAction.forEach((s) => {
      s.call(this.context, e, n);
    });
  }
  /**
   * Register an action for a specific subject.
   * @param {string} subject - The subject to observe.
   * @param {Function} action - The action to perform.
   */
  on(e, n) {
    this.subjectsActions[e] = n;
  }
  /**
   * Register an action for all subjects.
   * @param {Function} action - The action to perform.
   */
  onAll(e) {
    this.allSubjectAction.indexOf(e) === -1 && this.allSubjectAction.push(e);
  }
  /**
   * Notify all observers of a change.
   * @param {Object} obj - The object being observed.
   * @param {string} key - The key that changed.
   * @param {*} value - The new value.
   */
  static notify(e, n, s) {
    const i = e.__observers__;
    i !== void 0 && i.forEach((r) => {
      r.notify(n, s);
    });
  }
}
class R {
  /**
   *
   * @param {ModuleMetaData} module
   */
  constructor(e) {
    this.systemId = e.id, this.parentScope = e.parentScope || null, this.element = e.element || null, this.export = {}, this.uri = new xe(e.path), this.eventHandlers = {}, this.observers = [];
    const n = this.element.data ? B(
      this.element,
      this.element.data,
      this.parentScope,
      !0
    ) : {};
    k(this, "data", {
      enumerable: !0,
      configurable: !0,
      get: function() {
        return n;
      },
      set: function(s) {
        if (s === null || typeof s != "object")
          throw Error(
            "The `Scope.data` property must be type of object and can not be null."
          );
        Object.assign(n, s);
      }
    }), this.on("module.destroy", this.destroy.bind(this));
  }
  importAsText(e) {
    return e.indexOf("./") === 0 && (e = e.replace("./", this.uri.path)), fetch(e, {
      headers: {
        "Content-Type": "text/plain"
      }
    }).then((n) => n.text());
  }
  destroy() {
    Xt(this, "data"), this.observers.forEach(function(e) {
      e.remove();
    });
  }
  kill() {
    throw Error("Scope.kill() should not be invoked at the runtime");
  }
  load(e, n = {}) {
    const s = Object.assign({}, e, n);
    return s.path.indexOf("./") === 0 && (s.path = this.uri.path + e.path.substr(2)), s.parentScope = this, Fe(s);
  }
  loadModuleInto(e, n) {
    return this.load(e, {
      element: n
    }).then(function(s) {
      return s.start(), s;
    });
  }
  on(e, n) {
    this.eventHandlers[e] || (this.eventHandlers[e] = []), this.eventHandlers[e].indexOf(n) === -1 && this.eventHandlers[e].push(n);
  }
  trigger(e, n) {
    this.eventHandlers[e] && this.eventHandlers[e].forEach(function(s) {
      s.call(null, n);
    });
  }
  observe(e) {
    const n = new D(e);
    return this.observers.push(n), n;
  }
  useView() {
    return new W(this);
  }
  useRouter() {
    const e = new x(this);
    return this.systemId !== "@root" && this.on("module.destroy", () => e.destroy()), this.__router__ = e, this.router = e.data, e;
  }
}
const O = {
  tag: {
    type: "none"
  },
  node: {
    type: "none"
  },
  props: {
    type: "none"
  },
  children: {
    type: "none"
  },
  data_3: {
    type: "none",
    key: "data"
  },
  data_8: {
    type: "none",
    key: "data"
  },
  html: {
    type: "prop",
    key: "innerHTML"
  },
  onchange: {
    type: "event"
  },
  onclick: {
    type: "event"
  },
  ondblclick: {
    type: "event"
  },
  onmouseover: {
    type: "event"
  },
  onmouseout: {
    type: "event"
  },
  onkeydown: {
    type: "event"
  },
  onkeypress: {
    type: "event"
  },
  onkeyup: {
    type: "event"
  },
  onmousedown: {
    type: "event"
  },
  onmouseup: {
    type: "event"
  },
  onload: {
    type: "event"
  },
  onabort: {
    type: "event"
  },
  onerror: {
    type: "event"
  },
  onfocus: {
    type: "event"
  },
  onblur: {
    type: "event"
  },
  onreset: {
    type: "event"
  },
  onsubmit: {
    type: "event"
  }
}, Ge = [
  "text",
  "comment",
  //
  "a",
  "abbr",
  "acronym",
  "address",
  "applet",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "basefont",
  "bdi",
  "bdo",
  "bgsound",
  "big",
  "blink",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "content",
  "data",
  "datalist",
  "dd",
  "decorator",
  "del",
  "details",
  "dfn",
  "dir",
  "div",
  "dl",
  "dt",
  "element",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "isindex",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "listing",
  "main",
  "map",
  "mark",
  "marquee",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "nobr",
  "noframes",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "plaintext",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "shadow",
  "small",
  "source",
  "spacer",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  "xmp"
];
function he(t, e) {
  if (typeof e == "object" && e !== null) {
    const n = {};
    for (const s in e) {
      const i = e[s];
      typeof i == "object" ? n[s] = JSON.stringify(i) : n[s] = i;
    }
    Object.assign(t.dataset, n);
  } else
    t.dataset = null;
}
const Ke = {
  type: "reactive",
  key: "data",
  getConfig: function(t, e) {
    if (e !== null && (typeof e != "object" || e instanceof Array))
      throw new Error(`data property should be an object with explicits keys:
` + JSON.stringify(this.blueprint, null, "  "));
    return {
      reactiveData: null,
      subjects: e,
      scope: t
    };
  },
  install: function(t) {
    if (t.scope.data === t.subjects)
      throw new Error("It is not allowed to use Scope.data as data value");
    if (!this.blueprint.module) {
      t.reactiveData = B(this, t.subjects, t.scope, !0), new D(t.reactiveData).onAll(() => {
        he(this.node, t.reactiveData);
      });
      return;
    }
    return Object.assign(this.data, t.subjects), !1;
  },
  update: function(t, e, n) {
    n && (e = n()), t.subjects === e && (e = t.reactiveData), he(this.node, e);
  }
}, qe = {
  type: "prop",
  key: "nodeValue"
}, Ye = {
  type: "prop",
  key: "nodeValue"
}, Je = {
  type: "prop",
  key: "text",
  /**
   *
   * @param {ViewNode} viewNode
   * @param value
   */
  update: function(t, e) {
    let n = typeof e > "u" || e === null ? "" : e;
    n instanceof Object && (n = JSON.stringify(n));
    const s = t.node, i = s["<>text"];
    if (i)
      i.nodeValue = n;
    else {
      const r = s["<>text"] = document.createTextNode(n);
      s.insertBefore(r, s.firstChild);
    }
  }
};
let ie, ye;
if (!window.gsap)
  ye = function() {
  }, ie = {
    type: "prop",
    key: "animations",
    /**
     *
     * @param {ViewNode} viewNode
     * @param animationDescriptions
     */
    update: function(t, e) {
      e.enter && e.enter.to.onComplete && (t.processEnterAnimation = e.enter.to.onComplete), t.processLeaveAnimation = (n) => {
        n();
      };
    }
  }, window.gsap = {
    to: function(t, e) {
      return requestAnimationFrame(() => {
        typeof t == "string" && (t = document.querySelector(t));
        const n = t.style;
        if (n) {
          const s = Object.keys(e);
          for (let i = 0, r = s.length; i < r; i++) {
            const l = s[i], a = e[l];
            switch (l) {
              case "duration":
              case "ease":
                break;
              case "opacity":
              case "z-index":
                n.setProperty(l, a);
                break;
              case "scrollTo":
                t.scrollTop = typeof a.y == "string" ? document.querySelector(a.y).offsetTop : a.y, t.scrollLeft = typeof a.x == "string" ? document.querySelector(a.x).offsetLeft : a.x;
                break;
              default:
                n.setProperty(l, typeof a == "number" && a !== 0 ? a + "px" : a);
            }
          }
        } else
          Object.assign(t, e);
      });
    }
  }, console.info("%cIn order to activate animations, load GSAP - GreenSock", "color: yellowgreen; font-weight: bold;"), console.info("%cYou can implement most common animations by loading the following resources before galaxy.js", "color: yellowgreen;"), console.info("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/gsap.min.js"), console.info("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/ScrollToPlugin.min.js"), console.info(`https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/EasePack.min.js

`);
else {
  let t = function(o) {
    if (!o.parent) return !1;
    const c = o.parent;
    return c.blueprint.animations && c.blueprint.animations.enter && gsap.getTweensOf(c.node).length ? !0 : t(o.parent);
  }, n = function(o) {
    const c = gsap.getTweensOf(o);
    for (const f of c)
      f.parent ? (f.parent === gsap.globalTimeline ? f.pause() : f.parent.pause(), f.parent.remove(f)) : f.pause();
  }, s = function(o, c) {
    const f = o.node;
    if (c.withParent) {
      if (t(o))
        return gsap.set(f, Object.assign({}, c.to || {}));
      if (!o.parent.rendered.resolved)
        return;
    }
    gsap.getTweensOf(f).length && gsap.killTweensOf(f), e.contains(f) && p.installGSAPAnimation(o, "enter", c);
  }, i = function(o, c, f) {
    if (c.active === !1)
      return a.call(o, f);
    const h = c.withParent;
    o.leaveWithParent = h === !0;
    const m = o.node;
    if (h && o.parent.transitory)
      return gsap.killTweensOf(m), o.dump();
    if ("style" in m) {
      const b = m.getBoundingClientRect();
      if (b.width === 0 || b.height === 0 || m.style.opacity === "0" || m.style.visibility === "hidden")
        return gsap.killTweensOf(m), f();
    }
    n(m), p.installGSAPAnimation(o, "leave", c, f);
  }, r = function(o, c, f, u, h, m) {
    (h ? j : F)(o.index, (_) => {
      const y = !!c[f];
      h && (!o.node.classList.contains(m) || y) ? p.setupOnComplete(u.to || u.from, () => {
        o.node.classList.add(m);
      }) : !h && (o.node.classList.contains(m) || y) && p.setupOnComplete(u.to || u.from, () => {
        o.node.classList.remove(m);
      }), c[f] = c[f] || [], c[f].push(p.installGSAPAnimation(o, null, u)), _();
    });
  }, l = function(o, c, f) {
    const u = c ? "add:" + f : "remove:" + f;
    return o[u];
  }, a = function(o) {
    n(this.node), this.parent.transitory ? this.dump() : o();
  }, p = function(o) {
    const c = this;
    if (o && typeof o != "string") {
      if (o.__am__)
        return o.__am__;
      const f = o.eventCallback("onComplete") || w;
      c.name = "<user-defined>", c.timeline = o, c.timeline.__am__ = this, c.timeline.eventCallback("onComplete", function() {
        f.call(c.timeline), c.onCompletesActions.forEach((u) => {
          u(c.timeline);
        }), c.nodes = [], c.awaits = [], c.children = [], c.onCompletesActions = [];
      }), c.parsePosition = (u) => u;
    } else {
      const f = p.ANIMATIONS[o];
      if (f)
        return !f.timeline.getChildren().length && !f.timeline.isActive() && (f.timeline.clear(!1), f.timeline.invalidate()), f;
      c.name = o, c.timeline = gsap.timeline({
        autoRemoveChildren: !0,
        smoothChildTiming: !1,
        paused: !0,
        onComplete: function() {
          c.onCompletesActions.forEach((h) => {
            h(c.timeline);
          }), c.nodes = [], c.awaits = [], c.children = [], c.onCompletesActions = [], p.ANIMATIONS[o] = null;
        }
      }), c.timeline.data = { name: o }, c.labelCounter = 0, c.labelsMap = {};
      const u = d[o];
      u && c.setupLabels(u), p.ANIMATIONS[o] = this;
    }
    c.type = null, c.onCompletesActions = [], c.started = !1, c.configs = {}, c.children = [], c.nodes = [], c.awaits = [];
  };
  const e = document.body;
  ie = {
    type: "prop",
    key: "animations",
    /**
     *
     * @param {ViewNode} viewNode
     * @param animations
     */
    update: function(o, c) {
      if (o.virtual || !c)
        return;
      const f = c.enter;
      f && (o.processEnterAnimation = function() {
        s(this, f);
      });
      const u = c.leave;
      u ? (!f && o.blueprint.if && (console.warn("The following node has `if` and a `leave` animation but does NOT have a `enter` animation.\nThis can result in unexpected UI behavior.\nTry to define a `enter` animation that negates the leave animation to prevent unexpected behavior\n\n"), console.warn(o.node)), o.processLeaveAnimation = function(m) {
        i(this, u, m);
      }, o.populateHideSequence = o.processLeaveAnimation.bind(o, () => {
        o.node.style.display = "none";
      })) : o.processLeaveAnimation = a.bind(o);
      const h = o.cache;
      h.class && h.class.observer && o.rendered.then(function() {
        const m = h.class.observer.context;
        for (const _ in m) {
          const y = !!m[_], A = l(c, y, _);
          if (A) {
            if (A.to.keyframes instanceof Array)
              for (let g = 0, E = A.to.keyframes.length; g < E; g++)
                gsap.set(o.node, Object.assign({ callbackScope: o }, A.to.keyframes[g] || {}));
            else
              gsap.set(o.node, Object.assign({ callbackScope: o }, A.to || {}));
            y ? o.node.classList.add(_) : o.node.classList.remove(_);
          }
        }
        let b = JSON.stringify(m);
        h.class.observer.onAll((_) => {
          const y = JSON.stringify(m);
          if (b === y)
            return;
          b = y;
          const A = !!m[_], g = l(c, A, _);
          if (g) {
            const E = "tween:" + _;
            h[E] && (h[E].forEach((S) => S.kill()), Reflect.deleteProperty(h, E)), r(o, h, E, g, A, _);
          }
        });
      });
    }
  }, p.ANIMATIONS = {}, p.TIMELINES = {}, p.createSimpleAnimation = function(o, c, f) {
    f = f || w;
    const u = o.node;
    let h = c.from, m = c.to;
    if (m && (m = Object.assign({}, m), m.onComplete = f, c.onComplete)) {
      const _ = c.onComplete;
      m.onComplete = function() {
        _(), f();
      };
    }
    let b;
    if (h && m)
      b = gsap.fromTo(u, h, m);
    else if (h) {
      if (h = Object.assign({}, h), h.onComplete = f, c.onComplete) {
        const _ = c.onComplete;
        h.onComplete = function() {
          _(), f();
        };
      }
      b = gsap.from(u, h);
    } else if (m)
      b = gsap.to(u, m);
    else if (c.onComplete) {
      const _ = c.onComplete, y = function() {
        _(), f();
      };
      b = gsap.to(u, {
        duration: c.duration || 0,
        onComplete: y
      });
    } else
      b = gsap.to(u, {
        duration: c.duration || 0,
        onComplete: f
      });
    return b;
  }, p.addCallbackScope = function(o, c) {
    const f = Object.assign({}, o);
    return f.callbackScope = c, f;
  }, p.setupOnComplete = function(o, c) {
    if (o.onComplete) {
      const f = o.onComplete;
      o.onComplete = function() {
        f.call(this), c();
      };
    } else
      o.onComplete = () => {
        c();
      };
  }, p.installGSAPAnimation = function(o, c, f, u) {
    const h = f.from;
    let m = f.to;
    c !== "leave" && m && o.node.nodeType !== Node.COMMENT_NODE && (m.clearProps = m.hasOwnProperty("clearProps") ? m.clearProps : "all");
    const b = Object.assign({}, f);
    b.from = h, b.to = m;
    let _ = b.timeline;
    if (_) {
      const y = new p(_);
      if (c = c || y.type, b.await && y.awaits.indexOf(b.await) === -1) {
        let g = y.timeline;
        for (; g.parent !== gsap.globalTimeline; ) {
          if (!g.parent) return;
          g = g.parent;
        }
        y.awaits.push(b.await);
        const E = g.addPause(b.position, () => {
          if (o.transitory || o.destroyed.resolved)
            return g.resume();
          b.await.then(S);
        }).recent(), S = ((Q) => {
          const ue = y.awaits.indexOf(b.await);
          ue !== -1 && (y.awaits.splice(ue, 1), Q._initted ? g.resume() : g.getChildren(!1).indexOf(Q) !== -1 && g.remove(Q));
        }).bind(null, E);
        o.finalize.push(() => {
          y.awaits.indexOf(b.await) !== -1 && o.node.style && (o.node.style.display = "none"), S();
        });
      }
      y.type && y.type !== c && b.position && b.position.indexOf("=") !== -1 && (b.position = b.startPosition);
      const A = y.timeline.getChildren(!1);
      return A.length && A[A.length - 1].data === "timeline:start" && (b.position = "+=0"), y.type = c, y.add(o, b, u);
    } else
      return p.createSimpleAnimation(o, b, u);
  };
  const d = {};
  ye = function(o, c) {
    d[o] = c;
    const f = p.ANIMATIONS[o];
    f && f.setupLabels(c);
  }, p.prototype = {
    setupLabels: function(o) {
      for (const c in o) {
        const f = "label_" + this.labelCounter++, u = o[c];
        this.labelsMap[c] = f, this.timeline.addLabel(f, typeof u == "number" ? "+=" + u : u);
      }
    },
    parsePosition: function(o) {
      let c = this.labelsMap[o] || o, f = null;
      return (c || typeof c == "number") && (c.indexOf("+=") !== -1 ? f = c.split("+=")[0] : c.indexOf("-=") !== -1 && (f = c.split("-=")[0])), f && f !== "<" && f !== ">" && (c = c.replace(f, this.labelsMap[f])), c;
    },
    addOnComplete: function(o) {
      this.onCompletesActions.push(o);
    },
    /**
     *
     * @param viewNode
     * @param config {AnimationConfig}
     * @param finalize
     */
    add: function(o, c, f) {
      const u = this;
      let h;
      if (c.from && c.to) {
        const y = p.addCallbackScope(c.to, o);
        h = gsap.fromTo(o.node, c.from, y);
      } else if (c.from) {
        const y = p.addCallbackScope(c.from, o);
        h = gsap.from(o.node, y);
      } else {
        const y = p.addCallbackScope(c.to, o);
        h = gsap.to(o.node, y);
      }
      if (f)
        if (h.vars.onComplete) {
          const y = h.vars.onComplete;
          h.vars.onComplete = function() {
            y.apply(this, arguments), f();
          };
        } else
          h.vars.onComplete = f;
      const m = this.parsePosition(c.position), b = u.timeline.getChildren(!1), _ = b[0];
      return b.length === 0 ? u.timeline.add(h, m && m.indexOf("-=") === -1 ? m : null) : (b.length === 1 && !_.hasOwnProperty("timeline") && _.getChildren(!1).length === 0 && u.timeline.clear(!1), u.timeline.add(h, m)), u.name === "<user-defined>" || (u.started ? u.timeline.paused() && u.timeline.resume() : (u.started = !0, u.timeline.resume())), h;
    }
  };
}
const Xe = {
  type: "prop",
  key: "checked",
  /**
   *
   * @param {ViewNode} viewNode
   * @param {ReactiveData} scopeReactiveData
   * @param prop
   * @param {Function} expression
   */
  beforeActivate: function(t, e, n, s) {
    if (!e)
      return;
    if (s && t.blueprint.tag === "input")
      throw new Error("input.checked property does not support binding expressions because it must be able to change its data.\nIt uses its bound value as its `model` and expressions can not be used as model.\n");
    const r = V(t.blueprint.checked).propertyKeys[0].split(".").pop(), l = t.node;
    l.addEventListener("change", function() {
      const a = e.data[r];
      if (a instanceof Array && l.type !== "radio") {
        const d = l.hasAttribute("value") ? l.value : !0;
        a instanceof Array ? a.indexOf(d) === -1 ? a.push(d) : a.splice(a.indexOf(d), 1) : e.data[r] = [d];
      } else l.hasAttribute("value") ? e.data[r] = l.checked ? l.value : null : e.data[r] = l.checked;
    });
  },
  update: function(t, e) {
    const n = t.node;
    t.rendered.then(function() {
      if (e instanceof Array) {
        if (n.type === "radio")
          return console.error("Inputs with type `radio` can not provide array as a value."), console.warn("Read about radio input at: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio");
        const s = n.hasAttribute("value") ? n.value : !0;
        n.checked = e.indexOf(s) !== -1;
      } else n.hasAttribute("value") ? n.checked = e === n.value : n.checked = e;
    });
  }
}, ze = {
  type: "reactive",
  key: "class",
  getConfig: function(t, e) {
    return {
      scope: t,
      subjects: e,
      reactiveClasses: null,
      observer: null
    };
  },
  install: function(t) {
    if (this.virtual || t.subjects === null || t.subjects instanceof Array || typeof t.subjects != "object")
      return !0;
    const e = this, n = t.reactiveClasses = B(e, t.subjects, t.scope, !0), s = t.observer = new D(n), i = e.blueprint.animations || {}, r = !!window.gsap.config;
    return e.blueprint.renderConfig.applyClassListAfterRender ? e.rendered.then(() => {
      s.onAll((l) => {
        r && (i["add:" + l] || i["remove:" + l]) || G(e, n);
      });
    }) : s.onAll((l) => {
      r && (i["add:" + l] || i["remove:" + l]) || G(e, n);
    }), !0;
  },
  /**
   *
   * @param config
   * @param value
   * @param expression
   * @this ViewNode
   */
  update: function(t, e, n) {
    if (this.virtual)
      return;
    const s = this, i = s.node;
    if (n && (e = n()), typeof e == "string" || e === null || e === void 0)
      return i.className = e;
    if (e instanceof Array)
      return i.className = e.join(" ");
    t.subjects === e && (e = t.reactiveClasses), s.blueprint.renderConfig.applyClassListAfterRender ? s.rendered.then(() => {
      G(s, e);
    }) : G(s, e);
  }
};
function $e(t) {
  if (typeof t == "string")
    return [t];
  if (t instanceof Array)
    return t;
  if (t !== null && typeof t == "object") {
    let e = [];
    for (let n in t)
      t.hasOwnProperty(n) && t[n] && e.push(n);
    return e;
  }
}
function G(t, e) {
  const n = t.node.className || [], s = $e(e);
  JSON.stringify(n) !== JSON.stringify(s) && (t.node.className = s.join(" "));
}
const We = {
  type: "attr",
  key: "disabled",
  update: function(t, e, n) {
    t.rendered.then(() => {
      if (t.blueprint.tag.toLowerCase() === "form") {
        const s = t.node.querySelectorAll("input, textarea, select, button");
        e ? Array.prototype.forEach.call(s, (i) => i.setAttribute("disabled", "")) : Array.prototype.forEach.call(s, (i) => i.removeAttribute("disabled"));
      }
    }), Me(t, e ? "" : null, n);
  }
}, Qe = {
  type: "reactive",
  key: "if",
  getConfig: function() {
    return {
      throttleId: 0
    };
  },
  install: function(t) {
    return !0;
  },
  /**
   *
   * @this ViewNode
   * @param config
   * @param value
   * @param expression
   */
  update: function(t, e, n) {
    t.throttleId !== 0 && (window.clearTimeout(t.throttleId), t.throttleId = 0), n && (e = n()), e = !!e, !this.rendered.resolved && !this.inDOM && (this.blueprint.renderConfig.renderDetached = !e), t.throttleId = setTimeout(() => {
      this.inDOM !== e && this.setInDOM(e);
    });
  }
}, Ze = {
  type: "reactive",
  key: "module",
  getConfig: function(t) {
    return {
      previousModule: null,
      moduleMeta: null,
      scope: t
    };
  },
  install: function() {
    return !0;
  },
  /**
   *
   * @param cache
   * @param {ModuleMetaData} newModuleMeta
   * @param expression
   */
  update: function(e, n, s) {
    const i = this;
    if (s && (n = s()), n !== void 0) {
      if (typeof n != "object")
        return console.error("module property only accept objects as value", n);
      n && e.moduleMeta && n.path === e.moduleMeta.path || ((!n || n !== e.moduleMeta) && (et(i), e.loadedModule && (e.loadedModule.destroy(), e.loadedModule = null)), !i.virtual && n && n.path && n !== e.moduleMeta && j(i.index, (r) => {
        tt.call(null, i, e, n, r);
      }), e.moduleMeta = n);
    }
  }
};
function et(t) {
  const e = t.getChildNodes();
  for (let n = 0, s = e.length; n < s; n++) {
    const i = e[n];
    i.processLeaveAnimation === w && (i.processLeaveAnimation = function(r) {
      r();
    });
  }
  t.clean(t.hasAnimation(e));
}
function tt(t, e, n, s) {
  const i = new xe(n.path);
  let r = e.scope, l = e.scope;
  for (typeof n.onInvoke == "function" && n.onInvoke.call(); r; ) {
    if (l instanceof R || (l = new R({
      systemId: "repeat-item",
      path: e.scope.__parent__.uri.parsedURL,
      parentScope: e.scope.__parent__
    })), i.parsedURL === l.uri.parsedURL)
      return console.error(`Circular module loading detected and stopped. 
` + l.uri.parsedURL + " tries to load itself.");
    r = r.parentScope;
  }
  l.load(n, {
    element: t
  }).then(function(a) {
    e.loadedModule = a, t.node.setAttribute("module", a.path), a.start(), typeof n.onLoad == "function" && n.onLoad.call(), s();
  }).catch(function(a) {
    console.error(a), s();
  });
}
const nt = {
  type: "prop",
  key: "on",
  /**
   *
   * @param {ViewNode} viewNode
   * @param events
   */
  update: function(t, e) {
    if (e !== null && typeof e == "object") {
      for (let n in e)
        if (e.hasOwnProperty(n)) {
          const s = function(i) {
            return e[n].call(t, i, t.data);
          };
          t.node.addEventListener(n, s, !1), t.finalize.push(() => {
            t.node.removeEventListener(n, s, !1);
          });
        }
    }
  }
}, I = class I {
  constructor() {
    this.id = I.lastId++, I.lastId > 1e8 && (I.lastId = 0), this.init = null, this.original = null, this.returnValue = null, this.params = [], this.type = "reset";
  }
  /**
   * Get a new instance of ArrayChange with the same properties.
   * @returns {ArrayChange} A new instance of ArrayChange.
   */
  getInstance() {
    const e = new I();
    return e.init = this.init, e.original = this.original, e.params = [...this.params], e.type = this.type, e;
  }
};
de(I, "lastId", 0);
let C = I;
const ve = {
  type: "reactive",
  key: "repeat",
  getConfig: function(t, e) {
    return this.virtualize(), {
      changeId: null,
      previousActionId: null,
      nodes: [],
      data: e.data,
      as: e.as,
      indexAs: e.indexAs || "_index",
      oldChanges: {},
      positions: [],
      trackMap: [],
      scope: t,
      trackBy: e.trackBy,
      onComplete: e.onComplete
    };
  },
  /**
   *
   * @param config Value return by getConfig
   */
  install: function(t) {
    const e = this;
    if (t.data) {
      if (t.as === "data")
        throw new Error("`data` is an invalid value for repeat.as property. Please choose a different value.`");
      e.localPropertyNames.add(t.as), e.localPropertyNames.add(t.indexAs);
      const n = V(t.data);
      if (n.propertyKeys.length)
        $(e, "repeat", void 0, t.scope, n, e), n.propertyKeys.forEach((s) => {
          try {
            const i = De(t.scope, s);
            e.finalize.push(() => {
              i.removeNode(e);
            });
          } catch (i) {
            console.error("Could not find: " + s + `
`, i);
          }
        });
      else if (t.data instanceof Array) {
        const s = e.setters.repeat = fe(ve, e, t.data, null), i = new C();
        i.params = t.data, t.data.changes = i, s(t.data);
      }
    }
    return !1;
  },
  /**
   *
   * @this ViewNode
   * @param config The value returned by getConfig
   * @param value
   * @param {Function} expression
   */
  update: function(t, e, n) {
    let s = null;
    if (n) {
      if (e = n(), e === void 0)
        return;
      if (e === null)
        throw Error("Invalid return type: " + e + "\nThe expression function for `repeat.data` must return an instance of Array or Galaxy.View.ArrayChange or undefined");
      if (e instanceof C)
        s = e;
      else if (e instanceof Array) {
        const r = new C();
        r.original = e, r.type = "reset", r.params = e, s = e.changes = r;
      } else if (e instanceof Object) {
        const r = Object.entries(e).map(([a, d]) => ({ key: a, value: d })), l = new C();
        l.original = r, l.type = "reset", l.params = r, s = e.changes = l;
      } else
        s = {
          type: "reset",
          params: []
        };
    } else if (e instanceof C)
      s = e;
    else if (e instanceof Array)
      s = e.changes;
    else if (e instanceof Object) {
      const r = Object.entries(e).map(([l, a]) => ({ key: l, value: a }));
      s = new C(), s.original = r, s.type = "reset", s.params = r;
    }
    if (s && !(s instanceof C))
      return console.warn(`%crepeat %cdata is not a type of ArrayChange
data: ` + t.data + `
%ctry '` + t.data + `.changes'
`, "color:black;font-weight:bold", null, "color:green;font-weight:bold");
    (!s || typeof s == "string") && (s = {
      id: 0,
      type: "reset",
      params: []
    });
    const i = this;
    s.id !== t.changeId && (t.changeId = s.id, t.oldChanges = s, it(i, t, st(i, t, s)));
  }
};
function st(t, e, n) {
  const s = t.blueprint.animations && t.blueprint.animations.leave, i = e.trackBy;
  if (i && n.type === "reset") {
    let r;
    i === !0 ? r = n.params.map((d) => d) : typeof i == "string" && (r = n.params.map((d) => d[i]));
    const l = [];
    e.trackMap = e.trackMap.filter(function(d, p) {
      return r.indexOf(d) === -1 && e.nodes[p] ? (l.push(e.nodes[p]), !1) : !0;
    });
    const a = new C();
    return a.init = n.init, a.type = n.type, a.original = n.original, a.params = n.params, a.__rd__ = n.__rd__, a.type === "reset" && a.params.length && (a.type = "push"), e.nodes = e.nodes.filter(function(d) {
      return l.indexOf(d) === -1;
    }), z(l, s), a;
  } else if (n.type === "reset") {
    const r = e.nodes.slice(0);
    e.nodes = [], z(r, s);
    const l = Object.assign({}, n);
    return l.type = "push", l;
  }
  return n;
}
function it(t, e, n) {
  const s = t.parent, i = [], r = [], l = e.scope, a = e.trackMap, d = e.as, p = e.indexAs, o = e.nodes, c = e.trackBy, f = t.cloneBlueprint();
  f.repeat = null;
  let u = o.length ? o[o.length - 1].anchor.nextSibling : t.placeholder.nextSibling, h = [], m;
  if (c === !0 ? m = function(_, y, A) {
    a.push(A), this.push(_);
  } : typeof c == "string" ? m = function(_, y, A) {
    a.push(A[e.trackBy]), this.push(_);
  } : m = function(_) {
    this.push(_);
  }, n.type === "push")
    h = n.params;
  else if (n.type === "unshift")
    u = o[0] ? o[0].anchor : u, h = n.params, c === !0 ? m = function(_, y, A) {
      a.unshift(A), this.unshift(_);
    } : m = function(_, y, A) {
      a.unshift(A[c]), this.unshift(_);
    };
  else if (n.type === "splice") {
    const _ = n.params.slice(0, 2), y = Array.prototype.splice.apply(o, _);
    z(y.reverse(), t.blueprint.animations && t.blueprint.animations.leave), Array.prototype.splice.apply(a, _);
    const A = n.params[0];
    h = n.params.slice(2);
    for (let g = 0, E = h.length; g < E; g++) {
      const S = g + A;
      i.push(S), r.push(o[S] ? o[S].anchor : u);
    }
    c === !0 ? m = function(g, E, S) {
      a.splice(E, 0, S), this.splice(E, 0, g);
    } : m = function(g, E, S) {
      a.splice(E, 0, S[c]), this.splice(E, 0, g);
    };
  } else if (n.type === "pop") {
    const _ = o.pop();
    _ && _.destroy(), a.pop();
  } else if (n.type === "shift") {
    const _ = o.shift();
    _ && _.destroy(), a.shift();
  } else (n.type === "sort" || n.type === "reverse") && (o.forEach(function(_) {
    _.destroy();
  }), e.nodes = [], h = n.original, Array.prototype[n.type].call(a));
  const b = t.view;
  if (h instanceof Array) {
    const _ = h.slice(0);
    if (c)
      if (c === !0)
        for (let y = 0, A = h.length; y < A; y++) {
          const g = _[y], E = a.indexOf(g);
          if (E !== -1) {
            e.nodes[E].data._index = E;
            continue;
          }
          Z(b, f, l, d, g, p, y, s, r[y] || u, m, o, i);
        }
      else
        for (let y = 0, A = h.length; y < A; y++) {
          const g = _[y], E = a.indexOf(g[c]);
          if (E !== -1) {
            e.nodes[E].data._index = E;
            continue;
          }
          Z(b, f, l, d, g, p, y, s, r[y] || u, m, o, i);
        }
    else
      for (let y = 0, A = h.length; y < A; y++)
        Z(b, f, l, d, _[y], p, y, s, r[y] || u, m, o, i);
    e.onComplete && j(t.index, (y) => {
      e.onComplete(o), y();
    });
  }
}
function rt(t, e, n) {
  const s = Ne(t);
  return s[e] = n, s;
}
function Z(t, e, n, s, i, r, l, a, d, p, o, c) {
  const f = rt(n, s, i), u = pe(e);
  f[r] = l;
  const h = t.createNode(u, f, a, d);
  p.call(o, h, c[l], f[s]);
}
const ot = {
  type: "prop",
  key: "selected",
  /**
   *
   * @param {ViewNode} viewNode
   * @param {ReactiveData} scopeReactiveData
   * @param prop
   * @param {Function} expression
   */
  beforeActivate: function(t, e, n, s) {
    if (e) {
      if (s && t.blueprint.tag === "select")
        throw new Error(
          "select.selected property does not support binding expressions because it must be able to change its data.\nIt uses its bound value as its `model` and expressions can not be used as model.\n"
        );
      t.blueprint.tag === "select" && (V(t.blueprint.selected).propertyKeys[0].split(".").pop(), t.node.addEventListener("change", (l) => {
        console.log(t.node, "SELECTED", l);
      }));
    }
  },
  update: function(t, e) {
    const n = t.node;
    t.rendered.then(function() {
      n.value !== e && (t.blueprint.tag === "select" ? n.value = e : e ? n.setAttribute("selected", !0) : n.removeAttribute("selected"));
    });
  }
}, at = {
  type: "prop",
  key: "style"
}, lt = {
  type: "prop",
  key: "style"
}, ct = {
  type: "reactive",
  key: "style",
  getConfig: function(t, e) {
    return {
      scope: t,
      subjects: e,
      reactiveStyle: null
    };
  },
  install: function(t) {
    if (this.virtual || t.subjects === null || t.subjects instanceof Array || typeof t.subjects != "object")
      return !0;
    const e = this.node, n = t.reactiveStyle = B(
      this,
      t.subjects,
      t.scope,
      !0
    );
    return new D(n).onAll(() => {
      ee(e, n);
    }), !0;
  },
  /**
   *
   * @param config
   * @param value
   * @param expression
   * @this {ViewNode}
   */
  update: function(t, e, n) {
    if (this.virtual)
      return;
    const i = this.node;
    if (n && (e = n()), typeof e == "string")
      return i.style = e;
    if (e instanceof Array)
      return i.style = e.join(";");
    if (e instanceof Promise)
      e.then(function(r) {
        ee(i, r);
      });
    else if (e === null)
      return i.removeAttribute("style");
    t.subjects === e && (e = t.reactiveStyle), ee(i, e);
  }
};
function ee(t, e) {
  if (e instanceof Object)
    for (let n in e) {
      const s = e[n];
      s instanceof Promise ? s.then((i) => {
        t.style[n] = i;
      }) : typeof s == "function" ? t.style[n] = s.call(t.__vn__, t.__vn__.data) : t.style[n] = s;
    }
  else
    t.style = e;
}
const ft = ["radio", "checkbox", "button", "reset", "submit"], pt = {
  type: "none"
}, ut = {
  type: "prop",
  key: "value",
  /**
   *
   * @param {ViewNode} viewNode
   * @param {ReactiveData} scopeReactiveData
   * @param prop
   * @param {Function} expression
   */
  beforeActivate: function(e, n, s, i) {
    const r = e.node;
    if (!n || ft.indexOf(r.type) !== -1)
      return;
    if (i)
      throw new Error(
        "input.value property does not support binding expressions because it must be able to change its data.\nIt uses its bound value as its `model` and expressions can not be used as model.\n"
      );
    const a = V(e.blueprint.value).propertyKeys[0].split(".").pop();
    if (r.tagName === "SELECT") {
      const d = new MutationObserver(() => {
        e.rendered.then(() => {
          r.value = n.data[a];
        });
      });
      d.observe(r, { childList: !0 }), e.finalize.push(() => {
        d.disconnect();
      }), r.addEventListener(
        "change",
        me(n, a)
      );
    } else r.type === "number" || r.type === "range" ? r.addEventListener(
      "input",
      dt(r, n, a)
    ) : r.addEventListener(
      "input",
      me(n, a)
    );
  },
  update: function(t, e) {
    (e !== t.node.value || !t.node.value) && (t.node.value = e ?? "");
  }
};
function dt(t, e, n) {
  return function() {
    e.data[n] = t.value ? Number(t.value) : null;
  };
}
function me(t, e) {
  return function(n) {
    t.data[e] = n.target.value;
  };
}
const ht = {
  type: "reactive",
  key: "visible",
  getConfig: function() {
    return {
      throttleId: 0
    };
  },
  install: function() {
    return !0;
  },
  update: function(t, e, n) {
    t.throttleId !== 0 && (window.clearTimeout(t.throttleId), t.throttleId = 0), n && (e = n()), t.throttleId = window.setTimeout(() => {
      this.visible !== e && this.setVisibility(e);
    });
  }
};
O.data = Ke;
O.text_3 = qe;
O.text_8 = Ye;
O.text = Je;
O.animations = ie;
O.checked = Xe;
O.class = ze;
O.disabled = We;
O.if = Qe;
O.module = Ze;
O.on = nt;
O.repeat = ve;
O.selected = ot;
O.style = ct;
O.style_3 = at;
O.style_8 = lt;
O["value.config"] = pt;
O.value = ut;
O.visible = ht;
O._create = {
  type: "prop",
  key: "_create",
  getSetter: () => w
};
O._render = {
  type: "prop",
  key: "_render",
  getSetter: () => w
};
O._destroy = {
  type: "prop",
  key: "_destroy",
  getSetter: () => w
};
O.renderConfig = {
  type: "prop",
  key: "renderConfig"
};
const te = {
  value: void 0,
  configurable: !1,
  enumerable: !1
}, _e = {
  value: null,
  configurable: !1,
  enumerable: !1,
  writable: !0
};
function Ce(t, e, n) {
  t.insertBefore(e, n);
}
function Y(t, e) {
  t.removeChild(e);
}
function L(t) {
  const e = this;
  t ? (e.node.parentNode && Y(e.node.parentNode, e.node), e.placeholder.parentNode && Y(e.placeholder.parentNode, e.placeholder), e.garbage.forEach(function(n) {
    L.call(n, !0);
  }), e.hasBeenDestroyed()) : (e.placeholder.parentNode || Ce(e.node.parentNode, e.placeholder, e.node), e.node.parentNode && Y(e.node.parentNode, e.node), e.garbage.forEach(function(n) {
    L.call(n, !0);
  })), e.garbage = [];
}
v.GLOBAL_RENDER_CONFIG = {
  applyClassListAfterRender: !1,
  renderDetached: !1
};
v.cleanReferenceNode = function(t) {
  t instanceof Array ? t.forEach(function(e) {
    v.cleanReferenceNode(e);
  }) : t instanceof Object && (t.node = null, v.cleanReferenceNode(t.children));
};
v.createIndex = function(t) {
  if (t < 0) return "0";
  if (t < 10) return t + "";
  let e = "9", n = t - 10;
  for (; n >= 10; )
    e += "9", n -= 10;
  return e + n;
};
function v(t, e, n, s) {
  const i = this;
  i.view = n, t.tag instanceof Node ? (i.node = t.tag, t.tag = t.tag.tagName) : i.node = Qt(t.tag || "div", e), "style" in i.node || (i.processEnterAnimation = w), i.blueprint = t, i.data = s instanceof R ? {} : s, i.localPropertyNames = /* @__PURE__ */ new Set(), i.inputs = {}, i.virtual = !1, i.visible = !0, i.placeholder = Wt(t.tag || "div"), i.properties = /* @__PURE__ */ new Set(), i.inDOM = !1, i.setters = {}, i.parent = e, i.finalize = [], i.origin = !1, i.destroyOrigin = 0, i.transitory = !1, i.garbage = [], i.leaveWithParent = !1, i.onLeaveComplete = L.bind(i, !0), k(i, "cache", {
    enumerable: !1,
    configurable: !1,
    value: {}
  }), i.rendered = new Promise(function(l) {
    "style" in i.node ? i.hasBeenRendered = function() {
      i.rendered.resolved = !0, i.node.style.removeProperty("display"), i.blueprint._render && i.blueprint._render.call(i, i.data), l(i);
    } : i.hasBeenRendered = function() {
      i.rendered.resolved = !0, l();
    };
  }), i.rendered.resolved = !1, i.destroyed = new Promise(function(l) {
    i.hasBeenDestroyed = function() {
      i.destroyed.resolved = !0, i.blueprint._destroy && i.blueprint._destroy.call(i, i.data), l();
    };
  }), i.destroyed.resolved = !1, i.blueprint.renderConfig = Object.assign({}, v.GLOBAL_RENDER_CONFIG, t.renderConfig || {}), _e.value = this.node, k(i.blueprint, "node", _e), te.value = this, i.node.__vn__ || (k(i.node, "__vn__", te), k(i.placeholder, "__vn__", te)), i.blueprint._create && i.blueprint._create.call(i, i.data);
}
v.prototype = {
  onLeaveComplete: null,
  dump: function() {
    let t = this.parent, e = this.garbage;
    for (; t.transitory && (t.blueprint.hasOwnProperty("if") && !this.blueprint.hasOwnProperty("if") && (e = t.garbage), t.parent && t.parent.transitory); )
      t = t.parent;
    e.push(this), this.garbage = [];
  },
  query: function(t) {
    return this.node.querySelector(t);
  },
  dispatchEvent: function(t) {
    this.node.dispatchEvent(t);
  },
  cloneBlueprint: function() {
    const t = Object.assign({}, this.blueprint);
    return v.cleanReferenceNode(t), k(t, "mother", {
      value: this.blueprint,
      writable: !1,
      enumerable: !1,
      configurable: !1
    }), t;
  },
  virtualize: function() {
    this.placeholder.nodeValue = JSON.stringify(this.blueprint, (t, e) => t === "children" ? "<children>" : t === "animations" ? "<animations>" : e, 2), this.virtual = !0, this.setInDOM(!1);
  },
  processEnterAnimation: function() {
    this.node.style.display = null;
  },
  processLeaveAnimation: w,
  populateHideSequence: function() {
    this.node.style.display = "none";
  },
  /**
   *
   * @param {boolean} flag
   */
  setInDOM: function(t) {
    const e = this;
    if (e.blueprint.renderConfig.renderDetached) {
      j(e.index, (n) => {
        e.blueprint.renderConfig.renderDetached = !1, e.hasBeenRendered(), n();
      });
      return;
    }
    if (e.inDOM = t, !e.virtual) {
      if (t) {
        "style" in e.node && e.node.style.setProperty("display", "none"), e.node.parentNode || Ce(e.placeholder.parentNode, e.node, e.placeholder.nextSibling), e.placeholder.parentNode && Y(e.placeholder.parentNode, e.placeholder), j(e.index, (i) => {
          e.hasBeenRendered(), e.processEnterAnimation(), i();
        });
        const n = e.getChildNodesAsc(), s = n.length;
        for (let i = 0; i < s; i++)
          n[i].setInDOM(!0);
      } else if (!t && e.node.parentNode) {
        e.origin = !0, e.transitory = !0;
        const n = e.processLeaveAnimation, s = e.getChildNodes();
        e.prepareLeaveAnimation(e.hasAnimation(s), s), F(e.index, (i) => {
          e.processLeaveAnimation(L.bind(e, !1)), e.origin = !1, e.transitory = !1, e.processLeaveAnimation = n, i();
        });
      }
    }
  },
  setVisibility: function(t) {
    const e = this;
    e.visible = t, t && !e.virtual ? j(e.index, (n) => {
      e.node.style.display = null, e.processEnterAnimation(), n();
    }) : !t && e.node.parentNode && (e.origin = !0, e.transitory = !0, F(e.index, (n) => {
      e.populateHideSequence(), e.origin = !1, e.transitory = !1, n();
    }));
  },
  /**
   *
   * @param {ViewNode} childNode
   * @param position
   */
  registerChild: function(t, e) {
    this.node.insertBefore(t.placeholder, e);
  },
  createNode: function(t, e) {
    this.view.createNode(t, e, this);
  },
  /**
   * @param {string} propertyKey
   * @param {Galaxy.View.ReactiveData} reactiveData
   * @param {Function} expression
   */
  registerActiveProperty: function(t, e, n) {
    this.properties.add(e), qt(this, t, e, n);
  },
  snapshot: function(t) {
    const e = this.node.getBoundingClientRect(), n = this.node.cloneNode(!0), s = {
      margin: "0",
      width: e.width + "px",
      height: e.height + " px",
      top: e.top + "px",
      left: e.left + "px",
      position: "fixed"
    };
    return Object.assign(n.style, s), {
      tag: n,
      style: s
    };
  },
  hasAnimation: function(t) {
    if (this.processLeaveAnimation && this.processLeaveAnimation !== w)
      return !0;
    for (let e = 0, n = t.length; e < n; e++) {
      const s = t[e];
      if (s.hasAnimation(s.getChildNodes()))
        return !0;
    }
    return !1;
  },
  prepareLeaveAnimation: function(t, e) {
    const n = this;
    if (t) {
      if (n.processLeaveAnimation === w)
        n.origin ? n.processLeaveAnimation = function() {
          L.call(n, !1);
        } : n.destroyOrigin === 1 && L.call(n, !0);
      else if (n.processLeaveAnimation !== w && !n.origin)
        for (let s = 0, i = e.length; s < i; s++)
          e[s].onLeaveComplete = w;
    } else
      n.processLeaveAnimation = function() {
        L.call(n, !n.origin);
      };
  },
  destroy: function(t) {
    const e = this;
    if (e.transitory = !0, e.parent.destroyOrigin === 0 ? e.destroyOrigin = 1 : e.destroyOrigin = 2, e.inDOM) {
      const s = e.getChildNodes();
      t = t || e.hasAnimation(s), e.prepareLeaveAnimation(t, s), e.clean(t, s);
    }
    e.properties.forEach((s) => s.removeNode(e));
    let n = e.finalize.length;
    for (let s = 0; s < n; s++)
      e.finalize[s].call(e);
    F(e.index, (s) => {
      e.processLeaveAnimation(e.destroyOrigin === 2 ? w : e.onLeaveComplete), e.localPropertyNames.clear(), e.properties.clear(), e.finalize = [], e.inDOM = !1, e.inputs = {}, e.view = null, e.parent = null, Reflect.deleteProperty(e.blueprint, "node"), s();
    });
  },
  getChildNodes: function() {
    const t = [], e = Oe.call(this.node.childNodes, 0);
    for (let n = e.length - 1; n >= 0; n--) {
      const s = e[n];
      "__vn__" in s && t.push(s.__vn__);
    }
    return t;
  },
  getChildNodesAsc: function() {
    const t = [], e = Oe.call(this.node.childNodes, 0);
    for (let n = 0; n < e.length; n++) {
      const s = e[n];
      "__vn__" in s && t.push(s.__vn__);
    }
    return t;
  },
  /**
   *
   */
  clean: function(t, e) {
    e = e || this.getChildNodes(), z(e, t), F(this.index, (n) => {
      let s = this.finalize.length;
      for (let i = 0; i < s; i++)
        this.finalize[i].call(this);
      this.finalize = [], n();
    });
  },
  createNext: function(t) {
    j(this.index, t);
  },
  get index() {
    const t = this.parent;
    if (t) {
      let e = this.placeholder.parentNode ? this.placeholder.previousSibling : this.node.previousSibling;
      if (e) {
        if (!e.hasOwnProperty("__index__")) {
          let n = 0, s = this.node;
          for (; (s = s.previousSibling) !== null; ) ++n;
          e.__index__ = n;
        }
        this.node.__index__ = e.__index__ + 1;
      } else
        this.node.__index__ = 0;
      return t.index + "," + v.createIndex(this.node.__index__);
    }
    return "0";
  },
  get anchor() {
    return this.inDOM ? this.node : this.placeholder;
  }
};
function yt(t, e, n) {
  const s = e.key, i = e.update || Ft, r = mt(i, t, s);
  return n ? function() {
    const a = n();
    r(a);
  } : r;
}
function mt(t, e, n) {
  return function(i) {
    if (i instanceof Promise) {
      const r = function(l) {
        t(e, l, n);
      };
      i.then(r).catch(r);
    } else if (i instanceof Function) {
      const r = i.call(e, e.data);
      t(e, r, n);
    } else
      t(e, i, n);
  };
}
function _t(t, e, n) {
  const s = e.key, i = e.update || Me, r = bt(i, t, s);
  return n ? function() {
    const a = n();
    r(a);
  } : r;
}
function bt(t, e, n) {
  return function(i) {
    if (i instanceof Promise) {
      const r = function(l) {
        t(e, l, n);
      };
      i.then(r).catch(r);
    } else if (i instanceof Function) {
      const r = i.call(e, e.data);
      t(e, r, n);
    } else
      t(e, i, n);
  };
}
function gt(t, e, n, s) {
  const i = e.key, r = e.update, l = t.cache[i];
  return Ot(r, t, l, n, s);
}
function Ot(t, e, n, s, i) {
  const r = t.bind(e);
  return function(a) {
    return r(n, a, s, i);
  };
}
const At = Array.prototype, Et = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse"
], wt = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
  "changes",
  "__rd__"
], xt = Object.keys, T = Object.defineProperty, vt = function(t) {
  return {
    id: t || "Scope",
    shadow: {},
    data: {},
    notify: function() {
    },
    notifyDown: function() {
    },
    sync: function() {
    },
    makeReactiveObject: function() {
    },
    addKeyToShadow: function() {
    }
  };
}, Ct = function(t) {
  if (t instanceof Array) {
    const e = ["length"];
    return t.hasOwnProperty("changes") && e.push("changes"), e;
  } else
    return Object.keys(t);
};
function Pt(t, e, n) {
  const s = At[e];
  return function() {
    const r = this.__rd__;
    let l = arguments.length;
    const a = new Array(l);
    for (; l--; )
      a[l] = arguments[l];
    const d = s.apply(this, a), p = new C(), o = p.original = t;
    switch (p.type = e, p.params = a, p.returnValue = d, p.init = n, e) {
      case "push":
      case "reset":
      case "unshift":
        const c = o.length - 1;
        for (let f = 0, u = p.params.length; f < u; f++) {
          const h = p.params[f];
          h !== null && typeof h == "object" && new P(c + f, h, r);
        }
        break;
      case "pop":
      case "shift":
        d !== null && typeof d == "object" && "__rd__" in d && d.__rd__.removeMyRef();
        break;
      case "splice":
        p.params.slice(2).forEach(function(f) {
          f !== null && typeof f == "object" && new P(o.indexOf(f), f, r);
        });
        break;
    }
    return t.changes = p, r.notifyDown("length"), r.notifyDown("changes"), r.notify(r.keyInParent, this), d;
  };
}
const re = {
  _(t, e, n) {
    n instanceof C && (n = n.getInstance()), t instanceof v ? t.setters[e](n) : t[e] = n, D.notify(t, e, n);
  },
  self(t, e, n, s, i) {
    i || s || re._(t, e, n);
  },
  props(t, e, n, s, i) {
    i && re._(t, e, n);
  }
};
function Pe() {
  this.keys = [], this.nodes = [], this.types = [];
}
Pe.prototype.push = function(t, e, n) {
  this.keys.push(t), this.nodes.push(e), this.types.push(n);
};
function P(t, e, n) {
  const s = n instanceof P ? n : vt(n);
  if (this.data = e, this.id = s.id + (t ? "." + t : "|Scope"), this.keyInParent = t, this.nodesMap = /* @__PURE__ */ Object.create(null), this.parent = s, this.refs = [], this.shadow = /* @__PURE__ */ Object.create(null), this.nodeCount = -1, this.data && this.data.hasOwnProperty("__rd__")) {
    this.refs = this.data.__rd__.refs;
    const i = this.getRefById(this.id);
    if (i)
      return i.parent.isDead && (i.parent = s), this.fixHierarchy(t, i), i;
    this.refs.push(this);
  } else {
    if (this.refs.push(this), this.data === null) {
      if (this.parent.shadow[t])
        return this.parent.shadow[t];
      this.data = {}, this.parent.data[t] ? new P(t, this.parent.data[t], this.parent) : this.parent.makeReactiveObject(this.parent.data, t, !0);
    }
    if (!Object.isExtensible(this.data))
      return;
    T(this.data, "__rd__", {
      enumerable: !1,
      configurable: !0,
      value: this
    }), (this.data instanceof R || this.data.__scope__) && (this.addKeyToShadow = w), this.data instanceof R ? this.walkOnScope(this.data) : this.walk(this.data);
  }
  this.fixHierarchy(t, this);
}
P.prototype = {
  get isDead() {
    return this.nodeCount === 0 && this.refs.length === 1 && this.refs[0] === this;
  },
  // If parent data is an array, then this would be an item inside the array
  // therefore its keyInParent should NOT be its index in the array but the
  // array's keyInParent. This way we redirect each item in the array to the
  // array's reactive data
  fixHierarchy: function(t, e) {
    this.parent.data instanceof Array ? this.keyInParent = this.parent.keyInParent : this.parent.shadow[t] = e;
  },
  setData: function(t) {
    if (this.removeMyRef(), !(t instanceof Object)) {
      this.data = {};
      for (let e in this.shadow)
        this.shadow[e] instanceof P ? this.shadow[e].setData(t) : this.notifyDown(e);
      return;
    }
    this.data = t, t.hasOwnProperty("__rd__") ? (this.data.__rd__.addRef(this), this.refs = this.data.__rd__.refs, this.data instanceof Array ? (this.sync("length", this.data.length, !1, !1), this.sync("changes", this.data.changes, !1, !1)) : this.syncAll()) : (T(this.data, "__rd__", {
      enumerable: !1,
      configurable: !0,
      value: this
    }), this.walk(this.data)), this.setupShadowProperties(Ct(this.data));
  },
  /**
   *
   * @param data
   */
  walk: function(t) {
    if (!(t instanceof Node)) {
      if (t instanceof Array)
        this.makeReactiveArray(t);
      else if (t instanceof Object)
        for (let e in t)
          this.makeReactiveObject(t, e, !1);
    }
  },
  walkOnScope: function(t) {
  },
  /**
   *
   * @param data
   * @param {string} key
   * @param shadow
   */
  makeReactiveObject: function(t, e, n) {
    let s = t[e];
    if (typeof s == "function")
      return;
    const i = Object.getOwnPropertyDescriptor(t, e), r = i && i.get, l = i && i.set;
    T(t, e, {
      get: function() {
        return r ? r.call(t) : s;
      },
      set: function(a) {
        const d = t.__rd__;
        if (l && l.call(t, a), s === a) {
          a instanceof Array ? d.sync(e, a, !0, !1) : a instanceof Object && d.notifyDown(e);
          return;
        }
        s = a;
        for (let p = 0, o = d.refs.length; p < o; p++) {
          const c = d.refs[p];
          c.shadow[e] && (c.makeKeyEnum(e), c.shadow[e].setData(a));
        }
        d.notify(e, s, null, !1);
      },
      enumerable: !n,
      configurable: !0
    }), this.shadow[e] ? this.shadow[e].setData(s) : this.shadow[e] = null, this.sync(e, s, !1, !1);
  },
  /**
   *
   * @param arr
   * @returns {*}
   */
  makeReactiveArray: function(t) {
    if (t.hasOwnProperty("changes"))
      return t.changes.init;
    const e = this, n = new C();
    n.original = t, n.type = "reset", n.params = t;
    for (let s = 0, i = n.params.length; s < i; s++) {
      const r = n.params[s];
      r !== null && typeof r == "object" && new P(n.original.indexOf(r), r, e);
    }
    return e.sync("length", t.length, !1, !1), n.init = n, T(t, "changes", {
      enumerable: !1,
      configurable: !1,
      writable: !0,
      value: n
    }), Et.forEach(function(s) {
      T(t, s, {
        value: Pt(t, s, n),
        writable: !1,
        configurable: !0
      });
    }), n;
  },
  /**
   *
   * @param {string} key
   * @param {any} value
   * @param refs
   * @param {boolean} fromChild
   */
  notify: function(t, e, n, s) {
    if (this.refs === n) {
      this.sync(t, e, !1, s);
      return;
    }
    for (let i = 0, r = this.refs.length; i < r; i++) {
      const l = this.refs[i];
      this !== l && l.notify(t, e, this.refs, s);
    }
    this.sync(t, e, !1, s);
    for (let i = 0, r = this.refs.length; i < r; i++) {
      const l = this.refs[i], a = l.keyInParent, d = l.parent;
      l.parent.notify(a, d.data[a], null, !0);
    }
  },
  notifyDown: function(t) {
    const e = this.data[t];
    this.notifyRefs(t, e), this.sync(t, e, !1, !1);
  },
  notifyRefs: function(t, e) {
    for (let n = 0, s = this.refs.length; n < s; n++) {
      const i = this.refs[n];
      this !== i && i.notify(t, e, this.refs, !1);
    }
  },
  /**
   *
   * @param {string} propertyKey
   * @param {*} value
   * @param {boolean} sameValueObject
   * @param {boolean} fromChild
   */
  sync: function(t, e, n, s) {
    const i = this, r = i.nodesMap[t];
    if (D.notify(i.data, t, e), r)
      for (let l = 0, a = r.nodes.length; l < a; l++)
        i.syncNode(r.types[l], r.nodes[l], r.keys[l], e, n, s);
  },
  /**
   *
   */
  syncAll: function() {
    const t = this, e = xt(t.data);
    for (let n = 0, s = e.length; n < s; n++)
      t.sync(e[n], t.data[e[n]], !1, !1);
  },
  /**
   *
   * @param {string} bindType
   * @param node
   * @param {string} key
   * @param {*} value
   * @param {boolean} sameObjectValue
   * @param {boolean} fromChild
   */
  syncNode: function(t, e, n, s, i, r) {
    re[t].call(null, e, n, s, i, r);
  },
  /**
   *
   * @param {Galaxy.View.ReactiveData} reactiveData
   */
  addRef: function(t) {
    this.refs.indexOf(t) === -1 && this.refs.push(t);
  },
  /**
   *
   * @param {Galaxy.View.ReactiveData} reactiveData
   */
  removeRef: function(t) {
    const e = this.refs.indexOf(t);
    e !== -1 && this.refs.splice(e, 1);
  },
  /**
   *
   */
  removeMyRef: function() {
    if (!(!this.data || !this.data.hasOwnProperty("__rd__")))
      if (this.data.__rd__ !== this)
        this.refs = [this], this.data.__rd__.removeRef(this);
      else if (this.refs.length === 1) {
        const t = this.data;
        if (t instanceof Array)
          for (const e of wt)
            Reflect.deleteProperty(t, e);
      } else {
        this.data.__rd__.removeRef(this);
        const t = this.refs[0];
        T(this.data, "__rd__", {
          enumerable: !1,
          configurable: !0,
          value: t
        }), this.refs = [this];
      }
  },
  /**
   *
   * @param {string} id
   * @returns {*}
   */
  getRefById: function(t) {
    return this.refs.filter(function(e) {
      return e.id === t;
    })[0];
  },
  /**
   *
   * @param {Galaxy.ViewNode} node
   * @param {string} nodeKey
   * @param {string} dataKey
   * @param {string} bindType
   * @param expression
   */
  addNode: function(t, e, n, s, i) {
    let r = this.nodesMap[n];
    r || (r = this.nodesMap[n] = new Pe()), s = s || "_", this.nodeCount === -1 && (this.nodeCount = 0);
    const l = r.nodes.indexOf(t);
    if (l === -1 || r.keys[l] !== e) {
      this.nodeCount++, t instanceof v && !t.setters[e] && t.registerActiveProperty(e, this, i), r.push(e, t, s);
      let a = this.data[n];
      a instanceof Array && a.changes && (a.hasOwnProperty("changes") ? a.changes = a.changes.init : T(a, "changes", {
        enumerable: !1,
        configurable: !1,
        writable: !0,
        value: a.changes.init
      })), this.data instanceof Array && n !== "length" && a && (a = a.init), this.syncNode("_", t, e, a, !1, !1);
    }
  },
  /**
   *
   * @param node
   */
  removeNode: function(t) {
    for (let e = 0, n = this.refs.length; e < n; e++)
      this.removeNodeFromRef(this.refs[e], t);
  },
  /**
   *
   * @param ref
   * @param node
   */
  removeNodeFromRef: function(t, e) {
    let n;
    for (let s in t.nodesMap) {
      n = t.nodesMap[s];
      let i = -1;
      for (; (i = n.nodes.indexOf(e)) !== -1; )
        n.nodes.splice(i, 1), n.keys.splice(i, 1), n.types.splice(i, 1), this.nodeCount--;
    }
  },
  /**
   *
   * @param {string} key
   * @param {boolean} isArray
   */
  addKeyToShadow: function(t, e) {
    t in this.shadow || (e ? this.shadow[t] = new P(t, [], this) : this.shadow[t] = null), this.data.hasOwnProperty(t) || this.makeReactiveObject(this.data, t, !1);
  },
  /**
   *
   */
  setupShadowProperties: function(t) {
    for (let e in this.shadow)
      this.shadow[e] instanceof P ? (this.data.hasOwnProperty(e) || this.makeReactiveObject(this.data, e, !0), this.shadow[e].setData(this.data[e])) : t.indexOf(e) === -1 && this.sync(e, void 0, !1, !1);
  },
  /**
   *
   * @param {string} key
   */
  makeKeyEnum: function(t) {
    const e = Object.getOwnPropertyDescriptor(this.data, t);
    e && e.enumerable === !1 && (e.enumerable = !0, T(this.data, t, e));
  }
};
const St = /=\s*'<([^\[\]<>]*)>(.*)'/m, kt = /=\s*'=\s*"<([^\[\]<>]*)>(.*)"/m, Rt = /^\(\s*([^)]+?)\s*\)|^function.*\(\s*([^)]+?)\s*\)/m, Tt = /^<([^\[\]<>]*)>\s*([^<>]*)\s*$|^=\s*([^\[\]<>]*)\s*$/, jt = /\.|\[([^\[\]\n]+)]|([^.\n\[\]]+)/g, Se = {};
for (const t in O)
  O[t].type === "reactive" && (Se[t] = !0);
const It = {
  none: function() {
    return w;
  },
  prop: yt,
  attr: _t,
  reactive: gt
};
function Lt() {
  return "@" + performance.now();
}
function ce(t, e) {
  const s = t.match(jt).filter((i) => i !== "" && i !== ".");
  return e ? s.map((i) => i.indexOf("[") === 0 ? i.substring(1, i.length - 1) : i) : s;
}
function Mt(t, e) {
  const n = ce(e, !0);
  let s = n[0];
  const i = t;
  let r = t, l = t;
  if (t[s] === void 0) {
    for (; l.__parent__; ) {
      if (l.__parent__.hasOwnProperty(s)) {
        r = l.__parent__;
        break;
      }
      l = l.__parent__;
    }
    r[s] === void 0 && (r = i);
  }
  r = r || {};
  const a = n.length - 1;
  return n.forEach(function(d, p) {
    r = r[d], p !== a && !(r instanceof Object) && (r = {});
  }), r instanceof C ? r.getInstance() : r === void 0 ? null : r;
}
const J = W.DOM_MANIPLATION = {}, ke = [], Re = [];
let oe = [], ae = !0, U = !1, M = 0, N = 0, K;
const Te = function(t, e) {
  if (e)
    return t();
  this.length ? this.shift()(Te.bind(this, t)) : t();
}, be = function() {
  if (this.length) {
    let t = this.shift(), e = J[t];
    if (!e.length)
      return X.call(this);
    Te.call(e, X.bind(this), U);
  } else
    ae = !0, N = 0, M = 0;
}, X = function() {
  if (U)
    return U = !1, M = 0, X.call(oe);
  const t = performance.now();
  N = N || t, M = M + (t - N), N = t, M > 2 ? (M = 0, K && (clearTimeout(K), K = null), K = setTimeout((e) => {
    N = e, be.call(this);
  })) : be.call(this);
};
function Nt(t, e) {
  return t > e;
}
function Dt(t, e) {
  return t < e;
}
function je(t, e, n) {
  let s = 0, i = t.length - 1, r = 0;
  for (; s <= i; ) {
    let l = Math.floor((s + i) / 2), a = t[l];
    n(e, a) ? r = s = l + 1 : (r = l, i = l - 1);
  }
  return r;
}
function Vt(t, e) {
  return e < t[0] ? 0 : e > t[t.length - 1] ? t.length : je(t, e, Nt);
}
function Bt(t, e) {
  return e > t[0] ? 0 : e < t[t.length - 1] ? t.length : je(t, e, Dt);
}
function Ie(t, e, n, s) {
  t in J ? J[t].push(e) : (J[t] = [e], n.splice(s(n, t), 0, t));
}
let q = 0;
function Le() {
  q !== 0 && (clearTimeout(q), q = 0), oe = zt(Re, ke), q = setTimeout(() => {
    ae && (ae = !1, X.call(oe));
  });
}
function F(t, e) {
  U = !0, Ie("<" + t, e, Re, Bt), Le();
}
function j(t, e) {
  U = !0, Ie(">" + t, e, ke, Vt), Le();
}
function z(t, e) {
  let n = null;
  for (let s = 0, i = t.length; s < i; s++)
    n = t[s], n.destroy(e);
}
function Me(t, e, n) {
  e != null && e !== !1 ? t.node.setAttribute(n, e === !0 ? "" : e) : t.node.removeAttribute(n);
}
function Ft(t, e, n) {
  t.node[n] = e;
}
function Ne(t) {
  let e = {};
  return k(e, "__parent__", {
    enumerable: !1,
    value: t
  }), k(e, "__scope__", {
    enumerable: !1,
    value: t.__scope__ || t
  }), e;
}
function V(t) {
  let e = [], n = [], s = [], i = !1;
  const r = typeof t;
  let l = null;
  if (r === "string") {
    const a = t.match(Tt);
    a && (s = [a[1]], e = [a[2]], n = [t]);
  } else if (r === "function") {
    i = !0, l = t;
    const a = t.toString().match(Rt);
    a && (n = (a[1] || a[2]).split(",").map((p) => {
      const o = p.indexOf('"') === -1 ? p.match(St) : p.match(kt);
      if (o)
        return s.push(o[1]), e.push(o[2]), "<>" + o[2];
    }));
  }
  return {
    propertyKeys: e,
    propertyValues: n,
    bindTypes: s,
    handler: l,
    isExpression: i,
    expressionFn: null
  };
}
function le(t, e) {
  let s = ce(e, !0)[0];
  const i = t;
  let r = t, l = t, a = 0, d;
  if (t[s] === void 0) {
    for (; l.__parent__; ) {
      if (d = l.__parent__, d.hasOwnProperty(s)) {
        r = d;
        break;
      }
      if (a++ >= 1e3)
        throw Error("Maximum nested property lookup has reached `" + s + "`\n" + t);
      l = d;
    }
    if (r[s] === void 0)
      return i;
  }
  return r;
}
function De(t, e) {
  const n = e.split("."), s = n.length - 1;
  let i = t;
  return n.forEach(function(r, l) {
    i = le(i, r), l !== s && (i[r] ? i = i[r] : i = i.__rd__.refs.filter((d) => d.shadow[r])[0].shadow[r].data);
  }), i.__rd__;
}
const ne = {};
function Ut(t) {
  const e = t.join();
  if (ne[e])
    return ne[e];
  let n = "return [", s = [];
  for (let r = 0, l = t.length; r < l; r++) {
    const a = t[r];
    typeof a == "string" ? a.indexOf("<>this.") === 0 ? s.push('_prop(this.data, "' + a.replace("<>this.", "") + '")') : a.indexOf("<>") === 0 && s.push('_prop(scope, "' + a.replace("<>", "") + '")') : s.push("_var[" + r + "]");
  }
  n += s.join(",") + "]";
  const i = new Function("scope, _prop , _var", n);
  return ne[e] = i, i;
}
function Ht(t, e, n, s, i) {
  i[0] || (t instanceof v ? i[0] = t.data : i[0] = e);
  const r = Ut(i);
  return function() {
    let l = [];
    try {
      l = r.call(t, e, Mt, i);
    } catch (a) {
      console.error(`Can't find the property: 
` + s.join(`
`), `

It is recommended to inject the parent object instead of its property.

`, e, `
`, a);
    }
    return n.apply(t, l);
  };
}
function Gt(t, e, n) {
  if (!t.isExpression)
    return !1;
  if (t.expressionFn)
    return t.expressionFn;
  try {
    return t.expressionFn = Ht(e, n, t.handler, t.propertyKeys, t.propertyValues), t.expressionFn;
  } catch (s) {
    throw Error(s.message + `
` + t.propertyKeys);
  }
}
function $(t, e, n, s, i, r) {
  const l = i.propertyKeys, a = Gt(i, r, s);
  let d = s, p = null, o = null, c = null, f = [];
  for (let u = 0, h = l.length; u < h; u++) {
    p = l[u], o = null;
    const m = i.bindTypes[u];
    if (f = ce(p), f.length > 1 && (p = f[0], o = f.slice(1).join(".")), !n && s && ("__rd__" in s ? n = s.__rd__ : n = new P(null, s, s instanceof R ? s.systemId : "child")), f[0] === "Scope")
      throw new Error("`Scope` keyword must be omitted when it is used  used in bindings: " + l.join("."));
    p.indexOf("[") === 0 && (p = p.substring(1, p.length - 1)), f[0] === "this" && p === "this" && r instanceof v ? (p = f[1], i.propertyKeys = f.slice(2), o = null, n = new P("data", r.data, "this"), d = le(r.data, p)) : d && (d = le(d, p)), c = d, d !== null && typeof d == "object" && (c = d[p]);
    let b;
    if (c instanceof Object ? b = new P(p, c, n || s.__scope__.__rd__) : o ? b = new P(p, null, n) : n && n.addKeyToShadow(p, e === "repeat"), o === null) {
      if (t instanceof v || k(t, e, {
        set: function(y) {
          a || n.data[p] !== y && (n.data[p] = y);
        },
        get: function() {
          return a ? a() : n.data[p];
        },
        enumerable: !0,
        configurable: !0
      }), n && s instanceof R && t instanceof v && t.localPropertyNames.has(p))
        return;
      n.addNode(t, e, p, m, a);
    }
    o !== null && $(t, e, b, c, Object.assign({}, i, { propertyKeys: [o] }), r);
  }
}
function B(t, e, n, s) {
  const i = Be(e);
  let r, l;
  const a = s ? pe(e) : e;
  let d;
  n instanceof R || (d = new P(null, n, "BSTD"));
  for (let p = 0, o = i.length; p < o; p++) {
    if (r = i[p], l = a[r], l.__singleton__)
      continue;
    const c = V(l);
    c.propertyKeys.length && ($(a, r, d, n, c, t), t && c.propertyKeys.forEach(function(f) {
      try {
        const u = De(n, f);
        t.finalize.push(() => {
          u.removeNode(a);
        });
      } catch (u) {
        console.error("bind_subjects_to_data -> Could not find: " + f + `
 in`, n, u);
      }
    })), l && typeof l == "object" && !(l instanceof Array) && B(t, l, n);
  }
  return a;
}
function Kt(t, e, n, s) {
  if (n in Se) {
    if (s == null)
      return !1;
    const i = O[n], r = i.getConfig.call(t, e, t.blueprint[n]);
    return r !== void 0 && (t.cache[n] = r), i.install.call(t, r);
  }
  return !0;
}
function qt(t, e, n, s) {
  const i = O[e] || { type: "attr" };
  i.key = i.key || e, typeof i.beforeActivate < "u" && i.beforeActivate(t, n, e, s), t.setters[e] = fe(i, t, n, s);
}
function fe(t, e, n, s) {
  return t.type !== "reactive" && e.virtual ? w : typeof t.getSetter < "u" ? t.getSetter(e, t, t, s) : It[t.type](e, t, s);
}
function ge(t, e, n) {
  const s = e + "_" + t.node.nodeType;
  let i = O[s] || O[e];
  switch (i || (i = { type: "prop" }, !(e in t.node) && "setAttribute" in t.node && (i = { type: "attr" }), O[s] = i), i.key = i.key || e, i.type) {
    case "attr":
    case "prop":
    case "reactive":
      fe(i, t)(n, null);
      break;
    case "event":
      t.node[e] = function(r) {
        n.call(t, r, t.data);
      };
      break;
  }
}
W.COMPONENTS = {};
function W(t) {
  const e = this;
  e.scope = t, t.element instanceof v ? (e.container = t.element, e._components = Object.assign({}, t.element.view._components)) : (e.container = new v({
    tag: t.element
  }, null, e), e.container.setInDOM(!0));
}
function H(t) {
  this.type = t;
}
H.prototype.startKeyframe = function(t, e) {
  if (!t)
    throw new Error("Argument Missing: view." + this.type + ".startKeyframe(timeline:string) needs a `timeline`");
  e = e || "+=0";
  const n = {
    [this.type]: {
      // keyframe: true,
      to: {
        data: "timeline:start",
        duration: 1e-3
      },
      timeline: t,
      position: e
    }
  };
  return {
    tag: "comment",
    text: ["", this.type + ":timeline:start", "position: " + e, "timeline: " + t, ""].join(`
`),
    animations: n
  };
};
H.prototype.keyframe = function(t, e, n) {
  if (!e)
    throw new Error("Argument Missing: view." + this.type + ".addKeyframe(timeline:string) needs a `timeline`");
  const s = {
    [this.type]: {
      // keyframe: true,
      to: {
        duration: 1e-3,
        onComplete: t
      },
      timeline: e,
      position: n
    }
  };
  return {
    tag: "comment",
    text: this.type + ":timeline:keyframe",
    animations: s
  };
};
H.prototype.waitKeyframe = function(t, e) {
  if (!t)
    throw new Error("Argument Missing: view." + this.type + ".addKeyframe(timeline:string) needs a `timeline`");
  const n = {
    [this.type]: {
      to: {
        duration: 1e-3
      },
      timeline: t,
      position: e
    }
  };
  return {
    tag: "comment",
    text: this.type + ":timeline:waitKeyframe",
    animations: n
  };
};
W.prototype = {
  _components: {},
  components: function(t) {
    for (const e in t) {
      const n = t[e];
      if (typeof n != "function")
        throw new Error("Component must be type of function: " + e);
      this._components[e] = n;
    }
  },
  /**
   *
   */
  entering: new H("enter"),
  leaving: new H("leave"),
  /**
   *
   * @param {string} key
   * @param blueprint
   * @param {Scope|Object} scopeData
   * @returns {*}
   */
  getComponent: function(t, e, n) {
    let s = n, i = e;
    if (t)
      if (t in this._components) {
        if (e.props && typeof e.props != "object")
          throw new Error("The `props` must be a literal object.");
        if (s = Ne(n), Object.assign(s, e.props || {}), B(null, s, n), i = this._components[t].call(null, s, e, this), e instanceof Array)
          throw new Error("A component's blueprint can NOT be an array. A component must have only one root node.");
      } else Ge.indexOf(t) === -1 && console.warn("Invalid component/tag: " + t);
    return {
      blueprint: Object.assign(e, i),
      scopeData: s
    };
  },
  /**
   *
   * @param {{enter?: AnimationConfig, leave?:AnimationConfig}} animations
   * @returns Blueprint
   */
  addTimeline: function(t) {
    return {
      tag: "comment",
      text: "timeline",
      animations: t
    };
  },
  /**
   *
   * @param {Blueprint|Blueprint[]} blueprint
   * @return {ViewNode|Array<ViewNode>}
   */
  blueprint: function(t) {
    const e = this;
    return this.createNode(t, e.scope, e.container, null);
  },
  /**
   *
   * @param {boolean} [hasAnimation]
   */
  clean: function(t) {
    this.container.clean(t);
  },
  dispatchEvent: function(t) {
    this.container.dispatchEvent(t);
  },
  /**
   *
   * @param {Object} blueprint
   * @param {Object} scopeData
   * @param {ViewNode} parent
   * @param {Node|Element|null} position
   * @return {ViewNode|Array<ViewNode>}
   */
  createNode: function(t, e, n, s) {
    const i = this;
    let r = 0, l = 0;
    if (typeof t == "string") {
      const a = document.createElement("div");
      a.innerHTML = t;
      const d = Array.prototype.slice.call(a.childNodes);
      return d.forEach(function(p) {
        const o = new v({ tag: p }, n, i);
        n.registerChild(o, s), p.parentNode.removeChild(p), ge(o, "animations", {}), o.setInDOM(!0);
      }), d;
    } else {
      if (typeof t == "function")
        return t.call(i);
      if (t instanceof Array) {
        const a = [];
        for (r = 0, l = t.length; r < l; r++)
          a.push(i.createNode(t[r], e, n, null));
        return a;
      } else if (t instanceof Object) {
        const a = i.getComponent(t.tag, t, e);
        let d, p;
        const o = a.blueprint, c = Be(o), f = [], u = new v(o, n, i, a.scopeData);
        for (n.registerChild(u, s), r = 0, l = c.length; r < l; r++)
          p = c[r], d = o[p], Kt(u, a.scopeData, p, d) !== !1 && f.push(p);
        for (r = 0, l = f.length; r < l; r++) {
          if (p = f[r], p === "children") continue;
          d = o[p];
          const h = V(d);
          h.propertyKeys.length ? $(u, p, null, a.scopeData, h, u) : ge(u, p, d);
        }
        return u.virtual || (u.setInDOM(!0), o.children && i.createNode(o.children, a.scopeData, u, null)), u;
      } else
        throw Error("blueprint should NOT be null");
    }
  },
  loadStyle(t) {
    t.indexOf("./") === 0 && (t = t.replace("./", this.scope.uri.path));
  }
};
function Ve(t, e, n) {
  if (t instanceof Array) {
    const s = t.map((i) => Ve(i, e, n));
    return e && (e.activeRoute.children = s), s;
  }
  return {
    ...t,
    fullPath: n + t.path,
    active: !1,
    hidden: t.hidden || !!t.redirectTo || !1,
    viewports: t.viewports || {},
    parent: e ? e.activeRoute : null,
    children: t.children || []
  };
}
function Yt(t) {
  return t.map(function(e) {
    const n = [];
    let s = x.PARAMETER_NAME_REGEX.exec(e);
    for (; s; )
      n.push(s[1]), s = x.PARAMETER_NAME_REGEX.exec(e);
    return n.length ? {
      id: e,
      paramNames: n,
      paramFinderExpression: new RegExp(e.replace(x.PARAMETER_NAME_REGEX, x.PARAMETER_NAME_REPLACEMENT))
    } : null;
  }).filter(Boolean);
}
x.TITLE_SEPARATOR = " • ";
x.PARAMETER_NAME_REGEX = new RegExp(/[:*](\w+)/g);
x.PARAMETER_NAME_REPLACEMENT = "([^/]+)";
x.BASE_URL = "/";
x.currentPath = {
  handlers: [],
  subscribe: function(t) {
    this.handlers.push(t), t(location.pathname);
  },
  update: function() {
    this.handlers.forEach((t) => {
      t(location.pathname);
    });
  }
};
x.mainListener = function(t) {
  x.currentPath.update();
};
window.addEventListener("popstate", x.mainListener);
function x(t) {
  const e = this;
  if (e.__singleton__ = !0, e.config = {
    baseURL: x.BASE_URL
  }, e.scope = t, e.routes = [], e.parentScope = t.parentScope, e.parentRouter = t.parentScope ? t.parentScope.__router__ : null, e.parentScope && (!e.parentScope.router || !e.parentScope.router.activeRoute)) {
    let s = e.parentScope;
    for (; !s.router || !s.router.activeRoute; )
      s = s.parentScope;
    e.parentScope = s, e.parentRouter = s.__router__;
  }
  const n = e.parentScope && e.parentScope.router;
  e.title = n ? this.parentScope.router.activeRoute.title : "", e.path = n ? e.parentScope.router.activeRoute.path : "/", e.fullPath = this.config.baseURL === "/" ? this.path : this.config.baseURL + this.path, e.parentRoute = n ? this.parentScope.router.activeRoute : null, e.oldURL = "", e.resolvedRouteValue = null, e.resolvedDynamicRouteValue = null, e.routesMap = null, e.data = {
    routes: [],
    navs: [],
    activeRoute: null,
    activePath: null,
    activeModule: null,
    viewports: {
      main: null
    },
    parameters: e.parentScope && e.parentScope.router ? e.parentScope.router.parameters : {}
  }, e.onTransitionFn = w, e.onInvokeFn = w, e.onLoadFn = w, e.viewports = {
    main: {
      tag: "div",
      module: "<>router.activeModule"
    }
  }, Object.defineProperty(this, "urlParts", {
    get: function() {
      return e.oldURL.split("/").slice(1);
    },
    enumerable: !0
  }), t.systemId === "@root" && x.currentPath.update();
}
x.prototype = {
  setup: function(t) {
    return this.routes = Ve(t, this.parentScope ? this.parentScope.router : null, this.fullPath === "/" ? "" : this.fullPath), this.routes.forEach((e) => {
      (e.viewports ? Object.keys(e.viewports) : []).forEach((s) => {
        s === "main" || this.viewports[s] || (this.viewports[s] = {
          tag: "div",
          module: "<>router.viewports." + s
        });
      });
    }), this.data.routes = this.routes, this.data.navs = this.routes.filter((e) => !e.hidden), this;
  },
  start: function() {
    this.listener = this.detect.bind(this), window.addEventListener("popstate", this.listener), this.detect();
  },
  /**
   *
   * @param {string} title
   */
  setTitle(t) {
    this.title = t;
  },
  getTitle(t) {
    const e = [];
    if (t.pageTitle)
      return t.pageTitle;
    if (this.parentRouter) {
      const n = this.parentRoute.pageTitle;
      if (n)
        return e.push(n), t.title && e.push(t.title), e.join(x.TITLE_SEPARATOR);
      e.push(this.parentRouter.title);
    }
    return this.title && e.push(this.title), t.title && e.push(t.title), e.join(x.TITLE_SEPARATOR);
  },
  /**
   *
   * @param {string} path
   * @param {boolean} replace
   */
  navigateToPath: function(t, e) {
    if (typeof t != "string")
      throw new Error("Invalid argument(s) for `navigateToPath`: path must be a string. " + typeof t + " is given");
    if (t.indexOf("/") !== 0)
      throw new Error("Invalid argument(s) for `navigateToPath`: path must be starting with a `/`\nPlease use `/" + t + "` instead of `" + t + "`");
    t.indexOf(this.config.baseURL) !== 0 && (t = this.config.baseURL + t), window.location.pathname !== t && (e ? history.replaceState({}, "", t) : history.pushState({}, "", t), dispatchEvent(new PopStateEvent("popstate", { state: {} })));
  },
  navigate: function(t, e) {
    if (typeof t != "string")
      throw new Error("Invalid argument(s) for `navigate`: path must be a string. " + typeof t + " is given");
    if (t.indexOf("/") !== 0)
      throw new Error("Invalid argument(s) for `navigate`: path must be starting with a `/`\nPlease use `/" + t + "` instead of `" + t + "`");
    t.indexOf(this.path) !== 0 && (t = this.path + t), this.navigateToPath(t, e);
  },
  navigateToRoute: function(t, e) {
    let n = t.path;
    t.parent && (n = t.parent.path + t.path), this.navigate(n, e);
  },
  notFound: function() {
  },
  normalizeHash: function(t) {
    if (t.indexOf("#!/") === 0)
      throw new Error("Please use `#/` instead of `#!/` for you hash");
    let e = t;
    return t.indexOf("#/") !== 0 && (t.indexOf("/") !== 0 ? e = "/" + t : t.indexOf("#") === 0 && (e = t.split("#").join("#/"))), e.replace(this.fullPath, "/").replace("//", "/") || "/";
  },
  onTransition: function(t) {
    return this.onTransitionFn = t, this;
  },
  onInvoke: function(t) {
    return this.onInvokeFn = t, this;
  },
  onLoad: function(t) {
    return this.onLoadFn = t, this;
  },
  findMatchRoute: function(t, e, n) {
    const s = this;
    let i = 0;
    const r = s.normalizeHash(e), l = t.map((o) => o.path), a = Yt(l), d = t.filter((o) => a.indexOf(o) === -1 && r.indexOf(o.path) === 0), p = d.length ? d.reduce((o, c) => o.path.length > c.path.length ? o : c) : !1;
    if (p && !(r !== "/" && p.path === "/")) {
      const o = r.slice(0, p.path.length);
      return s.resolvedRouteValue === o ? Object.assign(s.data.parameters, s.createClearParameters()) : (s.resolvedDynamicRouteValue = null, s.resolvedRouteValue = o, p.redirectTo ? this.navigate(p.redirectTo, !0) : (i++, s.callRoute(p, r, s.createClearParameters(), n)));
    }
    for (let o = 0, c = a.length; o < c; o++) {
      const f = a[o], u = f.paramFinderExpression.exec(r);
      if (!u)
        continue;
      i++;
      const h = s.createParamValueMap(f.paramNames, u.slice(1));
      if (s.resolvedDynamicRouteValue === e)
        return Object.assign(s.data.parameters, h);
      s.resolvedDynamicRouteValue = e, s.resolvedRouteValue = null;
      const m = l.indexOf(f.id), b = f.id.split("/").filter((y) => y.indexOf(":") !== 0).join("/"), _ = e.replace(b, "").split("/");
      return s.callRoute(t[m], _.join("/"), h, n);
    }
    i === 0 && console.warn("No associated route has been found", e);
  },
  callRoute: function(t, e, n, s) {
    const i = this.data.activeRoute, r = this.data.activePath;
    return this.data.activeRoute = t, this.data.activePath = t.path, this.onTransitionFn.call(this, r, t.path, i, t), t.redirectTo || (i && t.path.indexOf(r) !== 0 && (i.active = !1, typeof i.onLeave == "function" && i.onLeave.call(null, r, t.path, i, t)), t.active = !0), typeof t.onEnter == "function" && t.onEnter.call(null, r, t.path, i, t), document.title = this.getTitle(t), typeof t.handle == "function" ? t.handle.call(this, n, s) : (this.populateViewports(t), j(Lt(), (l) => {
      Object.assign(this.data.parameters, n), l();
    }), !1);
  },
  populateViewports: function(t) {
    let e = !1;
    const n = this.data.viewports;
    for (const s in n) {
      let i = t.viewports[s];
      i !== void 0 && (typeof i == "string" && (i = {
        path: i,
        onInvoke: this.onInvokeFn.bind(this, i, s),
        onLoad: this.onLoadFn.bind(this, i, s)
      }, e = !0), s === "main" && (this.data.activeModule = i), this.data.viewports[s] = i);
    }
    !e && this.parentRouter && this.parentRouter.populateViewports(t);
  },
  createClearParameters: function() {
    const t = {};
    return Object.keys(this.data.parameters).forEach((n) => t[n] = void 0), t;
  },
  createParamValueMap: function(t, e) {
    const n = {};
    return t.forEach(function(s, i) {
      n[s] = e[i];
    }), n;
  },
  detect: function() {
    const t = window.location.pathname, e = t ? t.substring(-1) !== "/" ? t + "/" : t : "/", n = this.config.baseURL === "/" ? this.path : this.config.baseURL + this.path;
    e.indexOf(n) === 0 && e !== this.oldURL && (this.oldURL = e, this.findMatchRoute(this.routes, e, {}));
  },
  getURLParts: function() {
    return this.oldURL.split("/").slice(1);
  },
  destroy: function() {
    this.parentRoute && (this.parentRoute.children = []), window.removeEventListener("popstate", this.listener);
  }
};
class Jt {
  /**
   * @param {object} module
   * @param {Scope} scope
   */
  constructor(e, n) {
    this.id = e.id, this.source = typeof e.source == "function" ? e.source : null, this.path = e.path || null, this.scope = n;
  }
  init() {
    Reflect.deleteProperty(this, "source"), this.scope.trigger("module.init");
  }
  start() {
    this.scope.trigger("module.start");
  }
  destroy() {
    this.scope.trigger("module.destroy");
  }
}
function w() {
}
const k = Object.defineProperty, Xt = Reflect.deleteProperty, Be = Object.keys, zt = Array.prototype.concat.bind([]), Oe = Array.prototype.slice;
function pe(t) {
  let e = t instanceof Array ? [] : {};
  e.__proto__ = t.__proto__;
  for (let n in t)
    if (t.hasOwnProperty(n)) {
      const s = t[n];
      s instanceof Promise || s instanceof x ? e[n] = s : typeof s == "object" && s !== null ? n === "animations" && s && typeof s == "object" ? e[n] = s : e[n] = pe(s) : e[n] = s;
    }
  return e;
}
const $t = document.createComment("");
function Wt(t) {
  const e = $t.cloneNode();
  return e.textContent = t, e;
}
function Qt(t, e) {
  return t === "svg" || e && e.blueprint.tag === "svg" ? document.createElementNS("http://www.w3.org/2000/svg", t) : t === "comment" ? document.createComment("ViewNode") : document.createElement(t);
}
function Ae(t) {
  const e = new R(t), n = new Jt(t, e);
  return console.log("Module created:", n), n;
}
function Ee(t) {
  return new Promise(async function(e, n) {
    try {
      const s = t.source || (await import(
        /* @vite-ignore */
        "/" + t.path
      )).default;
      let i = s;
      typeof s != "function" && (i = function() {
        console.error("Can't find default function in %c" + t.path, "font-weight: bold;");
      });
      const r = i.call(null, t.scope) || null, l = () => (t.init(), e(t));
      r ? r.then(l) : l();
    } catch (s) {
      console.error(s.message + ": " + t.path), console.trace(s), n();
    }
  });
}
const we = {};
function Fe(t) {
  if (!t)
    throw new Error("Module meta data or constructor is missing");
  return new Promise(function(e, n) {
    if (t.hasOwnProperty("constructor") && typeof t.constructor == "function")
      return t.path = t.id = "internal/" + (/* @__PURE__ */ new Date()).valueOf() + "-" + Math.round(performance.now()), t.source = t.constructor, Ee(Ae(t)).then(e);
    t.path = t.path.indexOf("/") === 0 ? t.path.substring(1) : t.path, t.id || (t.id = t.parentScope ? t.parentScope.systemId + "/" + t.path : t.path);
    let s = t.path, i = we[s];
    i || (we[s] = i = fetch(s).then((r) => r.ok ? r : (console.error(r.statusText, s), n(r.statusText))).catch(n)), i.then((r) => r.clone().text()).then((r) => Ee(Ae(t))).then(e).catch(n);
  });
}
Array.prototype.unique = function() {
  const t = this.concat();
  for (let e = 0, n = t.length; e < n; ++e)
    for (let s = e + 1, i = t.length; s < i; ++s)
      t[e] === t[s] && t.splice(s--, 1);
  return t;
};
const se = {
  moduleContents: {},
  // addOnProviders: [],
  rootElement: null,
  bootModule: null,
  /**
   *
   * @param {Object} out
   * @returns {*|{}}
   */
  extend: function(t) {
    let e = t || {}, n;
    for (let s = 1; s < arguments.length; s++)
      if (n = arguments[s], !!n)
        for (let i in n)
          n.hasOwnProperty(i) && (n[i] instanceof Array ? e[i] = this.extend(e[i] || [], n[i]) : typeof n[i] == "object" && n[i] !== null ? e[i] = this.extend(e[i] || {}, n[i]) : e[i] = n[i]);
    return e;
  }
};
function tn(t) {
  if (se.rootElement = t.element, t.id = "@root", !se.rootElement)
    throw new Error("element property is mandatory");
  return new Promise(function(e, n) {
    Fe(t).then(function(s) {
      se.bootModule = s, e(s);
    }).catch(function(s) {
      console.error("Something went wrong", s), n();
    });
  });
}
export {
  se as Galaxy,
  Jt as Module,
  x as Router,
  R as Scope,
  W as View,
  tn as boot,
  ye as setupTimeline
};
//# sourceMappingURL=galaxy.js.map
