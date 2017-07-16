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
  },
];


Scope.moduleInputs = {
  text: 'asdasd',
  content: 'This is the default content',
  items: '[navItems]'
};

Scope.newItem = {
  title: '',
  link: ''
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
        click: function (event) {
          Scope.activeModule = this.data.item.module;
          console.info(this);
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
                text: '[benchmark]'
              },
              {
                tag: 'p',
                class: 'field',
                children: [
                  {
                    tag: 'label',
                    text: 'Input title'
                  },
                  {
                    tag: 'input',
                    value: '[moduleInputs.title]'
                  }
                ]
              },
              {
                $for: 'item in navItems',
                class: 'field',
                module: {
                  url: 'modules/text-field.js'
                },
                inputs: {
                  label: '[item.link]',
                  value: '[item.title]'
                }
              },
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
              {
                class: 'field',
                module: {
                  url: 'modules/text-field.js'
                },
                inputs: {
                  label: 'Link',
                  value: '[newItem.link]'
                }
              },
              {
                tag: 'button',
                text: 'Save',
                click: function (event) {
                  console.info(Scope.newItem);
                  Scope.navItems.push(Object.assign({}, Scope.newItem));
                  Scope.newItem = {
                    title: '',
                    link: ''
                  };
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
