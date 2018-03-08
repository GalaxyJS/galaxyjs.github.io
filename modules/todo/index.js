/* global Scope */

const inputs = Scope.import('galaxy/inputs');
const view = Scope.import('galaxy/view');
const tag = Scope.import('galaxy/tag');
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
  animations: animations.cardInOut,
  children: [
    {
      tag: 'section',
      class: 'content',
      children: [
        tag.h2([
          'inputs.items.length',
          function (len,c) {
            return 'ToDos, Count: ' + len;
          }
        ]),
        {
          class: 'fa-end',
          children: [
            tag.button('Check All').disabled([
              'inputs.items',
              function (items) {
                return items.filter(function (item) {
                  return !item.done;
                }).length === 0;
              }
            ]).onEvent('click', function () {
              inputs.items.forEach(function (item) {
                item.done = true;
              });
            }),

            tag.button('Un-Check All').disabled([
              'inputs.items',
              function (items) {
                return items.filter(function (item) {
                  return item.done;
                }).length === 0;
              }
            ]).onEvent('click', function () {
              inputs.items.forEach(function (item) {
                item.done = false;
              });
            }),

            tag.button('Toggle').onEvent('click', function () {
              inputs.items.forEach(function (item) {
                item.done = !item.done;
              });
            })
          ]
        },
        {
          tag: 'ul',
          children: {
            tag: 'li',
            $for: 'item in inputs.items',
            animations: {
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
                chainToParent: true,
                duration: .1
              }
            },
            // id: '<>item.title',
            class: {
              done: '<>item.done'
            },

            children: [
              tag.span('<>item.title'),
              tag.input().type('checkbox').checked('<>item.done')
            ]
          }
        },
        {
          tag: 'div',
          class: 'field',
          children: [
            tag.label('ToDo item'),
            tag.input().value('<>data.newItem.title').onEvent('keyup', function (event) {
              if (event.keyCode === 13) {
                ToDoService.add(Scope.data.newItem);
                Scope.data.newItem = {
                  title: '',
                  done: false
                };
              }
            })
          ]
        },
        {
          class: 'fa-end',
          children: [
            tag.button('Add').onEvent('click', function () {
              ToDoService.add(Scope.data.newItem);
              Scope.data.newItem = {
                title: '',
                done: false
              };
            })
          ]
        }
      ]
    }
  ]
});
