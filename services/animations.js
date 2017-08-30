/* global Scope */

Scope.export = {
  cardInOut: {
    ':enter': {
      sequence: 'card',
      from: {
        y: 100,
        opacity: 0
      },
      to: {
        y: 0,
        opacity: 1
      },
      duration: .5
    },
    ':leave': {
      sequence: 'card',
      order: 10,
      to: {
        y: 100,
        opacity: 0
      },
      duration: .5
    }
  },
  itemInOut: {
    ':enter': {
      sequence: 'card',
      group: 'items',
      from: {
        x: 100,
        opacity: 0
      },
      // to: {
      //   x: 0,
      //   autoAlpha: 1
      // },
      position: '-=.4',
      duration: .5
    },
    ':leave': {
      sequence: 'card',
      group: 'items',
      order: 5,
      to: {
        x: 100,
        opacity: 0
      },
      position: '-=.45',
      duration: .5
    },
    '.done': {
      sequence: 'card',
      group: 'item-state',
      position: '-=.15',
      duration: .3
    }
  },
  createSlideInOut: function (sequence) {
    return {
      ':enter': {
        sequence: sequence,
        group: 'items',
        from: {
          x: 100,
          opacity: 0
        },
        position: '-=.4',
        duration: .5
      },
      ':leave': {
        sequence: sequence,
        group: 'items',
        order: 5,
        to: {
          x: 100,
          opacity: 0
        },
        position: '-=.45',
        duration: .5
      }
    };
  },
  createPopInOut: function (sequence) {
    return {
      ':enter': {
        sequence: sequence,
        // group: val,
        from: {
          scale: 0
        },
        position: '-=.3',
        duration: .5
      },
      ':leave': {
        sequence: sequence,
        // group: 'items',
        order: 5,
        to: {
          scale: 0
        },
        position: '-=.45',
        duration: .5
      }
    };
  }
};
