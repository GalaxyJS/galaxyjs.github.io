/* eslint-disable */
(function () {
  /*

   Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt

   Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt

   Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt

   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */
  'use strict';
  var mb = 'undefined' != typeof window && window === this ?
    this :
    'undefined' != typeof global && null != global ?
      global :
      this;
  (function () {
    function k () {
      var a = this;
      this.u = {};
      this.g = document.documentElement;
      var b = new va;
      b.rules = [];
      this.h = x.set(this.g, new x(b));
      this.i = !1;
      this.a = this.b = null;
      nb(function () {a.c();});
    }

    function J () {
      this.customStyles = [];
      this.enqueued = !1;
    }

    function ob () {}

    function ha (a) {
      this.cache = {};
      this.f = void 0 === a ? 100 : a;
    }

    function n () {}

    function x (a, b, c, d, e) {
      this.I = a || null;
      this.b = b || null;
      this.Aa = c || [];
      this.S = null;
      this.aa = e || '';
      this.a = this.G = this.K = null;
    }

    function p () {}

    function va () {
      this.end = this.start = 0;
      this.rules = this.parent =
        this.previous = null;
      this.cssText = this.parsedCssText = '';
      this.atRule = !1;
      this.type = 0;
      this.parsedSelector = this.selector = this.keyframesName = '';
    }

    function Sc (a) {
      function b (b, c) {
        Object.defineProperty(b, 'innerHTML', {
          enumerable: c.enumerable, configurable: !0, get: c.get, set: function (b) {
            var d = this, e = void 0;
            m(this) && (e = [], O(this, function (a) {a !== d && e.push(a);}));
            c.set.call(this, b);
            if (e)for (var f = 0; f < e.length; f++) {
              var g = e[ f ];
              1 === g.__CE_state && a.disconnectedCallback(g);
            }
            this.ownerDocument.__CE_hasRegistry ? a.c(this) : a.l(this);
            return b;
          }
        });
      }

      function c (b, c) {
        z(b, 'insertAdjacentElement', function (b, d) {
          var e = m(d);
          b = c.call(this, b, d);
          e && a.a(d);
          m(b) && a.b(d);
          return b;
        });
      }

      pb ?
        z(Element.prototype, 'attachShadow', function (a) {return this.__CE_shadowRoot = a = pb.call(this, a);}) :
        console.warn('Custom Elements: `Element#attachShadow` was not patched.');
      if (wa && wa.get) b(Element.prototype, wa); else if (xa && xa.get) b(HTMLElement.prototype, xa); else {
        var d = ya.call(document, 'div');
        a.v(function (a) {
          b(a, {
            enumerable: !0, configurable: !0, get: function () {
              return qb.call(this,
                !0).innerHTML;
            }, set: function (a) {
              var b = 'template' === this.localName ? this.content : this;
              for (d.innerHTML = a; 0 < b.childNodes.length;)za.call(b, b.childNodes[ 0 ]);
              for (; 0 < d.childNodes.length;)ja.call(b, d.childNodes[ 0 ]);
            }
          });
        });
      }
      z(Element.prototype, 'setAttribute', function (b, c) {
        if (1 !== this.__CE_state)return rb.call(this, b, c);
        var d = Aa.call(this, b);
        rb.call(this, b, c);
        c = Aa.call(this, b);
        d !== c && a.attributeChangedCallback(this, b, d, c, null);
      });
      z(Element.prototype, 'setAttributeNS', function (b, c, d) {
        if (1 !== this.__CE_state)return sb.call(this,
          b, c, d);
        var e = ka.call(this, b, c);
        sb.call(this, b, c, d);
        d = ka.call(this, b, c);
        e !== d && a.attributeChangedCallback(this, c, e, d, b);
      });
      z(Element.prototype, 'removeAttribute', function (b) {
        if (1 !== this.__CE_state)return tb.call(this, b);
        var c = Aa.call(this, b);
        tb.call(this, b);
        null !== c && a.attributeChangedCallback(this, b, c, null, null);
      });
      z(Element.prototype, 'removeAttributeNS', function (b, c) {
        if (1 !== this.__CE_state)return ub.call(this, b, c);
        var d = ka.call(this, b, c);
        ub.call(this, b, c);
        var e = ka.call(this, b, c);
        d !== e && a.attributeChangedCallback(this,
          c, d, e, b);
      });
      vb ?
        c(HTMLElement.prototype, vb) :
        wb ?
          c(Element.prototype, wb) :
          console.warn('Custom Elements: `Element#insertAdjacentElement` was not patched.');
      xb(a, Element.prototype, { Ra: Tc, append: Uc });
      Vc(a, { ob: Wc, nb: Xc, zb: Yc, remove: Zc });
    }

    function Vc (a, b) {
      var c = Element.prototype;
      c.before = function (c) {
        for (var d = [], f = 0; f < arguments.length; ++f)d[ f - 0 ] = arguments[ f ];
        f = d.filter(function (a) {return a instanceof Node && m(a);});
        b.ob.apply(this, d);
        for (var g = 0; g < f.length; g++)a.a(f[ g ]);
        if (m(this))for (f = 0; f < d.length; f++)g = d[ f ],
        g instanceof Element && a.b(g);
      };
      c.after = function (c) {
        for (var d = [], f = 0; f < arguments.length; ++f)d[ f - 0 ] = arguments[ f ];
        f = d.filter(function (a) {return a instanceof Node && m(a);});
        b.nb.apply(this, d);
        for (var g = 0; g < f.length; g++)a.a(f[ g ]);
        if (m(this))for (f = 0; f < d.length; f++)g = d[ f ], g instanceof Element && a.b(g);
      };
      c.replaceWith = function (c) {
        for (var d = [], f = 0; f < arguments.length; ++f)d[ f - 0 ] = arguments[ f ];
        var f = d.filter(function (a) {return a instanceof Node && m(a);}), g = m(this);
        b.zb.apply(this, d);
        for (var h = 0; h < f.length; h++)a.a(f[ h ]);
        if (g)for (a.a(this), f = 0; f < d.length; f++)g = d[ f ], g instanceof Element && a.b(g);
      };
      c.remove = function () {
        var c = m(this);
        b.remove.call(this);
        c && a.a(this);
      };
    }

    function $c (a) {
      function b (b, d) {
        Object.defineProperty(b, 'textContent', {
          enumerable: d.enumerable,
          configurable: !0,
          get: d.get,
          set: function (b) {
            if (this.nodeType === Node.TEXT_NODE) d.set.call(this, b); else {
              var c = void 0;
              if (this.firstChild) {
                var e = this.childNodes, h = e.length;
                if (0 < h && m(this))for (var c = Array(h), l = 0; l < h; l++)c[ l ] = e[ l ];
              }
              d.set.call(this, b);
              if (c)for (b = 0; b < c.length; b++)a.a(c[ b ]);
            }
          }
        });
      }

      z(Node.prototype, 'insertBefore', function (b, d) {
        if (b instanceof DocumentFragment) {
          var c = Array.prototype.slice.apply(b.childNodes);
          b = yb.call(this, b, d);
          if (m(this))for (d = 0; d < c.length; d++)a.b(c[ d ]);
          return b;
        }
        c = m(b);
        d = yb.call(this, b, d);
        c && a.a(b);
        m(this) && a.b(b);
        return d;
      });
      z(Node.prototype, 'appendChild', function (b) {
        if (b instanceof DocumentFragment) {
          var c = Array.prototype.slice.apply(b.childNodes);
          b = ja.call(this, b);
          if (m(this))for (var e = 0; e < c.length; e++)a.b(c[ e ]);
          return b;
        }
        c = m(b);
        e = ja.call(this, b);
        c && a.a(b);
        m(this) &&
        a.b(b);
        return e;
      });
      z(Node.prototype, 'cloneNode', function (b) {
        b = qb.call(this, b);
        this.ownerDocument.__CE_hasRegistry ? a.c(b) : a.l(b);
        return b;
      });
      z(Node.prototype, 'removeChild', function (b) {
        var c = m(b), e = za.call(this, b);
        c && a.a(b);
        return e;
      });
      z(Node.prototype, 'replaceChild', function (b, d) {
        if (b instanceof DocumentFragment) {
          var c = Array.prototype.slice.apply(b.childNodes);
          b = zb.call(this, b, d);
          if (m(this))for (a.a(d), d = 0; d < c.length; d++)a.b(c[ d ]);
          return b;
        }
        var c = m(b), f = zb.call(this, b, d), g = m(this);
        g && a.a(d);
        c && a.a(b);
        g &&
        a.b(b);
        return f;
      });
      Ba && Ba.get ?
        b(Node.prototype, Ba) :
        a.v(function (a) {
          b(a, {
            enumerable: !0,
            configurable: !0,
            get: function () {
              for (var a = [], b = 0; b < this.childNodes.length; b++)a.push(this.childNodes[ b ].textContent);
              return a.join('');
            },
            set: function (a) {
              for (; this.firstChild;)za.call(this, this.firstChild);
              ja.call(this, document.createTextNode(a));
            }
          });
        });
    }

    function ad (a) {
      z(Document.prototype, 'createElement', function (b) {
        if (this.__CE_hasRegistry) {
          var c = a.f(b);
          if (c)return new c.constructor;
        }
        b = ya.call(this, b);
        a.g(b);
        return b;
      });
      z(Document.prototype, 'importNode', function (b, c) {
        b = bd.call(this, b, c);
        this.__CE_hasRegistry ? a.c(b) : a.l(b);
        return b;
      });
      z(Document.prototype, 'createElementNS', function (b, c) {
        if (this.__CE_hasRegistry && (null === b || 'http://www.w3.org/1999/xhtml' === b)) {
          var d = a.f(c);
          if (d)return new d.constructor;
        }
        b = cd.call(this, b, c);
        a.g(b);
        return b;
      });
      xb(a, Document.prototype, { Ra: dd, append: ed });
    }

    function xb (a, b, c) {
      b.prepend = function (b) {
        for (var d = [], f = 0; f < arguments.length; ++f)d[ f - 0 ] = arguments[ f ];
        f = d.filter(function (a) {
          return a instanceof
            Node && m(a);
        });
        c.Ra.apply(this, d);
        for (var g = 0; g < f.length; g++)a.a(f[ g ]);
        if (m(this))for (f = 0; f < d.length; f++)g = d[ f ], g instanceof Element && a.b(g);
      };
      b.append = function (b) {
        for (var d = [], f = 0; f < arguments.length; ++f)d[ f - 0 ] = arguments[ f ];
        f = d.filter(function (a) {return a instanceof Node && m(a);});
        c.append.apply(this, d);
        for (var g = 0; g < f.length; g++)a.a(f[ g ]);
        if (m(this))for (f = 0; f < d.length; f++)g = d[ f ], g instanceof Element && a.b(g);
      };
    }

    function fd (a) {
      window.HTMLElement = function () {
        function b () {
          var b = this.constructor, d = a.L(b);
          if (!d)throw Error('The custom element being constructed was not registered with `customElements`.');
          var e = d.constructionStack;
          if (!e.length)return e = ya.call(document, d.localName), Object.setPrototypeOf(e, b.prototype), e.__CE_state = 1, e.__CE_definition = d, a.g(e), e;
          var d = e.length - 1, f = e[ d ];
          if (f ===
            Ab)throw Error('The HTMLElement constructor was either called reentrantly for this constructor or called multiple times.');
          e[ d ] = Ab;
          Object.setPrototypeOf(f, b.prototype);
          a.g(f);
          return f;
        }

        b.prototype = gd.prototype;
        return b;
      }();
    }

    function r (a) {
      this.f = !1;
      this.a = a;
      this.h = new Map;
      this.g = function (a) {return a();};
      this.b = !1;
      this.c =
        [];
      this.l = new Ca(a, document);
    }

    function Bb () {
      var a = this;
      this.b = this.a = void 0;
      this.c = new Promise(function (b) {
        a.b = b;
        a.a && b(a.a);
      });
    }

    function Ca (a, b) {
      this.b = a;
      this.a = b;
      this.N = void 0;
      this.b.c(this.a);
      'loading' === this.a.readyState &&
      (this.N = new MutationObserver(this.f.bind(this)), this.N.observe(this.a, { childList: !0, subtree: !0 }));
    }

    function A () {
      this.u = new Map;
      this.s = new Map;
      this.i = [];
      this.h = !1;
    }

    function t (a, b) {
      if (a !== Cb)throw new TypeError('Illegal constructor');
      a = document.createDocumentFragment();
      a.__proto__ =
        t.prototype;
      a.i(b);
      return a;
    }

    function u (a) {
      this.root = a;
      this.fa = 'slot';
    }

    function T (a) {
      if (!a.__shady || void 0 === a.__shady.firstChild) {
        a.__shady = a.__shady || {};
        a.__shady.firstChild = Da(a);
        a.__shady.lastChild = Ea(a);
        Db(a);
        for (var b = a.__shady.childNodes = aa(a), c = 0, d; c < b.length && (d = b[ c ]); c++)d.__shady = d.__shady ||
          {}, d.__shady.parentNode = a, d.__shady.nextSibling = b[ c + 1 ] || null, d.__shady.previousSibling = b[ c -
          1 ] || null, Eb(d);
      }
    }

    function hd (a) {
      var b = a && a.N;
      b && (b.ea.delete(a.gb), b.ea.size || (a.lb.__shady.Z = null));
    }

    function id (a,
                 b) {
      a.__shady = a.__shady || {};
      a.__shady.Z || (a.__shady.Z = new la);
      a.__shady.Z.ea.add(b);
      var c = a.__shady.Z;
      return { gb: b, N: c, lb: a, takeRecords: function () {return c.takeRecords();} };
    }

    function la () {
      this.a = !1;
      this.addedNodes = [];
      this.removedNodes = [];
      this.ea = new Set;
    }

    function y (a) {return 'ShadyRoot' === a.cb;}

    function U (a) {
      a = a.getRootNode();
      if (y(a))return a;
    }

    function Fa (a, b) {
      if (a && b)for (var c = Object.getOwnPropertyNames(b), d = 0, e; d < c.length && (e = c[ d ]); d++) {
        var f = Object.getOwnPropertyDescriptor(b, e);
        f && Object.defineProperty(a,
          e, f);
      }
    }

    function Fb (a, b) {
      for (var c = [], d = 1; d < arguments.length; ++d)c[ d - 1 ] = arguments[ d ];
      for (d = 0; d < c.length; d++)Fa(a, c[ d ]);
      return a;
    }

    function jd (a, b) {for (var c in b)a[ c ] = b[ c ];}

    function Gb (a) {
      Ga.push(a);
      Ha.textContent = Hb++;
    }

    function Ib (a) {
      Ia || (Ia = !0, Gb(Ja));
      ba.push(a);
    }

    function Ja () {
      Ia = !1;
      for (var a = !!ba.length; ba.length;)ba.shift()();
      return a;
    }

    function kd (a, b) {
      var c = b.getRootNode();
      return a.map(function (a) {
        var b = c === a.target.getRootNode();
        if (b && a.addedNodes) {
          if (b = Array.from(a.addedNodes).filter(function (a) {
              return c ===
                a.getRootNode();
            }), b.length)return a = Object.create(a), Object.defineProperty(a, 'addedNodes', {
            value: b,
            configurable: !0
          }), a;
        } else if (b)return a;
      }).filter(function (a) {return a;});
    }

    function Jb (a) {
      switch (a) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case '\u00a0':
          return '&nbsp;';
      }
    }

    function Kb (a) {
      for (var b = {}, c = 0; c < a.length; c++)b[ a[ c ] ] = !0;
      return b;
    }

    function Ka (a, b) {
      'template' === a.localName && (a = a.content);
      for (var c = '', d = b ? b(a) : a.childNodes, e = 0, f = d.length, g; e < f && (g = d[ e ]); e++) {
        var h;
        a:{
          var l;
          h = g;
          l = a;
          var ia = b;
          switch (h.nodeType) {
            case Node.ELEMENT_NODE:
              for (var k = h.localName, K = '<' + k, m = h.attributes, n = 0; l = m[ n ]; n++)K += ' ' + l.name + '="' +
                l.value.replace(ld, Jb) + '"';
              K += '>';
              h = md[ k ] ? K : K + Ka(h, ia) + '</' + k + '>';
              break a;
            case Node.TEXT_NODE:
              h = h.data;
              h = l && nd[ l.localName ] ? h : h.replace(od, Jb);
              break a;
            case Node.COMMENT_NODE:
              h = '\x3c!--' + h.data + '--\x3e';
              break a;
            default:
              throw window.console.error(h), Error('not implemented');
          }
        }
        c += h;
      }
      return c;
    }

    function P (a) {
      D.currentNode = a;
      return D.parentNode();
    }

    function Da (a) {
      D.currentNode =
        a;
      return D.firstChild();
    }

    function Ea (a) {
      D.currentNode = a;
      return D.lastChild();
    }

    function Lb (a) {
      D.currentNode = a;
      return D.previousSibling();
    }

    function Mb (a) {
      D.currentNode = a;
      return D.nextSibling();
    }

    function aa (a) {
      var b = [];
      D.currentNode = a;
      for (a = D.firstChild(); a;)b.push(a), a = D.nextSibling();
      return b;
    }

    function Nb (a) {
      E.currentNode = a;
      return E.parentNode();
    }

    function Ob (a) {
      E.currentNode = a;
      return E.firstChild();
    }

    function Pb (a) {
      E.currentNode = a;
      return E.lastChild();
    }

    function Qb (a) {
      E.currentNode = a;
      return E.previousSibling();
    }

    function Rb (a) {
      E.currentNode = a;
      return E.nextSibling();
    }

    function Sb (a) {
      var b = [];
      E.currentNode = a;
      for (a = E.firstChild(); a;)b.push(a), a = E.nextSibling();
      return b;
    }

    function Tb (a) {return Ka(a, function (a) {return aa(a);});}

    function Ub (a) {
      if (a.nodeType !== Node.ELEMENT_NODE)return a.nodeValue;
      a = document.createTreeWalker(a, NodeFilter.SHOW_TEXT, null, !1);
      for (var b = '', c; c = a.nextNode();)b += c.nodeValue;
      return b;
    }

    function L (a, b, c) {
      for (var d in b) {
        var e = Object.getOwnPropertyDescriptor(a, d);
        e && e.configurable || !e && c ? Object.defineProperty(a,
          d, b[ d ]) : c && console.warn('Could not define', d, 'on', a);
      }
    }

    function Q (a) {
      L(a, Vb);
      L(a, La);
      L(a, Ma);
    }

    function Wb (a, b, c) {
      Eb(a);
      c = c || null;
      a.__shady = a.__shady || {};
      b.__shady = b.__shady || {};
      c && (c.__shady = c.__shady || {});
      a.__shady.previousSibling = c ? c.__shady.previousSibling : b.lastChild;
      var d = a.__shady.previousSibling;
      d && d.__shady && (d.__shady.nextSibling = a);
      (d = a.__shady.nextSibling = c) && d.__shady && (d.__shady.previousSibling = a);
      a.__shady.parentNode = b;
      c ? c === b.__shady.firstChild && (b.__shady.firstChild = a) : (b.__shady.lastChild =
        a, b.__shady.firstChild || (b.__shady.firstChild = a));
      b.__shady.childNodes = null;
    }

    function Xb (a) {
      var b = a.__shady && a.__shady.parentNode, c, d = U(a);
      if (b || d) {
        c = Yb(a);
        if (b) {
          a.__shady = a.__shady || {};
          b.__shady = b.__shady || {};
          a === b.__shady.firstChild && (b.__shady.firstChild = a.__shady.nextSibling);
          a === b.__shady.lastChild && (b.__shady.lastChild = a.__shady.previousSibling);
          var e = a.__shady.previousSibling, f = a.__shady.nextSibling;
          e && (e.__shady = e.__shady || {}, e.__shady.nextSibling = f);
          f && (f.__shady = f.__shady || {}, f.__shady.previousSibling =
            e);
          a.__shady.parentNode = a.__shady.previousSibling = a.__shady.nextSibling = void 0;
          void 0 !== b.__shady.childNodes && (b.__shady.childNodes = null);
        }
        if (e = d) {
          for (var g, e = d.sa(), f = 0; f < e.length; f++) {
            var h = e[ f ], l;
            a:{
              for (l = h; l;) {
                if (l == a) {
                  l = !0;
                  break a;
                }
                l = l.parentNode;
              }
              l = void 0;
            }
            if (l)for (h = h.assignedNodes({ flatten: !0 }), l = 0; l < h.length; l++) {
              g = !0;
              var ia = h[ l ], k = P(ia);
              k && V.call(k, ia);
            }
          }
          e = g;
        }
        b = b && d && b.localName === d.D.fa;
        if (e || b) d.ca = !1, ma(d);
      }
      Na(a);
      return c;
    }

    function Oa (a, b, c) {
      if (a = a.__shady && a.__shady.Z) b && a.addedNodes.push(b),
      c && a.removedNodes.push(c), a.Bb();
    }

    function Pa (a) {
      if (a && a.nodeType) {
        a.__shady = a.__shady || {};
        var b = a.__shady.Ba;
        void 0 === b &&
        (y(a) ? b = a : b = (b = a.parentNode) ? Pa(b) : a, document.documentElement.contains(a) && (a.__shady.Ba = b));
        return b;
      }
    }

    function Zb (a, b, c) {
      var d, e = c.D.fa;
      if (a.nodeType !== Node.DOCUMENT_FRAGMENT_NODE || a.__noInsertionPoint) a.localName === e &&
      (T(b), T(a), d = !0); else for (var e = a.querySelectorAll(e), f = 0, g, h; f < e.length &&
      (g = e[ f ]); f++)h = g.parentNode, h === a && (h = b), h = Zb(g, h, c), d = d || h;
      return d;
    }

    function $b (a) {
      return (a =
          a && a.__shady && a.__shady.root) && a.ya();
    }

    function Na (a) {
      if (a.__shady && void 0 !== a.__shady.Ba)for (var b = a.childNodes, c = 0, d = b.length, e; c < d &&
      (e = b[ c ]); c++)Na(e);
      a.__shady = a.__shady || {};
      a.__shady.Ba = void 0;
    }

    function Yb (a) {
      a = a.parentNode;
      if ($b(a))return ma(a.__shady.root), !0;
    }

    function ma (a) {
      a.ra = !0;
      a.update();
    }

    function ac (a, b) {'slot' === b ? Yb(a) : 'slot' === a.localName && 'name' === b && (a = U(a)) && a.update();}

    function bc (a, b, c) {
      var d = [];
      cc(a.childNodes, b, c, d);
      return d;
    }

    function cc (a, b, c, d) {
      for (var e = 0, f = a.length, g; e < f && (g =
        a[ e ]); e++) {
        var h;
        if (h = g.nodeType === Node.ELEMENT_NODE) {
          h = g;
          var l = b, k = c, q = d, K = l(h);
          K && q.push(h);
          k && k(K) ? h = K : (cc(h.childNodes, l, k, q), h = void 0);
        }
        if (h)break;
      }
    }

    function dc (a) {
      a = a.getRootNode();
      y(a) && a.Sa();
    }

    function ec (a, b, c) {
      if (c) {
        var d = c.__shady && c.__shady.parentNode;
        if (void 0 !== d && d !== a || void 0 === d && P(c) !==
          a)throw Error('Failed to execute \'insertBefore\' on \'Node\': The node before which the new node is to be inserted is not a child of this node.');
      }
      if (c === b)return b;
      b.nodeType !== Node.DOCUMENT_FRAGMENT_NODE &&
      ((d = b.__shady && b.__shady.parentNode) ?
        (Oa(d, null, b), Xb(b)) :
        (b.parentNode && V.call(b.parentNode, b), Na(b)));
      var d = c, e = U(a), f;
      e && (b.__noInsertionPoint && !e.ra && (e.ca = !0), f = Zb(b, a, e)) && (e.ca = !1);
      if (a.__shady && void 0 !== a.__shady.firstChild)if (Db(a), a.__shady = a.__shady || {}, void 0 !==
        a.__shady.firstChild && (a.__shady.childNodes = null), b.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        for (var g = b.childNodes, h = 0; h < g.length; h++)Wb(g[ h ], a, d);
        b.__shady = b.__shady || {};
        g = void 0 !== b.__shady.firstChild ? null : void 0;
        b.__shady.firstChild =
          b.__shady.lastChild = g;
        b.__shady.childNodes = g;
      } else Wb(b, a, d);
      var g = f, h = e && e.D.fa || '',
        l = b.nodeType === Node.DOCUMENT_FRAGMENT_NODE && !b.__noInsertionPoint && h && b.querySelector(h);
      f = l && l.parentNode.nodeType !== Node.DOCUMENT_FRAGMENT_NODE;
      ((l = l || b.localName === h) || a.localName === h || g) && e && ma(e);
      (e = $b(a)) && ma(a.__shady && a.__shady.root);
      if (!(e || l && !f || a.__shady.root || d && y(d.parentNode) && d.parentNode.O)) {
        if (c && (d = U(c))) {
          var k;
          if (c.localName === d.D.fa)a:{
            d = c.assignedNodes({ flatten: !0 });
            e = Pa(c);
            f = 0;
            for (g = d.length; f <
            g && (k = d[ f ]); f++)if (e.ga(c, k))break a;
            k = void 0;
          } else k = c;
          c = k;
        }
        k = y(a) ? a.host : a;
        c ? Qa.call(k, b, c) : fc.call(k, b);
      }
      Oa(a, b);
      return b;
    }

    function gc (a, b) {
      if (a.ownerDocument !== document)return Ra.call(document, a, b);
      var c = Ra.call(document, a, !1);
      if (b) {
        a = a.childNodes;
        b = 0;
        for (var d; b < a.length; b++)d = gc(a[ b ], !0), c.appendChild(d);
      }
      return c;
    }

    function Sa (a, b) {
      var c = [], d = a;
      for (a = a === window ? window : a.getRootNode(); d;)c.push(d), d = d.assignedSlot ?
        d.assignedSlot :
        d.nodeType === Node.DOCUMENT_FRAGMENT_NODE && d.host && (b || d !== a) ?
          d.host :
          d.parentNode;
      c[ c.length - 1 ] === document && c.push(window);
      return c;
    }

    function hc (a, b) {
      if (!y)return a;
      a = Sa(a, !0);
      for (var c = 0, d, e, f, g; c < b.length; c++)if (d = b[ c ], f = d === window ? window : d.getRootNode(), f !==
        e && (g = a.indexOf(f), e = f), !y(f) || -1 < g)return d;
    }

    function Ta (a) {
      function b (b, d) {
        b = new a(b, d);
        b.oa = d && !!d.composed;
        return b;
      }

      jd(b, a);
      b.prototype = a.prototype;
      return b;
    }

    function ic (a, b, c) {
      if (c = b.C && b.C[ a.type ] && b.C[ a.type ][ c ])for (var d = 0, e; (e = c[ d ]) && (e.call(b, a), !a.ab); d++);
    }

    function pd (a) {
      var b = a.composedPath(), c;
      Object.defineProperty(a,
        'currentTarget', { get: function () {return c;}, configurable: !0 });
      for (var d = b.length - 1; 0 <= d; d--)if (c = b[ d ], ic(a, c, 'capture'), a.pa)return;
      Object.defineProperty(a, 'eventPhase', { value: Event.AT_TARGET });
      for (var e, d = 0; d < b.length; d++)if (c = b[ d ], !d ||
        c.shadowRoot && c.shadowRoot === e)if (ic(a, c, 'bubble'), c !== window && (e = c.getRootNode()), a.pa)break;
    }

    function qd () {
      for (var a in Ua)window.addEventListener(a, function (a) {
        a.__target || (jc(a), pd(a), a.stopImmediatePropagation());
      }, !0);
    }

    function jc (a) {
      a.__target = a.target;
      a.Ha = a.relatedTarget;
      if (B.Y) {
        var b = kc, c = Object.getPrototypeOf(a);
        if (!c.hasOwnProperty('__patchProto')) {
          var d = Object.create(c);
          d.Gb = c;
          Fa(d, b);
          c.__patchProto = d;
        }
        a.__proto__ = c.__patchProto;
      } else Fa(a, kc);
    }

    function ca (a, b) {return { index: a, $: [], da: b };}

    function rd (a, b, c, d) {
      var e = 0, f = 0, g = 0, h = 0, l = Math.min(b - e, d - f);
      if (0 == e && 0 == f)a:{
        for (g = 0; g < l; g++)if (a[ g ] !== c[ g ])break a;
        g = l;
      }
      if (b == a.length && d == c.length) {
        for (var h = a.length, k = c.length, q = 0; q < l - g && sd(a[ --h ], c[ --k ]);)q++;
        h = q;
      }
      e += g;
      f += g;
      b -= h;
      d -= h;
      if (!(b - e || d - f))return [];
      if (e == b) {
        for (b = ca(e,
          0); f < d;)b.$.push(c[ f++ ]);
        return [ b ];
      }
      if (f == d)return [ ca(e, b - e) ];
      l = e;
      g = f;
      d = d - g + 1;
      h = b - l + 1;
      b = Array(d);
      for (k = 0; k < d; k++)b[ k ] = Array(h), b[ k ][ 0 ] = k;
      for (k = 0; k < h; k++)b[ 0 ][ k ] = k;
      for (k = 1; k < d; k++)for (q = 1; q < h; q++)if (a[ l + q - 1 ] === c[ g + k - 1 ]) b[ k ][ q ] = b[ k - 1 ][ q -
      1 ]; else {
        var K = b[ k - 1 ][ q ] + 1, m = b[ k ][ q - 1 ] + 1;
        b[ k ][ q ] = K < m ? K : m;
      }
      l = b.length - 1;
      g = b[ 0 ].length - 1;
      d = b[ l ][ g ];
      for (a = []; 0 < l || 0 < g;)l ?
        g ?
          (h = b[ l - 1 ][ g - 1 ], k = b[ l - 1 ][ g ], q = b[ l ][ g - 1 ], K = k < q ?
            k < h ?
              k :
              h :
            q < h ?
              q :
              h, K == h ?
            (h == d ? a.push(0) : (a.push(1), d = h), l--, g--) :
            K == k ?
              (a.push(3), l--, d = k) :
              (a.push(2), g--, d =
                q)) :
          (a.push(3), l--) :
        (a.push(2), g--);
      a.reverse();
      b = void 0;
      l = [];
      for (g = 0; g < a.length; g++)switch (a[ g ]) {
        case 0:
          b && (l.push(b), b = void 0);
          e++;
          f++;
          break;
        case 1:
          b || (b = ca(e, 0));
          b.da++;
          e++;
          b.$.push(c[ f ]);
          f++;
          break;
        case 2:
          b || (b = ca(e, 0));
          b.da++;
          e++;
          break;
        case 3:
          b || (b = ca(e, 0)), b.$.push(c[ f ]), f++;
      }
      b && l.push(b);
      return l;
    }

    function sd (a, b) {return a === b;}

    function lc (a) {
      dc(a);
      return a.__shady && a.__shady.assignedSlot || null;
    }

    function W (a, b) {
      for (var c = Object.getOwnPropertyNames(b), d = 0; d < c.length; d++) {
        var e = c[ d ], f = Object.getOwnPropertyDescriptor(b,
          e);
        f.value ? a[ e ] = f.value : Object.defineProperty(a, e, f);
      }
    }

    function mc (a) {
      var b = td.has(a);
      a = /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/.test(a);
      return !b && a;
    }

    function m (a) {
      var b = a.isConnected;
      if (void 0 !== b)return b;
      for (; a && !(a.__CE_isImportDocument || a instanceof Document);)a = a.parentNode ||
        (window.ShadowRoot && a instanceof ShadowRoot ? a.host : void 0);
      return !(!a || !(a.__CE_isImportDocument || a instanceof Document));
    }

    function Va (a, b) {
      for (; b && b !== a && !b.nextSibling;)b = b.parentNode;
      return b && b !== a ? b.nextSibling : null;
    }

    function O (a,
                b, c) {
      c = c ? c : new Set;
      for (var d = a; d;) {
        if (d.nodeType === Node.ELEMENT_NODE) {
          var e = d;
          b(e);
          var f = e.localName;
          if ('link' === f && 'import' === e.getAttribute('rel')) {
            d = e.import;
            if (d instanceof Node && !c.has(d))for (c.add(d), d = d.firstChild; d; d = d.nextSibling)O(d, b, c);
            d = Va(a, e);
            continue;
          } else if ('template' === f) {
            d = Va(a, e);
            continue;
          }
          if (e = e.__CE_shadowRoot)for (e = e.firstChild; e; e = e.nextSibling)O(e, b, c);
        }
        d = d.firstChild ? d.firstChild : Va(a, d);
      }
    }

    function z (a, b, c) {a[ b ] = c;}

    function Wa (a) {
      a = a.replace(M.qb, '').replace(M.port, '');
      var b =
        nc, c = a, d = new va;
      d.start = 0;
      d.end = c.length;
      for (var e = d, f = 0, g = c.length; f < g; f++)if ('{' === c[ f ]) {
        e.rules || (e.rules = []);
        var h = e, l = h.rules[ h.rules.length - 1 ] || null, e = new va;
        e.start = f + 1;
        e.parent = h;
        e.previous = l;
        h.rules.push(e);
      } else'}' === c[ f ] && (e.end = f + 1, e = e.parent || d);
      return b(d, a);
    }

    function nc (a, b) {
      var c = b.substring(a.start, a.end - 1);
      a.parsedCssText = a.cssText = c.trim();
      a.parent && ((c = b.substring(a.previous ? a.previous.end : a.parent.start, a.start -
        1), c = ud(c), c = c.replace(M.Qa, ' '), c = c.substring(c.lastIndexOf(';') + 1),
        c = a.parsedSelector = a.selector = c.trim(), a.atRule = !c.indexOf('@'), a.atRule) ?
        c.indexOf('@media') ?
          c.match(M.wb) && (a.type = F.na, a.keyframesName = a.selector.split(M.Qa).pop()) :
          a.type = F.MEDIA_RULE :
        a.type = c.indexOf('--') ? F.STYLE_RULE : F.Da);
      if (c = a.rules)for (var d = 0, e = c.length, f; d < e && (f = c[ d ]); d++)nc(f, b);
      return a;
    }

    function ud (a) {
      return a.replace(/\\([0-9a-f]{1,6})\s/gi, function (a, c) {
        a = c;
        for (c = 6 - a.length; c--;)a = '0' + a;
        return '\\' + a;
      });
    }

    function oc (a, b, c) {
      c = void 0 === c ? '' : c;
      var d = '';
      if (a.cssText || a.rules) {
        var e = a.rules,
          f;
        if (f = e) f = e[ 0 ], f = !(f && f.selector && 0 === f.selector.indexOf('--'));
        if (f) {
          f = 0;
          for (var g = e.length, h; f < g && (h = e[ f ]); f++)d = oc(h, b, d);
        } else b ?
          b = a.cssText :
          (b = a.cssText, b = b.replace(M.La, '').replace(M.Pa, ''), b = b.replace(M.xb, '')
            .replace(M.Db, '')), (d = b.trim()) && (d = '  ' + d + '\n');
      }
      d && (a.selector && (c += a.selector + ' {\n'), c += d, a.selector && (c += '}\n\n'));
      return c;
    }

    function pc (a) {a && (C = C && !a.nativeCss && !a.shimcssproperties, v = v && !a.nativeShadow && !a.shimshadow);}

    function X (a, b) {
      if (!a)return '';
      'string' === typeof a && (a = Wa(a));
      b && Y(a, b);
      return oc(a, C);
    }

    function na (a) {
      !a.__cssRules && a.textContent && (a.__cssRules = Wa(a.textContent));
      return a.__cssRules || null;
    }

    function qc (a) {return !!a.parent && a.parent.type === F.na;}

    function Y (a, b, c, d) {
      if (a) {
        var e = !1, f = a.type;
        if (d && f === F.MEDIA_RULE) {
          var g = a.selector.match(vd);
          g && (window.matchMedia(g[ 1 ]).matches || (e = !0));
        }
        f === F.STYLE_RULE ? b(a) : c && f === F.na ? c(a) : f === F.Da && (e = !0);
        if ((a = a.rules) && !e)for (var e = 0, f = a.length, h; e < f && (h = a[ e ]); e++)Y(h, b, c, d);
      }
    }

    function Xa (a, b, c, d) {
      var e = document.createElement('style');
      b && e.setAttribute('scope', b);
      e.textContent = a;
      rc(e, c, d);
      return e;
    }

    function rc (a, b, c) {
      b = b || document.head;
      b.insertBefore(a, c && c.nextSibling || b.firstChild);
      R ? a.compareDocumentPosition(R) === Node.DOCUMENT_POSITION_PRECEDING && (R = a) : R = a;
    }

    function sc (a, b) {
      var c = a.indexOf('var(');
      if (-1 === c)return b(a, '', '', '');
      var d;
      a:{
        var e = 0;
        d = c + 3;
        for (var f = a.length; d < f; d++)if ('(' === a[ d ]) e++; else if (')' === a[ d ] && !--e)break a;
        d = -1;
      }
      e = a.substring(c + 4, d);
      c = a.substring(0, c);
      a = sc(a.substring(d + 1), b);
      d = e.indexOf(',');
      return -1 === d ?
        b(c, e.trim(), '', a) : b(c, e.substring(0, d).trim(), e.substring(d + 1).trim(), a);
    }

    function oa (a, b) {
      v ?
        a.setAttribute('class', b) :
        window.ShadyDOM.nativeMethods.setAttribute.call(a, 'class', b);
    }

    function S (a) {
      var b = a.localName, c = '';
      b ? -1 < b.indexOf('-') || (c = b, b = a.getAttribute && a.getAttribute('is') || '') : (b = a.is, c = a.extends);
      return { is: b, aa: c };
    }

    function wd (a) {(a = pa[ a ]) && (a._applyShimInvalid = !0);}

    function xd (a) {
      a.a || (a.a = !0, yd.then(function () {
        a._applyShimInvalid = !1;
        a.a = !1;
      }));
    }

    function nb (a) {
      tc ? tc(a) : (Ya || (Ya = new Promise(function (a) {
        Za =
          a;
      }), 'complete' === document.readyState ?
        Za() :
        document.addEventListener('readystatechange', function () {
          'complete' === document.readyState && Za();
        })), Ya.then(function () {a && a();}));
    }

    (function () {
      if (!function () {
          var a = document.createEvent('Event');
          a.initEvent('foo', !0, !0);
          a.preventDefault();
          return a.defaultPrevented;
        }()) {
        var a = Event.prototype.preventDefault;
        Event.prototype.preventDefault = function () {
          this.cancelable && (a.call(this), Object.defineProperty(this, 'defaultPrevented', {
            get: function () {return !0;},
            configurable: !0
          }));
        };
      }
      var b =
        /Trident/.test(navigator.userAgent);
      if (!window.CustomEvent || b && 'function' !== typeof window.CustomEvent) window.CustomEvent = function (a, b) {
        b = b || {};
        var c = document.createEvent('CustomEvent');
        c.initCustomEvent(a, !!b.bubbles, !!b.cancelable, b.detail);
        return c;
      }, window.CustomEvent.prototype = window.Event.prototype;
      if (!window.Event || b && 'function' !== typeof window.Event) {
        var c = window.Event;
        window.Event = function (a, b) {
          b = b || {};
          var c = document.createEvent('Event');
          c.initEvent(a, !!b.bubbles, !!b.cancelable);
          return c;
        };
        if (c)for (var d in c)window.Event[ d ] = c[ d ];
        window.Event.prototype = c.prototype;
      }
      if (!window.MouseEvent || b && 'function' !== typeof window.MouseEvent) {
        b = window.MouseEvent;
        window.MouseEvent = function (a, b) {
          b = b || {};
          var c = document.createEvent('MouseEvent');
          c.initMouseEvent(a, !!b.bubbles, !!b.cancelable, b.view ||
            window, b.detail, b.screenX, b.screenY, b.clientX, b.clientY, b.ctrlKey, b.altKey, b.shiftKey, b.metaKey, b.button, b.relatedTarget);
          return c;
        };
        if (b)for (d in b)window.MouseEvent[ d ] = b[ d ];
        window.MouseEvent.prototype = b.prototype;
      }
      Array.from ||
      (Array.from = function (a) {return [].slice.call(a);});
      Object.assign || (Object.assign = function (a, b) {
        for (var c = [].slice.call(arguments, 1), d = 0, e; d <
        c.length; d++)if (e = c[ d ])for (var f = a, k = e, m = Object.getOwnPropertyNames(k), n = 0; n <
        m.length; n++)e = m[ n ], f[ e ] = k[ e ];
        return a;
      });
    })(window.WebComponents);
    (function () {
      function a () {}

      var b = 'undefined' === typeof HTMLTemplateElement;
      /Trident/.test(navigator.userAgent) && function () {
        var a = Document.prototype.importNode;
        Document.prototype.importNode = function () {
          var b = a.apply(this, arguments);
          if (b.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            var c = this.createDocumentFragment();
            c.appendChild(b);
            return c;
          }
          return b;
        };
      }();
      var c = Node.prototype.cloneNode, d = Document.prototype.createElement, e = Document.prototype.importNode,
        f = function () {
          if (!b) {
            var a = document.createElement('template'), c = document.createElement('template');
            c.content.appendChild(document.createElement('div'));
            a.content.appendChild(c);
            a = a.cloneNode(!0);
            return 0 === a.content.childNodes.length || 0 === a.content.firstChild.content.childNodes.length ||
              !(document.createDocumentFragment().cloneNode() instanceof DocumentFragment);
          }
        }();
      if (b) {
        var g = function (a) {
          switch (a) {
            case '&':
              return '&amp;';
            case '<':
              return '&lt;';
            case '>':
              return '&gt;';
            case '\u00a0':
              return '&nbsp;';
          }
        }, h = function (b) {
          Object.defineProperty(b, 'innerHTML', {
            get: function () {
              for (var a = '', b = this.content.firstChild; b; b = b.nextSibling)a += b.outerHTML ||
                b.data.replace(p, g);
              return a;
            }, set: function (b) {
              k.body.innerHTML = b;
              for (a.b(k); this.content.firstChild;)this.content.removeChild(this.content.firstChild);
              for (; k.body.firstChild;)this.content.appendChild(k.body.firstChild);
            }, configurable: !0
          });
        }, k = document.implementation.createHTMLDocument('template'), m = !0, q = document.createElement('style');
        q.textContent = 'template{display:none;}';
        var n = document.head;
        n.insertBefore(q, n.firstElementChild);
        a.prototype = Object.create(HTMLElement.prototype);
        var t = !document.createElement('div').hasOwnProperty('innerHTML');
        a.P = function (b) {
          if (!b.content) {
            b.content = k.createDocumentFragment();
            for (var c; c = b.firstChild;)b.content.appendChild(c);
            if (t) b.__proto__ = a.prototype; else if (b.cloneNode = function (b) {return a.a(this, b);}, m)try {h(b);} catch (be) {m = !1;}
            a.b(b.content);
          }
        };
        h(a.prototype);
        a.b = function (b) {
          b = b.querySelectorAll('template');
          for (var c = 0, d = b.length, e; c < d && (e = b[ c ]); c++)a.P(e);
        };
        document.addEventListener('DOMContentLoaded', function () {a.b(document);});
        Document.prototype.createElement = function () {
          var b = d.apply(this, arguments);
          'template' === b.localName && a.P(b);
          return b;
        };
        var p = /[&\u00A0<>]/g;
      }
      if (b || f) a.a = function (a, b) {
        var d = c.call(a, !1);
        this.P &&
        this.P(d);
        b && (d.content.appendChild(c.call(a.content, !0)), this.xa(d.content, a.content));
        return d;
      }, a.prototype.cloneNode = function (b) {return a.a(this, b);}, a.xa = function (a, b) {
        if (b.querySelectorAll) {
          b = b.querySelectorAll('template');
          a = a.querySelectorAll('template');
          for (var c = 0, d = a.length, e, f; c < d; c++)f = b[ c ], e = a[ c ], this.P &&
          this.P(f), e.parentNode.replaceChild(f.cloneNode(!0), e);
        }
      }, Node.prototype.cloneNode = function (b) {
        var d;
        if (this instanceof
          DocumentFragment)if (b) d = this.ownerDocument.importNode(this, !0); else return this.ownerDocument.createDocumentFragment();
        else d = c.call(this, b);
        b && a.xa(d, this);
        return d;
      }, Document.prototype.importNode = function (b, c) {
        if ('template' === b.localName)return a.a(b, c);
        var d = e.call(this, b, c);
        c && a.xa(d, b);
        return d;
      }, f && (window.HTMLTemplateElement.prototype.cloneNode = function (b) {return a.a(this, b);});
      b && (window.HTMLTemplateElement = a);
    })();
    !function (a, b) {
      'object' == typeof exports && 'undefined' != typeof module ?
        module.exports = b() :
        'function' == typeof define && define.Jb ?
          define(b) :
          a.ES6Promise = b();
    }(window, function () {
      function a (a, b) {
        y[ u ] = a;
        y[ u +
        1 ] = b;
        u += 2;
        2 === u && (E ? E(g) : M());
      }

      function b () {return function () {return process.Mb(g);};}

      function c () {return 'undefined' != typeof D ? function () {D(g);} : f();}

      function d () {
        var a = 0, b = new J(g), c = document.createTextNode('');
        return b.observe(c, { characterData: !0 }), function () {c.data = a = ++a % 2;};
      }

      function e () {
        var a = new MessageChannel;
        return a.port1.onmessage = g, function () {return a.port2.postMessage(0);};
      }

      function f () {
        var a = setTimeout;
        return function () {return a(g, 1);};
      }

      function g () {
        for (var a = 0; a < u; a += 2)(0, y[ a ])(y[ a + 1 ]), y[ a ] = void 0,
          y[ a + 1 ] = void 0;
        u = 0;
      }

      function h () {
        try {
          var a = require('vertx');
          return D = a.Ob || a.Nb, c();
        } catch (uc) {return f();}
      }

      function k (b, c) {
        var d = arguments, e = this, f = new this.constructor(q);
        void 0 === f[ I ] && $a(f);
        var g = e.o;
        return g ? !function () {
          var b = d[ g - 1 ];
          a(function () {return vc(g, f, b, e.m);});
        }() : z(e, f, b, c), f;
      }

      function m (a) {
        if (a && 'object' == typeof a && a.constructor === this)return a;
        var b = new this(q);
        return v(b, a), b;
      }

      function q () {}

      function n (a) {try {return a.then;} catch (uc) {return O.error = uc, O;}}

      function t (a, b, c, d) {
        try {
          a.call(b, c,
            d);
        } catch (Bd) {return Bd;}
      }

      function p (b, c, d) {
        a(function (a) {
          var b = !1, e = t(d, c, function (d) {b || (b = !0, c !== d ? v(a, d) : r(a, d));}, function (c) {
            b || (b = !0, N(a, c));
          });
          !b && e && (b = !0, N(a, e));
        }, b);
      }

      function w (a, b) {
        b.o === L ?
          r(a, b.m) :
          b.o === H ?
            N(a, b.m) :
            z(b, void 0, function (b) {return v(a, b);}, function (b) {return N(a, b);});
      }

      function x (a, b, c) {
        b.constructor === a.constructor && c === k && b.constructor.resolve === m ?
          w(a, b) :
          c === O ?
            N(a, O.error) :
            void 0 === c ?
              r(a, b) :
              'function' == typeof c ?
                p(a, b, c) :
                r(a, b);
      }

      function v (a, b) {
        a === b ? N(a, new TypeError('You cannot resolve a promise with itself')) :
          'function' == typeof b || 'object' == typeof b && null !== b ? x(a, b, n(b)) : r(a, b);
      }

      function C (a) {
        a.Ja && a.Ja(a.m);
        A(a);
      }

      function r (b, c) {b.o === F && (b.m = c, b.o = L, 0 !== b.X.length && a(A, b));}

      function N (b, c) {b.o === F && (b.o = H, b.m = c, a(C, b));}

      function z (b, c, d, e) {
        var f = b.X, g = f.length;
        b.Ja = null;
        f[ g ] = c;
        f[ g + L ] = d;
        f[ g + H ] = e;
        0 === g && b.o && a(A, b);
      }

      function A (a) {
        var b = a.X, c = a.o;
        if (0 !== b.length) {
          for (var d, e, f = a.m, g = 0; g < b.length; g += 3)d = b[ g ], e = b[ g + c ], d ?
            vc(c, d, e, f) :
            e(f);
          a.X.length = 0;
        }
      }

      function da () {this.error = null;}

      function vc (a, b, c, d) {
        var e = 'function' ==
          typeof c, f = void 0, g = void 0, h = void 0, da = void 0;
        if (e) {
          var k;
          try {k = c(d);} catch (Cd) {k = (P.error = Cd, P);}
          if (f = k, f === P ? (da = !0, g = f.error, f = null) : h = !0, b ===
            f)return void N(b, new TypeError('A promises callback cannot return that same promise.'));
        } else f = d, h = !0;
        b.o !== F || (e && h ? v(b, f) : da ? N(b, g) : a === L ? r(b, f) : a === H && N(b, f));
      }

      function Dd (a, b) {try {b(function (b) {v(a, b);}, function (b) {N(a, b);});} catch (zd) {N(a, zd);}}

      function $a (a) {
        a[ I ] = Q++;
        a.o = void 0;
        a.m = void 0;
        a.X = [];
      }

      function ea (a, b) {
        this.kb = a;
        this.J = new a(q);
        this.J[ I ] || $a(this.J);
        wc(b) ?
          (this.jb = b, this.length = b.length, this.ba = b.length, this.m = Array(this.length), 0 === this.length ?
            r(this.J, this.m) :
            (this.length = this.length || 0, this.ib(), 0 === this.ba && r(this.J, this.m))) :
          N(this.J, Error('Array Methods must be provided an Array'));
      }

      function G (a) {
        this[ I ] = Q++;
        this.m = this.o = void 0;
        this.X = [];
        if (q !== a) {
          if ('function' !=
            typeof a)throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
          if (this instanceof
            G) Dd(this, a); else throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');
        }
      }

      var ab = void 0, wc = ab = Array.isArray ?
          Array.isArray :
          function (a) {return '[object Array]' === Object.prototype.toString.call(a);}, u = 0, D = void 0, E = void 0,
        B = (ab = 'undefined' != typeof window ? window : void 0) || {},
        J = B.MutationObserver || B.WebKitMutationObserver,
        B = 'undefined' != typeof Uint8ClampedArray && 'undefined' != typeof importScripts &&
          'undefined' != typeof MessageChannel, y = Array(1E3), M = void 0,
        M = 'undefined' == typeof self && 'undefined' != typeof process &&
        '[object process]' === {}.toString.call(process) ? b() : J ? d() : B ? e() : ab || 'function' !=
        typeof require ? f() : h(), I = Math.random().toString(36).substring(16), F = void 0, L = 1, H = 2, O = new da,
        P = new da, Q = 0;
      return ea.prototype.ib = function () {
        for (var a = this.length, b = this.jb, c = 0; this.o === F && c < a; c++)this.hb(b[ c ], c);
      }, ea.prototype.hb = function (a, b) {
        var c = this.kb, d = c.resolve;
        d === m ?
          (d = n(a), d === k && a.o !== F ?
            this.ua(a.o, b, a.m) :
            'function' != typeof d ?
              (this.ba--, this.m[ b ] = a) :
              c === G ?
                (c = new c(q), x(c, a, d), this.va(c, b)) :
                this.va(new c(function (b) {return b(a);}), b)) :
          this.va(d(a), b);
      }, ea.prototype.ua = function (a, b, c) {
        var d =
          this.J;
        d.o === F && (this.ba--, a === H ? N(d, c) : this.m[ b ] = c);
        0 === this.ba && r(d, this.m);
      }, ea.prototype.va = function (a, b) {
        var c = this;
        z(a, void 0, function (a) {return c.ua(L, b, a);}, function (a) {return c.ua(H, b, a);});
      }, G.f = function (a) {return (new ea(this, a)).J;}, G.g = function (a) {
        var b = this;
        return new b(wc(a) ?
          function (c, d) {for (var e = a.length, f = 0; f < e; f++)b.resolve(a[ f ]).then(c, d);} :
          function (a, b) {return b(new TypeError('You must pass an array to race.'));});
      }, G.resolve = m, G.h = function (a) {
        var b = new this(q);
        return N(b, a), b;
      }, G.c = function (a) {
        E =
          a;
      }, G.b = function (b) {a = b;}, G.a = a, G.prototype = {
        constructor: G,
        then: k,
        'catch': function (a) {return this.then(null, a);}
      }, G.yb = function () {
        var a = void 0;
        if ('undefined' != typeof global) a = global; else if ('undefined' !=
          typeof self) a = self; else try {a = Function('return this')();} catch (Ad) {throw Error('polyfill failed because global object is unavailable in this environment');}
        var b = a.Promise;
        if (b) {
          var c = null;
          try {c = Object.prototype.toString.call(b.resolve());} catch (Ad) {}
          if ('[object Promise]' === c && !b.Kb)return;
        }
        a.Promise = G;
      },
        G.Promise = G, G;
    });
    ES6Promise.yb();
    (function (a) {
      function b (a, b) {
        if ('function' === typeof window.CustomEvent)return new CustomEvent(a, b);
        var c = document.createEvent('CustomEvent');
        c.initCustomEvent(a, !!b.bubbles, !!b.cancelable, b.detail);
        return c;
      }

      function c (a) {
        if (m)return a.ownerDocument !== document ? a.ownerDocument : null;
        var b = a.__importDoc;
        if (!b && a.parentNode) {
          b = a.parentNode;
          if ('function' === typeof b.closest) b = b.closest('link[rel=import]'); else for (; !h(b) &&
                                                                                              (b = b.parentNode););
          a.__importDoc = b;
        }
        return b;
      }

      function d (a) {
        var b =
          document.querySelectorAll('link[rel=import]:not(import-dependency)'), c = b.length;
        if (c)for (var d = 0, e = b.length, f; d < e && (f = b[ d ]); d++)g(f, function () {--c || a();}); else a();
      }

      function e (a) {
        if ('loading' !== document.readyState) a(); else {
          var b = function () {
            'loading' !== document.readyState && (document.removeEventListener('readystatechange', b), a());
          };
          document.addEventListener('readystatechange', b);
        }
      }

      function f (a) {e(function () {return d(function () {return a && a();});});}

      function g (a, b) {
        if (a.__loaded) b && b(); else if ('script' !== a.localName ||
          a.src) {
          var c = function (d) {
            a.removeEventListener(d.type, c);
            a.__loaded = !0;
            b && b();
          };
          a.addEventListener('load', c);
          w && 'style' === a.localName || a.addEventListener('error', c);
        } else a.__loaded = !0, b && b();
      }

      function h (a) {return a.nodeType === Node.ELEMENT_NODE && 'link' === a.localName && 'import' === a.rel;}

      function k () {
        var a = this;
        this.a = {};
        this.b = 0;
        this.c = new MutationObserver(function (b) {return a.s(b);});
        e(function () {
          a.c.observe(document.head, { childList: !0, subtree: !0 });
          a.f(document);
        });
      }

      var m = 'import' in document.createElement('link'),
        q = null;
      !1 === 'currentScript' in document && Object.defineProperty(document, 'currentScript', {
        get: function () {
          return q || ('complete' !== document.readyState ? document.scripts[ document.scripts.length - 1 ] : null);
        }, configurable: !0
      });
      var n = /(^\/)|(^#)|(^[\w-\d]*:)/, r = /(url\()([^)]*)(\))/g, t = /(@import[\s]+(?!url\())([^;]*)(;)/g,
        v = /(<link[^>]*)(rel=['|"]?stylesheet['|"]?[^>]*>)/g, p = {
          rb: function (a, b) {
            a.href && a.setAttribute('href', p.Ca(a.getAttribute('href'), b));
            a.src && a.setAttribute('src', p.Ca(a.getAttribute('src'), b));
            if ('style' === a.localName) {
              var c = p.Ta(a.textContent, b, r);
              a.textContent = p.Ta(c, b, t);
            }
          }, Ta: function (a, b, c) {
            return a.replace(c, function (a, c, d, e) {
              a = d.replace(/["']/g, '');
              b && (a = p.Ua(a, b));
              return c + '\'' + a + '\'' + e;
            });
          }, Ca: function (a, b) {return a && n.test(a) ? a : p.Ua(a, b);}, Ua: function (a, b) {
            if (void 0 === p.qa) {
              p.qa = !1;
              try {
                var c = new URL('b', 'http://a');
                c.pathname = 'c%20d';
                p.qa = 'http://a/c%20d' === c.href;
              } catch ($a) {}
            }
            if (p.qa)return (new URL(a, b)).href;
            c = p.fb;
            c || (c = document.implementation.createHTMLDocument('temp'), p.fb = c, c.Fa =
              c.createElement('base'), c.head.appendChild(c.Fa), c.Ea = c.createElement('a'));
            c.Fa.href = b;
            c.Ea.href = a;
            return c.Ea.href || a;
          }
        }, x = {
          async: !0, load: function (a, b, c) {
            if (a)if (a.match(/^data:/)) {
              a = a.split(',');
              var d = a[ 1 ], d = -1 < a[ 0 ].indexOf(';base64') ? atob(d) : decodeURIComponent(d);
              b(d);
            } else {
              var e = new XMLHttpRequest;
              e.open('GET', a, x.async);
              e.onload = function () {
                var a = e.getResponseHeader('Location');
                a && !a.indexOf('/') && (a = (location.origin || location.protocol + '//' + location.host) + a);
                var d = e.response || e.responseText;
                304 ===
                e.status || !e.status || 200 <= e.status && 300 > e.status ? b(d, a) : c(d);
              };
              e.send();
            } else c('error: href must be specified');
          }
        }, w = /Trident/.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent);
      k.prototype.f = function (a) {
        a = a.querySelectorAll('link[rel=import]');
        for (var b = 0, c = a.length; b < c; b++)this.h(a[ b ]);
      };
      k.prototype.h = function (a) {
        var b = this, c = a.href;
        if (void 0 !== this.a[ c ]) {
          var d = this.a[ c ];
          d && d.__loaded && (a.import = d, this.g(a));
        } else this.b++, this.a[ c ] = 'pending', x.load(c, function (a, d) {
          a = b.u(a, d || c);
          b.a[ c ] =
            a;
          b.b--;
          b.f(a);
          b.i();
        }, function () {
          b.a[ c ] = null;
          b.b--;
          b.i();
        });
      };
      k.prototype.u = function (a, b) {
        if (!a)return document.createDocumentFragment();
        w &&
        (a = a.replace(v, function (a, b, c) {
          return -1 === a.indexOf('type=') ?
            b + ' type=import-disable ' + c :
            a;
        }));
        var c = document.createElement('template');
        c.innerHTML = a;
        if (c.content) a = c.content; else for (a = document.createDocumentFragment(); c.firstChild;)a.appendChild(c.firstChild);
        if (c = a.querySelector('base')) b = p.Ca(c.getAttribute('href'), b), c.removeAttribute('href');
        for (var c = a.querySelectorAll('link[rel=import], link[rel=stylesheet][href][type=import-disable],\n    style:not([type]), link[rel=stylesheet][href]:not([type]),\n    script:not([type]), script[type="application/javascript"],\n    script[type="text/javascript"]'),
               d = 0, e = 0, f = c.length, h; e < f &&
             (h = c[ e ]); e++)g(h), p.rb(h, b), h.setAttribute('import-dependency', ''), 'script' === h.localName &&
        !h.src && h.textContent && (h.setAttribute('src', 'data:text/javascript;charset=utf-8,' +
          encodeURIComponent(h.textContent +
            ('\n//# sourceURL=' + b + (d ? '-' + d : '') + '.js\n'))), h.textContent = '', d++);
        return a;
      };
      k.prototype.i = function () {
        var a = this;
        if (!this.b) {
          this.c.disconnect();
          this.flatten(document);
          var b = !1, c = !1,
            d = function () {c && b && (a.c.observe(document.head, { childList: !0, subtree: !0 }), a.l());};
          this.B(function () {
            c =
              !0;
            d();
          });
          this.v(function () {
            b = !0;
            d();
          });
        }
      };
      k.prototype.flatten = function (a) {
        a = a.querySelectorAll('link[rel=import]');
        for (var b = {}, c = 0, d = a.length; c < d && (b.n = a[ c ]); b = { n: b.n }, c++) {
          var e = this.a[ b.n.href ];
          (b.n.import = e) && e.nodeType === Node.DOCUMENT_FRAGMENT_NODE &&
          (this.a[ b.n.href ] = b.n, b.n.readyState = 'loading', b.n.import = b.n, Object.defineProperty(b.n, 'baseURI', {
            get: function (a) {return function () {return a.n.href;};}(b),
            configurable: !0,
            enumerable: !0
          }), this.flatten(e), b.n.appendChild(e));
        }
      };
      k.prototype.v = function (a) {
        function b (e) {
          if (e <
            d) {
            var f = c[ e ], h = document.createElement('script');
            f.removeAttribute('import-dependency');
            for (var k = 0, l = f.attributes.length; k <
            l; k++)h.setAttribute(f.attributes[ k ].name, f.attributes[ k ].value);
            q = h;
            f.parentNode.replaceChild(h, f);
            g(h, function () {
              q = null;
              b(e + 1);
            });
          } else a();
        }

        var c = document.querySelectorAll('script[import-dependency]'), d = c.length;
        b(0);
      };
      k.prototype.B = function (a) {
        var b = document.querySelectorAll('style[import-dependency],\n    link[rel=stylesheet][import-dependency]'),
          d = b.length;
        if (d)for (var e = w &&
          !!document.querySelector('link[rel=stylesheet][href][type=import-disable]'), f = {}, h = 0, k = b.length; h <
                   k && (f.A = b[ h ]); f = { A: f.A }, h++) {
          if (g(f.A, function (b) {
              return function () {
                b.A.removeAttribute('import-dependency');
                --d || a();
              };
            }(f)), e && f.A.parentNode !== document.head) {
            var l = document.createElement(f.A.localName);
            l.__appliedElement = f.A;
            l.setAttribute('type', 'import-placeholder');
            f.A.parentNode.insertBefore(l, f.A.nextSibling);
            for (l = c(f.A); l && c(l);)l = c(l);
            l.parentNode !== document.head && (l = null);
            document.head.insertBefore(f.A,
              l);
            f.A.removeAttribute('type');
          }
        } else a();
      };
      k.prototype.l = function () {
        for (var a = document.querySelectorAll('link[rel=import]'), b = a.length - 1, c; 0 <= b &&
        (c = a[ b ]); b--)this.g(c);
      };
      k.prototype.g = function (a) {
        a.__loaded || (a.__loaded = !0, a.import && (a.import.readyState = 'complete'), a.dispatchEvent(b(a.import ?
          'load' :
          'error', { bubbles: !1, cancelable: !1, detail: void 0 })));
      };
      k.prototype.s = function (a) {
        for (var b = 0; b < a.length; b++) {
          var c = a[ b ];
          if (c.addedNodes)for (var d = 0; d < c.addedNodes.length; d++) {
            var e = c.addedNodes[ d ];
            e && e.nodeType ===
            Node.ELEMENT_NODE && (h(e) ? this.h(e) : this.f(e));
          }
        }
      };
      if (m) {
        for (var u = document.querySelectorAll('link[rel=import]'), z = 0, A = u.length, y; z < A &&
        (y = u[ z ]); z++)y.import && 'loading' === y.import.readyState || (y.__loaded = !0);
        u = function (a) {
          a = a.target;
          h(a) && (a.__loaded = !0);
        };
        document.addEventListener('load', u, !0);
        document.addEventListener('error', u, !0);
      } else new k;
      f(function () {
        return document.dispatchEvent(b('HTMLImportsLoaded', {
          cancelable: !0,
          bubbles: !0,
          detail: void 0
        }));
      });
      a.useNative = m;
      a.whenReady = f;
      a.importForElement = c;
    })(window.HTMLImports =
      window.HTMLImports || {});
    (function () {
      window.WebComponents = window.WebComponents || { flags: {} };
      var a = document.querySelector('script[src*="webcomponents-lite.js"]'), b = /wc-(.+)/, c = {};
      if (!c.noOpts) {
        location.search.slice(1).split('&').forEach(function (a) {
          a = a.split('=');
          var d;
          a[ 0 ] && (d = a[ 0 ].match(b)) && (c[ d[ 1 ] ] = a[ 1 ] || !0);
        });
        if (a)for (var d = 0, e; e = a.attributes[ d ]; d++)'src' !== e.name && (c[ e.name ] = e.value || !0);
        c.log && c.log.split ?
          (a = c.log.split(','), c.log = {}, a.forEach(function (a) {c.log[ a ] = !0;})) :
          c.log = {};
      }
      window.WebComponents.flags =
        c;
      if (a = c.shadydom) window.ShadyDOM = window.ShadyDOM || {}, window.ShadyDOM.force = a;
      (a = c.register || c.ce) && window.customElements && (window.customElements.forcePolyfill = a);
    })();
    var B = window.ShadyDOM || {};
    B.tb = !(!Element.prototype.attachShadow || !Node.prototype.getRootNode);
    var bb = Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild');
    B.Y = !!(bb && bb.configurable && bb.get);
    B.Oa = B.force || !B.tb;
    var Z = Element.prototype,
      xc = Z.matches || Z.matchesSelector || Z.mozMatchesSelector || Z.msMatchesSelector || Z.oMatchesSelector ||
        Z.webkitMatchesSelector, Ha = document.createTextNode(''), Hb = 0, Ga = [];
    (new MutationObserver(function () {for (; Ga.length;)try {Ga.shift()();} catch (a) {throw Ha.textContent = Hb++, a;}})).observe(Ha, { characterData: !0 });
    var ba = [], Ia;
    Ja.list = ba;
    la.prototype.Bb = function () {
      var a = this;
      this.a || (this.a = !0, Gb(function () {a.b();}));
    };
    la.prototype.b = function () {
      if (this.a) {
        this.a = !1;
        var a = this.takeRecords();
        a.length && this.ea.forEach(function (b) {b(a);});
      }
    };
    la.prototype.takeRecords = function () {
      if (this.addedNodes.length || this.removedNodes.length) {
        var a =
          [ { addedNodes: this.addedNodes, removedNodes: this.removedNodes } ];
        this.addedNodes = [];
        this.removedNodes = [];
        return a;
      }
      return [];
    };
    var fc = Element.prototype.appendChild, Qa = Element.prototype.insertBefore, V = Element.prototype.removeChild,
      yc = Element.prototype.setAttribute, zc = Element.prototype.removeAttribute, cb = Element.prototype.cloneNode,
      Ra = Document.prototype.importNode, Ac = Element.prototype.addEventListener,
      Bc = Element.prototype.removeEventListener, Ed = Object.freeze({
        appendChild: fc,
        insertBefore: Qa,
        removeChild: V,
        setAttribute: yc,
        removeAttribute: zc,
        cloneNode: cb,
        importNode: Ra,
        addEventListener: Ac,
        removeEventListener: Bc
      }), ld = /[&\u00A0"]/g, od = /[&\u00A0<>]/g,
      md = Kb('area base br col command embed hr img input keygen link meta param source track wbr'.split(' ')),
      nd = Kb('style script xmp iframe noembed noframes plaintext noscript'.split(' ')),
      D = document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, !1),
      E = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT, null, !1), Fd = Object.freeze({
        parentNode: P,
        firstChild: Da,
        lastChild: Ea,
        previousSibling: Lb,
        nextSibling: Mb,
        childNodes: aa,
        parentElement: Nb,
        firstElementChild: Ob,
        lastElementChild: Pb,
        previousElementSibling: Qb,
        nextElementSibling: Rb,
        children: Sb,
        innerHTML: Tb,
        textContent: Ub
      }), db = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML') ||
        Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML'),
      qa = document.implementation.createHTMLDocument('inert').createElement('div'),
      eb = Object.getOwnPropertyDescriptor(Document.prototype, 'activeElement'), Vb = {
        parentElement: {
          get: function () {
            var a =
              this.__shady && this.__shady.parentElement;
            return void 0 !== a ? a : Nb(this);
          }, configurable: !0
        },
        parentNode: {
          get: function () {
            var a = this.__shady && this.__shady.parentNode;
            return void 0 !== a ? a : P(this);
          }, configurable: !0
        },
        nextSibling: {
          get: function () {
            var a = this.__shady && this.__shady.nextSibling;
            return void 0 !== a ? a : Mb(this);
          }, configurable: !0
        },
        previousSibling: {
          get: function () {
            var a = this.__shady && this.__shady.previousSibling;
            return void 0 !== a ? a : Lb(this);
          }, configurable: !0
        },
        className: {
          get: function () {return this.getAttribute('class');},
          set: function (a) {this.setAttribute('class', a);}, configurable: !0
        },
        nextElementSibling: {
          get: function () {
            if (this.__shady && void 0 !== this.__shady.nextSibling) {
              for (var a = this.nextSibling; a && a.nodeType !== Node.ELEMENT_NODE;)a = a.nextSibling;
              return a;
            }
            return Rb(this);
          }, configurable: !0
        },
        previousElementSibling: {
          get: function () {
            if (this.__shady && void 0 !== this.__shady.previousSibling) {
              for (var a = this.previousSibling; a && a.nodeType !== Node.ELEMENT_NODE;)a = a.previousSibling;
              return a;
            }
            return Qb(this);
          }, configurable: !0
        }
      }, La = {
        childNodes: {
          get: function () {
            if (this.__shady &&
              void 0 !== this.__shady.firstChild) {
              if (!this.__shady.childNodes) {
                this.__shady.childNodes = [];
                for (var a = this.firstChild; a; a = a.nextSibling)this.__shady.childNodes.push(a);
              }
              return this.__shady.childNodes;
            }
            return aa(this);
          }, configurable: !0
        },
        firstChild: {
          get: function () {
            var a = this.__shady && this.__shady.firstChild;
            return void 0 !== a ? a : Da(this);
          }, configurable: !0
        },
        lastChild: {
          get: function () {
            var a = this.__shady && this.__shady.lastChild;
            return void 0 !== a ? a : Ea(this);
          }, configurable: !0
        },
        textContent: {
          get: function () {
            if (this.__shady &&
              void 0 !== this.__shady.firstChild) {
              for (var a = [], b = 0, c = this.childNodes, d; d = c[ b ]; b++)d.nodeType !== Node.COMMENT_NODE &&
              a.push(d.textContent);
              return a.join('');
            }
            return Ub(this);
          },
          set: function (a) {
            if (this.nodeType !== Node.ELEMENT_NODE) this.nodeValue = a; else {
              for (; this.firstChild;)this.removeChild(this.firstChild);
              a && this.appendChild(document.createTextNode(a));
            }
          },
          configurable: !0
        },
        firstElementChild: {
          get: function () {
            if (this.__shady && void 0 !== this.__shady.firstChild) {
              for (var a = this.firstChild; a && a.nodeType !== Node.ELEMENT_NODE;)a =
                a.nextSibling;
              return a;
            }
            return Ob(this);
          }, configurable: !0
        },
        lastElementChild: {
          get: function () {
            if (this.__shady && void 0 !== this.__shady.lastChild) {
              for (var a = this.lastChild; a && a.nodeType !== Node.ELEMENT_NODE;)a = a.previousSibling;
              return a;
            }
            return Pb(this);
          }, configurable: !0
        },
        children: {
          get: function () {
            return this.__shady && void 0 !== this.__shady.firstChild ?
              Array.prototype.filter.call(this.childNodes, function (a) {return a.nodeType === Node.ELEMENT_NODE;}) :
              Sb(this);
          }, configurable: !0
        },
        innerHTML: {
          get: function () {
            var a = 'template' ===
            this.localName ? this.content : this;
            return this.__shady && void 0 !== this.__shady.firstChild ? Ka(a) : Tb(a);
          },
          set: function (a) {
            for (var b = 'template' === this.localName ?
              this.content :
              this; b.firstChild;)b.removeChild(b.firstChild);
            for (db && db.set ? db.set.call(qa, a) : qa.innerHTML = a; qa.firstChild;)b.appendChild(qa.firstChild);
          },
          configurable: !0
        }
      }, Cc = {
        shadowRoot: {
          get: function () {return this.__shady && this.__shady.root || null;},
          set: function (a) {
            this.__shady = this.__shady || {};
            this.__shady.root = a;
          },
          configurable: !0
        }
      }, Ma = {
        activeElement: {
          get: function () {
            var a;
            a = eb && eb.get ? eb.get.call(document) : B.Y ? void 0 : document.activeElement;
            if (a && a.nodeType) {
              var b = !!y(this);
              if (this === document || b && this.host !== a && this.host.contains(a)) {
                for (b = U(a); b && b !== this;)a = b.host, b = U(a);
                a = this === document ? b ? null : a : b === this ? a : null;
              } else a = null;
            } else a = null;
            return a;
          }, set: function () {}, configurable: !0
        }
      }, Eb = B.Y ?
        function () {} :
        function (a) {a.__shady && a.__shady.eb || (a.__shady = a.__shady || {}, a.__shady.eb = !0, L(a, Vb, !0));},
      Db = B.Y ? function () {} : function (a) {
        a.__shady && a.__shady.bb || (a.__shady = a.__shady ||
          {}, a.__shady.bb = !0, L(a, La, !0), L(a, Cc, !0));
      }, ra = null, Gd = {
        focusin: !0,
        focusout: !0,
        click: !0,
        dblclick: !0,
        mousedown: !0,
        mouseenter: !0,
        mouseleave: !0,
        mousemove: !0,
        mouseout: !0,
        mouseover: !0,
        mouseup: !0,
        wheel: !0,
        beforeinput: !0,
        input: !0,
        keydown: !0,
        keyup: !0,
        compositionstart: !0,
        compositionupdate: !0,
        compositionend: !0,
        touchstart: !0,
        touchend: !0,
        touchmove: !0,
        touchcancel: !0,
        pointerover: !0,
        pointerenter: !0,
        pointerdown: !0,
        pointermove: !0,
        pointerup: !0,
        pointercancel: !0,
        pointerout: !0,
        pointerleave: !0,
        gotpointercapture: !0,
        lostpointercapture: !0,
        dragstart: !0,
        drag: !0,
        dragenter: !0,
        dragleave: !0,
        dragover: !0,
        drop: !0,
        dragend: !0,
        DOMActivate: !0,
        DOMFocusIn: !0,
        DOMFocusOut: !0,
        keypress: !0
      }, kc = {
        get composed () {
          !1 !== this.isTrusted && void 0 === this.oa && (this.oa = Gd[ this.type ]);
          return this.oa || !1;
        },
        composedPath: function () {
          this.Ga || (this.Ga = Sa(this.__target, this.composed));
          return this.Ga;
        },
        get target () {return hc(this.currentTarget, this.composedPath());},
        get relatedTarget () {
          if (!this.Ha)return null;
          this.Ia || (this.Ia = Sa(this.Ha, !0));
          return hc(this.currentTarget, this.Ia);
        },
        stopPropagation: function () {
          Event.prototype.stopPropagation.call(this);
          this.pa = !0;
        },
        stopImmediatePropagation: function () {
          Event.prototype.stopImmediatePropagation.call(this);
          this.pa = this.ab = !0;
        }
      }, Ua = { focus: !0, blur: !0 }, Hd = Ta(window.Event), Id = Ta(window.CustomEvent), Jd = Ta(window.MouseEvent),
      Kd = 'function' === typeof Event ? Event : function (a, b) {
        b = b || {};
        var c = document.createEvent('Event');
        c.initEvent(a, !!b.bubbles, !!b.cancelable);
        return c;
      };
    u.prototype.sb = function () {return this.root.querySelectorAll('slot');};
    u.prototype.za =
      function (a) {return a.localName && 'slot' == a.localName;};
    u.prototype.wa = function () {return this.root.ya() ? this.g(this.c()) : [];};
    u.prototype.c = function () {
      for (var a = [], b = 0, c = this.root.host.firstChild; c; c = c.nextSibling)a[ b++ ] = c;
      return a;
    };
    u.prototype.g = function (a) {
      for (var b = [], c = this.root.sa(), d = 0, e = c.length, f; d < e && (f = c[ d ]); d++) {
        this.f(f, a);
        var g = f.parentNode;
        (g = g && g.__shady && g.__shady.root) && g.ya() && b.push(g);
      }
      for (c = 0; c < a.length; c++)if (d = a[ c ]) d.__shady = d.__shady ||
        {}, d.__shady.assignedSlot = void 0, (e = P(d)) &&
      V.call(e, d);
      return b;
    };
    u.prototype.f = function (a, b) {
      var c = a.__shady.assignedNodes;
      c && this.Ka(a, !0);
      a.__shady.assignedNodes = [];
      for (var d = !1, e = !1, f = 0, g = b.length, h; f < g; f++)(h = b[ f ]) && this.h(h, a) &&
      (h.__shady.ta != a && (d = !0), this.b(h, a), b[ f ] = void 0, e = !0);
      if (!e)for (b = a.childNodes, e = 0; e < b.length; e++)h = b[ e ], h.__shady.ta != a && (d = !0), this.b(h, a);
      if (c) {
        for (h = 0; h < c.length; h++)c[ h ].__shady.ta = null;
        a.__shady.assignedNodes.length < c.length && (d = !0);
      }
      this.i(a);
      d && this.a(a);
    };
    u.prototype.Ka = function (a, b) {
      var c = a.__shady.assignedNodes;
      if (c)for (var d = 0; d < c.length; d++) {
        var e = c[ d ];
        b && (e.__shady.ta = e.__shady.assignedSlot);
        e.__shady.assignedSlot === a && (e.__shady.assignedSlot = null);
      }
    };
    u.prototype.h = function (a, b) {
      b = (b = b.getAttribute('name')) ? b.trim() : '';
      a = (a = a.getAttribute && a.getAttribute('slot')) ? a.trim() : '';
      return a == b;
    };
    u.prototype.b = function (a, b) {
      b.__shady.assignedNodes.push(a);
      a.__shady.assignedSlot = b;
    };
    u.prototype.i = function (a) {
      var b = a.__shady.assignedNodes;
      a.__shady.R = [];
      for (var c = 0, d; c < b.length && (d = b[ c ]); c++)if (this.za(d)) {
        var e =
          d.__shady.R;
        if (e)for (var f = 0; f < e.length; f++)a.__shady.R.push(e[ f ]);
      } else a.__shady.R.push(b[ c ]);
    };
    u.prototype.a = function (a) {
      a.dispatchEvent(new Kd('slotchange'));
      a.__shady.assignedSlot && this.a(a.__shady.assignedSlot);
    };
    u.prototype.ga = function (a) {return !a.__shady.assignedSlot;};
    var Cb = {};
    t.prototype = Object.create(DocumentFragment.prototype);
    t.prototype.i = function (a) {
      this.cb = 'ShadyRoot';
      T(a);
      T(this);
      a.shadowRoot = this;
      this.host = a;
      this.ra = this.O = !1;
      this.D = new u(this);
      this.update();
    };
    t.prototype.update = function () {
      var a =
        this;
      this.O || (this.O = !0, Ib(function () {return a.Sa();}));
    };
    t.prototype.h = function () {
      for (var a = this, b = this; b;)b.O && (a = b), b = b.mb();
      return a;
    };
    t.prototype.mb = function () {
      var a = this.host.getRootNode();
      if (y(a))for (var b = this.host.childNodes, c = 0, d; c < b.length; c++)if (d = b[ c ], this.D.za(d))return a;
    };
    t.prototype.Sa = function () {this.O && this.h()._render();};
    t.prototype._render = function () {
      this.ra = this.O = !1;
      this.ca || this.f();
      this.ca = !1;
      this.wa();
      this.l();
    };
    t.prototype.wa = function () {for (var a = this.D.wa(), b = 0; b < a.length; b++)a[ b ]._render();};
    t.prototype.f = function () {
      var a = this.a;
      if (a)for (var b = 0, c; b < a.length; b++)c = a[ b ], c.getRootNode() !== this && this.D.Ka(c);
      a = this.a = this.D.sb();
      for (b = 0; b < a.length; b++)c = a[ b ], c.__shady = c.__shady || {}, T(c), T(c.parentNode);
    };
    t.prototype.l = function () {this.g();};
    t.prototype.g = function () {
      this.c(this.host, this.b(this.host));
      for (var a = this.sa(), b = 0, c = a.length, d, e; b < c && (d = a[ b ]); b++)e = d.parentNode, e !== this.host &&
      e !== this && this.c(e, this.b(e));
    };
    t.prototype.b = function (a) {
      var b = [];
      a = (a.__shady && a.__shady.root || a).childNodes;
      for (var c = 0; c < a.length; c++) {
        var d = a[ c ];
        if (this.D.za(d))for (var e = d.__shady.R || (d.__shady.R = []), f = 0; f < e.length; f++) {
          var g = e[ f ];
          this.ga(d, g) && b.push(g);
        } else b.push(d);
      }
      return b;
    };
    t.prototype.ga = function (a, b) {return this.D.ga(a, b);};
    t.prototype.c = function (a, b) {
      for (var c = aa(a), d = rd(b, b.length, c, c.length), e = 0, f = 0, g; e < d.length && (g = d[ e ]); e++) {
        for (var h = 0, k; h < g.$.length && (k = g.$[ h ]); h++)P(k) === a && V.call(a, k), c.splice(g.index + f, 1);
        f -= g.da;
      }
      for (e = 0; e < d.length && (g = d[ e ]); e++)for (f = c[ g.index ], h = g.index; h < g.index + g.da; h++)k =
        b[ h ], Qa.call(a, k, f), c.splice(h, 0, k);
    };
    t.prototype.ya = function () {return !(!this.a || !this.a.length);};
    t.prototype.sa = function () {
      this.a || this.f();
      return this.a;
    };
    (function (a) {
      L(a, La, !0);
      L(a, Ma, !0);
    })(t.prototype);
    var Ld = {
      addEventListener: function (a, b, c) {
        if (b) {
          var d, e, f;
          'object' === typeof c ? (d = !!c.capture, e = !!c.once, f = !!c.passive) : (d = !!c, f = e = !1);
          if (b.j)for (var g = 0; g < b.j.length; g++) {
            if (b.j[ g ].node === this && b.j[ g ].type === a && b.j[ g ].capture === d && b.j[ g ].once === e &&
              b.j[ g ].passive === f)return;
          } else b.j = [];
          g = function (d) {
            e &&
            this.removeEventListener(a, b, c);
            d.__target || jc(d);
            if (d.composed || -1 < d.composedPath().indexOf(this))if (d.eventPhase === Event.BUBBLING_PHASE &&
              d.target === d.relatedTarget) d.stopImmediatePropagation(); else return b(d);
          };
          b.j.push({ node: this, type: a, capture: d, once: e, passive: f, Eb: g });
          Ua[ a ] ?
            (this.C = this.C || {}, this.C[ a ] = this.C[ a ] || { capture: [], bubble: [] }, this.C[ a ][ d ?
              'capture' :
              'bubble' ].push(g)) :
            Ac.call(this, a, g, c);
        }
      },
      removeEventListener: function (a, b, c) {
        if (b) {
          var d, e, f;
          'object' === typeof c ? (d = !!c.capture, e = !!c.once,
            f = !!c.passive) : (d = !!c, f = e = !1);
          var g = void 0;
          if (b.j)for (var h = 0; h < b.j.length; h++)if (b.j[ h ].node === this && b.j[ h ].type === a &&
            b.j[ h ].capture === d && b.j[ h ].once === e && b.j[ h ].passive === f) {
            g = b.j.splice(h, 1)[ 0 ].Eb;
            b.j.length || (b.j = void 0);
            break;
          }
          Bc.call(this, a, g || b, c);
          g && Ua[ a ] && this.C && this.C[ a ] &&
          (a = this.C[ a ][ d ? 'capture' : 'bubble' ], g = a.indexOf(g), -1 < g && a.splice(g, 1));
        }
      },
      appendChild: function (a) {return ec(this, a);},
      insertBefore: function (a, b) {return ec(this, a, b);},
      removeChild: function (a) {
        if (a.parentNode !== this)throw Error('The node to be removed is not a child of this node: ' +
          a);
        if (!Xb(a)) {
          var b = y(this) ? this.host : this, c = P(a);
          b === c && V.call(b, a);
        }
        Oa(this, null, a);
        return a;
      },
      replaceChild: function (a, b) {
        this.insertBefore(a, b);
        this.removeChild(b);
        return a;
      },
      cloneNode: function (a) {
        var b;
        if ('template' == this.localName) b = cb.call(this, a); else if (b = cb.call(this, !1), a) {
          a = this.childNodes;
          for (var c = 0, d; c < a.length; c++)d = a[ c ].cloneNode(!0), b.appendChild(d);
        }
        return b;
      },
      getRootNode: function () {return Pa(this);},
      get isConnected () {
        var a = this.ownerDocument;
        if (a && a.contains && a.contains(this) || (a = a.documentElement) &&
          a.contains && a.contains(this))return !0;
        for (a = this; a && !(a instanceof Document);)a = a.parentNode || (a instanceof t ? a.host : void 0);
        return !!(a && a instanceof Document);
      }
    }, Md = { get assignedSlot () {return lc(this);} }, fb = {
      querySelector: function (a) {
        return bc(this, function (b) {return xc.call(b, a);}, function (a) {return !!a;})[ 0 ] || null;
      }, querySelectorAll: function (a) {return bc(this, function (b) {return xc.call(b, a);});}
    }, Dc = {
      assignedNodes: function (a) {
        if ('slot' === this.localName)return dc(this), this.__shady ? (a && a.flatten ? this.__shady.R :
            this.__shady.assignedNodes) || [] : [];
      }
    }, Ec = Fb({
        setAttribute: function (a, b) {
          ra || (ra = window.ShadyCSS && window.ShadyCSS.ScopingShim);
          ra && 'class' === a ? ra.setElementClass(this, b) : (yc.call(this, a, b), ac(this, a));
        },
        removeAttribute: function (a) {
          zc.call(this, a);
          ac(this, a);
        },
        attachShadow: function (a) {
          if (!this)throw'Must provide a host.';
          if (!a)throw'Not enough arguments.';
          return new t(Cb, this);
        },
        get slot () {return this.getAttribute('slot');},
        set slot (a) {this.setAttribute('slot', a);},
        get assignedSlot () {return lc(this);}
      }, fb,
      Dc);
    Object.defineProperties(Ec, Cc);
    var Fc = Fb({ importNode: function (a, b) {return gc(a, b);} }, fb);
    Object.defineProperties(Fc, { _activeElement: Ma.activeElement });
    B.Oa && (window.ShadyDOM = {
      inUse: B.Oa,
      patch: function (a) {return a;},
      isShadyRoot: y,
      enqueue: Ib,
      flush: Ja,
      settings: B,
      filterMutations: kd,
      observeChildren: id,
      unobserveChildren: hd,
      nativeMethods: Ed,
      nativeTree: Fd
    }, window.Event = Hd, window.CustomEvent = Id, window.MouseEvent = Jd, qd(), W(window.Node.prototype, Ld), W(window.Text.prototype, Md), W(window.DocumentFragment.prototype,
      fb), W(window.Element.prototype, Ec), W(window.Document.prototype, Fc), window.HTMLSlotElement &&
    W(window.HTMLSlotElement.prototype, Dc), B.Y &&
    (Q(window.Node.prototype), Q(window.Text.prototype), Q(window.DocumentFragment.prototype), Q(window.Element.prototype), Q((window.customElements &&
    window.customElements.nativeHTMLElement ||
    HTMLElement).prototype), Q(window.Document.prototype), window.HTMLSlotElement &&
    Q(window.HTMLSlotElement.prototype)), window.ShadowRoot = t);
    var td = new Set('annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph'.split(' '));
    A.prototype.M = function (a, b) {
      this.u.set(a, b);
      this.s.set(b.constructor, b);
    };
    A.prototype.f = function (a) {return this.u.get(a);};
    A.prototype.L = function (a) {return this.s.get(a);};
    A.prototype.v = function (a) {
      this.h = !0;
      this.i.push(a);
    };
    A.prototype.l = function (a) {
      var b = this;
      this.h && O(a, function (a) {return b.g(a);});
    };
    A.prototype.g = function (a) {
      if (this.h && !a.__CE_patched) {
        a.__CE_patched = !0;
        for (var b = 0; b < this.i.length; b++)this.i[ b ](a);
      }
    };
    A.prototype.b = function (a) {
      var b = [];
      O(a, function (a) {return b.push(a);});
      for (a = 0; a < b.length; a++) {
        var c =
          b[ a ];
        1 === c.__CE_state ? this.connectedCallback(c) : this.B(c);
      }
    };
    A.prototype.a = function (a) {
      var b = [];
      O(a, function (a) {return b.push(a);});
      for (a = 0; a < b.length; a++) {
        var c = b[ a ];
        1 === c.__CE_state && this.disconnectedCallback(c);
      }
    };
    A.prototype.c = function (a, b) {
      b = b ? b : new Set;
      var c = this, d = [];
      O(a, function (a) {
        if ('link' === a.localName && 'import' === a.getAttribute('rel')) {
          var e = a.import;
          e instanceof Node && 'complete' === e.readyState ?
            (e.__CE_isImportDocument = !0, e.__CE_hasRegistry = !0) :
            a.addEventListener('load', function () {
              var d =
                a.import;
              d.__CE_documentLoadHandled ||
              (d.__CE_documentLoadHandled = !0, d.__CE_isImportDocument = !0, d.__CE_hasRegistry = !0, new Set(b), b.delete(d), c.c(d, b));
            });
        } else d.push(a);
      }, b);
      if (this.h)for (a = 0; a < d.length; a++)this.g(d[ a ]);
      for (a = 0; a < d.length; a++)this.B(d[ a ]);
    };
    A.prototype.B = function (a) {
      if (void 0 === a.__CE_state) {
        var b = this.f(a.localName);
        if (b) {
          b.constructionStack.push(a);
          var c = b.constructor;
          try {
            try {
              if (new c !== a)throw Error('The custom element constructor did not produce the element being upgraded.');
            } finally {b.constructionStack.pop();}
          } catch (f) {
            throw a.__CE_state =
              2, f;
          }
          a.__CE_state = 1;
          a.__CE_definition = b;
          if (b.attributeChangedCallback)for (b = b.observedAttributes, c = 0; c < b.length; c++) {
            var d = b[ c ], e = a.getAttribute(d);
            null !== e && this.attributeChangedCallback(a, d, null, e, null);
          }
          m(a) && this.connectedCallback(a);
        }
      }
    };
    A.prototype.connectedCallback = function (a) {
      var b = a.__CE_definition;
      b.connectedCallback && b.connectedCallback.call(a);
    };
    A.prototype.disconnectedCallback = function (a) {
      var b = a.__CE_definition;
      b.disconnectedCallback && b.disconnectedCallback.call(a);
    };
    A.prototype.attributeChangedCallback =
      function (a, b, c, d, e) {
        var f = a.__CE_definition;
        f.attributeChangedCallback && -1 < f.observedAttributes.indexOf(b) &&
        f.attributeChangedCallback.call(a, b, c, d, e);
      };
    Ca.prototype.c = function () {this.N && this.N.disconnect();};
    Ca.prototype.f = function (a) {
      var b = this.a.readyState;
      'interactive' !== b && 'complete' !== b || this.c();
      for (b = 0; b < a.length; b++)for (var c = a[ b ].addedNodes, d = 0; d < c.length; d++)this.b.c(c[ d ]);
    };
    Bb.prototype.resolve = function (a) {
      if (this.a)throw Error('Already resolved.');
      this.a = a;
      this.b && this.b(a);
    };
    r.prototype.i =
      function (a, b) {
        var c = this;
        if (!(b instanceof Function))throw new TypeError('Custom element constructors must be functions.');
        if (!mc(a))throw new SyntaxError('The element name \'' + a + '\' is not valid.');
        if (this.a.f(a))throw Error('A custom element with name \'' + a + '\' has already been defined.');
        if (this.f)throw Error('A custom element is already being defined.');
        this.f = !0;
        var d, e, f, g, h;
        try {
          var k = function (a) {
            var b = m[ a ];
            if (void 0 !== b && !(b instanceof Function))throw Error('The \'' + a + '\' callback must be a function.');
            return b;
          }, m = b.prototype;
          if (!(m instanceof
            Object))throw new TypeError('The custom element constructor\'s prototype is not an object.');
          d = k('connectedCallback');
          e = k('disconnectedCallback');
          f = k('adoptedCallback');
          g = k('attributeChangedCallback');
          h = b.observedAttributes || [];
        } catch (q) {return;} finally {this.f = !1;}
        this.a.M(a, {
          localName: a,
          constructor: b,
          connectedCallback: d,
          disconnectedCallback: e,
          adoptedCallback: f,
          attributeChangedCallback: g,
          observedAttributes: h,
          constructionStack: []
        });
        this.c.push(a);
        this.b || (this.b =
          !0, this.g(function () {return c.s();}));
      };
    r.prototype.s = function () {
      if (!1 !== this.b)for (this.b = !1, this.a.c(document); 0 < this.c.length;) {
        var a = this.c.shift();
        (a = this.h.get(a)) && a.resolve(void 0);
      }
    };
    r.prototype.get = function (a) {if (a = this.a.f(a))return a.constructor;};
    r.prototype.v = function (a) {
      if (!mc(a))return Promise.reject(new SyntaxError('\'' + a + '\' is not a valid custom element name.'));
      var b = this.h.get(a);
      if (b)return b.c;
      b = new Bb;
      this.h.set(a, b);
      this.a.f(a) && -1 === this.c.indexOf(a) && b.resolve(void 0);
      return b.c;
    };
    r.prototype.u = function (a) {
      this.l.c();
      var b = this.g;
      this.g = function (c) {return a(function () {return b(c);});};
    };
    window.CustomElementRegistry = r;
    r.prototype.define = r.prototype.i;
    r.prototype.get = r.prototype.get;
    r.prototype.whenDefined = r.prototype.v;
    r.prototype.polyfillWrapFlushCallback = r.prototype.u;
    var ya = window.Document.prototype.createElement, cd = window.Document.prototype.createElementNS,
      bd = window.Document.prototype.importNode, dd = window.Document.prototype.prepend,
      ed = window.Document.prototype.append, qb = window.Node.prototype.cloneNode,
      ja = window.Node.prototype.appendChild, yb = window.Node.prototype.insertBefore,
      za = window.Node.prototype.removeChild, zb = window.Node.prototype.replaceChild,
      Ba = Object.getOwnPropertyDescriptor(window.Node.prototype, 'textContent'),
      pb = window.Element.prototype.attachShadow,
      wa = Object.getOwnPropertyDescriptor(window.Element.prototype, 'innerHTML'),
      Aa = window.Element.prototype.getAttribute, rb = window.Element.prototype.setAttribute,
      tb = window.Element.prototype.removeAttribute, ka = window.Element.prototype.getAttributeNS,
      sb = window.Element.prototype.setAttributeNS, ub = window.Element.prototype.removeAttributeNS,
      wb = window.Element.prototype.insertAdjacentElement, Tc = window.Element.prototype.prepend,
      Uc = window.Element.prototype.append, Wc = window.Element.prototype.before, Xc = window.Element.prototype.after,
      Yc = window.Element.prototype.replaceWith, Zc = window.Element.prototype.remove, gd = window.HTMLElement,
      xa = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'innerHTML'),
      vb = window.HTMLElement.prototype.insertAdjacentElement,
      Ab = new function () {}, sa = window.customElements;
    if (!sa || sa.forcePolyfill || 'function' != typeof sa.define || 'function' != typeof sa.get) {
      var fa = new A;
      fd(fa);
      ad(fa);
      $c(fa);
      Sc(fa);
      document.__CE_hasRegistry = !0;
      var Nd = new r(fa);
      Object.defineProperty(window, 'customElements', { configurable: !0, enumerable: !0, value: Nd });
    }
    var F = { STYLE_RULE: 1, na: 7, MEDIA_RULE: 4, Da: 1E3 }, M = {
        qb: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
        port: /@import[^;]*;/gim,
        La: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,
        Pa: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,
        xb: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,
        Db: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
        wb: /^@[^\s]*keyframes/,
        Qa: /\s+/g
      }, v = !(window.ShadyDOM && window.ShadyDOM.inUse),
      C = !navigator.userAgent.match('AppleWebKit/601') && window.CSS && CSS.supports &&
        CSS.supports('box-shadow', '0 0 0 var(--foo)');
    window.ShadyCSS ? pc(window.ShadyCSS) : window.WebComponents && pc(window.WebComponents.flags);
    var Gc = /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:([^;{]*)|{([^}]*)})(?:(?=[;\s}])|$)/gi,
      Hc = /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi,
      Od = /(--[\w-]+)\s*([:,;)]|$)/gi, Pd = /(animation\s*:)|(animation-name\s*:)/, vd = /@media[^(]*(\([^)]*\))/,
      Qd = /\{[^}]*\}/g, R = null;
    p.prototype.g = function (a, b, c) {a.__styleScoped ? a.__styleScoped = null : this.i(a, b || '', c);};
    p.prototype.i = function (a, b, c) {
      a.nodeType === Node.ELEMENT_NODE && this.B(a, b, c);
      if (a = 'template' === a.localName ?
          (a.content || a.Hb).childNodes :
          a.children || a.childNodes)for (var d = 0; d < a.length; d++)this.i(a[ d ], b, c);
    };
    p.prototype.B = function (a, b, c) {
      if (b)if (a.classList) c ?
        (a.classList.remove('style-scope'),
          a.classList.remove(b)) :
        (a.classList.add('style-scope'), a.classList.add(b)); else if (a.getAttribute) {
        var d = a.getAttribute(Rd);
        c ?
          d && (b = d.replace('style-scope', '').replace(b, ''), oa(a, b)) :
          oa(a, (d ? d + ' ' : '') + 'style-scope ' + b);
      }
    };
    p.prototype.b = function (a, b, c) {
      var d = a.__cssBuild;
      v || 'shady' === d ? b = X(b, c) : (a = S(a), b = this.U(b, a.is, a.aa, c) + '\n\n');
      return b.trim();
    };
    p.prototype.U = function (a, b, c, d) {
      var e = this.c(b, c);
      b = this.h(b);
      var f = this;
      return X(a, function (a) {
        a.c || (f.W(a, b, e), a.c = !0);
        d && d(a, b, e);
      });
    };
    p.prototype.h =
      function (a) {return a ? Sd + a : '';};
    p.prototype.c = function (a, b) {return b ? '[is=' + a + ']' : a;};
    p.prototype.W = function (a, b, c) {this.l(a, this.f, b, c);};
    p.prototype.l = function (a, b, c, d) {a.selector = a.F = this.s(a, b, c, d);};
    p.prototype.s = function (a, b, c, d) {
      var e = a.selector.split(Ic);
      if (!qc(a)) {
        a = 0;
        for (var f = e.length, g; a < f && (g = e[ a ]); a++)e[ a ] = b.call(this, g, c, d);
      }
      return e.join(Ic);
    };
    p.prototype.f = function (a, b, c) {
      var d = this, e = !1;
      a = a.trim();
      a = a.replace(Td, function (a, b, c) {return ':' + b + '(' + c.replace(/\s/g, '') + ')';});
      a = a.replace(Ud, gb +
        ' $1');
      return a = a.replace(Vd, function (a, g, h) {
        e || (a = d.L(h, g, b, c), e = e || a.stop, g = a.pb, h = a.value);
        return g + h;
      });
    };
    p.prototype.L = function (a, b, c, d) {
      var e = a.indexOf(hb);
      0 <= a.indexOf(gb) ? a = this.T(a, d) : 0 !== e && (a = c ? this.u(a, c) : a);
      c = !1;
      0 <= e && (b = '', c = !0);
      var f;
      c && (f = !0, c && (a = a.replace(Wd, function (a, b) {return ' > ' + b;})));
      a = a.replace(Xd, function (a, b, c) {return '[dir="' + c + '"] ' + b + ', ' + b + '[dir="' + c + '"]';});
      return { value: a, pb: b, stop: f };
    };
    p.prototype.u = function (a, b) {
      a = a.split(Jc);
      a[ 0 ] += b;
      return a.join(Jc);
    };
    p.prototype.T = function (a,
                              b) {
      var c = a.match(Kc);
      return (c = c && c[ 2 ].trim() || '') ?
        c[ 0 ].match(Lc) ?
          a.replace(Kc, function (a, c, f) {return b + f;}) :
          c.split(Lc)[ 0 ] === b ?
            c :
            Yd :
        a.replace(gb, b);
    };
    p.prototype.V = function (a) {
      a.selector = a.parsedSelector;
      this.v(a);
      this.l(a, this.M);
    };
    p.prototype.v = function (a) {a.selector === Zd && (a.selector = 'html');};
    p.prototype.M = function (a) {return a.match(hb) ? this.f(a, Mc) : this.u(a.trim(), Mc);};
    mb.Object.defineProperties(p.prototype, {
      a: {
        configurable: !0,
        enumerable: !0,
        get: function () {return 'style-scope';}
      }
    });
    var Td = /:(nth[-\w]+)\(([^)]+)\)/,
      Mc = ':not(.style-scope)', Ic = ',', Vd = /(^|[\s>+~]+)((?:\[.+?\]|[^\s>+~=\[])+)/g, Lc = /[[.:#*]/, gb = ':host',
      Zd = ':root', hb = '::slotted', Ud = new RegExp('^(' + hb + ')'), Kc = /(:host)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/,
      Wd = /(?:::slotted)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/, Xd = /(.*):dir\((?:(ltr|rtl))\)/, Sd = '.', Jc = ':',
      Rd = 'class', Yd = 'should_not_match', w = new p;
    x.get = function (a) {return a ? a.__styleInfo : null;};
    x.set = function (a, b) {return a.__styleInfo = b;};
    x.prototype.c = function () {return this.I;};
    x.prototype._getStyleRules = x.prototype.c;
    var Nc = function (a) {
      return a.matches || a.matchesSelector || a.mozMatchesSelector || a.msMatchesSelector || a.oMatchesSelector ||
        a.webkitMatchesSelector;
    }(window.Element.prototype), $d = navigator.userAgent.match('Trident');
    n.prototype.W = function (a) {
      var b = this, c = {}, d = [], e = 0;
      Y(a, function (a) {
        b.c(a);
        a.index = e++;
        b.V(a.w.cssText, c);
      }, function (a) {d.push(a);});
      a.b = d;
      a = [];
      for (var f in c)a.push(f);
      return a;
    };
    n.prototype.c = function (a) {
      if (!a.w) {
        var b = {}, c = {};
        this.b(a, c) && (b.H = c, a.rules = null);
        b.cssText = this.U(a);
        a.w = b;
      }
    };
    n.prototype.b =
      function (a, b) {
        var c = a.w;
        if (c) {if (c.H)return Object.assign(b, c.H), !0;} else {
          for (var c = a.parsedCssText, d; a = Gc.exec(c);) {
            d = (a[ 2 ] || a[ 3 ]).trim();
            if ('inherit' !== d || 'unset' !== d) b[ a[ 1 ].trim() ] = d;
            d = !0;
          }
          return d;
        }
      };
    n.prototype.U = function (a) {return this.T(a.parsedCssText);};
    n.prototype.T = function (a) {return a.replace(Qd, '').replace(Gc, '');};
    n.prototype.V = function (a, b) {
      for (var c; c = Od.exec(a);) {
        var d = c[ 1 ];
        ':' !== c[ 2 ] && (b[ d ] = !0);
      }
    };
    n.prototype.ka = function (a) {
      for (var b = Object.getOwnPropertyNames(a), c = 0, d; c < b.length; c++)d =
        b[ c ], a[ d ] = this.a(a[ d ], a);
    };
    n.prototype.a = function (a, b) {
      if (a)if (0 <= a.indexOf(';')) a = this.f(a, b); else {
        var c = this;
        a = sc(a, function (a, e, f, g) {
          if (!e)return a + g;
          (e = c.a(b[ e ], b)) && 'initial' !== e ?
            'apply-shim-inherit' === e && (e = 'inherit') :
            e = c.a(b[ f ] || f, b) || f;
          return a + (e || '') + g;
        });
      }
      return a && a.trim() || '';
    };
    n.prototype.f = function (a, b) {
      a = a.split(';');
      for (var c = 0, d, e; c < a.length; c++)if (d = a[ c ]) {
        Hc.lastIndex = 0;
        if (e = Hc.exec(d)) d = this.a(b[ e[ 1 ] ], b); else if (e = d.indexOf(':'), -1 !== e) {
          var f = d.substring(e), f = f.trim(), f = this.a(f, b) ||
            f;
          d = d.substring(0, e) + f;
        }
        a[ c ] = d && d.lastIndexOf(';') === d.length - 1 ? d.slice(0, -1) : d || '';
      }
      return a.join(';');
    };
    n.prototype.M = function (a, b) {
      var c = '';
      a.w || this.c(a);
      a.w.cssText && (c = this.f(a.w.cssText, b));
      a.cssText = c;
    };
    n.prototype.L = function (a, b) {
      var c = a.cssText, d = a.cssText;
      null == a.Na && (a.Na = Pd.test(c));
      if (a.Na)if (null == a.ha) {
        a.ha = [];
        for (var e in b)d = b[ e ], d = d(c), c !== d && (c = d, a.ha.push(e));
      } else {
        for (e = 0; e < a.ha.length; ++e)d = b[ a.ha[ e ] ], c = d(c);
        d = c;
      }
      a.cssText = d;
    };
    n.prototype.ja = function (a, b) {
      var c = {}, d = this, e = [];
      Y(a,
        function (a) {
          a.w || d.c(a);
          var f = a.F || a.parsedSelector;
          b && a.w.H && f && Nc.call(b, f) &&
          (d.b(a, c), a = a.index, f = parseInt(a / 32, 10), e[ f ] = (e[ f ] || 0) | 1 << a % 32);
        }, null, !0);
      return { H: c, key: e };
    };
    n.prototype.ma = function (a, b, c, d) {
      b.w || this.c(b);
      if (b.w.H) {
        var e = S(a);
        a = e.is;
        var e = e.aa, e = a ? w.c(a, e) : 'html', f = b.parsedSelector, g = ':host > *' === f || 'html' === f,
          h = 0 === f.indexOf(':host') && !g;
        'shady' === c && (g = f === e + ' > *.' + e || -1 !== f.indexOf('html'), h = !g && 0 === f.indexOf(e));
        'shadow' === c && (g = ':host > *' === f || 'html' === f, h = h && !g);
        if (g || h) c =
          e, h && (v && !b.F && (b.F = w.s(b, w.f, w.h(a), e)), c = b.F || e), d({ Cb: c, vb: h, Lb: g });
      }
    };
    n.prototype.ia = function (a, b) {
      var c = {}, d = {}, e = this, f = b && b.__cssBuild;
      Y(b, function (b) {
        e.ma(a, b, f, function (f) {
          Nc.call(a.Ib || a, f.Cb) && (f.vb ? e.b(b, c) : e.b(b, d));
        });
      }, null, !0);
      return { Ab: d, ub: c };
    };
    n.prototype.la = function (a, b, c) {
      var d = this, e = S(a), f = w.c(e.is, e.aa),
        g = new RegExp('(?:^|[^.#[:])' + (a.extends ? '\\' + f.slice(0, -1) + '\\]' : f) + '($|[.:[\\s>+~])'),
        e = x.get(a).I, h = this.h(e, c);
      return w.b(a, e, function (a) {
        d.M(a, b);
        v || qc(a) || !a.cssText || (d.L(a,
          h), d.s(a, g, f, c));
      });
    };
    n.prototype.h = function (a, b) {
      a = a.b;
      var c = {};
      if (!v && a)for (var d = 0, e = a[ d ]; d < a.length; e = a[ ++d ])this.l(e, b), c[ e.keyframesName ] = this.i(e);
      return c;
    };
    n.prototype.i = function (a) {return function (b) {return b.replace(a.f, a.a);};};
    n.prototype.l = function (a, b) {
      a.f = new RegExp(a.keyframesName, 'g');
      a.a = a.keyframesName + '-' + b;
      a.F = a.F || a.selector;
      a.selector = a.F.replace(a.keyframesName, a.a);
    };
    n.prototype.s = function (a, b, c, d) {
      a.F = a.F || a.selector;
      d = '.' + d;
      for (var e = a.F.split(','), f = 0, g = e.length, h; f < g && (h = e[ f ]); f++)e[ f ] =
        h.match(b) ? h.replace(c, d) : d + ' ' + h;
      a.selector = e.join(',');
    };
    n.prototype.v = function (a, b, c) {
      var d = a.getAttribute('class') || '', e = d;
      c && (e = d.replace(new RegExp('\\s*x-scope\\s*' + c + '\\s*', 'g'), ' '));
      e += (e ? ' ' : '') + 'x-scope ' + b;
      d !== e && oa(a, e);
    };
    n.prototype.B = function (a, b, c, d) {
      b = d ? d.textContent || '' : this.la(a, b, c);
      var e = x.get(a), f = e.a;
      f && !v && f !== d && (f._useCount--, 0 >= f._useCount && f.parentNode && f.parentNode.removeChild(f));
      v ?
        e.a ?
          (e.a.textContent = b, d = e.a) :
          b && (d = Xa(b, c, a.shadowRoot, e.b)) :
        d ?
          d.parentNode || rc(d, null,
            e.b) :
          b && (d = Xa(b, c, null, e.b));
      d && (d._useCount = d._useCount || 0, e.a != d && d._useCount++, e.a = d);
      $d && (d.textContent = d.textContent);
      return d;
    };
    n.prototype.u = function (a, b) {
      var c = na(a), d = this;
      a.textContent = X(c, function (a) {
        var c = a.cssText = a.parsedCssText;
        a.w && a.w.cssText && (c = c.replace(M.La, '').replace(M.Pa, ''), a.cssText = d.f(c, b));
      });
    };
    mb.Object.defineProperties(n.prototype, {
      g: {
        configurable: !0,
        enumerable: !0,
        get: function () {return 'x-scope';}
      }
    });
    var H = new n, ib = {}, ta = window.customElements;
    if (ta && !v) {
      var ae = ta.define;
      ta.define = function (a, b, c) {
        var d = document.createComment(' Shady DOM styles for ' + a + ' '), e = document.head;
        e.insertBefore(d, (R ? R.nextSibling : null) || e.firstChild);
        R = d;
        ib[ a ] = d;
        return ae.call(ta, a, b, c);
      };
    }
    ha.prototype.b = function (a, b, c) {
      for (var d = 0; d < c.length; d++) {
        var e = c[ d ];
        if (a.H[ e ] !== b[ e ])return !1;
      }
      return !0;
    };
    ha.prototype.c = function (a, b, c, d) {
      var e = this.cache[ a ] || [];
      e.push({ H: b, styleElement: c, G: d });
      e.length > this.f && e.shift();
      this.cache[ a ] = e;
    };
    ha.prototype.a = function (a, b, c) {
      if (a = this.cache[ a ])for (var d = a.length -
        1; 0 <= d; d--) {
        var e = a[ d ];
        if (this.b(e, b, c))return e;
      }
    };
    if (!v) {
      var Oc = function (a) {
        for (var b = 0; b < a.length; b++) {
          var c = a[ b ];
          if (c.target !== document.documentElement && c.target !== document.head) {
            for (var d = 0; d < c.addedNodes.length; d++) {
              var e = c.addedNodes[ d ];
              if (e.classList && !e.classList.contains(w.a) || e instanceof window.SVGElement &&
                (!e.hasAttribute('class') || 0 > e.getAttribute('class').indexOf(w.a))) {
                var f = e.getRootNode();
                f.nodeType === Node.DOCUMENT_FRAGMENT_NODE && (f = f.host) && (f = S(f).is, w.g(e, f));
              }
            }
            for (d = 0; d < c.removedNodes.length; d++)if (e =
                c.removedNodes[ d ], e.nodeType === Node.ELEMENT_NODE && (f = void 0, e.classList ?
                f = Array.from(e.classList) :
                e.hasAttribute('class') && (f = e.getAttribute('class').split(/\s+/)), f)) {
              var g = f.indexOf(w.a);
              0 <= g && (f = f[ g + 1 ]) && w.g(e, f, !0);
            }
          }
        }
      }, Pc = new MutationObserver(Oc), Qc = function (a) {Pc.observe(a, { childList: !0, subtree: !0 });};
      if (window.customElements && !window.customElements.flush) Qc(document); else {
        var jb = function () {Qc(document.body);};
        window.HTMLImports ? window.HTMLImports.whenReady(jb) : requestAnimationFrame(function () {
          if ('loading' ===
            document.readyState) {
            var a = function () {
              jb();
              document.removeEventListener('readystatechange', a);
            };
            document.addEventListener('readystatechange', a);
          } else jb();
        });
      }
      ob = function () {Oc(Pc.takeRecords());};
    }
    var pa = {}, yd = Promise.resolve(), Ya = null, tc = window.HTMLImports && window.HTMLImports.whenReady || null, Za,
      ua = null, ga = null;
    J.prototype.Ma = function () {!this.enqueued && ga && (this.enqueued = !0, nb(ga));};
    J.prototype.b = function (a) {
      a.__seenByShadyCSS || (a.__seenByShadyCSS = !0, this.customStyles.push(a), this.Ma());
    };
    J.prototype.a =
      function (a) {return a.__shadyCSSCachedStyle ? a.__shadyCSSCachedStyle : a.getStyle ? a.getStyle() : a;};
    J.prototype.c = function () {
      for (var a = this.customStyles, b = 0; b < a.length; b++) {
        var c = a[ b ];
        if (!c.__shadyCSSCachedStyle) {
          var d = this.a(c);
          if (d) {
            var e = d.__appliedElement;
            if (e)for (var f = 0; f < d.attributes.length; f++) {
              var g = d.attributes[ f ];
              e.setAttribute(g.name, g.value);
            }
            d = e || d;
            ua && ua(d);
            c.__shadyCSSCachedStyle = d;
          }
        }
      }
      return a;
    };
    J.prototype.addCustomStyle = J.prototype.b;
    J.prototype.getStyleForCustomStyle = J.prototype.a;
    J.prototype.processStyles =
      J.prototype.c;
    Object.defineProperties(J.prototype, {
      transformCallback: {
        get: function () {return ua;},
        set: function (a) {ua = a;}
      }, validateCallback: {
        get: function () {return ga;}, set: function (a) {
          var b = !1;
          ga || (b = !0);
          ga = a;
          b && this.Ma();
        }
      }
    });
    var Rc = new ha;
    k.prototype.L = function () {ob();};
    k.prototype.ia = function (a) {
      var b = this.u[ a ] = (this.u[ a ] || 0) + 1;
      return a + '-' + b;
    };
    k.prototype.Ya = function (a) {return na(a);};
    k.prototype.$a = function (a) {return X(a);};
    k.prototype.W = function (a) {
      a = a.content.querySelectorAll('style');
      for (var b = [], c =
        0; c < a.length; c++) {
        var d = a[ c ];
        b.push(d.textContent);
        d.parentNode.removeChild(d);
      }
      return b.join('').trim();
    };
    k.prototype.ka = function (a) {
      return (a = a.content.querySelector('style')) ?
        a.getAttribute('css-build') || '' :
        '';
    };
    k.prototype.prepareTemplate = function (a, b, c) {
      if (!a.f) {
        a.f = !0;
        a.name = b;
        a.extends = c;
        pa[ b ] = a;
        var d = this.ka(a), e = this.W(a);
        c = { is: b, extends: c, Fb: d };
        v || w.g(a.content, b);
        this.c();
        var f = this.b.detectMixin(e), e = Wa(e);
        f && C && this.b.transformRules(e, b);
        a._styleAst = e;
        a.g = d;
        d = [];
        C || (d = H.W(a._styleAst));
        if (!d.length ||
          C) b = this.ja(c, a._styleAst, v ? a.content : null, ib[ b ]), a.b = b;
        a.c = d;
      }
    };
    k.prototype.ja = function (a, b, c, d) {
      b = w.b(a, b);
      if (b.length)return Xa(b, a.is, c, d);
    };
    k.prototype.ma = function (a) {
      var b = S(a), c = b.is, b = b.aa, d = ib[ c ], c = pa[ c ], e, f;
      c && (e = c._styleAst, f = c.c);
      return x.set(a, new x(e, d, f, 0, b));
    };
    k.prototype.U = function () {
      if (!this.b)if (window.ShadyCSS.ApplyShim) this.b = window.ShadyCSS.ApplyShim, this.b.invalidCallback = wd; else {
        var a = {};
        this.b = (a.detectMixin = function () {return !1;}, a.transformRule = function () {}, a.transformRules =
          function () {}, a);
      }
    };
    k.prototype.V = function () {
      var a = this;
      if (!this.a)if (window.ShadyCSS.CustomStyleInterface) this.a = window.ShadyCSS.CustomStyleInterface, this.a.transformCallback = function (b) {a.B(b);}, this.a.validateCallback = function () {
        requestAnimationFrame(function () {
          (a.a.enqueued || a.i) && a.f();
        });
      }; else {
        var b = {};
        this.a = (b.processStyles = function () {}, b.enqueued = !1, b.getStyleForCustomStyle = function () {return null;}, b);
      }
    };
    k.prototype.c = function () {
      this.U();
      this.V();
    };
    k.prototype.f = function () {
      this.c();
      var a = this.a.processStyles();
      this.a.enqueued &&
      (C ? this.Wa(a) : (this.v(this.g, this.h), this.M(a)), this.a.enqueued = !1, this.i && !C &&
      this.styleDocument());
    };
    k.prototype.styleElement = function (a, b) {
      var c = S(a).is, d = x.get(a);
      d || (d = this.ma(a));
      this.l(a) || (this.i = !0);
      b && (d.S = d.S || {}, Object.assign(d.S, b));
      if (C) {
        if (d.S) {
          b = d.S;
          for (var e in b)null === e ? a.style.removeProperty(e) : a.style.setProperty(e, b[ e ]);
        }
        ((e = pa[ c ]) || this.l(a)) && e && e.b && e._applyShimInvalid &&
        (e.a || (this.c(), this.b.transformRules(e._styleAst, c), e.b.textContent = w.b(a, d.I), xd(e)), v &&
        (c = a.shadowRoot) && (c.querySelector('style').textContent = w.b(a, d.I)), d.I = e._styleAst);
      } else this.v(a, d), d.Aa && d.Aa.length && this.T(a, d);
    };
    k.prototype.s = function (a) {return (a = a.getRootNode().host) ? x.get(a) ? a : this.s(a) : this.g;};
    k.prototype.l = function (a) {return a === this.g;};
    k.prototype.T = function (a, b) {
      var c = S(a).is, d = Rc.a(c, b.K, b.Aa), e = d ? d.styleElement : null, f = b.G;
      b.G = d && d.G || this.ia(c);
      e = H.B(a, b.K, b.G, e);
      v || H.v(a, b.G, f);
      d || Rc.c(c, b.K, e, b.G);
    };
    k.prototype.v = function (a, b) {
      var c = this.s(a), d = x.get(c), c = Object.create(d.K ||
        null), e = H.ia(a, b.I);
      a = H.ja(d.I, a).H;
      Object.assign(c, e.ub, a, e.Ab);
      this.la(c, b.S);
      H.ka(c);
      b.K = c;
    };
    k.prototype.la = function (a, b) {
      for (var c in b) {
        var d = b[ c ];
        if (d || 0 === d) a[ c ] = d;
      }
    };
    k.prototype.styleDocument = function (a) {this.styleSubtree(this.g, a);};
    k.prototype.styleSubtree = function (a, b) {
      var c = a.shadowRoot;
      (c || this.l(a)) && this.styleElement(a, b);
      if (b = c && (c.children || c.childNodes))for (a = 0; a <
      b.length; a++)this.styleSubtree(b[ a ]); else if (a = a.children || a.childNodes)for (b = 0; b <
      a.length; b++)this.styleSubtree(a[ b ]);
    };
    k.prototype.Wa = function (a) {
      for (var b = 0; b < a.length; b++) {
        var c = this.a.getStyleForCustomStyle(a[ b ]);
        c && this.Va(c);
      }
    };
    k.prototype.M = function (a) {
      for (var b = 0; b < a.length; b++) {
        var c = this.a.getStyleForCustomStyle(a[ b ]);
        c && H.u(c, this.h.K);
      }
    };
    k.prototype.B = function (a) {
      var b = this, c = na(a);
      Y(c, function (a) {
        v ? w.v(a) : w.V(a);
        C && (b.c(), b.b.transformRule(a));
      });
      C ? a.textContent = X(c) : this.h.I.rules.push(c);
    };
    k.prototype.Va = function (a) {
      if (C) {
        var b = na(a);
        this.c();
        this.b.transformRules(b);
        a.textContent = X(b);
      }
    };
    k.prototype.getComputedStyleValue =
      function (a, b) {
        var c;
        C || (c = (x.get(a) || x.get(this.s(a))).K[ b ]);
        return (c = c || window.getComputedStyle(a).getPropertyValue(b)) ? c.trim() : '';
      };
    k.prototype.Za = function (a, b) {
      var c = a.getRootNode();
      b = b ? b.split(/\s/) : [];
      c = c.host && c.host.localName;
      if (!c) {
        var d = a.getAttribute('class');
        if (d)for (var d = d.split(/\s/), e = 0; e < d.length; e++)if (d[ e ] === w.a) {
          c = d[ e + 1 ];
          break;
        }
      }
      c && b.push(w.a, c);
      C || (c = x.get(a)) && c.G && b.push(H.g, c.G);
      oa(a, b.join(' '));
    };
    k.prototype.Xa = function (a) {return x.get(a);};
    k.prototype.flush = k.prototype.L;
    k.prototype.prepareTemplate =
      k.prototype.prepareTemplate;
    k.prototype.styleElement = k.prototype.styleElement;
    k.prototype.styleDocument = k.prototype.styleDocument;
    k.prototype.styleSubtree = k.prototype.styleSubtree;
    k.prototype.getComputedStyleValue = k.prototype.getComputedStyleValue;
    k.prototype.setElementClass = k.prototype.Za;
    k.prototype._styleInfoForNode = k.prototype.Xa;
    k.prototype.transformCustomStyleForDocument = k.prototype.B;
    k.prototype.getStyleAst = k.prototype.Ya;
    k.prototype.styleAstToString = k.prototype.$a;
    k.prototype.flushCustomStyles =
      k.prototype.f;
    Object.defineProperties(k.prototype, {
      nativeShadow: { get: function () {return v;} },
      nativeCss: { get: function () {return C;} }
    });
    var I = new k, kb, lb;
    window.ShadyCSS && (kb = window.ShadyCSS.ApplyShim, lb = window.ShadyCSS.CustomStyleInterface);
    window.ShadyCSS = {
      ScopingShim: I, prepareTemplate: function (a, b, c) {
        I.f();
        I.prepareTemplate(a, b, c);
      }, styleSubtree: function (a, b) {
        I.f();
        I.styleSubtree(a, b);
      }, styleElement: function (a) {
        I.f();
        I.styleElement(a);
      }, styleDocument: function (a) {
        I.f();
        I.styleDocument(a);
      }, getComputedStyleValue: function (a,
                                          b) {return I.getComputedStyleValue(a, b);}, nativeCss: C, nativeShadow: v
    };
    kb && (window.ShadyCSS.ApplyShim = kb);
    lb && (window.ShadyCSS.CustomStyleInterface = lb);
    (function () {
      var a = window.customElements, b = window.HTMLImports;
      if (a && a.polyfillWrapFlushCallback) {
        var c, d = function () {
          if (c) {
            var a = c;
            c = null;
            a();
            return !0;
          }
        }, e = b.whenReady;
        a.polyfillWrapFlushCallback(function (a) {
          c = a;
          e(d);
        });
        b.whenReady = function (a) {e(function () {d() ? b.whenReady(a) : a();});};
      }
      b.whenReady(function () {requestAnimationFrame(function () {window.dispatchEvent(new CustomEvent('WebComponentsReady'));});});
    })();
    (function () {
      var a = document.createElement('style');
      a.textContent = 'body {transition: opacity ease-in 0.2s; } \nbody[unresolved] {opacity: 0; display: block; overflow: hidden; position: relative; } \n';
      var b = document.querySelector('head');
      b.insertBefore(a, b.firstChild);
    })();
  })();
}).call(self);

