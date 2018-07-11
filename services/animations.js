/* global Scope */

const animations = {
  cardInOut: {
    enter: {
      sequence: 'card',
      from: {
        transformOrigin: 'top center',
        scale: 1.1,
        opacity: 0,
        position: 'absolute',
        top: 0,
        x: function (val, node) {
          return node.offsetLeft;
        }
      },
      to: {
        top: 0,
        scale: 1,
        opacity: 1,
        position: 'absolute'
      },
      duration: .3,
      position: '-=.15',

      chainToParent: true
    },
    leave: {
      sequence: 'card',
      fixedPosition: true,
      from: {
        transformOrigin: 'top center'
      },
      to: {
        display: 'none',
        scale: .9,
        opacity: 0
      },
      duration: .3
    }
  },
  itemInOut: {
    enter: {
      parent: 'card',
      sequence: 'item',
      from: {
        x: 100,
        opacity: 0
      },
      position: '-=.3',
      duration: .5
    },
    leave: {
      parent: 'card',
      sequence: 'item',
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
      ease: 'Power3.easeOut',
      x: '-100%'
    },
    duration: .5
  }
};

animations.mainNavItem = {
  enter: {
    parent: 'card',
    sequence: 'main-nav-items',
    from: {
      transition: 'none',
      autoAlpha: 0,
      x: '-25%',
      ease: Elastic.easeOut.config(1, .5)
    },
    position: '-=.4',
    duration: .5
  },
  '.active': {
    sequence: 'main-nav-items',
    position: '-=.2',
    duration: .2
  }
};

Scope.exports = animations;
