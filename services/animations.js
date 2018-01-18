/* global Scope */

Scope.exports = {
  cardInOut: {
    enter: {
      sequence: 'card',
      from: {
        y: 100,
        opacity: 0
      },
      duration: .5
    },
    leave: {
      sequence: 'card',
      order: 100,
      to: {
        y: 100,
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
    },
    // '.done': {
    //   sequence: 'card',
    //   group: 'item-state',
    //   position: '-=.15',
    //   duration: .3
    // }
  },
  createSlideInOut: function (sequence, parent, lSeq) {
    return {
      enter: {
        parent: parent || null,
        sequence: sequence,
        from: {
          // ease: Power2.easeOut,
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
        // parent: parent || null,
        sequence: lSeq,
        to: {
          // ease: Power2.easeIn,
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
      },
      // leave: {
      //   parent: lParent || null,
      //   sequence: lSequence,
      //   order: 2,
      //   to: {
      //     scale: 0
      //   },
      //   position: '-=.15',
      //   duration: .2
      // }
    };
  }
};
