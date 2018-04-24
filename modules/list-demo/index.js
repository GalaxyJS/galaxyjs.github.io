const animations = Scope.import('services/animations.js');

const view = Scope.import('galaxy/view');

Scope.data.list1 = [];
Scope.data.list2 = [];

const itemAnimations = {
  enter: {
    sequence: 'list-items',
    from: {
      opacity: 0,
      x: 20
    },
    to: {
      opacity: 1,
      x: 0
    },
    duration: .6
  },
  leave: {
    sequence: 'list-items',
    to: {
      x: 20,
      backgroundColor: 'red'
    },
    duration: .6
  }
};

view.init({
  tag: 'div',
  class: 'card',
  // animations: animations.cardInOut,
  children: [
    {
      tag: 'section',
      class: 'content',
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
              text: 'Populate',
              on: {
                click: function () {
                  Scope.data.list1 = [
                    {
                      title: '***** i-1'
                    },
                    {
                      title: '***** i-2'
                    }
                  ];
                  Scope.data.list2 = [
                    {
                      title: 'L2 i-1'
                    },
                    {
                      title: 'L2 i-2'
                    },
                    {
                      title: 'L2 i-3'
                    }
                  ];
                }
              }
            },
            {
              tag: 'button',
              text: 'Empty',
              on: {
                click: function () {
                  Scope.data.list1 = [];
                  Scope.data.list2 = [];
                }
              }
            }
          ]
        },
        {
          tag: 'ul',

          children: [
            {
              tag: 'li',
              animations: itemAnimations,
              // renderConfig: {
              //   domManipulationOrder: 'cascade'
              // },
              class: 'flex-row',
              $for: {
                data: '<>data.list1.changes',
                as: 'list1Item'
              },
              text: '<>list1Item.title'
            },

            {
              tag: 'li',
              animations: itemAnimations,
              // renderConfig: {
              //   domManipulationOrder: 'cascade'
              // },
              class: 'flex-row',
              $for: {
                data: '<>data.list2.changes',
                as: 'list2Item'
              },
              text: '<>list2Item.title'
            }

          ]
        }
      ]
    }
  ]
});