/**
 * x-tag core starts here
 */
(function () {
  function t (t) {
    var e = F.call(t);
    return S[ e ] || (S[ e ] = e.match(q)[ 1 ].toLowerCase());
  }

  function e (n, r) {
    var a = e[ r || t(n) ];
    return a ? a(n) : n;
  }

  function n (e) {return R[ t(e) ] ? [ e ] : Array.prototype.slice.call(e, 0);}

  function r (t, e) {return (e || D).length ? n(t.querySelectorAll(e)) : [];}

  function a (t) {t();}

  function o (n, r, a) {
    var o = t(a);
    return 'object' == o && 'object' == t(n[ r ]) ? B.merge(n[ r ], a) : n[ r ] = e(a, o), n;
  }

  function i (t, e, n) {
    var r, a = {};
    for (var o in e)a[ o.split(':')[ 0 ] ] = o;
    for (o in n)r = a[ o.split(':')[ 0 ] ], 'function' == typeof e[ r ] ?
      (r.match(':mixins') ||
      (e[ r + ':mixins' ] = e[ r ], delete e[ r ], r += ':mixins'), e[ r ].__mixin__ = B.applyPseudos(o +
        (o.match(':mixins') ? '' : ':mixins'), n[ o ], t.pseudos, e[ r ].__mixin__)) :
      (e[ o ] = n[ o ], delete e[ r ]);
  }

  function s (t, e, n) {for (var r in n)e[ r + ':__mixin__(' + H++ + ')' ] = B.applyPseudos(r, n[ r ], t.pseudos);}

  function u (t, e) {
    for (var n = t.length; n--;)e.unshift(t[ n ]), B.mixins[ t[ n ] ].mixins && u(B.mixins[ t[ n ] ].mixins, e);
    return e;
  }

  function c (t) {
    return u(t.mixins, []).forEach(function (e) {
      var n = B.mixins[ e ];
      for (var r in n) {
        var a = n[ r ], o = t[ r ];
        if (o)switch (r) {
          case'mixins':
            break;
          case'events':
            s(t, o, a);
            break;
          case'accessors':
          case'prototype':
            for (var u in a)o[ u ] ? i(t, o[ u ], a[ u ], e) : o[ u ] = a[ u ];
            break;
          default:
            i(t, o, a, e);
        } else t[ r ] = a;
      }
    }), t;
  }

  function l (t, e) {
    for (var n, r = e.target, a = e.currentTarget; !n && r && r != a;)r.tagName && T.call(r, t.value) &&
    (n = r), r = r.parentNode;
    return !n && a.tagName && T.call(a, t.value) && (n = a), n ? t.listener = t.listener.bind(n) : null;
  }

  function p (t) {return 0 === t.button;}

  function d (t, e, n, r) {
    r ?
      e[ t ] = n[ t ] :
      Object.defineProperty(e, t, { writable: !0, enumerable: !0, value: n[ t ] });
  }

  function m (t, e) {
    var n = Object.getOwnPropertyDescriptor(t, 'target');
    for (var r in e)z[ r ] || d(r, t, e, n);
    t.baseEvent = e;
  }

  function f (t, e, n, r, a) {E[ a ].call(t, n, e && e.boolean ? '' : r);}

  function v (t, e, n, r, a) {
    if (e && (e.property || e.selector))for (var o = e.property ?
      [ t.xtag[ e.property ] ] :
      e.selector ?
        B.query(t, e.selector) :
        [], i = o.length; i--;)o[ i ][ a ](n, r);
  }

  function h (t, e, n, r, a, o) {
    var i = n.split(':'), s = i[ 0 ];
    'get' == s ?
      (i[ 0 ] = e, t.prototype[ e ].get = B.applyPseudos(i.join(':'), r[ n ], t.pseudos, r[ n ])) :
      'set' == s ?
        (i[ 0 ] = e, t.prototype[ e ].set = B.applyPseudos(i.join(':'), a ? function (t) {
          var e, i = 'setAttribute';
          a.boolean ?
            (t = !!t, e = this.hasAttribute(o), t || (i = 'removeAttribute')) :
            (t = a.validate ?
              a.validate.call(this, t) :
              t, e = this.getAttribute(o)), f(this, a, o, t, i), r[ n ].call(this, t, e), v(this, a, o, t, i);
        } : r[ n ] ? function (t) {r[ n ].call(this, t);} : null, t.pseudos, r[ n ]), a && (a.setter = r[ n ])) :
        t.prototype[ e ][ n ] = r[ n ];
  }

  function b (t, e) {
    t.prototype[ e ] = {};
    var n, r = t.accessors[ e ], a = r.attribute;
    a && (n = a.name = (a ? a.name || e.replace(N, '$1-$2') : e).toLowerCase(), a.key = e, t.attributes[ n ] = a);
    for (var o in r)h(t, e, o, r, a, n);
    if (a) {
      if (!t.prototype[ e ].get) {
        var i = (a.boolean ? 'has' : 'get') + 'Attribute';
        t.prototype[ e ].get = function () {return this[ i ](n);};
      }
      t.prototype[ e ].set || (t.prototype[ e ].set = function (t) {
        t = a.boolean ? !!t : a.validate ? a.validate.call(this, t) : t;
        var e = a.boolean ? t ? 'setAttribute' : 'removeAttribute' : 'setAttribute';
        f(this, a, n, t, e), v(this, a, n, t, e);
      });
    }
  }

  function y (t) {return 'function' == typeof t ? Y.exec('' + t)[ 1 ] : t;}

  var g = window, _ = document,
    E = { setAttribute: Element.prototype.setAttribute, removeAttribute: Element.prototype.removeAttribute },
    w = Element.prototype.createShadowRoot, A = _.createElement('div'), x = function () {},
    C = function () {return !0;},
    k = /,/g, N = /([a-z])([A-Z])/g, O = /\(|\)/g, L = /:(\w+)\u276A(.+?(?=\u276B))|:(\w+)/g, j = /(\d+)/g, P = {
      action: function (t, e) {
        return t.value.match(j).indexOf(e.keyCode + '') > -1 == ('keypass' == t.name) || null;
      }
    }, M = function () {
      var t = Object.keys(window).join(),
        e = (t.match(/,(ms)/) || t.match(/,(moz)/) || t.match(/,(O)/) || [ null, 'webkit' ])[ 1 ].toLowerCase();
      return {
        dom: 'ms' == e ? 'MS' : e,
        lowercase: e,
        css: '-' + e + '-',
        js: 'ms' == e ? e : e.charAt(0).toUpperCase() + e.substring(1)
      };
    }(), T = Element.prototype.matches || Element.prototype.matchesSelector ||
      Element.prototype[ M.lowercase + 'MatchesSelector' ], S = {}, F = S.toString, q = /\s([a-zA-Z]+)/;
  e.object = function (t) {
    var n = {};
    for (var r in t)n[ r ] = e(t[ r ]);
    return n;
  }, e.array = function (t) {
    for (var n = t.length, r = Array(n); n--;)r[ n ] = e(t[ n ]);
    return r;
  };
  var R = { undefined: 1, 'null': 1, number: 1, 'boolean': 1, string: 1, 'function': 1 }, D = '', H = 0, z = {};
  for (var X in _.createEvent('CustomEvent'))z[ X ] = 1;
  var Y = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//, B = {
    tags: {},
    defaultOptions: {
      pseudos: [],
      mixins: [],
      events: {},
      methods: {},
      accessors: {},
      lifecycle: {},
      attributes: {},
      prototype: { xtag: { get: function () {return this.__xtag__ ? this.__xtag__ : this.__xtag__ = { data: {} };} } }
    },
    register: function (t, e) {
      var r;
      if ('string' != typeof t)throw'First argument must be a Custom Element string name';
      r = t.toLowerCase(), B.tags[ r ] = e || {};
      var a = e.prototype;
      delete e.prototype;
      var o = B.tags[ r ].compiled = c(B.merge({}, B.defaultOptions, e)), i = o.prototype, s = o.lifecycle;
      for (var u in o.events)o.events[ u ] = B.parseEvent(u, o.events[ u ]);
      for (u in s)s[ u.split(':')[ 0 ] ] = B.applyPseudos(u, s[ u ], o.pseudos, s[ u ]);
      for (u in o.methods)i[ u.split(':')[ 0 ] ] = {
        value: B.applyPseudos(u, o.methods[ u ], o.pseudos, o.methods[ u ]),
        enumerable: !0
      };
      for (u in o.accessors)b(o, u);
      o.shadow && (o.shadow = o.shadow.nodeName ? o.shadow : B.createFragment(o.shadow)), o.content &&
      (o.content = o.content.nodeName ? o.content.innerHTML : y(o.content));
      var l = s.created, p = s.finalized;
      i.createdCallback = {
        enumerable: !0, value: function () {
          var t = this;
          o.shadow && w && this.createShadowRoot().appendChild(o.shadow.cloneNode(!0)), o.content &&
          (this.appendChild(document.createElement('div')).outerHTML = o.content);
          var e = l ? l.apply(this, arguments) : null;
          B.addEvents(this, o.events);
          for (var n in o.attributes) {
            var r = o.attributes[ n ], a = this.hasAttribute(n), i = void 0 !== r.def;
            (a || r.boolean || i) && (this[ r.key ] = r.boolean ? a : !a && i ? r.def : this.getAttribute(n));
          }
          return o.pseudos.forEach(function (e) {e.onAdd.call(t, e);}), this.xtagComponentReady = !0, p &&
          p.apply(this, arguments), e;
        }
      };
      var d = s.inserted, m = s.removed;
      (d || m) && (i.attachedCallback = {
        value: function () {
          return m && (this.xtag.__parentNode__ = this.parentNode), d ?
            d.apply(this, arguments) :
            void 0;
        }, enumerable: !0
      }), m && (i.detachedCallback = {
        value: function () {
          var t = n(arguments);
          t.unshift(this.xtag.__parentNode__);
          var e = m.apply(this, t);
          return delete this.xtag.__parentNode__, e;
        }, enumerable: !0
      }), s.attributeChanged &&
      (i.attributeChangedCallback = { value: s.attributeChanged, enumerable: !0 }), i.setAttribute = {
        writable: !0,
        enumerable: !0,
        value: function (t, e) {
          var n, r = t.toLowerCase(), a = o.attributes[ r ];
          a && (n = this.getAttribute(r), e = a.boolean ?
            '' :
            a.validate ?
              a.validate.call(this, e) :
              e), f(this, a, r, e, 'setAttribute'), a &&
          (a.setter && a.setter.call(this, a.boolean ? !0 : e, n), v(this, a, r, e, 'setAttribute'));
        }
      }, i.removeAttribute = {
        writable: !0,
        enumerable: !0,
        value: function (t) {
          var e = t.toLowerCase(), n = o.attributes[ e ], r = this.hasAttribute(e);
          f(this, n, e, '', 'removeAttribute'), n &&
          (n.setter && n.setter.call(this, n.boolean ? !1 : void 0, r), v(this, n, e, '', 'removeAttribute'));
        }
      };
      var h = {}, E = a instanceof g.HTMLElement, A = o[ 'extends' ] && (h[ 'extends' ] = o[ 'extends' ]);
      return a && Object.getOwnPropertyNames(a)
        .forEach(function (t) {
          var e = i[ t ], n = E ? Object.getOwnPropertyDescriptor(a, t) : a[ t ];
          if (e)for (var r in n)e[ r ] = 'function' == typeof n[ r ] && e[ r ] ? B.wrap(n[ r ], e[ r ]) : n[ r ];
          i[ t ] = e || n;
        }), h.prototype = Object.create(A ?
        Object.create(_.createElement(A).constructor).prototype :
        g.HTMLElement.prototype, i), _.registerElement(r, h);
    },
    mixins: {},
    prefix: M,
    captureEvents: { focus: 1, blur: 1, scroll: 1, DOMMouseScroll: 1 },
    customEvents: {
      animationstart: { attach: [ M.dom + 'AnimationStart' ] },
      animationend: { attach: [ M.dom + 'AnimationEnd' ] },
      transitionend: { attach: [ M.dom + 'TransitionEnd' ] },
      move: { attach: [ 'pointermove' ] },
      enter: { attach: [ 'pointerenter' ] },
      leave: { attach: [ 'pointerleave' ] },
      scrollwheel: {
        attach: [ 'DOMMouseScroll', 'mousewheel' ],
        condition: function (t) {
          return t.delta = t.wheelDelta ?
            t.wheelDelta / 40 :
            Math.round(-1 * (t.detail / 3.5)), !0;
        }
      },
      tap: {
        attach: [ 'pointerdown', 'pointerup' ],
        condition: function (t, e) {
          if ('pointerdown' == t.type) e.startX = t.clientX, e.startY = t.clientY; else if (0 === t.button &&
            10 > Math.abs(e.startX - t.clientX) && 10 > Math.abs(e.startY - t.clientY))return !0;
        }
      },
      tapstart: { attach: [ 'pointerdown' ], condition: p },
      tapend: { attach: [ 'pointerup' ], condition: p },
      tapmove: {
        attach: [ 'pointerdown' ],
        condition: function (t, e) {
          if ('pointerdown' == t.type) {
            var n = e.listener.bind(this);
            e.tapmoveListeners ||
            (e.tapmoveListeners = B.addEvents(document, { pointermove: n, pointerup: n, pointercancel: n }));
          } else('pointerup' == t.type || 'pointercancel' == t.type) &&
          (B.removeEvents(document, e.tapmoveListeners), e.tapmoveListeners = null);
          return !0;
        }
      },
      taphold: {
        attach: [ 'pointerdown', 'pointerup' ],
        condition: function (t, e) {
          if ('pointerdown' == t.type) (e.pointers = e.pointers ||
            {})[ t.pointerId ] = setTimeout(B.fireEvent.bind(null, this, 'taphold'), e.duration || 1e3); else {
            if ('pointerup' != t.type)return !0;
            e.pointers && (clearTimeout(e.pointers[ t.pointerId ]), delete e.pointers[ t.pointerId ]);
          }
        }
      }
    },
    pseudos: {
      __mixin__: {},
      mixins: {
        onCompiled: function (t, e) {
          var n = e.source && e.source.__mixin__ || e.source;
          if (!n)return t;
          switch (e.value) {
            case null:
            case'':
            case'before':
              return function () {return n.apply(this, arguments), t.apply(this, arguments);};
            case'after':
              return function () {
                var e = t.apply(this, arguments);
                return n.apply(this, arguments), e;
              };
            case'none':
              return t;
          }
        }
      },
      keypass: P,
      keyfail: P,
      delegate: { action: l },
      preventable: { action: function (t, e) {return !e.defaultPrevented;} },
      duration: { onAdd: function (t) {t.source.duration = Number(t.value);} },
      capture: { onCompiled: function (t, e) {e.source && (e.source.capture = !0);} }
    },
    clone: e,
    typeOf: t,
    toArray: n,
    wrap: function (t, e) {
      return function () {
        var n = t.apply(this, arguments);
        return e.apply(this, arguments), n;
      };
    },
    merge: function (e, n, r) {
      if ('string' == t(n))return o(e, n, r);
      for (var a = 1, i = arguments.length; i > a; a++) {
        var s = arguments[ a ];
        for (var u in s)o(e, u, s[ u ]);
      }
      return e;
    },
    uid: function () {return Math.random().toString(36).substr(2, 10);},
    query: r,
    skipTransition: function (t, e, n) {
      var r = M.js + 'TransitionProperty';
      t.style[ r ] = t.style.transitionProperty = 'none';
      var a = e ? e.call(n || t) : null;
      return B.skipFrame(function () {t.style[ r ] = t.style.transitionProperty = '', a && a.call(n || t);});
    },
    requestFrame: function () {
      var t = g.requestAnimationFrame || g[ M.lowercase + 'RequestAnimationFrame' ] ||
        function (t) {return g.setTimeout(t, 20);};
      return function (e) {return t(e);};
    }(),
    cancelFrame: function () {
      var t = g.cancelAnimationFrame || g[ M.lowercase + 'CancelAnimationFrame' ] || g.clearTimeout;
      return function (e) {return t(e);};
    }(),
    skipFrame: function (t) {
      var e = B.requestFrame(function () {e = B.requestFrame(t);});
      return e;
    },
    matchSelector: function (t, e) {return T.call(t, e);},
    set: function (t, e, n) {t[ e ] = n, window.CustomElements && CustomElements.upgradeAll(t);},
    innerHTML: function (t, e) {B.set(t, 'innerHTML', e);},
    hasClass: function (t, e) {return t.className.split(' ').indexOf(e.trim()) > -1;},
    addClass: function (t, e) {
      var n = t.className.trim().split(' ');
      return e.trim().split(' ').forEach(function (t) {~n.indexOf(t) || n.push(t);}), t.className = n.join(' ')
        .trim(), t;
    },
    removeClass: function (t, e) {
      var n = e.trim().split(' ');
      return t.className = t.className.trim()
        .split(' ')
        .filter(function (t) {return t && !~n.indexOf(t);})
        .join(' '), t;
    },
    toggleClass: function (t, e) {return B[ B.hasClass(t, e) ? 'removeClass' : 'addClass' ].call(null, t, e);},
    queryChildren: function (t, e) {
      var r = t.id, a = '#' + (t.id = r || 'x_' + B.uid()) + ' > ', o = t.parentNode || !A.appendChild(t);
      e = a + (e + '').replace(k, ',' + a);
      var i = t.parentNode.querySelectorAll(e);
      return r || t.removeAttribute('id'), o || A.removeChild(t), n(i);
    },
    createFragment: function (t) {
      var e = document.createElement('template');
      return t && (t.nodeName ?
        n(arguments).forEach(function (t) {e.content.appendChild(t);}) :
        e.innerHTML = y(t)), document.importNode(e.content, !0);
    },
    manipulate: function (t, e) {
      var n = t.nextSibling, r = t.parentNode, a = e.call(t) || t;
      n ? r.insertBefore(a, n) : r.appendChild(a);
    },
    applyPseudos: function (t, e, r, o) {
      var i = e, s = {};
      if (t.match(':')) {
        var u = [], c = 0;
        t.replace(O, function (t) {return '(' == t ? 1 == ++c ? '❪' : '(' : --c ? ')' : '❫';})
          .replace(L, function (t, e, n, r) {u.push([ e || r, n ]);});
        for (var l = u.length; l--;)a(function () {
          var a = u[ l ][ 0 ], c = u[ l ][ 1 ];
          if (!B.pseudos[ a ])throw'pseudo not found: ' + a + ' ' + c;
          c = '' === c || c === void 0 ? null : c;
          var p = s[ l ] = Object.create(B.pseudos[ a ]);
          p.key = t, p.name = a, p.value = c, p.arguments = (c || '').split(','), p.action = p.action ||
            C, p.source = o, p.onAdd = p.onAdd || x, p.onRemove = p.onRemove || x;
          var d = p.listener = i;
          i = function () {
            var t = p.action.apply(this, [ p ].concat(n(arguments)));
            return null === t || t === !1 ? t : (t = p.listener.apply(this, arguments), p.listener = d, t);
          }, r ? r.push(p) : p.onAdd.call(e, p);
        });
      }
      for (var p in s)s[ p ].onCompiled && (i = s[ p ].onCompiled(i, s[ p ]) || i);
      return i;
    },
    removePseudos: function (t, e) {e.forEach(function (e) {e.onRemove.call(t, e);});},
    parseEvent: function (t, e) {
      var r = t.split(':'), a = r.shift(), o = B.customEvents[ a ], i = B.merge({
        type: a,
        stack: x,
        condition: C,
        capture: B.captureEvents[ a ],
        attach: [],
        _attach: [],
        pseudos: '',
        _pseudos: [],
        onAdd: x,
        onRemove: x
      }, o || {});
      i.attach = n(i.base || i.attach), i.chain = a + (i.pseudos.length ? ':' + i.pseudos : '') +
        (r.length ? ':' + r.join(':') : '');
      var s = B.applyPseudos(i.chain, e, i._pseudos, i);
      return i.stack = function (t) {
        t.currentTarget = t.currentTarget || this;
        var e = t.detail || {};
        return e.__stack__ ?
          e.__stack__ == s ?
            (t.stopPropagation(), t.cancelBubble = !0, s.apply(this, arguments)) :
            void 0 :
          s.apply(this, arguments);
      }, i.listener = function (t) {
        var e = n(arguments), r = i.condition.apply(this, e.concat([ i ]));
        return r ?
          t.type != a && t.baseEvent && t.type != t.baseEvent.type ?
            (B.fireEvent(t.target, a, {
              baseEvent: t,
              detail: r !== !0 && (r.__stack__ = s) ? r : { __stack__: s }
            }), void 0) :
            i.stack.apply(this, e) :
          r;
      }, i.attach.forEach(function (t) {i._attach.push(B.parseEvent(t, i.listener));}), i;
    },
    addEvent: function (t, e, n, r) {
      var a = 'function' == typeof n ? B.parseEvent(e, n) : n;
      return a._pseudos.forEach(function (e) {e.onAdd.call(t, e);}), a._attach.forEach(function (e) {B.addEvent(t, e.type, e);}), a.onAdd.call(t, a, a.listener), t.addEventListener(a.type, a.stack, r ||
        a.capture), a;
    },
    addEvents: function (t, e) {
      var n = {};
      for (var r in e)n[ r ] = B.addEvent(t, r, e[ r ]);
      return n;
    },
    removeEvent: function (t, e, n) {
      n = n ||
        e, n.onRemove.call(t, n, n.listener), B.removePseudos(t, n._pseudos), n._attach.forEach(function (e) {B.removeEvent(t, e);}), t.removeEventListener(n.type, n.stack);
    },
    removeEvents: function (t, e) {for (var n in e)B.removeEvent(t, e[ n ]);},
    fireEvent: function (t, e, n) {
      var r = _.createEvent('CustomEvent');
      n = n || {}, r.initCustomEvent(e, n.bubbles !== !1, n.cancelable !== !1, n.detail), n.baseEvent &&
      m(r, n.baseEvent), t.dispatchEvent(r);
    }
  };
  'function' == typeof define && define.amd ?
    define(B) :
    'undefined' != typeof module && module.exports ?
      module.exports = B :
      g.xtag = B, _.addEventListener('WebComponentsReady', function () {B.fireEvent(_.body, 'DOMComponentsLoaded');});
})();

