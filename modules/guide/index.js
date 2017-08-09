/* globals Scope */

var view = Scope.import('galaxy/view');
Scope.import('galaxy/inputs');

view.init({
  class: 'card big',
  animation: {
    ':enter': {
      sequence: 'card',
      from: {
        y: 100,
        opacity: 0
      },
      to: {
        y: 0,
        opacity: 1
      },
      duration: .5
    },
    ':leave': {
      sequence: 'card',
      order: 100,
      to: {
        y: 100,
        opacity: 0
      },
      duration: .5
    }
  },
  children: [
    {
      class: 'content',
      tag: 'section',
      children: [
        {
          tag: 'h1',
          text: 'Guide Page',
          // animation: {
          //   ':leave': {
          //     sequence: 'card',
          //     group: 'h1',
          //     order: 10,
          //     to: {
          //       color: 'green'
          //     },
          //     duration: 1
          //   }
          // }
        },
        {
          tag: 'h3',
          text: 'Secondary title',
          // animation: {
          //   ':leave': {
          //     sequence: 'card',
          //     group: 'h3',
          //     order: 5,
          //     to: {
          //       color: 'red'
          //     },
          //     duration: 1
          //   }
          // }
        },
        {
          content: '*'
        },
        {
          tag: 'blockquote',
          children: [
            {
              $for: 'item in inputs.items',
              animation: {
                ':enter': {
                  sequence: 'card',
                  group: 'items',
                  from: {
                    x: 100,
                    opacity: 0
                  },
                  position: '-=.25',
                  duration: .4
                },
                ':leave': {
                  sequence: 'card',
                  group: 'items',
                  order: 10,
                  to: {
                    x: 100,
                    opacity: 0
                  },
                  position: '-=.25',
                  duration: .4
                },
                '.done': {
                  sequence: 'card',
                  group: 'items',
                  order: 1,
                  duration: .3
                }
              },
              tag: 'p',
              class: {
                done: '[item.done]'
              },
              text: '[item.title]',
              children: [
                {
                  tag: 'input',
                  type: 'checkbox',
                  checked: '[item.done]'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
