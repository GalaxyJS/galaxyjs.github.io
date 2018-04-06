/* global Scope */

const view = Scope.import('galaxy/view');
const router = Scope.import('galaxy/router');
const animations = Scope.import('services/animations.js');

Scope.data.navItems = [
  {
    title: 'Start',
    link: 'start',
    module: {
      id: 'start',
      url: 'modules/start/index.js'
    }
  },
  {
    title: 'Guide',
    link: 'guide',
    module: {
      id: 'guide',
      url: 'modules/guide/index.js'
    }
  },
  {
    title: 'API',
    link: 'api',
    module: {
      id: 'api',
      url: 'modules/api/index.js'
    }
  },
  {
    title: 'ToDo - Demo',
    link: 'todo-demo',
    module: {
      id: 'todo-demo',
      url: 'modules/todo/index.js'
    }
  },

  {
    title: 'VueJS Replica - Demo',
    link: 'vuejs-replica-demo',
    module: {
      id: 'vuejs-replica-demo',
      url: 'modules/vuejs-replica/index.js'
    }
  }
];

// Scope.data.activeModule = null;
Scope.data.activeModule = null;

Scope.data.todos = [
  {
    title: 'Should add new item to todos',
    done: false
  },
  {
    title: 'Should add new item to todos 2',
    done: false
  }
];

Scope.data.moduleInputs = {
  text: 'asdasd',
  content: 'This is the default content',
  items: '<>data.todos'
};

router.on('/', function () {
  router.navigate('start');
}).resolve();

router.on('/:moduleId*', function (params) {
  const nav = Scope.data.navItems.filter(function (item) {
    return item.module.id === params.moduleId;
  })[0];

  if (nav) {
    Scope.data.activeModule = nav.module;
  }
  console.info(params);
}).resolve();

router.notFound(function () {
  console.error('404, Not Found!');
});

requestAnimationFrame(function () {
  view.init([
    {
      tag: 'div',
      id: 'main-nav',
      class: 'main-nav',
      // animations: animations.mainNav,
      children: [
        {
          tag: 'a',
          $for: 'item in data.navItems',
          inputs: {
            in_item: '<>item'
          },
          animations: animations.mainNavItem,
          // href: '<>item.link',
          text: '<>item.title',
          class: {
            active: [
              'item.module',
              'data.activeModule',
              function (mod, actMod) {
                // debugger;
                //   console.info(mod, actMod, mod === actMod);
                return mod === actMod;
              }
            ]
          },
          on: {
            click: function () {
              // console.info(this);
              router.navigate(this.inputs.in_item.link);
              // page('/' + this.inputs.in_item.link);
              // Scope.data.activeModule = this.inputs.in_item.module;
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
          tag: 'main',
          module: '<>data.activeModule',
          inputs: Scope.data.moduleInputs,
          on: {
            test: function (event) {
              console.info(event);
            }
          }
        }
      ]
    }
  ]);
});
