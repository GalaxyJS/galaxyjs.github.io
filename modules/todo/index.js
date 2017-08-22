/* global Scope */

var view = Scope.import('galaxy/view');
var inputs = Scope.import('galaxy/inputs');

Scope.count = 0;

var observer = Scope.observe(inputs.data);
observer.on('count', function (value, oldValue) {
});

console.info(inputs);

Scope.newItem = {
  title: '',
  done: false
};

view.init({
  tag: 'div',
  class: 'card',
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
      to: {
        y: 100,
        opacity: 0
      },
      duration: .5
    }
  },
  children: [
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h2',
          text: '[inputs.data.count]'
        },
        {
          tag: 'ul',
          children: {
            $for: 'item in inputs.items',
            animation: {
              class: {}
            },
            tag: 'li',
            class: {
              done: '[item.done]'
            },
            children: [
              {
                tag: 'span',
                text: '[item.title]'
              },
              {
                tag: 'input',
                type: 'checkbox',
                checked: '[item.done]'
              }
            ]

          }
        },
        {
          tag: 'div',
          class: 'field',
          children: [
            {
              tag: 'label',
              text: 'ToDo Item'
            },
            {
              tag: 'input',
              value: '[newItem.title]'
            }
          ]
        },
        {
          tag: 'button',
          text: 'Add',
          on: {
            click: function () {
              Scope.newItem.title = Scope.newItem.title.trim();
              if (Scope.newItem.title.trim()) {
                Scope.inputs.items.push(Object.assign({}, Scope.newItem));
                Scope.inputs.data.count += 1;
                Scope.newItem = {
                  title: '',
                  done: false
                };
              }
            }
          }
        }
      ]
    }
  ]
});
