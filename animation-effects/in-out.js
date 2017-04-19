/* global GalaxyAnimation, TweenLite, Node, Galaxy */

(function () {
  GalaxyAnimation.effects[ 'galaxy.in-out' ] = {
    register: function (element) {
      return new ComeAndGo(element);
    },
    deregister: function (element) {
      if (element.xtag.animations[ 'galaxy.in-out' ]) {
        element.xtag.animations[ 'galaxy.in-out' ].off();
      }
    }
  };

  function ComeAndGo (element) {
    var _this = this;
    _this.timeline = null;
    _this.element = element;
    _this.inTimeLineItems = [];

    if (!_this.observer) {
      _this.observer = new MutationObserver(function (mutations) {
        _this.readProperties();

        var inNodes = [];
        var outNodes = [];

        mutations.forEach(function (item) {
          if (item.target !== _this.element) {
            return null;
          }

          var addedNode = item.addedNodes[ 0 ];
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

          var removedNode = item.removedNodes[ 0 ];
          if (removedNode && removedNode.nodeType === Node.ELEMENT_NODE) {
            if (removedNode.__ui_neutral || removedNode.__cag_ready ||
              !removedNode.classList.contains(_this.targetItem)) {
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

        _this.readProperties();
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

  ComeAndGo.prototype.readProperties = function () {
    this.targetItem = this.element.getAttribute('in-out-item');
    this.staggerDuration = parseFloat(this.element.getAttribute('in-out-stagger') || 0.05);
  };

  ComeAndGo.prototype.animate = function (inNodes, outNodes) {
    if (!inNodes.length && !outNodes.length) {
      return;
    }

    var _this = this;
    _this.readProperties();

    var outTimeLineItems = [];
    var staggerDuration = this.staggerDuration || GalaxyAnimation.CONFIG.staggerDuration;
    var parentTimeLine = null;

    var parentGalaxyAnimation = Galaxy.ui.utility.findParent(_this.element, 'galaxy-animation');
    if (parentGalaxyAnimation && parentGalaxyAnimation.xtag.animations[ 'galaxy.in-out' ] &&
      parentGalaxyAnimation.xtag.animations[ 'galaxy.in-out' ].timeline) {
      parentTimeLine = parentGalaxyAnimation.xtag.animations[ 'galaxy.in-out' ].timeline;
      parentTimeLine.pause();
    }

    if (_this.timeline) {
      // _this.timeline.clear();
      _this.timeline.progress(1);
    }

    _this.timeline = new TimelineLite({
      paused: true,
      smoothChildTiming: true,
      autoRemoveChildren: true,
      onComplete: function () {
        _this.element.xtag.__come_and_go_animating = false;
        _this.timeline = null;
      }
    });
    _this.element.xtag.__come_and_go_animating = true;

    var outAnimation = {
      className: '+=out',
      ease: 'Power2.easeInOut'
    };

    outNodes.forEach(function (item) {
      GalaxyAnimation.disable(item.node);
      item.parent.appendChild(item.node);

      TweenLite.set(item.node, {
        className: '-=out'
      });

      outTimeLineItems.push(TweenLite.to(item.node, GalaxyAnimation.CONFIG.baseDuration, outAnimation));
    });

    inNodes.forEach(function (item) {
      item.node.__cag_ready = true;
      item.node.style.position = outNodes.length ? 'absolute' : '';

      TweenLite.set(item.node, {
        className: '+=out',
        transform: ''
      });

      var tempTween = TweenLite.to(item.node, GalaxyAnimation.CONFIG.baseDuration, {
        className: '-=out',
        ease: 'Power2.easeInOut',
        onComplete: function () {
          _this.inTimeLineItems.splice(_this.inTimeLineItems.indexOf(tempTween), 1);
          delete item.node.__cag_ready;
        }
      });

      _this.inTimeLineItems.push(tempTween);
    });

    _this.timeline.add(outTimeLineItems, null, null, staggerDuration);
    _this.timeline.add(function () {
      Array.prototype.forEach.call(outNodes || [], function (item) {
        if (item.node.parentNode) {
          item.node.parentNode.removeChild(item.node);
          GalaxyAnimation.enable(item.node);
          window.requestAnimationFrame(function () {
            delete item.node.__cag_ready;
          });
        }
      });

      xtag.fireEvent(_this.element, 'galaxy-layout-repaint', {
        detail: {
          from: _this
        },
        bubbles: true,
        cancelable: true
      });

      inNodes.forEach(function (item) {
        item.node.style.position = '';
      });
    });

    _this.timeline.add(_this.inTimeLineItems, null, null, staggerDuration);

    if (parentTimeLine) {
      if (!parentTimeLine._timeline_added) {
        parentTimeLine.add(_this.timeline, null, null, staggerDuration);
        parentTimeLine._timeline_added = true;
      }

      parentTimeLine.resume();
    }

    _this.timeline.play();
  };
})();
