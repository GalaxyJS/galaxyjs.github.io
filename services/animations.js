/* global Scope */

const animations = {
  cardInOut: {
    enter: {
      timeline: 'main-nav-timeline',
      position: 'side-bar+=.25',
      from: {
        transformOrigin: 'top center',
        scale: 1.04,
        opacity: 0,
        position: 'absolute',
        top: 0,
        // x: function (val, node) {
        //   return node.offsetLeft;
        // }
      },
      to: {
        ease: 'Power1.easeOut',
        transformOrigin: 'top center',
        top: 0,
        scale: 1,
        opacity: 1,
        position: 'absolute'
      },
      duration: .25,
    },
    leave: {
      timeline: 'main-nav-timeline',
      position: 'side-bar',
      to: {
        ease: 'Power1.easeIn',
        transformOrigin: 'top center',
        display: 'none',
        scale: .96,
        opacity: 0,
        delay: .1
      },
      duration: .25
    }
  },
  itemInOut: {
    enter: {
      timeline: 'item',
      addTo: 'card',
      from: {
        x: 100,
        opacity: 0
      },
      position: '-=.3',
      duration: .5
    },
    leave: {
      timeline: 'item',
      addTo: 'card',
      order: 5,
      to: {
        x: 100,
        opacity: 0
      },
      position: '-=.4',
      duration: .5
    }
  },
  createSlideInOut: function (timeline, parent, lSeq) {
    return {
      enter: {
        parent: parent || null,
        timeline: timeline,
        from: {
          x: 100,
          opacity: 0
        },
        to: {
          x: 0,
          opacity: 1
        },
        position: '-=.2',
        duration: .3
      },
      leave: {
        timeline: lSeq,
        to: {
          x: 150,
          opacity: 0
        },
        position: '-=.15',
        duration: .2
      }
    };
  },
  createPopInOut: function (timeline, parent, lSequence, lParent) {
    return {
      enter: {
        parent: parent || null,
        timeline: timeline,
        from: {
          scale: 0
        },
        position: '-=.2',
        duration: .3
      }
    };
  }
};

animations.mainNav = {
  enter: {
    timeline: 'nav',
    duration: .5,
    // position: '-=.5',
    to: {
      // ease: 'elastic.inOut(1.5, .75)',
      x: 0,
      clearProps: ''
    }
  },
  leave: {
    // timeline: 'card',
    duration: .25,
    // position: '-=.25',
    to: {
      x: '-100%',
      clearProps: ''
    }
  },
};

animations.mainNavItem = {
  enter: {
    timeline: 'card',

    from: {
      transition: 'none',
      autoAlpha: 0,
      x: '-25%',
      ease: 'elastic.easeOut.config(1, .5)',
      clearProps: 'all'
    },
    position: '-=.5',
    duration: .6
  }
};

animations.navSubItem = {
  timeline: 'sub-nav-items',
  attachTo: 'main-nav-items',
  positionInParent: '+=.2',

  from: {
    opacity: 0,
    y: -10
  },
  position: '-=.3',
  duration: .35
};

Scope.export = animations;
