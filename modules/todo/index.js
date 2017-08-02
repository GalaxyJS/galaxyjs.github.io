/* global Scope */

var view = Scope.import('galaxy/view');
var inputs = Scope.import('galaxy/inputs');
Scope.newItem = {
  title: '',
  done: false
};

view.init({
  tag: 'div',
  class: 'card',
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
    }
  },
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
            animation: {
              class: {}
            },
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
