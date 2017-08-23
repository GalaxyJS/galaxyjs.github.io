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
      order: 1,
      to: {
        y: 100,
        opacity: 0
      },
      duration: .5
    }
  }
};
