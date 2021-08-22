const view = Scope.import('galaxy/view');

Scope.data.condition = true;
view.init([
  {
    tag: 'div',
    children: [
      {
        tag: 'button',
        text: 'Toggle',
        on: {
          click: function () {
            Scope.data.condition = !Scope.data.condition;
          }
        }
      }
    ]
  },
  {
    tag: 'p',
    children: [
      'Condition is: ',
      {
        tag: 'strong',
        text: '<>data.condition'
      }
    ]
  },
  {
    tag: 'p',
    text: 'This paragraph has $if',
    $if: '<>data.condition',
    animations: {
      enter: {
        from: {
          opacity: 0,
          y: -15
        },
        to: {
          opacity: 1,
          y: 0
        },
        duration: .3
      },
      leave: {
        withParent: true,
        to: {
          y: -15,
          opacity: 0
        },
        position: '-=.18',
        duration: .2
      }
    }
  }
]);