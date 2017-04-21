/* global GalaxyAnimation, TweenLite */

(function () {
  GalaxyAnimation.effects['galaxy.zoom'] = {
    install: function (element) {
      return new ZoomInAnimation(element);
    },
    uninstall: function (element) {
      if (element.xtag.animations['galaxy.zoom']) {
        element.xtag.animations['galaxy.zoom'].off();
      }
    }
  };

  function ZoomInAnimation(element) {
    var _this = this;
    _this.element = element;
    
    if (!this.observer) {
      var existedNodes = element.querySelectorAll('.' + _this.zoomItem);
      _this.animate(existedNodes);

      _this.observer = new MutationObserver(function (mutations) {
        _this.zoomItem = element.getAttribute('zoom');
        _this.stagger = 0;
        var nodes = [];

        mutations.forEach(function (item) {
          var node = null;
          if (item.addedNodes[0]) {

            if (item.addedNodes[0].__ui_neutral ||
                    item.addedNodes[0].nodeType !== Node.ELEMENT_NODE ||
                    !item.addedNodes[0].classList.contains(_this.zoomItem))
              return null;

            node = item.addedNodes[0];
          }

          if (item.removedNodes[0] && item.removedNodes[0].__ui_neutral) {
            return null;
          }

          node && nodes.push(node);
        });

        _this.animate(nodes);
      });

      _this.observer.observe(_this.element, {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true
      });
    }

    _this.element.xtag.PopInAnimation = this;
  }

  ZoomInAnimation.prototype.off = function () {
    if (this.observer) {
      this.observer.disconnect();
    }
  };

  ZoomInAnimation.prototype.animate = function (nodes, style) {
    if (!nodes.length) {
      return;
    }

    var timelineItems = [];
    var timeline = new TimelineLite({
      paused: true,
      smoothChildTiming: true,
      onComplete: function () {
      }
    });

    nodes.forEach(function (element) {
      TweenLite.set(element, {
        transition: 'none',
        scale: element.dataset.zoomFrom || 0.01,
        opacity: 0
      });

      timelineItems.push(TweenLite.to(element, GalaxyAnimation.CONFIG.baseDuration, {
        scale: 1,
        opacity: 1,
        clearProps: 'transition,scale,opacity',
        ease: 'Power3.easeOut',
        onComplete: function () { }
      }));
    });

    timeline.add(timelineItems, null, null, GalaxyAnimation.CONFIG.staggerDuration);

    timeline.play(0);
  };
})();
