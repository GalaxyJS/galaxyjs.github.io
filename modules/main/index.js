/* global Scope */


var view = Scope.import('galaxy/view');

// Scope.modules = [
//   {
//     id: 'start',
//     url: 'modules/start/index.js'
//   }
// ];

Scope.activeModule = {
  id: 'guide',
  url: 'modules/guide/index.js'
};

// Scope.activeModule = {
// };


Scope.flag = false;

Scope.navItems = [
  {
    title: 'Start',
    link: '#start',
    module: {
      id: 'start',
      url: 'modules/start/index.js'
    }
  },
  {
    title: 'Guide',
    link: '#guide',
    module: {
      id: 'guide',
      url: 'modules/guide/index.js'
    }
  },
  {
    title: 'API',
    link: '#api'
  },
  {
    title: 'ToDo - Demo',
    link: '#todo-demo',
    module: {
      id: 'todo-demo',
      url: 'modules/todo/index.js'
    }
  }
];

Scope.todos = [
  {
    title: 'Should add new item to todos',
    done: false
  },
  {
    title: 'Should add new item to todos 2',
    done: false
  },
  {
    title: 'Should add new item to todos 3',
    done: false
  },
  {
    title: 'Should add new item to todos 4',
    done: false
  },
  {
    title: 'Should add new item to todos 5',
    done: false
  },
  {
    title: 'Should add new item to todos 6',
    done: false
  }
];

for (var i = 0; i < 10; i++) {
  Scope.todos.push({
    title: 'Dynamic item ' + i,
    done: (i % 3 === 0)
  });
}

Scope.moduleInputs = {
  text: 'asdasd',
  content: 'This is the default content',
  items: '[todos]'
};

Scope.newItem = {
  title: '',
  done: false
};

view.init([
  {
    tag: 'div',
    id: 'main-nav',
    class: 'main-nav',
    children: [
      {
        $for: 'item in navItems',
        tag: 'a',
        href: '[item.link]',
        text: '[item.title]',
        on: {
          click: function () {
            Scope.activeModule = this.data.item.module;
          }
        },
        onDataChange: {
          'item.title': function () {

          }
        }
      }
    ]
  },
  {
    tag: 'div',
    id: 'main-content',
    class: 'main-content',
    children: [
      {
        tag: 'div',
        class: 'card',
        children: [
          {
            tag: 'section',
            class: 'content',
            children: [
              {
                tag: 'h2',
                text: 'ToDos List'
              },
              /*{
                $for: 'item in todos',
                tag: 'p',
                animation: {
                  enter: {
                    sequence: true,
                    from: {
                      x: -100,
                      opacity: 0
                    },
                    to: {
                      x: 0,
                      opacity: 1
                    },
                    position: '-=.9',
                    duration: 1
                  },
                  leave: {
                    to: {
                      height: 0,
                      marginTop: 0,
                      overflow: 'hidden'
                    },
                    duration: .3
                  }
                },
                text: '[item.title]',
                class: {
                  done: '[item.done]'
                },
                on: {
                  click: function () {
                    var index = Scope.todos.indexOf(this.data.item);
                    if (index !== -1) {
                      Scope.todos.splice(index, 1);
                    }
                  }
                },
                children: [
                  {
                    tag: 'input',
                    type: 'checkbox',
                    checked: '[item.done]'
                  }
                ]
              },*/
              // {
              //   $for: 'item in navItems',
              //   class: 'field',
              //   module: {
              //     url: 'modules/text-field.js'
              //   },
              //   inputs: {
              //     label: '[item.link]',
              //     value: '[item.title]'
              //   }
              // },
              {
                tag: 'h2',
                text: 'Add New Item'
              },
              {
                class: 'field',
                module: {
                  url: 'modules/text-field.js'
                },
                inputs: {
                  label: 'Title',
                  value: '[newItem.title]'
                }
              },
              // {
              //   class: 'field',
              //   module: {
              //     url: 'modules/text-field.js'
              //   },
              //   inputs: {
              //     label: 'Link',
              //     value: '[newItem.link]'
              //   }
              // },
              {
                tag: 'button',
                text: 'Save',
                click: function () {
                  console.info(Scope.newItem);
                  if (Scope.newItem.title.trim()) {
                    Scope.todos.push(Object.assign({}, Scope.newItem));
                    Scope.newItem = {
                      title: '',
                      done: false
                    };
                  }
                }
              }
            ]
          }
        ]
      },
      {
        module: '[activeModule]',
        inputs: '[moduleInputs]',
        children: [
          {
            tag: 'p',
            text: 'No content at the moment!'
          },
          {
            tag: 'p',
            text: '[moduleInputs.text]'
          },
          {
            tag: 'p',
            text: '[moduleInputs.content]'
          }
        ]
      }
    ]
  }
]);

console.info(Scope);
