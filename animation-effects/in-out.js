/* global GalaxyAnimation, TweenLite, Node, Galaxy */

(function () {
  GalaxyAnimation.effects['galaxy.in-out'] = {
    register: function (element) {
      return new ComeAndGo(element);
    },
    deregister: function (element) {
      if (element.xtag.animations['galaxy.in-out']) {
        element.xtag.animations['galaxy.in-out'].off();
      }
    }
  };

  function ComeAndGo(element) {
    var _this = this;
    _this.element = element;
    if (!_this.observer) {
      _this.observer = new MutationObserver(function (mutations) {
        _this.stagger = 0;
        _this.targetItem = element.getAttribute('in-out-item');
        _this.staggerDuration = parseFloat(element.getAttribute('in-out-stagger') || 0.05);

        var inNodes = [];
        var outNodes = [];

        mutations.forEach(function (item) {
          var addedNode = item.addedNodes[0];
          if (addedNode && addedNode.nodeType === Node.ELEMENT_NODE) {
            if (addedNode.__ui_neutral || addedNode.__cag_ready || !addedNode.classList.contains(_this.targetItem)) {
              return null;
            }

            addedNode.__cag_ready = true;
            inNodes.push({
              parent: item.target,
              node: addedNode
            });
          }

          var removedNode = item.removedNodes[0];
          if (removedNode && removedNode.nodeType === Node.ELEMENT_NODE) {
            if (removedNode.__ui_neutral || removedNode.__cag_ready || !removedNode.classList.contains(_this.targetItem)) {
              return null;
            }

            removedNode.__cag_ready = true;
            outNodes.push({
              parent: item.target,
              node: removedNode
            });
          }
        });

        _this.animate(inNodes, outNodes);
      });

      window.requestAnimationFrame(function () {
        if (!_this.observer) {
          return;
        }
        _this.observer.observe(_this.element, {
          attributes: false,
          childList: true,
          characterData: false,
          subtree: true
        });

        var existedNodes = [];
        Array.prototype.forEach.call(element.getElementsByClassName(element.getAttribute('in-out-item')), function (item) {
          if (item.offsetParent === null) {
            return;
          }

          item.__cag_ready = true;
          existedNodes.push({
            parent: item.parentNode,
            node: item
          });
        });

        _this.animate(existedNodes, []);
      });
    }
  }

  ComeAndGo.prototype.off = function () {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  };


  ComeAndGo.prototype.animate = function (inNodes, outNodes) {
    if (!inNodes.length && !outNodes.length) {
      return;
    }

    var _this = this;
    var inTimeLineItems = [];
    var outTimeLineItems = [];
    var staggerDuration = this.staggerDuration || GalaxyAnimation.CONFIG.staggerDuration;
    var parentTimeLine = null;

    var parentGalaxyAnimation = Galaxy.ui.utility.findParent(_this.element, 'galaxy-animation');
    if (parentGalaxyAnimation && parentGalaxyAnimation.xtag.animations['galaxy.in-out'] && parentGalaxyAnimation.xtag.animations['galaxy.in-out'].timeline) {
      parentTimeLine = parentGalaxyAnimation.xtag.animations['galaxy.in-out'].timeline;
      parentTimeLine.pause();
    }

    if (_this.timeline) {
      // _this.timeline.progress(1, false);
    }
    _this.timeline = new TimelineLite({
      autoRemoveChildren: true,
      paused: true,
      smoothChildTiming: true,
      onComplete: function () {
        _this.element.xtag.__come_and_go_animating = false;
        _this.timeline = null;
      }
    });

    _this.element.xtag.__come_and_go_animating = true;
    inNodes.forEach(function (item) {
      item.node.__cag_ready = true;
      if (item.node.parenNode) {
        item.parent.removeChild(item.node);
      }
    });

    var outAnimation = {
      className: '+=out',
      ease: 'Power2.easeInOut'
    };
    outNodes.forEach(function (item) {
      var element = item.node;
      GalaxyAnimation.disable(element);
      item.parent.appendChild(element);
      TweenLite.set(element, {
        className: '-=out'
      });
      outTimeLineItems.push(TweenLite.to(element, GalaxyAnimation.CONFIG.baseDuration, outAnimation));
    });

    inNodes.forEach(function (item) {
      var element = item.node;
      var parent = item.parent;
      parent.appendChild(element);
      TweenLite.set(element, {
        className: '+=out'
      });
      inTimeLineItems.push(TweenLite.to(element, GalaxyAnimation.CONFIG.baseDuration, {
        className: '-=out',
        ease: 'Power2.easeInOut',
        onComplete: function () {
          delete element.__cag_ready;
        }
      }));
    });

    _this.timeline.add(outTimeLineItems, null, null, staggerDuration);
    _this.timeline.add(function () {
      Array.prototype.forEach.call(outNodes || [], function (item) {
        var element = item.node;
        if (element.parentNode) {
          element.parentNode.removeChild(element);
          GalaxyAnimation.enable(element);
          window.requestAnimationFrame(function () {
            delete element.__cag_ready;
          });
        }
      });
    });
    _this.timeline.add(inTimeLineItems, null, null, staggerDuration);

    if (parentTimeLine) {
      parentTimeLine.add(_this.timeline, '+=' + staggerDuration, null, null);
      parentTimeLine.resume();
    }
    _this.timeline.play();
  };
})();
