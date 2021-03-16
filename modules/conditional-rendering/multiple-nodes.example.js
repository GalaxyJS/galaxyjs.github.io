const view = Scope.import('galaxy/view');

const itemAnimations = {
  enter: {
    withParent: true,
    sequence: 'if-sequence',
    addTo: 'card',
    from: {
      opacity: 0,
      x: 20
    },
    to: {
      opacity: 1,
      x: 0
    },
    position: '-=.2',
    duration: .3
  },
  leave: {
    withParent: true,
    sequence: 'if-sequence',
    to: {
      x: 25,
      opacity: 0
    },
    position: '-=.18',
    duration: .3
  }
};

Scope.data.conditionForMultiple = true;
view.init([
  {
    tag: 'p',
    children: [
      {
        tag: 'button',
        text: 'Toggle',
        on: {
          click: function () {
            Scope.data.conditionForMultiple = !Scope.data.conditionForMultiple;
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
        text: '<>data.conditionForMultiple'
      }
    ]
  },
  {
    tag: 'p',
    text: 'Item 1',
    animations: itemAnimations,
    $if: '<>data.conditionForMultiple'

  },
  {
    tag: 'p',
    text: 'Item 2',
    animations: itemAnimations,
    $if: '<>data.conditionForMultiple'

  },
  {
    tag: 'p',
    text: 'Item 3',
    animations: itemAnimations,
    $if: '<>data.conditionForMultiple'
  },
  {
    tag: 'p',
    text: 'Item 4',
    animations: itemAnimations,
    $if: '<>data.conditionForMultiple'
  },
  {
    tag: 'p',
    text: 'Item 5',
    animations: itemAnimations,
    $if: '<>data.conditionForMultiple'
  }
]);
