/* global Scope */

/** @type Galaxy.View */
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

// Scope.data.activeModule = Scope.data.navItems[3].module;
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

Scope.data.fn = 'jh';

Scope.data.moduleInputs = {
  text: 'asdasd',
  content: 'This is the default content',
  items: '<>data.todos',
  subMenus: {
    items: []
  }
};

const items = [
  {
    title: 'Galaxy.Scope'
  },
  {
    title: 'Galaxy.Module'
  },
  {
    title: 'Galaxy.Sequence'
  },
  {
    title: 'Galaxy.Observer'
  },
  {
    title: 'Galaxy.View'
  },
  {
    title: 'Galaxy.View.ViewNode'
  }
];
// navService.setSubNavItems(items);

router.init({
  '/': function () {
    router.navigate('start');
  },

  '/:moduleId': function (params) {
    const nav = Scope.data.navItems.filter(function (item) {
      return item.module.id === params.moduleId;
    })[0];

    if (nav) {
      navService.setSubNavItems([]);
      // Scope.data.moduleInputs.subMenus.items = [];
      Scope.data.activeModule = nav.module;
    }
  }
});

router.notFound(function () {
  console.error('404, Not Found!');
});

view.config.cleanContainer = true;
view.init([
  {
    tag: 'div',
    id: 'main-nav',
    class: 'main-nav',
    animations: animations.mainNav,
    children: [
      {
        tag: 'h1',
        text: 'GalaxyJS'
      },
      {
        tag: 'div',
        $for: 'nav in data.navItems',

        animations: animations.mainNavItem,
        class: 'ahah',
        children: [
          {
            animations: {
              '.active': {
                sequence: 'active-nav',
                position: '-=.2',
                duration: .2
              }
            },

            tag: 'a',
            inputs: {
              nav: '<>nav'
            },

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
                router.navigate(this.inputs.nav.link);
              }
            }
          },
          {
            class: 'sub-nav-container',
            $if: [
              'nav.module',
              'data.activeModule',
              'data.navService.subNavItems.length',
              function (mod, actMod, length) {
                return mod === actMod && length;
              }
            ],
            animations: {
              enter: {
                parent: 'main-nav-items',
                // chainToParent: true,
                positionInParent: '-=.5',
                sequence: 'sub-nav-container',
                // positionInParent: '+=.2',
                from: {
                  borderLeftWidth: 15,
                  height: 0
                },
                to: {
                  height: function (v, node) {
                    node.style.height = 'auto';
                    const height = node.offsetHeight;
                    node.style.height = 0;

                    return height;
                  }
                },
                duration: .3
              },
              leave: {
                to: {
                  // borderLeftWidth: 0,
                  height: 0
                },
                duration: .2
              }
            },

            lifecycle: {
              postEnter: function () {
                console.log('postEnter');
              },
              post$forEnter: function (items) {
                console.log('post$forEnter', items);
              }
            },

            children: {
              // {
              tag: 'a',
              class: 'nav-item sub',
              animations: {
                config: {
                  leaveWithParent: true
                },
                enter: animations.navSubItem,
                leave: {}
              },
              $for: {
                as: 'subNav',
                data: [
                  'nav.module',
                  'data.activeModule',
                  'data.navService.subNavItems.changes',
                  function (m, am, c) {
                    if (m === am) {
                      return c;
                    }

                    return null;
                  }
                ]
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
