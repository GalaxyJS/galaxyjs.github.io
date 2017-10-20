/* global Scope */

Scope.export = {
  cardInOut: {
    ':enter': {
      sequence: 'card',
      from: {
        y: 100,
        opacity: 0,
        ease: Power1.easeInOut
      },
      to: {
        y: 0,
        opacity: 1
      },
      duration: .5
    },
    ':leave': {
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
    ':enter': {
      parent: 'card',
      sequence: 'item',
      from: {
        x: 100,
        opacity: 0
      },
      position: '-=.3',
      duration: .5
    },
    ':leave': {
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
  createSlideInOut: function (sequence, parent, order) {
    return {
      ':enter': {
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
        position: '-=.3',
        duration: .5
      },
      ':leave': {
        parent: parent || null,
        sequence: sequence,
        order: order || 5,
        to: {
          x: 100,
          opacity: 0
        },
        position: '-=.3',
        duration: .5
      }
    };
  },
  createPopInOut: function (sequence, parent) {
    return {
      ':enter': {
        parent: parent || null,
        sequence: sequence,
        from: {
          scale: 0
        },
        position: '-=.3',
        duration: .5
      },
      ':leave': {
        parent: parent || null,
        sequence: sequence,
        order: 2,
        to: {
          scale: 0
        },
        position: '-=.3',
        duration: .5
      }
    };
  }
};
