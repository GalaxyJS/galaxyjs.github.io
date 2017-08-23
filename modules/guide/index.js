/* globals Scope */
Scope.import('galaxy/inputs');

var view = Scope.import('galaxy/view');
var animations = Scope.import('services/animations.js');

Scope.on('module.init', function () {
  console.info('Module guide initialized');
});

Scope.on('module.start', function () {
  console.info('Module guide started');
});

Scope.on('module.destroy', function () {
  console.info('Module guide destroyed');
});

// var observer = Scope.observe(inputs);
// observer.on('items', function (value, oldValue) {
//   debugger;
// });

view.init({
  class: 'card big',
  animation: animations.cardInOut,
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/guide.jpg'
    },
    {
      class: 'content',
      tag: 'section',
      children: [
        {
          tag: 'h1',
          text: 'Guide Page'
        },
        {
          tag: 'h2',
          text: 'Installation'
        },
        {
          tag: 'div',
          class: 'field',
          children: [
            {
              tag: 'label',
              text: 'Text'
            },
            {
              tag: 'input',
              value: '[inputs.text]'
            }
          ]
        },
        {
          tag: 'h3',
          text: '[inputs.text]',
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
              tag: 'p',
              $for: 'item in inputs.items',
              animation: {
                // ':enter': {
                //   sequence: 'card',
                //   group: 'items',
                //   from: {
                //     x: 100,
                //     opacity: 0
                //   },
                //   position: '-=.25',
                //   duration: .4
                // },
                // ':leave': {
                //   sequence: 'card',
                //   group: 'items',
                //   order: 10,
                //   to: {
                //     x: 100,
                //     opacity: 0
                //   },
                //   position: '-=.25',
                //   duration: .4
                // },
                '.done': {
                  sequence: 'card',
                  group: 'items',
                  order: 1,
                  duration: .3
                }
              },
              class: {
                done: [
                  'item.done',
                  function (done) {
                    return !done;
                  }
                ]
              },
              text: [
                'item.title',
                'inputs.text',
                function (title, text) {
                  return title + ', text length: ' + text.length;
                }
              ],
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