/* global xtag, GalaxyAnimation */

(function () {
  window.GalaxyAnimation = {
    CONFIG: {
      baseDuration: .5,
      staggerDuration: .05
    },
    effects: {},
    sequences: {},
    disable: function (element) {
      var tags = element.getElementsByTagName('galaxy-animation');
      Array.prototype.forEach.call(tags, function (tag) {
        tag.__ui_neutral = true;
      });
    },
    enable: function (element) {
      var tags = element.getElementsByTagName('galaxy-animation');
      Array.prototype.forEach.call(tags, function (tag) {
        tag.__ui_neutral = false;
        delete tag.__ui_neutral;
      });
    }
  };

  var Animation = {
    lifecycle: {
      created: function () {
        var element = this;
        element.xtag.animations = {};
        element.xtag.effects = [];
        element.xtag.registeredAnimations = [];
      },
      inserted: function () {
        this.xtag.effects = this.getAttribute('effects').split(/[\s,]+/).filter(Boolean);
        if (this.xtag.effects.length && !this.__ui_neutral) {
          this.prepare();
        }
      },
      removed: function () {
        if (!this.__ui_neutral) {
          this.xtag.effects = [];
          this.prepare();
        }
      }
    },
    accessors: {
      effects: {
        attribute: {},
        set: function (value, oldValue) {
          if (value === oldValue) {
            return;
          }

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
    events: {},
    methods: {
      prepare: function () {
        var element = this;
        this.xtag.effects.forEach(function (item) {
          if (element.xtag.registeredAnimations.indexOf(item) !== -1) {
            return null;
          }

          if (!GalaxyAnimation.effects[ item ]) {
            return console.warn('effect not found:', item);
          }

          var animation = GalaxyAnimation.effects[ item ].install(element);
          if (!animation) {
            return console.warn('effect.install should return and object', item, element);
          } else {
            element.xtag.animations[ item ] = animation;
          }
          element.xtag.registeredAnimations.push(item);
        });

        this.xtag.registeredAnimations = this.xtag.registeredAnimations.filter(function (item) {
          if (element.xtag.effects.indexOf(item) === -1) {
            GalaxyAnimation.effects[ item ].uninstall(element, element.xtag.animations[ item ]);
            delete element.xtag.animations[ item ];
            return false;
          }

          return true;
        });
      }
    }
  };

  xtag.register('galaxy-animation', Animation);
})();

/* global xtag */

(function () {
  var Field = {
    prototype: HTMLDivElement.prototype,
    lifecycle: {
      created: function () {
        var element = this;
        element._states = [];

        var input = this.querySelectorAll('input, textarea, select');
        if (input.length > 1) {
          console.warn('Only one input field is allowed inside system-field', this);
        }

        element.xtag._input = this.querySelectorAll('input, textarea, select')[ 0 ];

        element.init();
      },
      inserted: function () {
        var element = this;
        if (!element.xtag._input) {
          element.xtag._input = element.querySelectorAll('input, textarea, select')[ 0 ];
          element.init();
        }

        element.xtag.observer = setInterval(function () {
          if (element.xtag._input && element.xtag._input.value !== element.xtag.oldValue) {
            element.setEmptiness();
            element.xtag.oldValue = element.xtag._input.value;
          }
        }, 250);

        element.setEmptiness();
      },
      removed: function () {
        clearInterval(this.xtag.observer);
      }
    },
    accessors: {},
    events: {},
    methods: {
      init: function () {
        var element = this;
        if (element.xtag._input) {
          element.setEmptiness();

          element.xtag._input.addEventListener('focus', function () {
            element.setState('focus', '');
            element.setEmptiness();
          });

          element.xtag._input.addEventListener('blur', function () {
            element.setState('focus', null);
          });

          element.xtag._input.onchange = function (e) {
            element.setEmptiness();
          };

          element.xtag._input.addEventListener('input', function (e) {
            element.setEmptiness();
          });
        }

        element.xtag._label = this.getElementsByTagName('label')[ 0 ];
        if (element.xtag._label && !element.xtag._label._galaxy_field_onclick) {
          element.xtag._label._galaxy_field_onclick = element.xtag._input.focus.bind(element.xtag._input);
          element.xtag._label.addEventListener('click', element.xtag._label._galaxy_field_onclick);
        }
      },
      setState: function (state, value) {
        var element = this;
        if (value === null) {
          element.removeAttribute(state);
          if (element._states.indexOf(state) !== -1) {
            element._states.splice(element._states.indexOf(state), 1);
          }
        } else {
          element.setAttribute(state, '');
          if (element._states.indexOf(state) === -1) {
            element._states.push(state);
          }
        }
      },
      setEmptiness: function () {
        var element = this;

        if (element.xtag._input.value || element.xtag._input.type === 'file') {
          element.setState('empty', null);
        } else {
          element.setState('empty', '');
        }
      }
    }
  };

  xtag.register('galaxy-field', Field);
})();

/* global xtag */

(function () {
  var FloatMenu = {
    lifecycle: {
      created: function () {
        var _this = this;
        _this.xtag.indicator = _this.querySelector('[indicator]') || _this.children[ 0 ];
        _this.xtag.actionsContainer = _this.querySelector('[actions]') || _this.children[ 1 ];

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
        this.classList.add('expand');
      },
      contract: function () {
        this.expanded = false;
        this.classList.remove('expand');
      },
      on: function () {
        this.classList.remove('off');
      },
      off: function () {
        this.classList.add('off');
      },
      clean: function () {
        this.innerHTML = '';
      }
    },
    events: {}
  };

  xtag.register('galaxy-float-menu', FloatMenu);
})();

/* global xtag */

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
          xtag.fireEvent(this, 'switch', {
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

  xtag.register('galaxy-switch', SwitchButton);
})();