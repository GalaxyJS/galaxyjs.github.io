/* global Scope */


var view = Scope.import('galaxy/view');

Scope.activeModule = {
  id: 'guide',
  url: 'modules/guide/index.js'
};

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

Scope.moduleInputs = {
  text: 'asdasd',
  content: 'This is the default content',
  items: '[todos]',
  data: {
    count: '[count]'
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
        module: '[activeModule]',
        // inputs: {}
        inputs: Scope.moduleInputs,
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

setTimeout(function () {
  // Scope.moduleInputs.text = 'This has been changed after 3 seconds!';
  // for (var i = 0; i < 1000; i++) {
  //   Scope.todos.push({
  //     title: 'Dynamic item ' + i,
  //     done: (i % 3 === 0)
  //   });
  // }
}, 2000);
