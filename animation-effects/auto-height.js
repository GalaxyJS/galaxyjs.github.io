/* global GalaxyAnimation, TweenLite, Galaxy */

(function () {
  GalaxyAnimation.effects[ 'galaxy.auto-height' ] = {
    install: function (element) {
      return new AutoHeightAnimation(element);
    },
    uninstall: function (element) {
      if (element.xtag.animations[ 'galaxy.auto-height' ]) {
        element.xtag.animations[ 'galaxy.auto-height' ].off();
      }
    }
  };

  function AutoHeightAnimation (element) {
    var _this = this;
    _this.element = element;

    if (!_this.observer) {
      _this.observer = new MutationObserver(function (mutations) {
        if (_this.element.offsetParent === null) {
          return;
        }

        mutations.forEach(function (item) {
          if (item.addedNodes[ 0 ] && item.addedNodes[ 0 ].__ui_neutral) {
            return null;
          }

          if (item.removedNodes[ 0 ] && item.removedNodes[ 0 ].__ui_neutral) {
            return null;
          }
        });

        _this.animate();
      });

      window.requestAnimationFrame(function () {
        _this.height = element.offsetHeight;

        TweenLite.set(_this.element, {
          height: _this.height
        });

        _this.animate();

        if (_this.observer) {
          _this.observer.observe(_this.element, {
            attributes: false,
            childList: true,
            characterData: false,
            subtree: true
          });
        }
      });

      _this.resizeHandler = function () {
        _this.animate();
      };

      window.addEventListener('resize', _this.resizeHandler);
      //window.addEventListener('galaxy-layout-repaint', _this.resizeHandler);
    }
  }

  AutoHeightAnimation.prototype.off = function () {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;

      window.removeEventListener('resize', this.resizeHandler);
      //window.removeEventListener('galaxy-layout-repaint', this.resizeHandler);
      TweenLite.set(this.element, {
        height: ''
      });
    }
  };

  AutoHeightAnimation.prototype.animate = function () {
    var _this = this;
    clearTimeout(_this.animationThrottle);

    _this.animationThrottle = setTimeout(function () {
      if (_this.animation) {
        _this.animation.pause();
        _this.animation = null;
      }

      var newHeight = Galaxy.ui.utility.getContentHeight(_this.element, true);

      if (_this.height !== newHeight) {
        _this.animation = TweenLite.fromTo(_this.element, GalaxyAnimation.CONFIG.baseDuration, {
          height: _this.height
        }, {
          height: newHeight,
          //clearProps: newHeight === 0 ? 'height' : '',
          ease: 'Power2.easeInOut',
          onComplete: function () {
            _this.height = newHeight;
          }
        });
      }
    }, 250);
  };
})();
