/** @typedef {Galaxy.Scope} Scope */

/** @type Galaxy.View */
const view = Scope.import('galaxy/view');
const style = Scope.import('./style.css');
const animations = Scope.import('services/animations.js');

const ToDoService = {
  data: Scope.data.items,
  add: function (newItem) {
    newItem.title = newItem.title.trim();
    if (newItem.title) {
      this.data.push(newItem);
    }
  },
  remove: function (item) {
    const index = this.data.indexOf(item);
    if (index !== -1) {
      this.data.splice(index, 1);
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

function removeFromList(item) {
  ToDoService.remove(item);
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

view.components({
  'todo-field': Scope.import('./todo-field.js')
});

view.blueprint({
  tag: 'div',
  class: 'card',
  animations: animations.cardInOut,
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
          class: 'flex-bar fa-end',
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
                  Scope.data.items.forEach(function (item) {
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
                  Scope.data.items.forEach(function (item) {
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
            repeat: {
              data: '<>data.items',
              as: 'toDoItem'
            },
            animations: {
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
                duration: .15
              },
              leave: {
                withParent: true,
                timeline: 'card',
                to: {
                  height: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  marginTop: 0,
                  marginBottom: 0
                },
                position: '-=.1',
                duration: .25
              }
            },
            class: {
              done: '<>toDoItem.done',
              test: true
            },

            children: {
              tag: 'label',
              class: 'checkbox',
              children: [
                {
                  tag: 'input',
                  type: 'checkbox',
                  checked: '<>toDoItem.done'
                },
                {
                  tag: 'span',
                  text: '<>toDoItem.title'
                },
                {
                  tag: 'button',
                  class: 'red',
                  html: '<span>Remove</span><i class="fas fa-trash-alt"></i>',
                  on: {
                    click() {
                      removeFromList(this.data.toDoItem);
                    }
                  }
                }
              ]
            }
          }
        },
        {
          tag: 'todo-field',
          props: {
            label: 'To Do Description',
            value: '<>data.newItem',
            onConfirm: addToList
          },
        },
        {
          class: 'flex-bar fa-end',
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
