/* global Scope */

const view = Scope.import('galaxy/view');

Scope.data.navItems = [
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
    link: '#api',
    module: {
      id: 'api',
      url: 'modules/api/index.js'
    }
  },
  {
    title: 'ToDo - Demo',
    link: '#todo-demo',
    module: {
      id: 'todo-demo',
      url: 'modules/todo/index.js'
    }
  },

  {
    title: 'VueJS Replica - Demo',
    link: '#vuejs-replica-demo',
    module: {
      id: 'vuejs-replica',
      url: 'modules/vuejs-replica/index.js'
    }
  }
];

Scope.data.activeModule = Scope.data.navItems[1].module;

Scope.data.todos = [
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
  },
  {
    title: 'Should add new item to todos 7',
    done: false
  },
  {
    title: 'Should add new item to todos 8',
    done: false
  },
  {
    title: 'Should add new item to todos 9',
    done: false
  }
];

Scope.data.moduleInputs = {
  text: 'asdasd',
  content: 'This is the default content',
  items: '<>data.todos',
  data: {
    count: '<>count'
  }
};

Scope.data.newItem = {
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
        tag: 'a',
        $for: 'item in data.navItems',
        inputs: {
          item: '<>item'
        },
        href: '<>item.link',
        text: '<>item.title',
        class: {
          active: [
            'item.module',
            'data.activeModule',
            function (mod, actMod) {
              return mod === actMod;
            }
          ]
        },
        on: {
          click: function () {
            Scope.data.activeModule = this.inputs.item.module;
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
        module: '<>data.activeModule',
        inputs: Scope.data.moduleInputs,
        on: {
          test: function (event) {
            console.info(event);
          }
        }
        // children: [
        //   {
        //     tag: 'p',
        //     text: 'No content at the moment!'
        //   },
        //   {
        //     tag: 'p',
        //     text: '[moduleInputs.text]'
        //   },
        //   {
        //     tag: 'p',
        //     text: '[moduleInputs.content]'
        //   }
        // ]
      }
    ]
  }
]);
