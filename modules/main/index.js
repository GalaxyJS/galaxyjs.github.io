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

// for (var i = 0; i < 10; i++) {
//   Scope.todos.push({
//     title: 'Dynamic item ' + i,
//     done: (i % 3 === 0)
//   });
// }

Scope.moduleInputs = {
  text: 'asdasd',
  content: 'This is the default content',
  items: '[todos]'
};

Scope.newItem = {
  title: '',
  done: false
};

var mi = {
  text: 'asdasdasd',
  content: 'This is the default content',
  items: '[todos]'
};

view.init([
  {
    tag: 'div',
    id: 'main-nav',
    class: 'main-nav',
    // text: '[moduleInputs.text]',
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
        inputs: mi,
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

console.info(mi);
setTimeout(function () {
  mi.text = 'This has been changed after 3 seconds!';
}, 3000);
