/* global Scope */

/** @type Galaxy.View */
const view = Scope.import('galaxy/view');
const router = Scope.import('galaxy/router');
const animations = Scope.import('services/animations.js');
const navService = Scope.import('services/navigation.js');

// setTimeout(() => {
//   setInterval(() => {
//     if (Scope.data.activeModule.id === 'start') {
//       router.navigate('vuejs-replica-demo');
//     } else {
//       router.navigate('start');
//     }
//   }, 1500);
// }, 2000);

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
      fresh: true,
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

isActiveModule.watch = ['nav.module', 'data.activeModule'];

function isActiveModule(mod, actMod) {
  return mod === actMod;
}

router.config.baseURL = '/';
router.init({
  '/': () => {
    router.navigate('start');
  },

  '/:moduleId': (params, asdasd) => {
    console.log(params, asdasd);
    const nav = Scope.data.navItems.filter(function (item) {
      return item.module.id === params.moduleId;
    })[0];

    if (nav) {
      navService.setSubNavItems([]);
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
    class: {
      'main-nav': true,
      'expand': '<>data.expandNav'
    },
    animations: animations.mainNav,
    on: {
      click(vn) {
        if (window.innerWidth < 768) {
          Scope.data.expandNav = !Scope.data.expandNav;
        }
      },
      tap(vn) {
        if (window.innerWidth < 768) {
          Scope.data.expandNav = !Scope.data.expandNav;
        }
      }
    },
    children: [
      {
        tag: 'h1',
        text: 'GalaxyJS'
      },
      {
        tag: 'div',
        $for: {
          data: '<>data.navItems',
          as: 'nav'
        },
        animations: {
          enter: {
            sequence: 'card',
            from: {
              transition: 'none',
              autoAlpha: 0,
              x: '-25%',
              ease: Elastic.easeOut.config(1, .4),
              clearProps: 'all'
            },
            position: '-=.25',
            duration: .3
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
            href: '<>nav.link',
            on: {
              click: function (e) {
                e.preventDefault();
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
            children: {
              tag: 'a',
              class: 'nav-item sub',
              animations: {
                enter: {
                  sequence: 'card',
                  from: {
                    opacity: 0,
                    y: -10
                  },
                  position: '-=.2',
                  duration: .3
                },
                leave: {
                  sequence: 'card',
                  to: {
                    opacity: 0,
                    y: -10
                  },
                  position: '-=.12',
                  duration: .2
                }
              },
              $for: {
                as: 'subNav',
                data: [
                  'nav.module',
                  'data.activeModule',
                  'data.navService.subNavItems',
                  function (m, am, c) {
                    if (m === am) {
                      return c;
                    }

                    return null;
                  }
                ]
              },
              inputs: {
                subNav: '<>subNav'
              },
              text: '<>subNav.title',
              href: '<>subNav.href',
              on: {
                click: function (e) {
                  e.preventDefault();
                  // debugger;
                  router.navigate(this.inputs.subNav.href);
                }
              }
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
        inputs: {
          text: 'asdasd',
          content: 'This is the default content',
          items: '<>data.todos',
          subMenus: {
            items: []
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
