/** @typedef {Galaxy.Scope} Scope */

/** @type Galaxy.View */
const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');
const inputs = Scope.inputs;

const ToDoService = {
  data: inputs.items,
  add: function (newItem) {
    newItem.title = newItem.title.trim();
    if (newItem.title) {
      this.data.push(newItem);
    }
  }
};

function calculateDuration() {
  let listAnimationDuration = 1 / (inputs.items.length || 1);
  if (listAnimationDuration < .12) {
    listAnimationDuration = .12;
  }

  return listAnimationDuration;
}

Scope.data.newItem = {
  title: '',
  done: false
};
// console.log(inputs.items);
console.log(Scope.data.newItem, Scope.data);
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
                  let res = items.filter(function (item) {
                    return !item.done;
                  });

                  return res.length === 0;
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
            $for: {
              data: '<>inputs.items',
              as: 'titem'
            },
            animations: {
              enter: {
                addTo: 'card',
                // parent: true,
                sequence: 'todo-items',
                from: {
                  opacity: 0,
                  x: 25,
                  clearProps: 'all'
                },
                position: '-=.1',
                duration: calculateDuration
              },
              leave: {
                withParent: true,
                sequence: 'card',
                to: {
                  opacity: 0,
                  x: 25
                },
                position: '-=.1',
                duration: .15
              }
            },
            class: {
              done: '<>titem.done',
              test: true
            },

            children: [
              {
                tag: 'span',
                text: '<>titem.title'
              },
              {
                tag: 'input',
                type: 'checkbox',
                checked: '<>titem.done'
              }
            ]
          }
        },
        {
          module: {
            url: './field.js'
          },
          inputs: {
            entry: '<>data.newItem'
          },
          on: {
            confirm: function () {
              // console.log(Scope.data.newItem);
              // debugger
              ToDoService.add(Scope.data.newItem);
              Scope.data.newItem = {
                title: '',
                done: false
              };
              // console.log(Scope.data.newItem);
            }
          }
        },
        {
          class: 'fa-end',
          children: [
            {
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
          ]
        }
      ]
    }
  ]
});
