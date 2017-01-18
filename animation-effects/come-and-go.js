/* global GalaxyAnimation, TweenLite, Node, Galaxy */

(function () {
  var tree = [];

  GalaxyAnimation.effects['galaxy.come-and-go'] = {
    register: function (element) {
      return new ComeAndGo(element);
    },
    deregister: function (element) {
      if (element.xtag.animations['galaxy.come-and-go']) {
        element.xtag.animations['galaxy.come-and-go'].off();
      }
    }
  };

  function ComeAndGo(element) {
    var _this = this;
    _this.element = element;
    //_this.staggerDuration = parseFloat(element.getAttribute('come-and-go-stagger') || 0.05);

    if (!_this.observer) {
      _this.observer = new MutationObserver(function (mutations) {
        _this.stagger = 0;
        _this.targetItem = element.getAttribute('come-and-go-item');
        _this.staggerDuration = parseFloat(element.getAttribute('come-and-go-stagger') || 0.05);

        var come = [];
        var go = [];

        mutations.forEach(function (item) {
          var addedNode = item.addedNodes[0];
          if (addedNode && addedNode.nodeType === Node.ELEMENT_NODE) {

            if (addedNode.__ui_neutral || addedNode.__cag_ready || !addedNode.classList.contains(_this.targetItem))
              return null;

            addedNode.__cag_ready = true;
//            console.log(!addedNode.classList.contains('content'),_this.targetItem,addedNode.__ui_neutral,addedNode.__cag_ready);  
            come.push({
              parent: item.target,
              node: addedNode
            });
          }

          var removedNode = item.removedNodes[0];
          if (removedNode && removedNode.nodeType === Node.ELEMENT_NODE) {
            if (removedNode.__ui_neutral || removedNode.__cag_ready || !removedNode.classList.contains(_this.targetItem))
              return null;

            removedNode.__cag_ready = true;
            go.push({
              parent: item.target,
              node: removedNode
            });
          }
        });

        _this.animate(come, go);
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
        Array.prototype.forEach.call(element.getElementsByClassName(element.getAttribute('come-and-go-item')), function (item) {
          item.__cag_ready = true;
          existedNodes.push({
            parent: item.parentNode,
            node: item
          });
        });
//        console.log(existedNodes, _this.element);
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


  ComeAndGo.prototype.animate = function (comingNodes, goingNodes) {
    if (!comingNodes.length && !goingNodes.length) {
      return;
    }

    var _this = this;
    var parentGalaxyAnimation = Galaxy.ui.utility.findParent(_this.element, 'galaxy-animation');
    if (parentGalaxyAnimation && parentGalaxyAnimation.xtag.animations['galaxy.come-and-go'] && parentGalaxyAnimation.xtag.animations['galaxy.come-and-go'].timeline) {
      _this.timeline = parentGalaxyAnimation.xtag.animations['galaxy.come-and-go'].timeline;
//      _this.timeline.pause();
//      console.log('asd');
    } else {
      if (_this.timeline) {
        _this.timeline.progress(1, false);
      }
      _this.timeline = new TimelineLite({
        paused: true,
        smoothChildTiming: true,
        onComplete: function () {
          _this.element.xtag.__come_and_go_animating = false;
          _this.timeline = null;
        }
      });
    }


    _this.element.xtag.__come_and_go_animating = true;
    var comeTimlineItems = [];
    var goTimlineItems = [];

    Array.prototype.forEach.call(comingNodes || [], function (item) {
      item.node.__cag_ready = true;
//      GalaxyAnimation.disable(item.node);

      if (item.node.parenNode) {
        item.parent.removeChild(item.node);
      }
    });

    Array.prototype.forEach.call(goingNodes || [], function (item) {
      var element = item.node;

      GalaxyAnimation.disable(element);
      item.parent.appendChild(element);
      TweenLite.set(element, {
        className: '-=come'
      });

      goTimlineItems.push(TweenLite.to(element, GalaxyAnimation.CONFIG.baseDuration, {
        className: '+=come',
        ease: 'Power2.easeInOut',
        onComplete: function () { }
      }));
    });

    Array.prototype.forEach.call(comingNodes || [], function (item) {
      var element = item.node;
      var parent = item.parent;
//      GalaxyAnimation.enable(element);
      parent.appendChild(element);
      TweenLite.set(element, {
        //display: 'none',
        className: '+=come'
      });

      comeTimlineItems.push(TweenLite.to(element, GalaxyAnimation.CONFIG.baseDuration, {
        //display: '',
        className: '-=come',
        ease: 'Power2.easeInOut',
        onComplete: function () {
          element.__cag_ready = false;
          delete element.__cag_ready;
        }
      }));
    });

//    debugger;
    _this.timeline.add(goTimlineItems, null, null, this.staggerDuration || GalaxyAnimation.CONFIG.staggerDuration);
    _this.timeline.add(function () {
      Array.prototype.forEach.call(goingNodes || [], function (item) {
        var element = item.node;
        if (element.parentNode) {
          GalaxyAnimation.enable(element);
          element.parentNode.removeChild(element);
          window.requestAnimationFrame(function () {
            delete element.__cag_ready;
          });
        }
      });
    });

    _this.timeline.add(comeTimlineItems, null, null, this.staggerDuration || GalaxyAnimation.CONFIG.staggerDuration);
    _this.timeline.play(0);
//    window.requestAnimationFrame(function () {
//      debugger;
//    })
  };
})();
