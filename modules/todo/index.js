/* global Scope */

var view = Scope.import('galaxy/view');
var inputs = Scope.import('galaxy/inputs');

console.log(inputs);
Scope.newItem = {
  title: '',
  done: false
};

view.init({
  tag: 'div',
  class: 'card',
  animation: {},
  children: [
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h2',
          text: 'ToDos Widget'
        },
        {
          tag: 'ul',
          children: {
            $for: 'item in inputs.items',
            tag: 'li',
            class: {
              done: '[item.done]'
            },
            text: '[item.title]'
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
          // click: function () {
          //   Scope.newItem.done = !Scope.newItem.done;
          // }
          // on: '[newItem.title]'
          on: {
            click: function () {
              if (Scope.newItem) {
                Scope.inputs.items.push(Object.assign({}, Scope.newItem));
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
