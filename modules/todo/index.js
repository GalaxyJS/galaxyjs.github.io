/** @typedef {Galaxy.Scope} Scope */

const inputs = Scope.import('galaxy/inputs');
/** @type Galaxy.View */
const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');

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
                  // console.info(items, JSON.stringify(res));
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
            // $for: 'titem in inputs.items',
            $for: {
              data: '<>inputs.items.changes',
              as: 'titem'
            },
            animations: {
              config: {},
              enter: {
                // startAfter: 'card',
                parent: true,
                sequence: 'todo-items',
                from: {
                  height: 0,
                  paddingTop: 0,
                  paddingBottom: 0
                },
                position: '-=.1',
                duration: calculateDuration,
                chainToParent: true
              },
              leave: {
                sequence: 'card',
                to: {
                  height: 0,
                  paddingTop: 0,
                  paddingBottom: 0
                },
                position: '-=.1',
                duration: .5
              }
            },
            // id: '<>item.title',
            class: {
              done: '<>titem.done'
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
            data: '<>data.newItem'
          },
          on: {
            confirm: function () {
              ToDoService.add(Scope.data.newItem);
              Scope.data.newItem = {
                title: '',
                done: false
              };

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
