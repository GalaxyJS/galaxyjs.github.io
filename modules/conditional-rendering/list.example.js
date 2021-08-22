const view = Scope.import('galaxy/view');

Scope.data.conditionForList = true;
view.init([
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
    $if: '<>data.conditionForList',
    animations: {
      leave: {
        to: {
          opacity: 0,
          x: 20,
          clearProps: 'all'
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
            sequence: 'if-items',
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