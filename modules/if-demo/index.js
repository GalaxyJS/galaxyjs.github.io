const animations = Scope.import('services/animations.js');

const view = Scope.import('galaxy/view');

Scope.data.condition = true;

const itemAnimations = {
  enter: {
    parent: 'card',
    sequence: 'list-items',
    from: {
      opacity: 0,
      x: 20
    },
    to: {
      opacity: 1,
      x: 0
    },
    position: '-=.3',
    duration: .5
  },
  leave: {
    parent: 'card',
    sequence: 'list-items',
    to: {
      x: 20,
      opacity: 0
    },
    position: '-=.3',
    duration: .5
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
              }
            }
          ]
        },
        {
          tag: 'p',
          text: ' Item 1',
          animations: itemAnimations,
          $if: '<>data.condition',
        },
        {
          tag: 'p',
          text: ' Item 2',
          animations: itemAnimations,
          $if: '<>data.condition',

        },
        {
          tag: 'p',
          text: ' Item 3',
          animations: itemAnimations,
          $if: '<>data.condition',
        },
        {
          tag: 'p',
          text: ' Item 4',
          animations: itemAnimations,
          $if: '<>data.condition',
        },
        {
          tag: 'p',
          text: ' Item 5',
          animations: itemAnimations,
          $if: '<>data.condition',
        }
      ]
    }
  ]
});