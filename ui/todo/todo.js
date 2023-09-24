import { animations } from '/services/animations.js';
import TodoField from './todo-field.js';
export default (Scope) => {
  const view = Scope.useView();
  // const style = Scope.import('./style.css');

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
    'todo-field': TodoField
  });

  view.blueprint({
    tag: 'div',
    class: 'card',
    animations: animations.cardInOut,
    children: [
      // style,
      {
        tag: 'section',
        class: 'content',
        children: [
          {
            tag: 'h2',
            text: (length = '<>data.items.length') => {
              return 'ToDos, Count: ' + length;
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
                  addTo: 'main-nav-timeline',
                  timeline: 'todo-items',
                  position: '-=.1',
                  from: {
                    opacity: 0,
                    y: -15,
                    x: -15,
                    clearProps: 'all',
                    duration: .15
                  },
                },
                leave: {
                  withParent: true,
                  timeline: 'card',
                  position: '-=.1',
                  to: {
                    height: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    duration: .25
                  },
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
                    html: '<i class="fas fa-trash-alt"></i>',
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
};
