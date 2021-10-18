const view = Scope.import('galaxy/view');

Scope.data.conditionForList = true;
view.blueprint([
  {
    tag: 'div',
    children: [
      {
        tag: 'button',
        text: 'Toggle',
        on: {
          click: function () {
            Scope.data.conditionForList = !Scope.data.conditionForList;
          }
        }
      }
    ]
  },
  {
    tag: 'p',
    children: [
      {
        tag: 'text',
        text: 'Condition is: '
      },
      {
        tag: 'strong',
        text: '<>data.conditionForList'
      }
    ]
  },
  {
    if: '<>data.conditionForList',
    animations: {
      enter: {
        to: {
          opacity: 1,
          x: 0
        },
        duration: 0
      },
      leave: {
        to: {
          opacity: 0,
          x: 20,
        },
        duration: .3
      }
    },
    children: [
      {
        tag: 'p',
        animations: {
          enter: {
            from: {
              opacity: 0,
              x: 20
            },
            to: {
              opacity: 1,
              x: 0
            },
            duration: .5
          },
          leave: {
            timeline: 'if-items',
            to: {
              opacity: 0,
              x: 20,
            },
            position: '-=.18',
            duration: .3
          }
        },
        repeat: {
          data: ['first', 'Second', 'third'],
          as: 'item'
        },
        text: '<>item'
      }
    ]
  }
]);
