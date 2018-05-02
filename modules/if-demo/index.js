const animations = Scope.import('services/animations.js');

const view = Scope.import('galaxy/view');

Scope.data.condition = true;

const itemAnimations = {
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
  class: 'card',
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
          tag: 'h2',
          text: 'List Demo'
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
              },
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
          text: ' Item 1',
          animations: itemAnimations,
          $if: '<>data.condition'
        },
        {
          tag: 'p',
          text: ' Item 2',
          animations: itemAnimations,
          $if: '<>data.condition'

        },
        {
          tag: 'p',
          text: ' Item 3',
          animations: itemAnimations,
          $if: '<>data.condition'
        },
        {
          tag: 'p',
          text: ' Item 4',
          animations: itemAnimations,
          $if: '<>data.condition'
        },
        {
          tag: 'p',
          text: ' Item 5',
          animations: itemAnimations,
          $if: '<>data.condition'
        }
      ]
    }
  ]
});