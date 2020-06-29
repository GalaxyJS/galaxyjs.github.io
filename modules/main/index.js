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
    icon: 'fas fa-play',
    module: {
      id: 'start',
      url: 'modules/start/index.js'
    }
  },
  {
    title: 'Guide',
    link: 'guide',
    icon: 'fas fa-map',
    module: {
      id: 'guide',
      url: 'modules/guide/index.js'
    }
  },
  {
    title: 'Reactive',
    link: 'reactive',
    icon: 'fas fa-exchange-alt',
    module: {
      id: 'reactive',
      url: 'modules/reactive/index.js'
    }
  },
  {
    title: 'Conditional Rendering',
    link: 'conditional-rendering',
    icon: 'fas fa-exclamation-triangle',
    module: {
      id: 'conditional-rendering',
      url: 'modules/conditional-rendering/index.js'
    }
  },

  {
    title: 'List Rendering',
    link: 'list-rendering',
    icon: 'fas fa-list-ul',
    module: {
      id: 'list-rendering',
      url: 'modules/list-rendering/index.js'
    }
  },

  {
    title: 'Animations',
    link: 'animations',
    icon: 'fas fa-spinner',
    module: {
      id: 'animations',
      url: 'modules/animations/index.js'
    }
  },

  {
    title: 'API',
    link: 'api',
    icon: 'fas fa-code',
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
console.log(Scope.data);

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

isActiveModule.watch = ['nav.module', 'data.activeModule'];

function isActiveModule(mod, actMod) {
  return mod === actMod;
}


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
navService.setSubNavItems([
  {
    title: 'Installation'
  },
  {
    title: 'Bootstrap'
  },
  {
    title: 'The Progressive Way'
  }
]);

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
      // setTimeout(function () {
      Scope.data.activeModule = nav.module;
      // }, 300);

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
    // animations: animations.mainNav,
    children: [
      {
        tag: 'h1',
        text: 'GalaxyJS'
      },
      {
        tag: 'div',
        $for: {
          data: '<>data.navItems.changes',
          as: 'nav'
        },

        animations: {
          enter: {
            sequence: 'main-nav-items',
            from: {
              transition: 'none',
              autoAlpha: 0,
              x: '-25%',
              ease: Elastic.easeOut.config(1, .4),
              clearProps: 'all'
            },
            position: '-=.1',
            duration: .2
          }
        },
        children: [
          {
            tag: 'a',
            inputs: {
              nav: '<>nav'
            },

            class: {
              'nav-item': true,
              active: isActiveModule
            },
            on: {
              click: function () {
                router.navigate(this.inputs.nav.link);
              }
            },
            children: [
              {
                tag: 'i',
                class: '<>nav.icon'
              },
              {
                tag: 'span',
                text: '<>nav.title'
              }
            ]
          },
          {
            class: 'sub-nav-container',
            // $if: [
            //   'nav.module',
            //   'data.activeModule',
            //   'data.navService.subNavItems.length',
            //   function (mod, actMod, length) {
            //     return mod === actMod && length;
            //   }
            // ],
            // animations: {
            //   enter: {
            //     sequence: 'sub-nav-container',
            //     // addTo: 'main-nav-items',
            //     // positionInParent: '-=.5',
            //
            //     from: {
            //       borderLeftWidth: 15,
            //       height: 0
            //     },
            //     to: {
            //       height: function (v, node) {
            //         node.style.height = 'auto';
            //         const height = node.offsetHeight;
            //         node.style.height = 0;
            //
            //         return height;
            //       }
            //     },
            //     duration: .5
            //   },
            //   leave: {
            //     to: {
            //       height: 0
            //     },
            //     duration: .2
            //   }
            // },

            children: {
              tag: 'a',
              class: 'nav-item sub',
              animations: {
                config: {
                  leaveWithParent: true
                },
                enter: {
                  sequence: 'main-nav-items',
                  from: {
                    opacity: 0,
                    y: -10
                  },
                  position: '-=.1',
                  duration: .5
                },
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
        lifecycle: {
          beforeCreate() {
          },
          created() {
          },
          beforeMount() {
          },
          mounted() {
          },
          beforeDestroy() {
          },
          destroyed() {
          }
        },
        on: {
          test: function (event) {
            console.info(event);
          }
        }
      }
    ]
  }
]);
