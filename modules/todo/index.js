/** @typedef {Galaxy.Scope} Scope */

/** @type Galaxy.View */
const view = Scope.import('galaxy/view');
const style = Scope.import('./style.css');
const animations = Scope.import('services/animations.js');
Scope.data.fields = ['a', 'b'];
const ToDoService = {
  data: Scope.data.items,
  add: function (newItem) {
    newItem.title = newItem.title.trim();
    if (newItem.title) {
      this.data.push(newItem);
    }
  }
};

function addToList() {
  ToDoService.add(Scope.data.newItem);
  Scope.data.newItem = {
    title: '',
    done: false
  };
}

function calculateDuration() {
  let listAnimationDuration = 1 / (Scope.data.items.length || 1);
  if (listAnimationDuration < .12) {
    listAnimationDuration = .12;
  }

  return listAnimationDuration;
}

const checkAllButton = {
  tag: 'button',
  text: 'Check All',
  disabled: function (items = '<>data.items') {
    let res = items.filter(function (item) {
      return !item.done;
    });

    return res.length === 0;
  },
  on: {
    click: function () {
      Scope.data.items.forEach(function (item) {
        item.done = true;
      });
    }
  }
};

Scope.data.newItem = {
  title: '',
  done: false
};

view.blueprint({
  tag: 'div',
  class: 'card',
  _animations: animations.cardInOut,
  children: [
    style,
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h1',
          text: (len = '<>data.items.length') => {
            return 'ToDos, Count: ' + len;
          },
        },
        {
          class: 'fa-end',
          children: [
            checkAllButton,
            {
              tag: 'button',
              text: 'Un-Check All',
              disabled: (items = '<>data.items') => {
                return items.filter(function (item) {
                  return item.done;
                }).length === 0;
              },
              on: {
                click: function () {
                  data.data.items.forEach(function (item) {
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
                  data.data.items.forEach(function (item) {
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
            _repeat: {
              data: '<>data.items',
              as: 'titem'
            },
            _animations: {
              enter: {
                addTo: 'card',
                timeline: 'todo-items',
                from: {
                  opacity: 0,
                  y: -15,
                  x: -15,
                  clearProps: 'all'
                },
                position: '-=.1',
                duration: calculateDuration
              },
              leave: {
                withParent: true,
                timeline: 'card',
                to: {
                  opacity: 0,
                  y: -15,
                  x: -15
                },
                position: '-=.1',
                duration: .15
              }
            },
            class: {
              done: '<>titem.done',
              test: true
            },

            children: {
              tag: 'label',
              class: 'checkbox',
              children: [
                {
                  tag: 'input',
                  type: 'checkbox',
                  checked: '<>titem.done'
                },
                {
                  tag: 'span',
                  text: '<>titem.title'
                }
              ]
            }
          }
        },
        {
          _module: {
            path: './field.js'
          },
          _data: {
            entry: '<>data.newItem'
          },
          on: {
            confirm: addToList
          }
        },
        {
          class: 'fa-end',
          children: [
            {
              tag: 'button',
              text: 'Add',
              on: {
                click: addToList
              }
            }
          ]
        }
      ]
    }
  ]
});
console.log(Scope);
