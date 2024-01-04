const animations = {};

animations.cardInOut = {
  enter: {
    timeline: 'main-timeline',
    // position: 'pre-side-bar',
    from: {
      transformOrigin: 'top center',
      scale: 1.04,
      opacity: 0,
      position: 'absolute',
      top: 0,
    },
    to: {
      ease: 'power1.inOut',
      transformOrigin: 'top center',
      top: 0,
      scale: 1,
      opacity: 1,
      position: 'absolute',
      xPercent: 0,
      duration: .4,
    },
  },
  leave: {
    timeline: 'main-timeline',
    position: '-=.4',
    from: {
      position: 'absolute',
    },
    to: {
      ease: 'power1.inOut',
      transformOrigin: 'top center',
      display: 'none',
      scale: .96,
      opacity: 0,
      delay: .1,
      duration: .4,
    }
  }
};

animations.itemInOut = {
  enter: {
    timeline: 'item',
    position: '-=.3',
    addTo: 'card',
    from: {
      x: 100,
      opacity: 0,
      duration: .5
    },
  },
  leave: {
    timeline: 'item',
    position: '-=.4',
    addTo: 'card',
    order: 5,
    to: {
      x: 100,
      opacity: 0,
      duration: .5
    },
  }
};

animations.mainNav = {
  enter: {
    timeline: 'nav',
    to: {
      x: 0,
      clearProps: '',
      duration: .5,
    }
  },
  leave: {
    to: {
      x: '-100%',
      clearProps: '',
      duration: .25,
    }
  },
};

animations.mainNavItem = {
  enter: {
    timeline: 'card',
    position: '-=.5',
    from: {
      transition: 'none',
      autoAlpha: 0,
      x: '-25%',
      ease: 'elastic.easeOut.config(1, .5)',
      clearProps: 'all',
      duration: .6
    },
  }
};

animations.navSubItem = {
  timeline: 'sub-nav-items',
  position: '-=.3',
  attachTo: 'main-nav-items',
  positionInParent: '+=.2',

  from: {
    opacity: 0,
    y: -10,
    duration: .35
  },
};

export { animations };

