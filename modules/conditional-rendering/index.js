const animations = Scope.import('services/animations.js');

const view = Scope.import('galaxy/view');

Scope.data.condition = true;
Scope.data.conditionForMultiple = true;

const itemAnimations = {
  config: {
    enterWithParent: true,
    leaveWithParent: true
  },
  enter: {
    parent: 'card',
    sequence: 'if-items',
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
    parent: 'card',
    sequence: 'if-items',
    to: {
      x: 25,
      opacity: 0
    },
    position: '-=.18',
    duration: .2
  }
};

view.init({
  tag: 'div',
  class: 'card big',
  animations: animations.cardInOut,
  children: [
    {
      tag: 'section',
      class: 'content',
      renderConfig: {
        domManipulationOrder: 'alternate'
      },
      children: [
        {
          tag: 'h1',
          text: 'Conditional Rendering'
        },
        {
          tag: 'p',
          text: 'With $if you can specify presence of the element inside dom based on a condition.'
        },
        {
          tag: 'p',
          text: 'Keep in mind that when the condition is false the element will be detach from DOM, ' +
          'but not destroyed and upon condition true it will be reattached to DOM.'
        },
        {
          tag: 'p',
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
            {
              tag: 'text',
              text: 'Condition is: '
            },
            {
              tag: 'strong',
              text: '<>data.condition'
            }
          ]
        },
        {
          tag: 'p',
          text: 'This paragraph has $if',
          animations: {
            config: {
              leaveWithParent: true
            },
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
              to: {
                y: -15,
                opacity: 0
              },
              position: '-=.18',
              duration: .2
            }
          },
          $if: '<>data.condition'
        },

        {
          tag: 'h2',
          text: 'Multiple Nodes'
        },
        {
          tag: 'p',
          text: 'If multiple nodes which are direct children of the same parent and have $if condition,' +
          ' then they follow default rendering order upon condition change.'
        },
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
            {
              tag: 'text',
              text: 'Condition is: '
            },
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
      ]
    }
  ]
});