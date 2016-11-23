/* global GalaxyAnimation, TweenLite, Node */

(function () {
  GalaxyAnimation.effects['galaxy.come-and-go'] = {
    register: function (element) {
      new ComeAndGo(element);
    },
    deregister: function (element) {
      if (element.xtag.PopInAnimation) {
        element.xtag.PopInAnimation.off();
      }
    }
  };

  function ComeAndGo(element) {
    var _this = this;
    _this.element = element;
    //_this.staggerDuration = parseFloat(element.getAttribute('come-and-go-stagger') || 0.05);

    if (!this.observer) {
      var existedNodes = element.querySelectorAll(element.getAttribute('come-and-go-item'));
      animate(existedNodes);
     
      _this.observer = new MutationObserver(function (mutations) {
        _this.stagger = 0;
        _this.targetItem = element.getAttribute('come-and-go-item');
        _this.staggerDuration = parseFloat(element.getAttribute('come-and-go-stagger') || 0.05);

        var nodes = [];

        mutations.forEach(function (item) {
          var node = null;
          if (item.addedNodes[0] && item.addedNodes[0].nodeType === Node.ELEMENT_NODE) {

            if (item.addedNodes[0].__ui_neutral || !item.addedNodes[0].classList.contains(_this.targetItem))
              return null;

            node = item.addedNodes[0];
          }

          if (item.removedNodes[0] && item.removedNodes[0].__ui_neutral) {
            return null;
          }

          node && nodes.push(node);
        });

        animate(nodes);
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

  ComeAndGo.prototype.off = function () {
    if (this.observer) {
      this.observer.disconnect();
    }
  };

    function animate(nodes, style) {
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

    Array.prototype.forEach.call(nodes, function (element) {
      TweenLite.set(element, {
        className: '+=come'
      });

      timelineItems.push(TweenLite.to(element, GalaxyAnimation.CONFIG.baseDuration, {
        className: '-=come',
        ease: 'Power2.easeOut',
        onComplete: function () { }
      }));
    });

    timeline.add(timelineItems, null, null, this.staggerDuration || GalaxyAnimation.CONFIG.staggerDuration);

    timeline.play(0);
  };
})();
