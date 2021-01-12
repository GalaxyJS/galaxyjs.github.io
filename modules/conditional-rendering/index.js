const animations = Scope.import('services/animations.js');

const view = Scope.import('galaxy/view');

Scope.data.condition = true;
Scope.data.conditionForMultiple = true;
Scope.data.conditionForList = true;

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
    // addTo: 'card',
    to: {
      x: 25,
      opacity: 0
    },
    position: '-=.18',
    duration: .3
  }
};

const listItemAnimations = {
  enter: {
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
    sequence: 'if-items',
    to: {
      x: 25,
      opacity: 0
    },
    position: '-=.18',
    duration: .5
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
      children: [
        {
          tag: 'h1',
          text: 'Conditional Rendering'
        },
        {
          tag: 'p',
          html: 'With <strong>$if</strong> you can specify presence of the element inside dom based on a condition.'
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
          },
          $if: '<>data.condition'
        },

        {
          tag: 'h2',
          text: 'Multiple Nodes'
        },
        {
          tag: 'p',
          html: 'If multiple nodes which are direct children of the same parent and have <strong>$if</strong> condition,' +
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
        },

        '<h2>Condition on a list</h2>',
        {
          tag: 'p',
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
            enter: {
              to: {
                opacity: 1
              },
              duration: .1
            },
            leave: {
              sequence: 'if-items',
              to: {
                opacity: 0,
                clearProps: 'all'
              },
              duration: 1
            }
          },
          children: [
            {
              tag: 'p',
              animations: listItemAnimations,

              repeat: {
                data: ['first', 'Second', 'third'],
                as: 'item'
              },
              text: '<>item'
            }
          ]
        },
        '<h2>Rendering Strategy</h2>' +
        '<p>The way <strong>$if</strong> handles DOM manipulation is important to be understood. ' +
        'When condition is false, then the element will be detached from DOM and upon on true ' +
        'the same element will be reattached to the DOM</p>' +
        '<p>Also keep in mind that <strong>$if</strong> rendering process only sees direct children rendering process ' +
        'e.g. leave or enter.' +
        'This means the animation on a element with a <strong>$if</strong> will not response properly to ' +
        'indirect children animations of that element</p>'

      ]
    }
  ]
});
