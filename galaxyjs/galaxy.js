//#region src/runtime.js
var e = {};
function t(t) {
	if (!t) throw Error("Module meta data or constructor is missing");
	return new Promise(function(n, r) {
		if (t.hasOwnProperty("constructor") && typeof t.constructor == "function") return t.path = t.id = "internal/" + (/* @__PURE__ */ new Date()).valueOf() + "-" + Math.round(performance.now()), t.source = t.constructor, n(t);
		t.path = t.path.indexOf("/") === 0 ? t.path.substring(1) : t.path, t.id ||= t.parentScope ? t.parentScope.moduleId + "/" + t.path : t.path;
		let i = t.path, a = e[i];
		a || (e[i] = a = fetch(i).then((e) => e.ok ? e : (console.error(e.statusText, i), r(e.statusText))).catch(r)), a.then((e) => e.clone().text()).then(() => t).then(n).catch(r);
	});
}
//#endregion
//#region src/utils.js
function n() {}
var r = Object.defineProperty, i = Reflect.deleteProperty, a = Object.keys, o = Array.prototype.concat.bind([]), s = Array.prototype.slice, c = 36, l = 4, u = c ** l - 1, d = 4096, f = Array.from({ length: d }, (e, t) => t.toString(c).padStart(l, "0"));
function p(e) {
	if (!Number.isFinite(e) || (e = Math.floor(e), e < 0)) return f[0];
	if (e < d) return f[e];
	if (e > u) throw Error("ViewNode index overflow: " + e + ". Increase INDEX_WIDTH to support larger sibling indexes.");
	return e.toString(c).padStart(l, "0");
}
function m(e) {
	let t = e instanceof Array ? [] : {};
	t.__proto__ = e.__proto__;
	for (let n in e) if (e.hasOwnProperty(n)) {
		let r = e[n];
		r instanceof Promise || r?.__singleton__ ? t[n] = r : typeof r == "object" && r ? n === "animations" && r && typeof r == "object" ? t[n] = r : t[n] = m(r) : t[n] = r;
	}
	return t;
}
var h = document.createComment("");
function g(e) {
	let t = h.cloneNode();
	return t.textContent = e, t;
}
function _(e, t) {
	return e === "svg" || t && t.blueprint.tag === "svg" ? document.createElementNS("http://www.w3.org/2000/svg", e) : e === "comment" ? document.createComment("ViewNode") : document.createElement(e);
}
//#endregion
//#region src/dom-scheduler.js
var v = {}, ee = [], te = [], y = [], b = !0, x = !1, S = 0, C = 0, w, ne = function(e, t) {
	if (t) return e();
	this.length ? this.shift()(ne.bind(this, e)) : e();
}, re = function() {
	if (this.length) {
		let e = v[this.shift()];
		if (!e.length) return T.call(this);
		ne.call(e, T.bind(this), x);
	} else b = !0, C = 0, S = 0;
}, T = function() {
	if (x) return x = !1, S = 0, T.call(y);
	let e = performance.now();
	C ||= e, S += e - C, C = e, S > 2 ? (S = 0, w &&= (clearTimeout(w), null), w = setTimeout((e) => {
		C = e, re.call(this);
	})) : re.call(this);
};
function ie(e, t) {
	return e > t;
}
function ae(e, t) {
	return e < t;
}
function oe(e, t, n) {
	let r = 0, i = e.length - 1, a = 0;
	for (; r <= i;) {
		let o = Math.floor((r + i) / 2), s = e[o];
		n(t, s) ? a = r = o + 1 : (a = o, i = o - 1);
	}
	return a;
}
function se(e, t) {
	return t < e[0] ? 0 : t > e[e.length - 1] ? e.length : oe(e, t, ie);
}
function ce(e, t) {
	return t > e[0] ? 0 : t < e[e.length - 1] ? e.length : oe(e, t, ae);
}
function le(e, t, n, r) {
	e in v ? v[e].push(t) : (v[e] = [t], n.splice(r(n, e), 0, e));
}
var E = 0;
function ue() {
	E !== 0 && (clearTimeout(E), E = 0), y = o(te, ee), E = setTimeout(() => {
		b && (b = !1, T.call(y));
	});
}
function D(e, t) {
	x = !0, le("<" + e, t, te, ce), ue();
}
function O(e, t) {
	x = !0, le(">" + e, t, ee, se), ue();
}
function de() {
	return "@" + performance.now();
}
//#endregion
//#region src/properties/animations.property.js
var k, A;
if (!window.gsap) A = function() {}, k = {
	type: "prop",
	key: "animations",
	update: function(e, t) {
		t.enter && t.enter.to.onComplete && (e.processEnterAnimation = t.enter.to.onComplete), e.processLeaveAnimation = (e) => {
			e();
		};
	}
}, window.gsap = { to: function(e, t) {
	return requestAnimationFrame(() => {
		typeof e == "string" && (e = document.querySelector(e));
		let n = e.style;
		if (n) {
			let r = Object.keys(t);
			for (let i = 0, a = r.length; i < a; i++) {
				let a = r[i], o = t[a];
				switch (a) {
					case "duration":
					case "ease": break;
					case "opacity":
					case "z-index":
						n.setProperty(a, o);
						break;
					case "scrollTo":
						e.scrollTop = typeof o.y == "string" ? document.querySelector(o.y).offsetTop : o.y, e.scrollLeft = typeof o.x == "string" ? document.querySelector(o.x).offsetLeft : o.x;
						break;
					default: n.setProperty(a, typeof o == "number" && o !== 0 ? o + "px" : o);
				}
			}
		} else Object.assign(e, t);
	});
} }, console.info("%cIn order to activate animations, load GSAP - GreenSock", "color: yellowgreen; font-weight: bold;"), console.info("%cYou can implement most common animations by loading the following resources before galaxy.js", "color: yellowgreen;"), console.info("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/gsap.min.js"), console.info("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/ScrollToPlugin.min.js"), console.info("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/EasePack.min.js\n\n");
else {
	function e(t) {
		if (!t.parent) return !1;
		let n = t.parent;
		return n.blueprint.animations && n.blueprint.animations.enter && gsap.getTweensOf(n.node).length ? !0 : e(t.parent);
	}
	let t = document.body;
	k = {
		type: "prop",
		key: "animations",
		update: function(e, t) {
			if (e.virtual || !t) return;
			let n = t.enter;
			n && (e.processEnterAnimation = function() {
				i(this, n);
			});
			let r = t.leave;
			r ? (!n && e.blueprint.if && (console.warn("The following node has `if` and a `leave` animation but does NOT have a `enter` animation.\nThis can result in unexpected UI behavior.\nTry to define a `enter` animation that negates the leave animation to prevent unexpected behavior\n\n"), console.warn(e.node)), e.processLeaveAnimation = function(e) {
				a(this, r, e);
			}, e.populateHideSequence = e.processLeaveAnimation.bind(e, () => {
				e.node.style.display = "none";
			})) : e.processLeaveAnimation = c.bind(e);
			let l = e.cache;
			l.class && l.class.observer && e.rendered.then(function() {
				let n = l.class.observer.context;
				for (let r in n) {
					let i = !!n[r], a = s(t, i, r);
					if (a) {
						if (a.to.keyframes instanceof Array) for (let t = 0, n = a.to.keyframes.length; t < n; t++) gsap.set(e.node, Object.assign({ callbackScope: e }, a.to.keyframes[t] || {}));
						else gsap.set(e.node, Object.assign({ callbackScope: e }, a.to || {}));
						i ? e.node.classList.add(r) : e.node.classList.remove(r);
					}
				}
				let r = JSON.stringify(n);
				l.class.observer.onAll((i) => {
					let a = JSON.stringify(n);
					if (r === a) return;
					r = a;
					let c = !!n[i], u = s(t, c, i);
					if (u) {
						let t = "tween:" + i;
						l[t] && (l[t].forEach((e) => e.kill()), Reflect.deleteProperty(l, t)), o(e, l, t, u, c, i);
					}
				});
			});
		}
	};
	function r(e) {
		let t = gsap.getTweensOf(e);
		for (let e of t) e.parent ? (e.parent === gsap.globalTimeline ? e.pause() : e.parent.pause(), e.parent.remove(e)) : e.pause();
	}
	function i(n, r) {
		let i = n.node;
		if (r.withParent) {
			if (e(n)) return gsap.set(i, Object.assign({}, r.to || {}));
			if (!n.parent.rendered.resolved) return;
		}
		gsap.getTweensOf(i).length && gsap.killTweensOf(i), t.contains(i) && u.installGSAPAnimation(n, "enter", r);
	}
	function a(e, t, n) {
		if (t.active === !1) return c.call(e, n);
		let i = t.withParent;
		e.leaveWithParent = i === !0;
		let a = e.node;
		if (i && e.parent.transitory) return gsap.killTweensOf(a), e.dump();
		if ("style" in a) {
			let e = a.getBoundingClientRect();
			if (e.width === 0 || e.height === 0 || a.style.opacity === "0" || a.style.visibility === "hidden") return gsap.killTweensOf(a), n();
		}
		r(a), u.installGSAPAnimation(e, "leave", t, n);
	}
	function o(e, t, n, r, i, a) {
		(i ? O : D)(e.index, (o) => {
			let s = !!t[n];
			i && (!e.node.classList.contains(a) || s) ? u.setupOnComplete(r.to || r.from, () => {
				e.node.classList.add(a);
			}) : !i && (e.node.classList.contains(a) || s) && u.setupOnComplete(r.to || r.from, () => {
				e.node.classList.remove(a);
			}), t[n] = t[n] || [], t[n].push(u.installGSAPAnimation(e, null, r)), o();
		});
	}
	function s(e, t, n) {
		return e[t ? "add:" + n : "remove:" + n];
	}
	function c(e) {
		r(this.node), this.parent.transitory ? this.dump() : e();
	}
	u.ANIMATIONS = {}, u.TIMELINES = {}, u.createSimpleAnimation = function(e, t, r) {
		r ||= n;
		let i = e.node, a = t.from, o = t.to;
		if (o && (o = Object.assign({}, o), o.onComplete = r, t.onComplete)) {
			let e = t.onComplete;
			o.onComplete = function() {
				e(), r();
			};
		}
		let s;
		if (a && o) s = gsap.fromTo(i, a, o);
		else if (a) {
			if (a = Object.assign({}, a), a.onComplete = r, t.onComplete) {
				let e = t.onComplete;
				a.onComplete = function() {
					e(), r();
				};
			}
			s = gsap.from(i, a);
		} else if (o) s = gsap.to(i, o);
		else if (t.onComplete) {
			let e = t.onComplete;
			s = gsap.to(i, {
				duration: t.duration || 0,
				onComplete: function() {
					e(), r();
				}
			});
		} else s = gsap.to(i, {
			duration: t.duration || 0,
			onComplete: r
		});
		return s;
	}, u.addCallbackScope = function(e, t) {
		let n = Object.assign({}, e);
		return n.callbackScope = t, n;
	}, u.setupOnComplete = function(e, t) {
		if (e.onComplete) {
			let n = e.onComplete;
			e.onComplete = function() {
				n.call(this), t();
			};
		} else e.onComplete = () => {
			t();
		};
	}, u.installGSAPAnimation = function(e, t, n, r) {
		let i = n.from, a = n.to;
		t !== "leave" && a && e.node.nodeType !== Node.COMMENT_NODE && (a.clearProps = a.hasOwnProperty("clearProps") ? a.clearProps : "all");
		let o = Object.assign({}, n);
		o.from = i, o.to = a;
		let s = o.timeline;
		if (s) {
			let n = new u(s);
			if (t ||= n.type, o.await && n.awaits.indexOf(o.await) === -1) {
				let t = n.timeline;
				for (; t.parent !== gsap.globalTimeline;) {
					if (!t.parent) return;
					t = t.parent;
				}
				n.awaits.push(o.await);
				let r = t.addPause(o.position, () => {
					if (e.transitory || e.destroyed.resolved) return t.resume();
					o.await.then(i);
				}).recent(), i = ((e) => {
					let r = n.awaits.indexOf(o.await);
					r !== -1 && (n.awaits.splice(r, 1), e._initted ? t.resume() : t.getChildren(!1).indexOf(e) !== -1 && t.remove(e));
				}).bind(null, r);
				e.finalize.push(() => {
					n.awaits.indexOf(o.await) !== -1 && e.node.style && (e.node.style.display = "none"), i();
				});
			}
			n.type && n.type !== t && o.position && o.position.indexOf("=") !== -1 && (o.position = o.startPosition);
			let i = n.timeline.getChildren(!1);
			return i.length && i[i.length - 1].data === "timeline:start" && (o.position = "+=0"), n.type = t, n.add(e, o, r);
		} else return u.createSimpleAnimation(e, o, r);
	};
	let l = {};
	A = function(e, t) {
		l[e] = t;
		let n = u.ANIMATIONS[e];
		n && n.setupLabels(t);
	};
	function u(e) {
		let t = this;
		if (e && typeof e != "string") {
			if (e.__am__) return e.__am__;
			let r = e.eventCallback("onComplete") || n;
			t.name = "<user-defined>", t.timeline = e, t.timeline.__am__ = this, t.timeline.eventCallback("onComplete", function() {
				r.call(t.timeline), t.onCompletesActions.forEach((e) => {
					e(t.timeline);
				}), t.nodes = [], t.awaits = [], t.children = [], t.onCompletesActions = [];
			}), t.parsePosition = (e) => e;
		} else {
			let n = u.ANIMATIONS[e];
			if (n) return !n.timeline.getChildren().length && !n.timeline.isActive() && (n.timeline.clear(!1), n.timeline.invalidate()), n;
			t.name = e, t.timeline = gsap.timeline({
				autoRemoveChildren: !0,
				smoothChildTiming: !1,
				paused: !0,
				onComplete: function() {
					t.onCompletesActions.forEach((e) => {
						e(t.timeline);
					}), t.nodes = [], t.awaits = [], t.children = [], t.onCompletesActions = [], u.ANIMATIONS[e] = null;
				}
			}), t.timeline.data = { name: e }, t.labelCounter = 0, t.labelsMap = {};
			let r = l[e];
			r && t.setupLabels(r), u.ANIMATIONS[e] = this;
		}
		t.type = null, t.onCompletesActions = [], t.started = !1, t.configs = {}, t.children = [], t.nodes = [], t.awaits = [];
	}
	u.prototype = {
		setupLabels: function(e) {
			for (let t in e) {
				let n = "label_" + this.labelCounter++, r = e[t];
				this.labelsMap[t] = n, this.timeline.addLabel(n, typeof r == "number" ? "+=" + r : r);
			}
		},
		parsePosition: function(e) {
			let t = this.labelsMap[e] || e, n = null;
			return (t || typeof t == "number") && (t.indexOf("+=") === -1 ? t.indexOf("-=") !== -1 && (n = t.split("-=")[0]) : n = t.split("+=")[0]), n && n !== "<" && n !== ">" && (t = t.replace(n, this.labelsMap[n])), t;
		},
		addOnComplete: function(e) {
			this.onCompletesActions.push(e);
		},
		add: function(e, t, n) {
			let r = this, i;
			if (t.from && t.to) {
				let n = u.addCallbackScope(t.to, e);
				i = gsap.fromTo(e.node, t.from, n);
			} else if (t.from) {
				let n = u.addCallbackScope(t.from, e);
				i = gsap.from(e.node, n);
			} else {
				let n = u.addCallbackScope(t.to, e);
				i = gsap.to(e.node, n);
			}
			if (n) if (i.vars.onComplete) {
				let e = i.vars.onComplete;
				i.vars.onComplete = function() {
					e.apply(this, arguments), n();
				};
			} else i.vars.onComplete = n;
			let a = this.parsePosition(t.position), o = r.timeline.getChildren(!1), s = o[0];
			return o.length === 0 ? r.timeline.add(i, a && a.indexOf("-=") === -1 ? a : null) : (o.length === 1 && !s.hasOwnProperty("timeline") && s.getChildren(!1).length === 0 && r.timeline.clear(!1), r.timeline.add(i, a)), r.name === "<user-defined>" || (r.started ? r.timeline.paused() && r.timeline.resume() : (r.started = !0, r.timeline.resume())), i;
		}
	};
}
//#endregion
//#region src/uri.js
function fe(e) {
	let t = document.createElement("a");
	t.href = e;
	let n = /\/([^\t\n]+\/)/g.exec(t.pathname);
	this.parsedURL = t.href, this.path = n ? n[1] : "/", this.base = window.location.pathname, this.protocol = t.protocol;
}
//#endregion
//#region src/observer.js
var j = class {
	constructor(e) {
		this.context = e, this.subjectsActions = {}, this.allSubjectAction = [];
		let t = "__observers__";
		this.context.hasOwnProperty(t) || r(e, t, {
			value: [],
			writable: !0,
			configurable: !0
		}), this.context[t].push(this);
	}
	remove() {
		let e = this.context.__observers__, t = e.indexOf(this);
		t !== -1 && e.splice(t, 1);
	}
	notify(e, t) {
		this.subjectsActions.hasOwnProperty(e) && this.subjectsActions[e].call(this.context, t), this.allSubjectAction.forEach((n) => {
			n.call(this.context, e, t);
		});
	}
	on(e, t) {
		this.subjectsActions[e] = t;
	}
	onAll(e) {
		this.allSubjectAction.indexOf(e) === -1 && this.allSubjectAction.push(e);
	}
	static notify(e, t, n) {
		let r = e.__observers__;
		r !== void 0 && r.forEach((e) => {
			e.notify(t, n);
		});
	}
}, M = {
	tag: { type: "none" },
	node: { type: "none" },
	props: { type: "none" },
	children: { type: "none" },
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
	onchange: { type: "event" },
	onclick: { type: "event" },
	ondblclick: { type: "event" },
	onmouseover: { type: "event" },
	onmouseout: { type: "event" },
	onkeydown: { type: "event" },
	onkeypress: { type: "event" },
	onkeyup: { type: "event" },
	onmousedown: { type: "event" },
	onmouseup: { type: "event" },
	onload: { type: "event" },
	onabort: { type: "event" },
	onerror: { type: "event" },
	onfocus: { type: "event" },
	onblur: { type: "event" },
	onreset: { type: "event" },
	onsubmit: { type: "event" }
}, pe = /* @__PURE__ */ "text.comment.a.abbr.acronym.address.applet.area.article.aside.audio.b.base.basefont.bdi.bdo.bgsound.big.blink.blockquote.body.br.button.canvas.caption.center.cite.code.col.colgroup.content.data.datalist.dd.decorator.del.details.dfn.dir.div.dl.dt.element.em.embed.fieldset.figcaption.figure.font.footer.form.frame.frameset.h1.h2.h3.h4.h5.h6.head.header.hgroup.hr.html.i.iframe.img.input.ins.isindex.kbd.keygen.label.legend.li.link.listing.main.map.mark.marquee.menu.menuitem.meta.meter.nav.nobr.noframes.noscript.object.ol.optgroup.option.output.p.param.plaintext.pre.progress.q.rp.rt.ruby.s.samp.script.section.select.shadow.small.source.spacer.span.strike.strong.style.sub.summary.sup.table.tbody.td.template.textarea.tfoot.th.thead.time.title.tr.track.tt.u.ul.var.video.wbr.xmp".split(".");
//#endregion
//#region src/properties/data.reactive.js
function me(e, t) {
	if (typeof t == "object" && t) {
		let n = {};
		for (let e in t) {
			let r = t[e];
			typeof r == "object" ? n[e] = JSON.stringify(r) : n[e] = r;
		}
		Object.assign(e.dataset, n);
	} else e.dataset = null;
}
var he = {
	type: "reactive",
	key: "data",
	getConfig: function(e, t) {
		if (t !== null && (typeof t != "object" || t instanceof Array)) throw Error("data property should be an object with explicits keys:\n" + JSON.stringify(this.blueprint, null, "  "));
		return {
			reactiveData: null,
			subjects: t,
			scope: e
		};
	},
	install: function(e) {
		if (e.scope.data === e.subjects) throw Error("It is not allowed to use Scope.data as data value");
		if (!this.blueprint.module) {
			e.reactiveData = J(this, e.subjects, e.scope, !0), new j(e.reactiveData).onAll(() => {
				me(this.node, e.reactiveData);
			});
			return;
		}
		return Object.assign(this.data, e.subjects), !1;
	},
	update: function(e, t, n) {
		n && (t = n()), e.subjects === t && (t = e.reactiveData), me(this.node, t);
	}
}, ge = {
	type: "prop",
	key: "nodeValue"
}, _e = {
	type: "prop",
	key: "nodeValue"
}, ve = {
	type: "prop",
	key: "text",
	update: function(e, t) {
		let n = t ?? "";
		n instanceof Object && (n = JSON.stringify(n));
		let r = e.node, i = r["<>text"];
		if (i) i.nodeValue = n;
		else {
			let e = r["<>text"] = document.createTextNode(n);
			r.insertBefore(e, r.firstChild);
		}
	}
}, ye = /=\s*'<([^\[\]<>]*)>(.*)'/m, be = /=\s*'=\s*"<([^\[\]<>]*)>(.*)"/m, xe = /^\(\s*([^)]+?)\s*\)|^function.*\(\s*([^)]+?)\s*\)/m, Se = /^<([^\[\]<>]*)>\s*([^<>]*)\s*$|^=\s*([^\[\]<>]*)\s*$/;
function N(e) {
	let t = [], n = [], r = [], i = !1, a = typeof e, o = null;
	if (a === "string") {
		let i = e.match(Se);
		i && (r = [i[1]], t = [i[2]], n = [e]);
	} else if (a === "function") {
		i = !0, o = e;
		let a = e.toString().match(xe);
		a && (n = (a[1] || a[2]).split(",").map((e) => {
			let n = e.indexOf("\"") === -1 ? e.match(ye) : e.match(be);
			if (n) return r.push(n[1]), t.push(n[2]), "<>" + n[2];
		}));
	}
	return {
		propertyKeys: t,
		propertyValues: n,
		bindTypes: r,
		handler: o,
		isExpression: i,
		expressionFn: null
	};
}
//#endregion
//#region src/properties/checked.property.js
var Ce = {
	type: "prop",
	key: "checked",
	beforeActivate: function(e, t, n, r) {
		if (!t) return;
		if (r && e.blueprint.tag === "input") throw Error("input.checked property does not support binding expressions because it must be able to change its data.\nIt uses its bound value as its `model` and expressions can not be used as model.\n");
		let i = N(e.blueprint.checked).propertyKeys[0].split(".").pop(), a = e.node;
		a.addEventListener("change", function() {
			let e = t.data[i];
			if (e instanceof Array && a.type !== "radio") {
				let n = a.hasAttribute("value") ? a.value : !0;
				e instanceof Array ? e.indexOf(n) === -1 ? e.push(n) : e.splice(e.indexOf(n), 1) : t.data[i] = [n];
			} else a.hasAttribute("value") ? t.data[i] = a.checked ? a.value : null : t.data[i] = a.checked;
		});
	},
	update: function(e, t) {
		let n = e.node;
		e.rendered.then(function() {
			if (t instanceof Array) {
				if (n.type === "radio") return console.error("Inputs with type `radio` can not provide array as a value."), console.warn("Read about radio input at: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio");
				let e = n.hasAttribute("value") ? n.value : !0;
				n.checked = t.indexOf(e) !== -1;
			} else n.hasAttribute("value") ? n.checked = t === n.value : n.checked = t;
		});
	}
}, we = {
	type: "reactive",
	key: "class",
	getConfig: function(e, t) {
		return {
			scope: e,
			subjects: t,
			reactiveClasses: null,
			observer: null
		};
	},
	install: function(e) {
		if (this.virtual || e.subjects === null || e.subjects instanceof Array || typeof e.subjects != "object") return !0;
		let t = this, n = e.reactiveClasses = J(t, e.subjects, e.scope, !0), r = e.observer = new j(n), i = t.blueprint.animations || {}, a = !!window.gsap.config;
		return t.blueprint.renderConfig.applyClassListAfterRender ? t.rendered.then(() => {
			r.onAll((e) => {
				a && (i["add:" + e] || i["remove:" + e]) || P(t, n);
			});
		}) : r.onAll((e) => {
			a && (i["add:" + e] || i["remove:" + e]) || P(t, n);
		}), !0;
	},
	update: function(e, t, n) {
		if (this.virtual) return;
		let r = this, i = r.node;
		if (n && (t = n()), typeof t == "string" || t == null) return i.className = t;
		if (t instanceof Array) return i.className = t.join(" ");
		e.subjects === t && (t = e.reactiveClasses), r.blueprint.renderConfig.applyClassListAfterRender ? r.rendered.then(() => {
			P(r, t);
		}) : P(r, t);
	}
};
function Te(e) {
	if (typeof e == "string") return [e];
	if (e instanceof Array) return e;
	if (typeof e == "object" && e) {
		let t = [];
		for (let n in e) e.hasOwnProperty(n) && e[n] && t.push(n);
		return t;
	}
}
function P(e, t) {
	let n = e.node.className || [], r = Te(t);
	JSON.stringify(n) !== JSON.stringify(r) && (e.node.className = r.join(" "));
}
//#endregion
//#region src/dom-apply.js
function Ee(e, t, n) {
	t != null && t !== !1 ? e.node.setAttribute(n, t === !0 ? "" : t) : e.node.removeAttribute(n);
}
function De(e, t, n) {
	e.node[n] = t;
}
//#endregion
//#region src/properties/disabled.property.js
var Oe = {
	type: "attr",
	key: "disabled",
	update: function(e, t, n) {
		e.rendered.then(() => {
			if (e.blueprint.tag.toLowerCase() === "form") {
				let n = e.node.querySelectorAll("input, textarea, select, button");
				t ? Array.prototype.forEach.call(n, (e) => e.setAttribute("disabled", "")) : Array.prototype.forEach.call(n, (e) => e.removeAttribute("disabled"));
			}
		}), Ee(e, t ? "" : null, n);
	}
}, ke = {
	type: "reactive",
	key: "if",
	getConfig: function() {
		return { throttleId: 0 };
	},
	install: function(e) {
		return !0;
	},
	update: function(e, t, n) {
		e.throttleId !== 0 && (window.clearTimeout(e.throttleId), e.throttleId = 0), n && (t = n()), t = !!t, !this.rendered.resolved && !this.inDOM && (this.blueprint.renderConfig.renderDetached = !t), e.throttleId = setTimeout(() => {
			this.inDOM !== t && this.setInDOM(t);
		});
	}
}, Ae = {
	type: "reactive",
	key: "module",
	getConfig: function(e) {
		return {
			previousModule: null,
			moduleMeta: null,
			scope: e
		};
	},
	install: function() {
		return !0;
	},
	update: function(e, t, n) {
		let r = this;
		if (n && (t = n()), t !== void 0) {
			if (typeof t != "object") return console.error("module property only accept objects as value", t);
			t && e.moduleMeta && t.path === e.moduleMeta.path || ((!t || t !== e.moduleMeta) && (je(r), e.loadedModule &&= (e.loadedModule.destroy(), null)), !r.virtual && t && t.path && t !== e.moduleMeta && O(r.index, (n) => {
				Me.call(null, r, e, t, n);
			}), e.moduleMeta = t);
		}
	}
};
function je(e) {
	let t = e.getChildNodes();
	for (let e = 0, r = t.length; e < r; e++) {
		let r = t[e];
		r.processLeaveAnimation === n && (r.processLeaveAnimation = function(e) {
			e();
		});
	}
	e.clean(e.hasAnimation(t));
}
function Me(e, t, n, r) {
	let i = new fe(n.path), a = t.scope, o = t.scope;
	for (typeof n.onInvoke == "function" && n.onInvoke.call(); a;) {
		if (o instanceof Z || (o = new Z({
			id: "repeat-item",
			path: t.scope.__parent__.uri.parsedURL,
			parentScope: t.scope.__parent__
		})), i.parsedURL === o.uri.parsedURL) return console.error("Circular module loading detected and stopped. \n" + o.uri.parsedURL + " tries to load itself.");
		a = a.parentScope;
	}
	o.load(n, { element: e }).then(function(i) {
		t.loadedModule = i, e.node.setAttribute("module", i.path), i.start(), typeof n.onLoad == "function" && n.onLoad.call(), r();
	}).catch(function(e) {
		console.error(e), r();
	});
}
//#endregion
//#region src/properties/on.property.js
var Ne = {
	type: "prop",
	key: "on",
	update: function(e, t) {
		if (typeof t == "object" && t) {
			for (let n in t) if (t.hasOwnProperty(n)) {
				let r = function(r) {
					return t[n].call(e, r, e.data);
				};
				e.node.addEventListener(n, r, !1), e.finalize.push(() => {
					e.node.removeEventListener(n, r, !1);
				});
			}
		}
	}
}, F = class e {
	static lastId = 0;
	constructor() {
		this.id = e.lastId++, e.lastId > 1e8 && (e.lastId = 0), this.init = null, this.original = null, this.returnValue = null, this.params = [], this.type = "reset";
	}
	getInstance() {
		let t = new e();
		return t.init = this.init, t.original = this.original, t.params = [...this.params], t.type = this.type, t;
	}
}, Pe = {
	type: "reactive",
	key: "repeat",
	getConfig: function(e, t) {
		return this.virtualize(), {
			changeId: null,
			previousActionId: null,
			nodes: [],
			data: t.data,
			as: t.as,
			indexAs: t.indexAs || "_index",
			oldChanges: {},
			positions: [],
			trackMap: [],
			scope: e,
			trackBy: t.trackBy,
			onComplete: t.onComplete
		};
	},
	install: function(e) {
		let t = this;
		if (e.data) {
			if (e.as === "data") throw Error("`data` is an invalid value for repeat.as property. Please choose a different value.`");
			t.localPropertyNames.add(e.as), t.localPropertyNames.add(e.indexAs);
			let n = N(e.data);
			if (n.propertyKeys.length) q(t, "repeat", void 0, e.scope, n, t), n.propertyKeys.forEach((n) => {
				try {
					let r = ht(e.scope, n);
					t.finalize.push(() => {
						r.removeNode(t);
					});
				} catch (e) {
					console.error("Could not find: " + n + "\n", e);
				}
			});
			else if (e.data instanceof Array) {
				let n = t.setters.repeat = St(Pe, t, e.data, null), r = new F();
				r.params = e.data, e.data.changes = r, n(e.data);
			}
		}
		return !1;
	},
	update: function(e, t, n) {
		let r = null;
		if (n) {
			if (t = n(), t === void 0) return;
			if (t === null) throw Error("Invalid return type: " + t + "\nThe expression function for `repeat.data` must return an instance of Array or Galaxy.View.ArrayChange or undefined");
			if (t instanceof F) r = t;
			else if (t instanceof Array) {
				let e = new F();
				e.original = t, e.type = "reset", e.params = t, r = t.changes = e;
			} else if (t instanceof Object) {
				let e = Object.entries(t).map(([e, t]) => ({
					key: e,
					value: t
				})), n = new F();
				n.original = e, n.type = "reset", n.params = e, r = t.changes = n;
			} else r = {
				type: "reset",
				params: []
			};
		} else if (t instanceof F) r = t;
		else if (t instanceof Array) r = t.changes;
		else if (t instanceof Object) {
			let e = Object.entries(t).map(([e, t]) => ({
				key: e,
				value: t
			}));
			r = new F(), r.original = e, r.type = "reset", r.params = e;
		}
		if (r && !(r instanceof F)) return console.warn("%crepeat %cdata is not a type of ArrayChange\ndata: " + e.data + "\n%ctry '" + e.data + ".changes'\n", "color:black;font-weight:bold", null, "color:green;font-weight:bold");
		(!r || typeof r == "string") && (r = {
			id: 0,
			type: "reset",
			params: []
		});
		let i = this;
		r.id !== e.changeId && (e.changeId = r.id, e.oldChanges = r, Ie(i, e, Fe(i, e, r)));
	}
};
function Fe(e, t, n) {
	let r = e.blueprint.animations && e.blueprint.animations.leave, i = t.trackBy;
	if (i && n.type === "reset") {
		let e;
		i === !0 ? e = n.params.map((e) => e) : typeof i == "string" && (e = n.params.map((e) => e[i]));
		let a = [];
		t.trackMap = t.trackMap.filter(function(n, r) {
			return e.indexOf(n) === -1 && t.nodes[r] ? (a.push(t.nodes[r]), !1) : !0;
		});
		let o = new F();
		return o.init = n.init, o.type = n.type, o.original = n.original, o.params = n.params, o.__rd__ = n.__rd__, o.type === "reset" && o.params.length && (o.type = "push"), t.nodes = t.nodes.filter(function(e) {
			return a.indexOf(e) === -1;
		}), K(a, r), o;
	} else if (n.type === "reset") {
		let e = t.nodes.slice(0);
		t.nodes = [], K(e, r);
		let i = Object.assign({}, n);
		return i.type = "push", i;
	}
	return n;
}
function Ie(e, t, n) {
	let r = e.parent, i = [], a = [], o = t.scope, s = t.trackMap, c = t.as, l = t.indexAs, u = t.nodes, d = t.trackBy, f = e.cloneBlueprint();
	f.repeat = null;
	let p = u.length ? u[u.length - 1].anchor.nextSibling : e.placeholder.nextSibling, m = [], h;
	if (h = d === !0 ? function(e, t, n) {
		s.push(n), this.push(e);
	} : typeof d == "string" ? function(e, n, r) {
		s.push(r[t.trackBy]), this.push(e);
	} : function(e) {
		this.push(e);
	}, n.type === "push") m = n.params;
	else if (n.type === "unshift") p = u[0] ? u[0].anchor : p, m = n.params, h = d === !0 ? function(e, t, n) {
		s.unshift(n), this.unshift(e);
	} : function(e, t, n) {
		s.unshift(n[d]), this.unshift(e);
	};
	else if (n.type === "splice") {
		let t = n.params.slice(0, 2);
		K(Array.prototype.splice.apply(u, t).reverse(), e.blueprint.animations && e.blueprint.animations.leave), Array.prototype.splice.apply(s, t);
		let r = n.params[0];
		m = n.params.slice(2);
		for (let e = 0, t = m.length; e < t; e++) {
			let t = e + r;
			i.push(t), a.push(u[t] ? u[t].anchor : p);
		}
		h = d === !0 ? function(e, t, n) {
			s.splice(t, 0, n), this.splice(t, 0, e);
		} : function(e, t, n) {
			s.splice(t, 0, n[d]), this.splice(t, 0, e);
		};
	} else if (n.type === "pop") {
		let e = u.pop();
		e && e.destroy(), s.pop();
	} else if (n.type === "shift") {
		let e = u.shift();
		e && e.destroy(), s.shift();
	} else (n.type === "sort" || n.type === "reverse") && (u.forEach(function(e) {
		e.destroy();
	}), t.nodes = [], m = n.original, Array.prototype[n.type].call(s));
	let g = e.view;
	if (m instanceof Array) {
		let n = m.slice(0);
		if (d) if (d === !0) for (let e = 0, d = m.length; e < d; e++) {
			let d = n[e], m = s.indexOf(d);
			if (m !== -1) {
				t.nodes[m].data._index = m;
				continue;
			}
			I(g, f, o, c, d, l, e, r, a[e] || p, h, u, i);
		}
		else for (let e = 0, _ = m.length; e < _; e++) {
			let m = n[e], _ = s.indexOf(m[d]);
			if (_ !== -1) {
				t.nodes[_].data._index = _;
				continue;
			}
			I(g, f, o, c, m, l, e, r, a[e] || p, h, u, i);
		}
		else for (let e = 0, t = m.length; e < t; e++) I(g, f, o, c, n[e], l, e, r, a[e] || p, h, u, i);
		t.onComplete && O(e.index, (e) => {
			t.onComplete(u), e();
		});
	}
}
function Le(e, t, n) {
	let r = pt(e);
	return r[t] = n, r;
}
function I(e, t, n, r, i, a, o, s, c, l, u, d) {
	let f = Le(n, r, i), p = m(t);
	f[a] = o;
	let h = e.createNode(p, f, s, c);
	l.call(u, h, d[o], f[r]);
}
//#endregion
//#region src/properties/selected.property.js
var Re = {
	type: "prop",
	key: "selected",
	beforeActivate: function(e, t, n, r) {
		if (t) {
			if (r && e.blueprint.tag === "select") throw Error("select.selected property does not support binding expressions because it must be able to change its data.\nIt uses its bound value as its `model` and expressions can not be used as model.\n");
			e.blueprint.tag === "select" && (N(e.blueprint.selected).propertyKeys[0].split(".").pop(), e.node.addEventListener("change", (t) => {
				console.log(e.node, "SELECTED", t);
			}));
		}
	},
	update: function(e, t) {
		let n = e.node;
		e.rendered.then(function() {
			n.value !== t && (e.blueprint.tag === "select" ? n.value = t : t ? n.setAttribute("selected", !0) : n.removeAttribute("selected"));
		});
	}
}, ze = {
	type: "prop",
	key: "style"
}, Be = {
	type: "prop",
	key: "style"
}, Ve = {
	type: "reactive",
	key: "style",
	getConfig: function(e, t) {
		return {
			scope: e,
			subjects: t,
			reactiveStyle: null
		};
	},
	install: function(e) {
		if (this.virtual || e.subjects === null || e.subjects instanceof Array || typeof e.subjects != "object") return !0;
		let t = this.node, n = e.reactiveStyle = J(this, e.subjects, e.scope, !0);
		return new j(n).onAll(() => {
			L(t, n);
		}), !0;
	},
	update: function(e, t, n) {
		if (this.virtual) return;
		let r = this.node;
		if (n && (t = n()), typeof t == "string") return r.style = t;
		if (t instanceof Array) return r.style = t.join(";");
		if (t instanceof Promise) t.then(function(e) {
			L(r, e);
		});
		else if (t === null) return r.removeAttribute("style");
		e.subjects === t && (t = e.reactiveStyle), L(r, t);
	}
};
function L(e, t) {
	if (t instanceof Object) for (let n in t) {
		let r = t[n];
		r instanceof Promise ? r.then((t) => {
			e.style[n] = t;
		}) : typeof r == "function" ? e.style[n] = r.call(e.__vn__, e.__vn__.data) : e.style[n] = r;
	}
	else e.style = t;
}
//#endregion
//#region src/properties/value.property.js
var He = [
	"radio",
	"checkbox",
	"button",
	"reset",
	"submit"
], Ue = { type: "none" }, We = {
	type: "prop",
	key: "value",
	beforeActivate: function(e, t, n, r) {
		let i = e.node;
		if (!t || He.indexOf(i.type) !== -1) return;
		if (r) throw Error("input.value property does not support binding expressions because it must be able to change its data.\nIt uses its bound value as its `model` and expressions can not be used as model.\n");
		let a = N(e.blueprint.value).propertyKeys[0].split(".").pop();
		if (i.tagName === "SELECT") {
			let n = new MutationObserver(() => {
				e.rendered.then(() => {
					i.value = t.data[a];
				});
			});
			n.observe(i, { childList: !0 }), e.finalize.push(() => {
				n.disconnect();
			}), i.addEventListener("change", Ke(t, a));
		} else i.type === "number" || i.type === "range" ? i.addEventListener("input", Ge(i, t, a)) : i.addEventListener("input", Ke(t, a));
	},
	update: function(e, t) {
		(t !== e.node.value || !e.node.value) && (e.node.value = t ?? "");
	}
};
function Ge(e, t, n) {
	return function() {
		t.data[n] = e.value ? Number(e.value) : null;
	};
}
function Ke(e, t) {
	return function(n) {
		e.data[t] = n.target.value;
	};
}
M.data = he, M.text_3 = ge, M.text_8 = _e, M.text = ve, M.animations = k, M.checked = Ce, M.class = we, M.disabled = Oe, M.if = ke, M.module = Ae, M.on = Ne, M.repeat = Pe, M.selected = Re, M.style = Ve, M.style_3 = ze, M.style_8 = Be, M["value.config"] = Ue, M.value = We, M.visible = {
	type: "reactive",
	key: "visible",
	getConfig: function() {
		return { throttleId: 0 };
	},
	install: function() {
		return !0;
	},
	update: function(e, t, n) {
		e.throttleId !== 0 && (window.clearTimeout(e.throttleId), e.throttleId = 0), n && (t = n()), e.throttleId = window.setTimeout(() => {
			this.visible !== t && this.setVisibility(t);
		});
	}
}, M._create = {
	type: "prop",
	key: "_create",
	getSetter: () => n
}, M._render = {
	type: "prop",
	key: "_render",
	getSetter: () => n
}, M._destroy = {
	type: "prop",
	key: "_destroy",
	getSetter: () => n
}, M.renderConfig = {
	type: "prop",
	key: "renderConfig"
};
var R = {
	value: void 0,
	configurable: !1,
	enumerable: !1
}, qe = {
	value: null,
	configurable: !1,
	enumerable: !1,
	writable: !0
};
function Je(e, t, n) {
	e.insertBefore(t, n);
}
function z(e, t) {
	e.removeChild(t);
}
function B(e) {
	let t = this;
	e ? (t.node.parentNode && z(t.node.parentNode, t.node), t.placeholder.parentNode && z(t.placeholder.parentNode, t.placeholder), t.garbage.forEach(function(e) {
		B.call(e, !0);
	}), t.hasBeenDestroyed()) : (t.placeholder.parentNode || Je(t.node.parentNode, t.placeholder, t.node), t.node.parentNode && z(t.node.parentNode, t.node), t.garbage.forEach(function(e) {
		B.call(e, !0);
	})), t.garbage = [];
}
V.GLOBAL_RENDER_CONFIG = {
	applyClassListAfterRender: !1,
	renderDetached: !1
}, V.cleanReferenceNode = function(e) {
	e instanceof Array ? e.forEach(function(e) {
		V.cleanReferenceNode(e);
	}) : e instanceof Object && (e.node = null, V.cleanReferenceNode(e.children));
};
function V(e, t, i, a) {
	let o = this;
	o.view = i, e.tag instanceof Node ? (o.node = e.tag, e.tag = e.tag.tagName) : o.node = _(e.tag || "div", t), "style" in o.node || (o.processEnterAnimation = n), o.blueprint = e, o.data = a instanceof Z ? {} : a, o.localPropertyNames = /* @__PURE__ */ new Set(), o.inputs = {}, o.virtual = !1, o.visible = !0, o.placeholder = g(e.tag || "div"), o.properties = /* @__PURE__ */ new Set(), o.inDOM = !1, o.setters = {}, o.parent = t, o.finalize = [], o.origin = !1, o.destroyOrigin = 0, o.transitory = !1, o.garbage = [], o.leaveWithParent = !1, o.onLeaveComplete = B.bind(o, !0), o._display = null, r(o, "cache", {
		enumerable: !1,
		configurable: !1,
		value: {}
	}), o.rendered = new Promise(function(e) {
		"style" in o.node ? o.hasBeenRendered = function() {
			o.rendered.resolved = !0, o.node.style.setProperty("display", o._display), o.blueprint._render && o.blueprint._render.call(o, o.data), e(o);
		} : o.hasBeenRendered = function() {
			o.rendered.resolved = !0, e();
		};
	}), o.rendered.resolved = !1, o.destroyed = new Promise(function(e) {
		o.hasBeenDestroyed = function() {
			o.destroyed.resolved = !0, o.blueprint._destroy && o.blueprint._destroy.call(o, o.data), e();
		};
	}), o.destroyed.resolved = !1, o.blueprint.renderConfig = Object.assign({}, V.GLOBAL_RENDER_CONFIG, e.renderConfig || {}), qe.value = this.node, r(o.blueprint, "node", qe), R.value = this, o.node.__vn__ || (r(o.node, "__vn__", R), r(o.placeholder, "__vn__", R)), o.blueprint._create && o.blueprint._create.call(o, o.data);
}
V.prototype = {
	onLeaveComplete: null,
	dump: function() {
		let e = this.parent, t = this.garbage;
		for (; e.transitory && (e.blueprint.hasOwnProperty("if") && !this.blueprint.hasOwnProperty("if") && (t = e.garbage), e.parent && e.parent.transitory);) e = e.parent;
		t.push(this), this.garbage = [];
	},
	query: function(e) {
		return this.node.querySelector(e);
	},
	dispatchEvent: function(e) {
		this.node.dispatchEvent(e);
	},
	cloneBlueprint: function() {
		let e = Object.assign({}, this.blueprint);
		return V.cleanReferenceNode(e), r(e, "mother", {
			value: this.blueprint,
			writable: !1,
			enumerable: !1,
			configurable: !1
		}), e;
	},
	virtualize: function() {
		this.placeholder.nodeValue = JSON.stringify(this.blueprint, (e, t) => e === "children" ? "<children>" : e === "animations" ? "<animations>" : t, 2), this.virtual = !0, this.setInDOM(!1);
	},
	processEnterAnimation: function() {
		this.node.style.display = this._display;
	},
	processLeaveAnimation: n,
	populateHideSequence: function() {
		this.node.style.display = "none";
	},
	setInDOM: function(e) {
		if (this.blueprint.renderConfig.renderDetached) {
			O(this.index, (e) => {
				this.blueprint.renderConfig.renderDetached = !1, this.hasBeenRendered(), e();
			});
			return;
		}
		if (this.inDOM = e, !this.virtual) {
			if (e) {
				"style" in this.node && (this._display = this.node.style.display === "none" ? null : this.node.style.display, this.node.style.setProperty("display", "none")), this.node.parentNode || Je(this.placeholder.parentNode, this.node, this.placeholder.nextSibling), this.placeholder.parentNode && z(this.placeholder.parentNode, this.placeholder), O(this.index, (e) => {
					this.hasBeenRendered(), this.processEnterAnimation(), e();
				});
				let e = this.getChildNodesAsc(), t = e.length;
				for (let n = 0; n < t; n++) e[n].setInDOM(!0);
			} else if (!e && this.node.parentNode) {
				this.origin = !0, this.transitory = !0;
				let e = this.processLeaveAnimation, t = this.getChildNodes();
				this.prepareLeaveAnimation(this.hasAnimation(t), t), D(this.index, (t) => {
					this.processLeaveAnimation(B.bind(this, !1)), this.origin = !1, this.transitory = !1, this.processLeaveAnimation = e, t();
				});
			}
		}
	},
	setVisibility: function(e) {
		this.visible = e, e && !this.virtual ? O(this.index, (e) => {
			this.node.style.display = null, this.processEnterAnimation(), e();
		}) : !e && this.node.parentNode && (this.origin = !0, this.transitory = !0, D(this.index, (e) => {
			this.populateHideSequence(), this.origin = !1, this.transitory = !1, e();
		}));
	},
	registerChild: function(e, t) {
		this.node.insertBefore(e.placeholder, t);
	},
	createNode: function(e, t) {
		this.view.createNode(e, t, this);
	},
	registerActiveProperty: function(e, t, n) {
		this.properties.add(t), xt(this, e, t, n);
	},
	snapshot: function(e) {
		let t = this.node.getBoundingClientRect(), n = this.node.cloneNode(!0), r = {
			margin: "0",
			width: t.width + "px",
			height: t.height + " px",
			top: t.top + "px",
			left: t.left + "px",
			position: "fixed"
		};
		return Object.assign(n.style, r), {
			tag: n,
			style: r
		};
	},
	hasAnimation: function(e) {
		if (this.processLeaveAnimation && this.processLeaveAnimation !== n) return !0;
		for (let t = 0, n = e.length; t < n; t++) {
			let n = e[t];
			if (n.hasAnimation(n.getChildNodes())) return !0;
		}
		return !1;
	},
	prepareLeaveAnimation: function(e, t) {
		let r = this;
		if (e) {
			if (r.processLeaveAnimation === n) r.origin ? r.processLeaveAnimation = function() {
				B.call(r, !1);
			} : r.destroyOrigin === 1 && B.call(r, !0);
			else if (r.processLeaveAnimation !== n && !r.origin) for (let e = 0, r = t.length; e < r; e++) t[e].onLeaveComplete = n;
		} else r.processLeaveAnimation = function() {
			B.call(r, !r.origin);
		};
	},
	destroy: function(e) {
		let t = this;
		if (t.transitory = !0, t.parent.destroyOrigin === 0 ? t.destroyOrigin = 1 : t.destroyOrigin = 2, t.inDOM) {
			let n = t.getChildNodes();
			e ||= t.hasAnimation(n), t.prepareLeaveAnimation(e, n), t.clean(e, n);
		}
		t.properties.forEach((e) => e.removeNode(t));
		let r = t.finalize.length;
		for (let e = 0; e < r; e++) t.finalize[e].call(t);
		D(t.index, (e) => {
			t.processLeaveAnimation(t.destroyOrigin === 2 ? n : t.onLeaveComplete), t.localPropertyNames.clear(), t.properties.clear(), t.finalize = [], t.inDOM = !1, t.inputs = {}, t.view = null, t.parent = null, Reflect.deleteProperty(t.blueprint, "node"), e();
		});
	},
	getChildNodes: function() {
		let e = [], t = s.call(this.node.childNodes, 0);
		for (let n = t.length - 1; n >= 0; n--) {
			let r = t[n];
			"__vn__" in r && e.push(r.__vn__);
		}
		return e;
	},
	getChildNodesAsc: function() {
		let e = [], t = s.call(this.node.childNodes, 0);
		for (let n = 0; n < t.length; n++) {
			let r = t[n];
			"__vn__" in r && e.push(r.__vn__);
		}
		return e;
	},
	clean: function(e, t) {
		t ||= this.getChildNodes(), K(t, e), D(this.index, (e) => {
			let t = this.finalize.length;
			for (let e = 0; e < t; e++) this.finalize[e].call(this);
			this.finalize = [], e();
		});
	},
	createNext: function(e) {
		O(this.index, e);
	},
	get index() {
		let e = this.parent;
		if (e) {
			let t = this.placeholder.parentNode ? this.placeholder.previousSibling : this.node.previousSibling;
			if (t) {
				if (!t.hasOwnProperty("__index__")) {
					let e = 0, n = this.node;
					for (; (n = n.previousSibling) !== null;) ++e;
					t.__index__ = e;
				}
				this.node.__index__ = t.__index__ + 1;
			} else this.node.__index__ = 0;
			return e.index + " " + p(this.node.__index__);
		}
		return p(0);
	},
	get anchor() {
		return this.inDOM ? this.node : this.placeholder;
	}
};
//#endregion
//#region src/setters/prop.js
function Ye(e, t, n) {
	let r = t.key, i = Xe(t.update || De, e, r);
	return n ? function() {
		i(n());
	} : i;
}
function Xe(e, t, n) {
	return function(r) {
		if (r instanceof Promise) {
			let i = function(r) {
				e(t, r, n);
			};
			r.then(i).catch(i);
		} else r instanceof Function ? e(t, r.call(t, t.data), n) : e(t, r, n);
	};
}
//#endregion
//#region src/setters/attr.js
function Ze(e, t, n) {
	let r = t.key, i = Qe(t.update || Ee, e, r);
	return n ? function() {
		i(n());
	} : i;
}
function Qe(e, t, n) {
	return function(r) {
		if (r instanceof Promise) {
			let i = function(r) {
				e(t, r, n);
			};
			r.then(i).catch(i);
		} else r instanceof Function ? e(t, r.call(t, t.data), n) : e(t, r, n);
	};
}
//#endregion
//#region src/setters/reactive.js
function $e(e, t, n, r) {
	let i = t.key, a = t.update, o = e.cache[i];
	return et(a, e, o, n, r);
}
function et(e, t, n, r, i) {
	let a = e.bind(t);
	return function(e) {
		return a(n, e, r, i);
	};
}
//#endregion
//#region src/reactive-data.js
var tt = Array.prototype, nt = [
	"push",
	"pop",
	"shift",
	"unshift",
	"splice",
	"sort",
	"reverse"
], rt = [
	"push",
	"pop",
	"shift",
	"unshift",
	"splice",
	"sort",
	"reverse",
	"changes",
	"__rd__"
], it = Object.keys, H = Object.defineProperty, at = function(e) {
	return {
		id: e || "Scope",
		shadow: {},
		data: {},
		notify: function() {},
		notifyDown: function() {},
		sync: function() {},
		makeReactiveObject: function() {},
		addKeyToShadow: function() {}
	};
}, ot = function(e) {
	if (e instanceof Array) {
		let t = ["length"];
		return e.hasOwnProperty("changes") && t.push("changes"), t;
	} else return Object.keys(e);
};
function st(e, t, n) {
	let r = tt[t];
	return function() {
		let i = this.__rd__, a = arguments.length, o = Array(a);
		for (; a--;) o[a] = arguments[a];
		let s = r.apply(this, o), c = new F(), l = c.original = e;
		switch (c.type = t, c.params = o, c.returnValue = s, c.init = n, t) {
			case "push":
			case "reset":
			case "unshift":
				let e = l.length - 1;
				for (let t = 0, n = c.params.length; t < n; t++) {
					let n = c.params[t];
					typeof n == "object" && n && new W(e + t, n, i);
				}
				break;
			case "pop":
			case "shift":
				typeof s == "object" && s && "__rd__" in s && s.__rd__.removeMyRef();
				break;
			case "splice":
				c.params.slice(2).forEach(function(e) {
					typeof e == "object" && e && new W(l.indexOf(e), e, i);
				});
				break;
		}
		return e.changes = c, i.notifyDown("length"), i.notifyDown("changes"), i.notify(i.keyInParent, this), s;
	};
}
var U = {
	_(e, t, n) {
		n instanceof F && (n = n.getInstance()), e instanceof V ? e.setters[t](n) : e[t] = n, j.notify(e, t, n);
	},
	self(e, t, n, r, i) {
		i || r || U._(e, t, n);
	},
	props(e, t, n, r, i) {
		i && U._(e, t, n);
	}
};
function ct() {
	this.keys = [], this.nodes = [], this.types = [];
}
ct.prototype.push = function(e, t, n) {
	this.keys.push(e), this.nodes.push(t), this.types.push(n);
};
function W(e, t, r) {
	let i = r instanceof W ? r : at(r);
	if (this.data = t, this.id = i.id + (e ? "." + e : "|Scope"), this.keyInParent = e, this.nodesMap = Object.create(null), this.parent = i, this.refs = [], this.shadow = Object.create(null), this.nodeCount = -1, this.data && this.data.hasOwnProperty("__rd__")) {
		this.refs = this.data.__rd__.refs;
		let t = this.getRefById(this.id);
		if (t) return t.parent.isDead && (t.parent = i), this.fixHierarchy(e, t), t;
		this.refs.push(this);
	} else {
		if (this.refs.push(this), this.data === null) {
			if (this.parent.shadow[e]) return this.parent.shadow[e];
			this.data = {}, this.parent.data[e] ? new W(e, this.parent.data[e], this.parent) : this.parent.makeReactiveObject(this.parent.data, e, !0);
		}
		if (!Object.isExtensible(this.data)) return;
		H(this.data, "__rd__", {
			enumerable: !1,
			configurable: !0,
			value: this
		}), (this.data instanceof Z || this.data.__scope__) && (this.addKeyToShadow = n), this.data instanceof Z ? this.walkOnScope(this.data) : this.walk(this.data);
	}
	this.fixHierarchy(e, this);
}
W.prototype = {
	get isDead() {
		return this.nodeCount === 0 && this.refs.length === 1 && this.refs[0] === this;
	},
	fixHierarchy: function(e, t) {
		this.parent.data instanceof Array ? this.keyInParent = this.parent.keyInParent : this.parent.shadow[e] = t;
	},
	setData: function(e) {
		if (this.removeMyRef(), !(e instanceof Object)) {
			this.data = {};
			for (let t in this.shadow) this.shadow[t] instanceof W ? this.shadow[t].setData(e) : this.notifyDown(t);
			return;
		}
		this.data = e, e.hasOwnProperty("__rd__") ? (this.data.__rd__.addRef(this), this.refs = this.data.__rd__.refs, this.data instanceof Array ? (this.sync("length", this.data.length, !1, !1), this.sync("changes", this.data.changes, !1, !1)) : this.syncAll()) : (H(this.data, "__rd__", {
			enumerable: !1,
			configurable: !0,
			value: this
		}), this.walk(this.data)), this.setupShadowProperties(ot(this.data));
	},
	walk: function(e) {
		if (!(e instanceof Node)) {
			if (e instanceof Array) this.makeReactiveArray(e);
			else if (e instanceof Object) for (let t in e) this.makeReactiveObject(e, t, !1);
		}
	},
	walkOnScope: function(e) {},
	makeReactiveObject: function(e, t, n) {
		let r = e[t];
		if (typeof r == "function") return;
		let i = Object.getOwnPropertyDescriptor(e, t), a = i && i.get, o = i && i.set;
		H(e, t, {
			get: function() {
				return a ? a.call(e) : r;
			},
			set: function(n) {
				let i = e.__rd__;
				if (o && o.call(e, n), r === n) {
					n instanceof Array ? i.sync(t, n, !0, !1) : n instanceof Object && i.notifyDown(t);
					return;
				}
				r = n;
				for (let e = 0, r = i.refs.length; e < r; e++) {
					let r = i.refs[e];
					r.shadow[t] && (r.makeKeyEnum(t), r.shadow[t].setData(n));
				}
				i.notify(t, r, null, !1);
			},
			enumerable: !n,
			configurable: !0
		}), this.shadow[t] ? this.shadow[t].setData(r) : this.shadow[t] = null, this.sync(t, r, !1, !1);
	},
	makeReactiveArray: function(e) {
		if (e.hasOwnProperty("changes")) return e.changes.init;
		let t = this, n = new F();
		n.original = e, n.type = "reset", n.params = e;
		for (let e = 0, r = n.params.length; e < r; e++) {
			let r = n.params[e];
			typeof r == "object" && r && new W(n.original.indexOf(r), r, t);
		}
		return t.sync("length", e.length, !1, !1), n.init = n, H(e, "changes", {
			enumerable: !1,
			configurable: !1,
			writable: !0,
			value: n
		}), nt.forEach(function(t) {
			H(e, t, {
				value: st(e, t, n),
				writable: !1,
				configurable: !0
			});
		}), n;
	},
	notify: function(e, t, n, r) {
		if (this.refs === n) {
			this.sync(e, t, !1, r);
			return;
		}
		for (let n = 0, i = this.refs.length; n < i; n++) {
			let i = this.refs[n];
			this !== i && i.notify(e, t, this.refs, r);
		}
		this.sync(e, t, !1, r);
		for (let e = 0, t = this.refs.length; e < t; e++) {
			let t = this.refs[e], n = t.keyInParent, r = t.parent;
			t.parent.notify(n, r.data[n], null, !0);
		}
	},
	notifyDown: function(e) {
		let t = this.data[e];
		this.notifyRefs(e, t), this.sync(e, t, !1, !1);
	},
	notifyRefs: function(e, t) {
		for (let n = 0, r = this.refs.length; n < r; n++) {
			let r = this.refs[n];
			this !== r && r.notify(e, t, this.refs, !1);
		}
	},
	sync: function(e, t, n, r) {
		let i = this, a = i.nodesMap[e];
		if (j.notify(i.data, e, t), a) for (let e = 0, o = a.nodes.length; e < o; e++) i.syncNode(a.types[e], a.nodes[e], a.keys[e], t, n, r);
	},
	syncAll: function() {
		let e = this, t = it(e.data);
		for (let n = 0, r = t.length; n < r; n++) e.sync(t[n], e.data[t[n]], !1, !1);
	},
	syncNode: function(e, t, n, r, i, a) {
		U[e].call(null, t, n, r, i, a);
	},
	addRef: function(e) {
		this.refs.indexOf(e) === -1 && this.refs.push(e);
	},
	removeRef: function(e) {
		let t = this.refs.indexOf(e);
		t !== -1 && this.refs.splice(t, 1);
	},
	removeMyRef: function() {
		if (!(!this.data || !this.data.hasOwnProperty("__rd__"))) if (this.data.__rd__ !== this) this.refs = [this], this.data.__rd__.removeRef(this);
		else if (this.refs.length === 1) {
			let e = this.data;
			if (e instanceof Array) for (let t of rt) Reflect.deleteProperty(e, t);
		} else {
			this.data.__rd__.removeRef(this);
			let e = this.refs[0];
			H(this.data, "__rd__", {
				enumerable: !1,
				configurable: !0,
				value: e
			}), this.refs = [this];
		}
	},
	getRefById: function(e) {
		return this.refs.filter(function(t) {
			return t.id === e;
		})[0];
	},
	addNode: function(e, t, n, r, i) {
		let a = this.nodesMap[n];
		a ||= this.nodesMap[n] = new ct(), r ||= "_", this.nodeCount === -1 && (this.nodeCount = 0);
		let o = a.nodes.indexOf(e);
		if (o === -1 || a.keys[o] !== t) {
			this.nodeCount++, e instanceof V && !e.setters[t] && e.registerActiveProperty(t, this, i), a.push(t, e, r);
			let o = this.data[n];
			o instanceof Array && o.changes && (o.hasOwnProperty("changes") ? o.changes = o.changes.init : H(o, "changes", {
				enumerable: !1,
				configurable: !1,
				writable: !0,
				value: o.changes.init
			})), this.data instanceof Array && n !== "length" && o && (o = o.init), this.syncNode("_", e, t, o, !1, !1);
		}
	},
	removeNode: function(e) {
		for (let t = 0, n = this.refs.length; t < n; t++) this.removeNodeFromRef(this.refs[t], e);
	},
	removeNodeFromRef: function(e, t) {
		let n;
		for (let r in e.nodesMap) {
			n = e.nodesMap[r];
			let i = -1;
			for (; (i = n.nodes.indexOf(t)) !== -1;) n.nodes.splice(i, 1), n.keys.splice(i, 1), n.types.splice(i, 1), this.nodeCount--;
		}
	},
	addKeyToShadow: function(e, t) {
		e in this.shadow || (t ? this.shadow[e] = new W(e, [], this) : this.shadow[e] = null), this.data.hasOwnProperty(e) || this.makeReactiveObject(this.data, e, !1);
	},
	setupShadowProperties: function(e) {
		for (let t in this.shadow) this.shadow[t] instanceof W ? (this.data.hasOwnProperty(t) || this.makeReactiveObject(this.data, t, !0), this.shadow[t].setData(this.data[t])) : e.indexOf(t) === -1 && this.sync(t, void 0, !1, !1);
	},
	makeKeyEnum: function(e) {
		let t = Object.getOwnPropertyDescriptor(this.data, e);
		t && t.enumerable === !1 && (t.enumerable = !0, H(this.data, e, t));
	}
};
//#endregion
//#region src/view.js
var lt = /\.|\[([^\[\]\n]+)]|([^.\n\[\]]+)/g, ut = {};
for (let e in M) M[e].type === "reactive" && (ut[e] = !0);
var dt = {
	none: function() {
		return n;
	},
	prop: Ye,
	attr: Ze,
	reactive: $e
};
function G(e, t) {
	let n = e.match(lt).filter((e) => e !== "" && e !== ".");
	return t ? n.map((e) => e.indexOf("[") === 0 ? e.substring(1, e.length - 1) : e) : n;
}
function ft(e, t) {
	let n = G(t, !0), r = n[0], i = e, a = e, o = e;
	if (e[r] === void 0) {
		for (; o.__parent__;) {
			if (o.__parent__.hasOwnProperty(r)) {
				a = o.__parent__;
				break;
			}
			o = o.__parent__;
		}
		a[r] === void 0 && (a = i);
	}
	a ||= {};
	let s = n.length - 1;
	return n.forEach(function(e, t) {
		a = a[e], t !== s && !(a instanceof Object) && (a = {});
	}), a instanceof F ? a.getInstance() : a === void 0 ? null : a;
}
function K(e, t) {
	let n = null;
	for (let r = 0, i = e.length; r < i; r++) n = e[r], n.destroy(t);
}
function pt(e) {
	let t = {};
	return r(t, "__parent__", {
		enumerable: !1,
		value: e
	}), r(t, "__scope__", {
		enumerable: !1,
		value: e.__scope__ || e
	}), t;
}
function mt(e, t) {
	let n = G(t, !0)[0];
	if (!e || typeof e != "object" || !n) return e;
	let r = e, i = e, a = e, o = /* @__PURE__ */ new Set();
	if (e[n] === void 0) {
		for (; a && a.__parent__ && typeof a.__parent__ == "object";) {
			let e = a.__parent__;
			if (o.has(e)) throw Error("Circular parent chain detected while looking up `" + n + "`.");
			if (o.add(e), Object.prototype.hasOwnProperty.call(e, n)) {
				i = e;
				break;
			}
			a = e;
		}
		if (i[n] === void 0) return r;
	}
	return i;
}
function ht(e, t) {
	let n = t.split("."), r = n.length - 1, i = e;
	return n.forEach(function(e, t) {
		i = mt(i, e), t !== r && (i = i[e] ? i[e] : i.__rd__.refs.filter((t) => t.shadow[e])[0].shadow[e].data);
	}), i.__rd__;
}
var gt = {};
function _t(e) {
	let t = e.join();
	if (gt[t]) return gt[t];
	let n = "return [", r = [];
	for (let t = 0, n = e.length; t < n; t++) {
		let n = e[t];
		typeof n == "string" ? n.indexOf("<>this.") === 0 ? r.push("_prop(this.data, \"" + n.replace("<>this.", "") + "\")") : n.indexOf("<>") === 0 && r.push("_prop(scope, \"" + n.replace("<>", "") + "\")") : r.push("_var[" + t + "]");
	}
	n += r.join(",") + "]";
	let i = Function("scope, _prop , _var", n);
	return gt[t] = i, i;
}
function vt(e, t, n, r, i) {
	i[0] || (e instanceof V ? i[0] = e.data : i[0] = t);
	let a = _t(i);
	return function() {
		let o = [];
		try {
			o = a.call(e, t, ft, i);
		} catch (e) {
			console.error("Can't find the property: \n" + r.join("\n"), "\n\nIt is recommended to inject the parent object instead of its property.\n\n", t, "\n", e);
		}
		return n.apply(e, o);
	};
}
function yt(e, t, n) {
	if (!e.isExpression) return !1;
	if (e.expressionFn) return e.expressionFn;
	try {
		return e.expressionFn = vt(t, n, e.handler, e.propertyKeys, e.propertyValues), e.expressionFn;
	} catch (t) {
		throw Error(t.message + "\n" + e.propertyKeys);
	}
}
function q(e, t, n, i, a, o) {
	let s = a.propertyKeys, c = yt(a, o, i), l = i, u = null, d = null, f = null, p = [];
	for (let m = 0, h = s.length; m < h; m++) {
		u = s[m], d = null;
		let h = a.bindTypes[m];
		if (p = G(u), p.length > 1 && (u = p[0], d = p.slice(1).join(".")), !n && i && (n = "__rd__" in i ? i.__rd__ : new W(null, i, i instanceof Z ? i.moduleId : "child")), p[0] === "Scope") throw Error("`Scope` keyword must be omitted when it is used  used in bindings: " + s.join("."));
		u.indexOf("[") === 0 && (u = u.substring(1, u.length - 1)), p[0] === "this" && u === "this" && o instanceof V ? (u = p[1], a.propertyKeys = p.slice(2), d = null, n = new W("data", o.data, "this"), l = mt(o.data, u)) : l &&= mt(l, u), f = l, typeof l == "object" && l && (f = l[u]);
		let g;
		if (f instanceof Object ? g = new W(u, f, n || i.__scope__.__rd__) : d ? g = new W(u, null, n) : n && n.addKeyToShadow(u, t === "repeat"), d === null) {
			if (e instanceof V || r(e, t, {
				set: function(e) {
					c || n.data[u] !== e && (n.data[u] = e);
				},
				get: function() {
					return c ? c() : n.data[u];
				},
				enumerable: !0,
				configurable: !0
			}), n && i instanceof Z && e instanceof V && e.localPropertyNames.has(u)) return;
			n.addNode(e, t, u, h, c);
		}
		d !== null && q(e, t, g, f, Object.assign({}, a, { propertyKeys: [d] }), o);
	}
}
function J(e, t, n, r) {
	let i = a(t), o, s, c = r ? m(t) : t, l;
	n instanceof Z || (l = new W(null, n, "BSTD"));
	for (let t = 0, r = i.length; t < r; t++) {
		if (o = i[t], s = c[o], s.__singleton__) continue;
		let r = N(s);
		r.propertyKeys.length && (q(c, o, l, n, r, e), e && r.propertyKeys.forEach(function(t) {
			try {
				let r = ht(n, t);
				e.finalize.push(() => {
					r.removeNode(c);
				});
			} catch (e) {
				console.error("bind_subjects_to_data -> Could not find: " + t + "\n in", n, e);
			}
		})), s && typeof s == "object" && !(s instanceof Array) && J(e, s, n);
	}
	return c;
}
function bt(e, t, n, r) {
	if (n in ut) {
		if (r == null) return !1;
		let i = M[n], a = i.getConfig.call(e, t, e.blueprint[n]);
		return a !== void 0 && (e.cache[n] = a), i.install.call(e, a);
	}
	return !0;
}
function xt(e, t, n, r) {
	let i = M[t] || { type: "attr" };
	i.key = i.key || t, i.beforeActivate !== void 0 && i.beforeActivate(e, n, t, r), e.setters[t] = St(i, e, n, r);
}
function St(e, t, r, i) {
	return e.type !== "reactive" && t.virtual ? n : e.getSetter === void 0 ? dt[e.type](t, e, i) : e.getSetter(t, e, e, i);
}
function Ct(e, t, n) {
	let r = t + "_" + e.node.nodeType, i = M[r] || M[t];
	switch (i || (i = { type: "prop" }, !(t in e.node) && "setAttribute" in e.node && (i = { type: "attr" }), M[r] = i), i.key = i.key || t, i.type) {
		case "attr":
		case "prop":
		case "reactive":
			St(i, e)(n, null);
			break;
		case "event":
			e.node[t] = function(t) {
				n.call(e, t, e.data);
			};
			break;
	}
}
Y.COMPONENTS = {};
function Y(e) {
	let t = this;
	t.scope = e, e.element instanceof V ? (t.container = e.element, t._components = Object.assign({}, e.element.view._components)) : (t.container = new V({ tag: e.element }, null, t), t.container.setInDOM(!0));
}
function X(e) {
	this.type = e;
}
X.prototype.startKeyframe = function(e, t) {
	if (!e) throw Error("Argument Missing: view." + this.type + ".startKeyframe(timeline:string) needs a `timeline`");
	t ||= "+=0";
	let n = { [this.type]: {
		to: {
			data: "timeline:start",
			duration: .001
		},
		timeline: e,
		position: t
	} };
	return {
		tag: "comment",
		text: [
			"",
			this.type + ":timeline:start",
			"position: " + t,
			"timeline: " + e,
			""
		].join("\n"),
		animations: n
	};
}, X.prototype.keyframe = function(e, t, n) {
	if (!t) throw Error("Argument Missing: view." + this.type + ".addKeyframe(timeline:string) needs a `timeline`");
	let r = { [this.type]: {
		to: {
			duration: .001,
			onComplete: e
		},
		timeline: t,
		position: n
	} };
	return {
		tag: "comment",
		text: this.type + ":timeline:keyframe",
		animations: r
	};
}, X.prototype.waitKeyframe = function(e, t) {
	if (!e) throw Error("Argument Missing: view." + this.type + ".addKeyframe(timeline:string) needs a `timeline`");
	let n = { [this.type]: {
		to: { duration: .001 },
		timeline: e,
		position: t
	} };
	return {
		tag: "comment",
		text: this.type + ":timeline:waitKeyframe",
		animations: n
	};
}, Y.prototype = {
	_components: {},
	components: function(e) {
		for (let t in e) {
			let n = e[t];
			if (typeof n != "function") throw Error("Component must be type of function: " + t);
			this._components[t] = n;
		}
	},
	entering: new X("enter"),
	leaving: new X("leave"),
	getComponent: function(e, t, n) {
		let r = n, i = t;
		if (e) if (e in this._components) {
			if (t.props && typeof t.props != "object") throw Error("The `props` must be a literal object.");
			if (r = pt(n), Object.assign(r, t.props || {}), J(null, r, n), i = this._components[e].call(null, r, t, this), t instanceof Array) throw Error("A component's blueprint can NOT be an array. A component must have only one root node.");
		} else pe.indexOf(e) === -1 && console.warn("Invalid component/tag: " + e);
		return {
			blueprint: Object.assign(t, i),
			scopeData: r
		};
	},
	addTimeline: function(e) {
		return {
			tag: "comment",
			text: "timeline",
			animations: e
		};
	},
	blueprint: function(e) {
		let t = this;
		return this.createNode(e, t.scope, t.container, null);
	},
	clean: function(e) {
		this.container.clean(e);
	},
	dispatchEvent: function(e) {
		this.container.dispatchEvent(e);
	},
	createNode: function(e, t, n, r) {
		let i = this, o = 0, s = 0;
		if (typeof e == "string") {
			let t = document.createElement("div");
			t.innerHTML = e;
			let a = Array.prototype.slice.call(t.childNodes);
			return a.forEach(function(e) {
				let t = new V({ tag: e }, n, i);
				n.registerChild(t, r), e.parentNode.removeChild(e), Ct(t, "animations", {}), t.setInDOM(!0);
			}), a;
		} else if (typeof e == "function") return e.call(i);
		else if (e instanceof Array) {
			let r = [];
			for (o = 0, s = e.length; o < s; o++) r.push(i.createNode(e[o], t, n, null));
			return r;
		} else if (e instanceof Object) {
			let c = i.getComponent(e.tag, e, t), l, u, d = c.blueprint, f = a(d), p = [], m = new V(d, n, i, c.scopeData);
			for (n.registerChild(m, r), o = 0, s = f.length; o < s; o++) u = f[o], l = d[u], bt(m, c.scopeData, u, l) !== !1 && p.push(u);
			for (o = 0, s = p.length; o < s; o++) {
				if (u = p[o], u === "children") continue;
				l = d[u];
				let e = N(l);
				e.propertyKeys.length ? q(m, u, null, c.scopeData, e, m) : Ct(m, u, l);
			}
			return m.virtual || (m.setInDOM(!0), d.children && i.createNode(d.children, c.scopeData, m, null)), m;
		} else throw Error("blueprint should NOT be null");
	},
	loadStyle(e) {
		e.indexOf("./") === 0 && (e = e.replace("./", this.scope.uri.path));
	}
};
//#endregion
//#region src/module.js
var wt = class {
	constructor(e) {
		this.id = e.moduleId, this.source = typeof e.source == "function" ? e.source : null, this.path = e.path || null, this.scope = e, this.scope.source = "consumed";
	}
	init() {
		return new Promise(async (e, t) => {
			let n = this;
			try {
				let t = n.source || (await import(
					/* @vite-ignore */
					"/" + n.path
)).default, r = t;
				typeof t != "function" && (r = function() {
					console.error("Can't find default function in %c" + n.path, "font-weight: bold;");
				});
				let i = r.call(null, n.scope) || null, a = () => (this.scope.trigger("module.init"), e(n));
				i ? i.then(a) : a();
			} catch (e) {
				console.error(e.message + ": " + n.path), console.trace(e), t();
			}
		});
	}
	start() {
		this.scope.trigger("module.start");
	}
	destroy() {
		this.scope.trigger("module.destroy");
	}
}, Z = class e {
	moduleId = null;
	path = null;
	source = null;
	constructor(e) {
		this.moduleId = e.id, this.parentScope = e.parentScope || null, this.source = typeof e.source == "function" ? e.source : null, this.path = e.path || null, this.element = e.element || null, this.export = {}, this.uri = new fe(e.path), this.eventHandlers = {}, this.observers = [];
		let t = this.element.data ? J(this.element, this.element.data, this.parentScope, !0) : {};
		r(this, "data", {
			enumerable: !0,
			configurable: !0,
			get: function() {
				return t;
			},
			set: function(e) {
				if (typeof e != "object" || !e) throw Error("The `Scope.data` property must be type of object and can not be null.");
				Object.assign(t, e);
			}
		}), this.on("module.destroy", this.destroy.bind(this));
	}
	importAsText(e) {
		return e.indexOf("./") === 0 && (e = e.replace("./", this.uri.path)), fetch(e, { headers: { "Content-Type": "text/plain" } }).then((e) => e.text());
	}
	destroy() {
		i(this, "data"), this.observers.forEach(function(e) {
			e.remove();
		});
	}
	kill() {
		throw Error("Scope.kill() should not be invoked at the runtime");
	}
	load(n, r = {}) {
		let i = Object.assign({}, n, r);
		return i.path.indexOf("./") === 0 && (i.path = this.uri.path + n.path.substr(2)), i.parentScope = this, t(i).then((t) => new wt(new e(t)).init());
	}
	loadModuleInto(e, t) {
		return this.load(e, { element: t }).then(function(e) {
			return e.start(), e;
		});
	}
	on(e, t) {
		this.eventHandlers[e] || (this.eventHandlers[e] = []), this.eventHandlers[e].indexOf(t) === -1 && this.eventHandlers[e].push(t);
	}
	trigger(e, t) {
		this.eventHandlers[e] && this.eventHandlers[e].forEach(function(e) {
			e.call(null, t);
		});
	}
	observe(e) {
		let t = new j(e);
		return this.observers.push(t), t;
	}
};
//#endregion
//#region src/router.js
function Tt(e, t, n) {
	if (e instanceof Array) {
		let r = e.map((e) => Tt(e, t, n));
		return t && (t.activeRoute.children = r), r;
	}
	return {
		...e,
		fullPath: n + e.path,
		active: !1,
		hidden: e.hidden || !!e.redirectTo || !1,
		viewports: e.viewports || {},
		parent: t ? t.activeRoute : null,
		children: e.children || []
	};
}
function Et(e) {
	return e.map(function(e) {
		let t = [], n = Q.PARAMETER_NAME_REGEX.exec(e);
		for (; n;) t.push(n[1]), n = Q.PARAMETER_NAME_REGEX.exec(e);
		return t.length ? {
			id: e,
			paramNames: t,
			paramFinderExpression: new RegExp(e.replace(Q.PARAMETER_NAME_REGEX, Q.PARAMETER_NAME_REPLACEMENT))
		} : null;
	}).filter(Boolean);
}
Q.TITLE_SEPARATOR = " • ", Q.PARAMETER_NAME_REGEX = /* @__PURE__ */ new RegExp(/[:*](\w+)/g), Q.PARAMETER_NAME_REPLACEMENT = "([^/]+)", Q.BASE_URL = "/", Q.currentPath = {
	handlers: [],
	subscribe: function(e) {
		this.handlers.push(e), e(location.pathname);
	},
	update: function() {
		this.handlers.forEach((e) => {
			e(location.pathname);
		});
	}
}, Q.mainListener = function() {
	Q.currentPath.update();
}, window.addEventListener("popstate", Q.mainListener);
function Q(e) {
	let t = this;
	if (t.__singleton__ = !0, t.config = { baseURL: Q.BASE_URL }, t.scope = e, t.routes = [], t.parentScope = e.parentScope, t.parentRouter = e.parentScope ? e.parentScope.__router__ : null, t.parentScope && (!t.parentScope.router || !t.parentScope.router.activeRoute)) {
		let e = t.parentScope;
		for (; !e.router || !e.router.activeRoute;) e = e.parentScope;
		t.parentScope = e, t.parentRouter = e.__router__;
	}
	let r = t.parentScope && t.parentScope.router;
	t.title = r ? this.parentScope.router.activeRoute.title : "", t.path = r ? t.parentScope.router.activeRoute.path : "/", t.fullPath = this.config.baseURL === "/" ? this.path : this.config.baseURL + this.path, t.parentRoute = r ? this.parentScope.router.activeRoute : null, t.oldURL = "", t.resolvedRouteValue = null, t.resolvedDynamicRouteValue = null, t.routesMap = null, t.data = {
		routes: [],
		navs: [],
		activeRoute: null,
		activePath: null,
		activeModule: null,
		viewports: { main: null },
		parameters: t.parentScope && t.parentScope.router ? t.parentScope.router.parameters : {}
	}, t.onTransitionFn = n, t.onInvokeFn = n, t.onLoadFn = n, t.viewports = { main: {
		tag: "div",
		module: "<>router.activeModule"
	} }, Object.defineProperty(this, "urlParts", {
		get: function() {
			return t.oldURL.split("/").slice(1);
		},
		enumerable: !0
	}), e.moduleId === "@root" && Q.currentPath.update();
}
//#endregion
//#region main.js
Q.prototype = {
	setup: function(e) {
		return this.routes = Tt(e, this.parentScope ? this.parentScope.router : null, this.fullPath === "/" ? "" : this.fullPath), this.routes.forEach((e) => {
			(e.viewports ? Object.keys(e.viewports) : []).forEach((e) => {
				e === "main" || this.viewports[e] || (this.viewports[e] = {
					tag: "div",
					module: "<>router.viewports." + e
				});
			});
		}), this.data.routes = this.routes, this.data.navs = this.routes.filter((e) => !e.hidden), this;
	},
	start: function() {
		this.listener = this.detect.bind(this), window.addEventListener("popstate", this.listener), this.detect();
	},
	setTitle(e) {
		this.title = e;
	},
	getTitle(e) {
		let t = [];
		if (e.pageTitle) return e.pageTitle;
		if (this.parentRouter) {
			let n = this.parentRoute.pageTitle;
			if (n) return t.push(n), e.title && t.push(e.title), t.join(Q.TITLE_SEPARATOR);
			t.push(this.parentRouter.title);
		}
		return this.title && t.push(this.title), e.title && t.push(e.title), t.join(Q.TITLE_SEPARATOR);
	},
	navigateToPath: function(e, t) {
		if (typeof e != "string") throw Error("Invalid argument(s) for `navigateToPath`: path must be a string. " + typeof e + " is given");
		if (e.indexOf("/") !== 0) throw Error("Invalid argument(s) for `navigateToPath`: path must be starting with a `/`\nPlease use `/" + e + "` instead of `" + e + "`");
		e.indexOf(this.config.baseURL) !== 0 && (e = this.config.baseURL + e), window.location.pathname !== e && (t ? history.replaceState({}, "", e) : history.pushState({}, "", e), dispatchEvent(new PopStateEvent("popstate", { state: {} })));
	},
	navigate: function(e, t) {
		if (typeof e != "string") throw Error("Invalid argument(s) for `navigate`: path must be a string. " + typeof e + " is given");
		if (e.indexOf("/") !== 0) throw Error("Invalid argument(s) for `navigate`: path must be starting with a `/`\nPlease use `/" + e + "` instead of `" + e + "`");
		e.indexOf(this.path) !== 0 && (e = this.path + e), this.navigateToPath(e, t);
	},
	navigateToRoute: function(e, t) {
		let n = e.path;
		e.parent && (n = e.parent.path + e.path), this.navigate(n, t);
	},
	notFound: function() {},
	normalizeHash: function(e) {
		if (e.indexOf("#!/") === 0) throw Error("Please use `#/` instead of `#!/` for you hash");
		let t = e;
		return e.indexOf("#/") !== 0 && (e.indexOf("/") === 0 ? e.indexOf("#") === 0 && (t = e.split("#").join("#/")) : t = "/" + e), t.replace(this.fullPath, "/").replace("//", "/") || "/";
	},
	onTransition: function(e) {
		return this.onTransitionFn = e, this;
	},
	onInvoke: function(e) {
		return this.onInvokeFn = e, this;
	},
	onLoad: function(e) {
		return this.onLoadFn = e, this;
	},
	findMatchRoute: function(e, t, n) {
		let r = this, i = 0, a = r.normalizeHash(t), o = e.map((e) => e.path), s = Et(o), c = e.filter((e) => s.indexOf(e) === -1 && a.indexOf(e.path) === 0), l = c.length ? c.reduce((e, t) => e.path.length > t.path.length ? e : t) : !1;
		if (l && !(a !== "/" && l.path === "/")) {
			let e = a.slice(0, l.path.length);
			return r.resolvedRouteValue === e ? Object.assign(r.data.parameters, r.createClearParameters()) : (r.resolvedDynamicRouteValue = null, r.resolvedRouteValue = e, l.redirectTo ? this.navigate(l.redirectTo, !0) : (i++, r.callRoute(l, a, r.createClearParameters(), n)));
		}
		for (let c = 0, l = s.length; c < l; c++) {
			let l = s[c], u = l.paramFinderExpression.exec(a);
			if (!u) continue;
			i++;
			let d = r.createParamValueMap(l.paramNames, u.slice(1));
			if (r.resolvedDynamicRouteValue === t) return Object.assign(r.data.parameters, d);
			r.resolvedDynamicRouteValue = t, r.resolvedRouteValue = null;
			let f = o.indexOf(l.id), p = l.id.split("/").filter((e) => e.indexOf(":") !== 0).join("/"), m = t.replace(p, "").split("/");
			return r.callRoute(e[f], m.join("/"), d, n);
		}
		i === 0 && console.warn("No associated route has been found", t);
	},
	callRoute: function(e, t, n, r) {
		let i = this.data.activeRoute, a = this.data.activePath;
		return this.data.activeRoute = e, this.data.activePath = e.path, this.onTransitionFn.call(this, a, e.path, i, e), e.redirectTo || (i && e.path.indexOf(a) !== 0 && (i.active = !1, typeof i.onLeave == "function" && i.onLeave.call(null, a, e.path, i, e)), e.active = !0), typeof e.onEnter == "function" && e.onEnter.call(null, a, e.path, i, e), document.title = this.getTitle(e), typeof e.handle == "function" ? e.handle.call(this, n, r) : (this.populateViewports(e), O(de(), (e) => {
			Object.assign(this.data.parameters, n), e();
		}), !1);
	},
	populateViewports: function(e) {
		let t = !1, n = this.data.viewports;
		for (let r in n) {
			let n = e.viewports[r];
			n !== void 0 && (typeof n == "string" && (n = {
				path: n,
				onInvoke: this.onInvokeFn.bind(this, n, r),
				onLoad: this.onLoadFn.bind(this, n, r)
			}, t = !0), r === "main" && (this.data.activeModule = n), this.data.viewports[r] = n);
		}
		!t && this.parentRouter && this.parentRouter.populateViewports(e);
	},
	createClearParameters: function() {
		let e = {};
		return Object.keys(this.data.parameters).forEach((t) => e[t] = void 0), e;
	},
	createParamValueMap: function(e, t) {
		let n = {};
		return e.forEach(function(e, r) {
			n[e] = t[r];
		}), n;
	},
	detect: function() {
		let e = window.location.pathname, t = e ? e.substring(-1) === "/" ? e : e + "/" : "/", n = this.config.baseURL === "/" ? this.path : this.config.baseURL + this.path;
		t.indexOf(n) === 0 && t !== this.oldURL && (this.oldURL = t, this.findMatchRoute(this.routes, t, {}));
	},
	getURLParts: function() {
		return this.oldURL.split("/").slice(1);
	},
	destroy: function() {
		this.parentRoute && (this.parentRoute.children = []), window.removeEventListener("popstate", this.listener);
	}
}, Array.prototype.unique = function() {
	let e = this.concat();
	for (let t = 0, n = e.length; t < n; ++t) for (let n = t + 1, r = e.length; n < r; ++n) e[t] === e[n] && e.splice(n--, 1);
	return e;
};
var $ = {
	moduleContents: {},
	rootElement: null,
	bootModule: null,
	extend: function(e) {
		let t = e || {}, n;
		for (let e = 1; e < arguments.length; e++) if (n = arguments[e], n) for (let e in n) n.hasOwnProperty(e) && (n[e] instanceof Array ? t[e] = this.extend(t[e] || [], n[e]) : typeof n[e] == "object" && n[e] !== null ? t[e] = this.extend(t[e] || {}, n[e]) : t[e] = n[e]);
		return t;
	}
};
function Dt(e) {
	if ($.rootElement = e.element, e.id = "@root", !$.rootElement) throw Error("element property is mandatory");
	return new Promise(function(n, r) {
		t(e).then((e) => new wt(new Z(e)).init().then((e) => ($.bootModule = e, n(e)))).catch(function(e) {
			console.error("Something went wrong", e), r();
		});
	});
}
Z.prototype.useView = function() {
	return new Y(this);
}, Z.prototype.useRouter = function() {
	let e = new Q(this);
	return this.moduleId !== "@root" && this.on("module.destroy", () => e.destroy()), this.__router__ = e, this.router = e.data, e;
};
//#endregion
export { $ as Galaxy, wt as Module, Q as Router, Z as Scope, Y as View, Dt as boot, A as setupTimeline };

//# sourceMappingURL=galaxy.js.map