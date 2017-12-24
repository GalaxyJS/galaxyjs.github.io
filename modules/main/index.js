/* global Scope */


const view = Scope.import('galaxy/view');

Scope.flag = false;
Scope.count = 10;

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

Scope.activeModule = Scope.navItems[1].module;

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

Scope.moduleInputs = {
  text: 'asdasd',
  content: 'This is the default content',
  items: '<>todos',
  data: {
    count: '<>count'
  }
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
        tag: 'a',
        $for: 'item in navItems',
        inputs: {
          item: '<>item'
        },
        href: '<>item.link',
        text: '<>item.title',
        class: {
          active: [
            'item.module',
            'activeModule',
            function (mod, actMod) {
              return mod === actMod;
            }
          ]
        },
        on: {
          click: function () {
            Scope.activeModule = this.inputs.item.module;
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
        module: '<>activeModule',
        inputs: Scope.moduleInputs,
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
