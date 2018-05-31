/* global Scope */

const view = Scope.import('galaxy/view');
const router = Scope.import('galaxy/router');
const animations = Scope.import('services/animations.js');
const navService = Scope.import('services/navigation.js');
Scope.data.navService = navService;

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
    title: 'Reactive',
    link: 'reactive',
    module: {
      id: 'reactive',
      url: 'modules/reactive/index.js'
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
    title: 'Conditional Rendering',
    link: 'conditional-rendering',
    module: {
      id: 'conditional-rendering',
      url: 'modules/conditional-rendering/index.js'
    }
  },

  {
    title: 'List Rendering',
    link: 'list-rendering',
    module: {
      id: 'list-rendering',
      url: 'modules/list-rendering/index.js'
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

router.init({
  '/': function () {
    router.navigate('start');
  },
  '/:moduleId*': function (params) {
    const nav = Scope.data.navItems.filter(function (item) {
      return item.module.id === params.moduleId;
    })[0];

    if (nav) {
      Scope.data.activeModule = nav.module;
    }
    console.info(params);
  }
});

router.notFound(function () {
  console.error('404, Not Found!');
});
console.log(Scope)
requestAnimationFrame(function () {
  view.config.cleanContainer = true;
  view.init([
    {
      tag: 'div',
      id: 'main-nav',
      class: 'main-nav',
      animations: animations.mainNav,
      children: [
        {
          tag: 'div',
          $for: 'nav in data.navItems',
          children: [
            {
              tag: 'a',
              inputs: {
                nav: '<>nav'
              },
              animations: animations.mainNavItem,
              text: '<>nav.title',
              class: {
                'nav-item': true,
                active: [
                  'nav.module',
                  'data.activeModule',
                  function (mod, actMod) {
                    return mod === actMod;
                  }
                ]
              },
              on: {
                click: function () {
                  navService.setSubNavItems([]);
                  router.navigate(this.inputs.nav.link);
                }
              }
            },
            {
              class: 'sub-nav-container',
              $if: [
                'nav.module',
                'data.activeModule',
                function (mod, actMod) {
                  return mod.id === actMod.id;
                }
              ],
              children: {
                tag: 'a',
                class: 'nav-item sub',
                animations: {
                  config: {
                    // leaveWithParent: true
                  },
                  enter: {
                    // parent: 'card',
                    sequence: 'sub-navs',
                    from: {
                      paddingTop: 0,
                      paddingBottom: 0,
                      height: 0
                    },
                    position: '-=.05',
                    duration: .1
                  },
                  // leave: {
                  //   parent: 'card',
                  //   sequence: 'sub-navs',
                  //   to: {
                  //     paddingTop: 0,
                  //     paddingBottom: 0,
                  //     height: 0
                  //   },
                  //   position: '-=.04',
                  //   duration: .06
                  // }

                },
                $for: {
                  as: 'subNav',
                  data: '<>data.navService.subNavItems.changes'
                  // data: [
                  //   'nav.module',
                  //   'data.activeModule',
                  //   'data.navService.subNavItems.changes',
                  //   function (m, am, c) {
                  //     if (m.id === am.id) {
                  //       return c;
                  //     }
                  //
                  //     return null;
                  //   }
                  // ]
                },
                text: '<>subNav.title'
              }
            }

          ]
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
