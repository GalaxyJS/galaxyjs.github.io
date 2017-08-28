/* global Scope */

Scope.import('galaxy/inputs');

var view = Scope.import('galaxy/view');
var animations = Scope.import('services/animations.js');

Scope.count = 0;

var observer = Scope.observe(Scope.inputs.data);
observer.on('count', function (value, oldValue) {
});

Scope.newItem = {
  title: '',
  done: false
};

view.init({
  tag: 'div',
  class: 'card',
  animation: animations.cardInOut,
  children: [
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h2',
          text: [
            'inputs.items.length',
            function (items) {
              return 'ToDos, Count: ' + items;
            }
          ]
        },
        {
          tag: 'button',
          text: 'Check All',
          on: {
            click: function () {
              Scope.inputs.items.forEach(function (item) {
                item.done = true;
              });
            }
          }
        },
        {
          tag: 'ul',
          children: {
            tag: 'li',
            $for: 'item in inputs.items',
            animation: animations.itemInOut,
            renderConfig: {
              applyClassListAfterRender: true
            },
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
