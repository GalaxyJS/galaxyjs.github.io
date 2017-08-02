/* globals Scope */

var view = Scope.import('galaxy/view');
var inputs = Scope.import('galaxy/inputs');

view.init({
  class: 'card big',
  animation: {
    enter: {
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
    leave: {
      sequence: 'card',
      from: {
        opacity: 1
      },
      to: {
        opacity: 0
      },
      duration: 2
    }
  },
  children: [
    {
      class: 'content',
      tag: 'section',
      children: [
        {
          tag: 'h1',
          text: 'Guide Page'
        },
        {
          tag: 'h3',
          text: '[inputs.title]'
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
                enter: {
                  sequence: 'card',
                  from: {
                    x: 100,
                    opacity: 0
                  },
                  to: {
                    x: 0,
                    opacity: 1
                  },
                  position: '-=.9',
                  duration: 1
                },
                leave: {
                  to: {
                    opacity: 0
                  },
                  duration: .3
                },
                '* to done': {
                  from: '',
                  to: 'done',
                  duration: 3
                }
              },
              tag: 'p',
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
