/* global Scope */

const animations = {
  cardInOut: {
    enter: {
      sequence: 'card',
      from: {
        transformOrigin: 'top center',
        scale: 1.04,
        opacity: 0,
        position: 'absolute',
        top: 0,
        x: function (val, node) {
          return node.offsetLeft;
        }
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
      sequence: 'card',
      from: {},
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
      sequence: 'item',
      addTo: 'card',
      from: {
        x: 100,
        opacity: 0
      },
      position: '-=.3',
      duration: .5
    },
    leave: {
      sequence: 'item',
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
  createSlideInOut: function (sequence, parent, lSeq) {
    return {
      enter: {
        parent: parent || null,
        sequence: sequence,
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
        sequence: lSeq,
        to: {
          x: 150,
          opacity: 0
        },
        position: '-=.15',
        duration: .2
      }
    };
  },
  createPopInOut: function (sequence, parent, lSequence, lParent) {
    return {
      enter: {
        parent: parent || null,
        sequence: sequence,
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
    sequence: 'card',
    from: {
      ease: 'elastic.inOut(1.2, .8)',
      x: '-100%'
    },
    duration: .5
  },
  'add:expand': {
    duration: .5,
    to: {
      ease: 'power2.inOut',
      height: '60%',
      boxShadow: '0 15px 25px rgba(40, 40, 40, .35)',
      overflow: 'auto'
    }
  },
  'remove:expand': {
    duration: .3,
    to: {
      ease: 'power2.inOut',
      height: 60,
      boxShadow: '0 5px 15px rgba(40, 40, 40, .2)',
      overflow: 'hidden'
    }
  }
};

animations.mainNavItem = {
  enter: {
    sequence: 'main-nav-items',
    appendTo: 'side-bar',
    positionInParent: '-=.3',

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
  sequence: 'sub-nav-items',
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
