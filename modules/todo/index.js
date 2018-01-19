/* global Scope */

const inputs = Scope.import('galaxy/inputs');
const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');

const ToDoService = {
  data: inputs.items,
  add: function (newItem) {
    newItem.title = newItem.title.trim();
    if (newItem.title) {
      this.data.push(Object.assign({}, newItem));
    }
  }
};

const observer = Scope.observe(inputs.items);
observer.on('length', function (value, oldValue) {
  console.info('length has been changed from', value, 'to', oldValue);
});

Scope.data.newItem = {
  title: '',
  done: false
};

console.info(Scope);

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
            function (len) {
              return 'ToDos, Count: ' + len;
            }
          ]
        },
        {
          class: 'fa-end',
          children: [
            {
              tag: 'button',
              text: 'Check All',
              disabled: [
                'inputs.items',
                function (items) {
                  return items.filter(function (item) {
                    return !item.done;
                  }).length === 0;
                }
              ],
              on: {
                click: function () {
                  inputs.items.forEach(function (item) {
                    item.done = true;
                  });
                }
              }
            },
            {
              tag: 'button',
              text: 'Un-Check All',
              disabled: [
                'inputs.items',
                function (items) {
                  return items.filter(function (item) {
                    return item.done;
                  }).length === 0;
                }
              ],
              on: {
                click: function () {
                  inputs.items.forEach(function (item) {
                    item.done = false;
                  });
                }
              }
            },
            {
              tag: 'button',
              text: 'Toggle',
              on: {
                click: function () {
                  inputs.items.forEach(function (item) {
                    item.done = !item.done;
                  });
                }
              }
            }
          ]
        },
        {
          tag: 'ul',
          children: {
            tag: 'li',
            $for: 'item in inputs.items',
            animation: {
              enter: {
                parent: 'card',
                sequence: 'todo-items',
                from: {
                  height: 0,
                  paddingTop: 0,
                  paddingBottom: 0
                },
                position: '-=.1',
                duration: .2,
                chainToParent: true
              },
              leave: {
                parent: 'card',
                sequence: 'todo-items',
                to: {
                  height: 0,
                  paddingTop: 0,
                  paddingBottom: 0
                },
                position: '-=.05',
                duration: .1
              }
            },
            // id: '<>item.title',
            class: {
              done: '<>item.done'
            },
            children: [
              {
                tag: 'span',
                text: '<>item.title'
              },
              {
                tag: 'input',
                type: 'checkbox',
                checked: '<>item.done'
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
              value: '<>data.newItem.title',
              on: {
                keyup: function (event) {
                  if (event.keyCode === 13) {
                    ToDoService.add(Scope.data.newItem);
                    Scope.data.newItem = {
                      title: '',
                      done: false
                    };
                  }
                }
              }
            }
          ]
        },
        {
          class: 'fa-end',
          children: {
            tag: 'button',
            text: 'Add',
            on: {
              click: function () {
                ToDoService.add(Scope.data.newItem);
                Scope.data.newItem = {
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
