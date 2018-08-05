const animations = Scope.import('services/animations.js');

const view = Scope.import('galaxy/view');

Scope.data.list1 = [];
Scope.data.list2 = [];

function trackBy(item) {
  return item.title;
}

const itemAnimations = {
  enter: {
    sequence: 'list-items',
    from: {
      opacity: 0,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0
    },
    to: {
      opacity: 1,
      paddingTop: 5,
      paddingBottom: 5,
      height: function (val, node) {
        node.style.height = 'auto';
        const h = node.offsetHeight;
        node.style.height = val + 'px';
        return h + 10;
      }
    },
    position: '-=.2',
    duration: .4
  },
  leave: {
    parent: 'card',
    sequence: 'list-items',
    to: {
      paddingTop: 0,
      paddingBottom: 0,
      height: 0,
      opacity: 0
    },
    position: '-=.3',
    duration: .4
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
      children: [
        {
          tag: 'h1',
          text: 'List Rendering'
        },
        '<p>We can use the <strong>$for</strong> property to render a list of items based on an array</p>',
        {
          tag: 'p',
          children: [
            {
              tag: 'button',
              text: 'Populate',
              on: {
                click: function () {
                  // Scope.data.list1 = [
                  //   {
                  //     title: '***** i-1'
                  //   },
                  //   {
                  //     title: '***** i-2'
                  //   }
                  // ];
                  // Scope.data.list2 = [
                  //   {
                  //     title: 'L2 i-1'
                  //   },
                  //   {
                  //     title: 'L2 i-2'
                  //   },
                  //   {
                  //     title: 'L2 i-3'
                  //   }
                  // ];

                  for (let i = 0; i < 150; i++) {
                    Scope.data.list2.push({
                      title: i
                    });
                  }
                }
              }
            },
            {
              tag: 'button',
              text: 'Empty',
              on: {
                click: function () {
                  // debugger;
                  // Scope.data.list1.pop();
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
                as: 'list1Item',
                trackBy: trackBy
              },
              text: '<>list1Item.title'
            },

            {
              tag: 'li',
              // animations: itemAnimations,
              // renderConfig: {
              //   domManipulationOrder: 'cascade'
              // },
              class: 'flex-row',
              $for: {
                data: [{title:'test'}],
                as: 'list2Item',
                trackBy: trackBy
              },
              text: '<>list2Item.title'
            }

          ]
        }
      ]
    }
  ]
});
