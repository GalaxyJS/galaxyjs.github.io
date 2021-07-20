/* global Scope */

/** @type Galaxy.View */
const view = Scope.import('galaxy/view');
const router = Scope.import('galaxy/router');
const animations = Scope.import('services/animations.js');
const navService = Scope.import('services/navigation.js');

Scope.data.navService = navService;
// Scope.data.routes = [
//   {
//     title: 'Start',
//     link: '/start',
//     icon: 'fas fa-play',
//     module: {
//       id: 'start',
//       url: 'modules/start/index.js'
//     }
//   },
//   {
//     title: 'Guide',
//     link: '/guide',
//     icon: 'fas fa-map',
//     module: {
//       id: 'guide',
//       url: 'modules/guide/index.js'
//     }
//   },
//   {
//     title: 'Reactive',
//     link: '/reactive',
//     icon: 'fas fa-exchange-alt',
//     module: {
//       id: 'reactive',
//       url: 'modules/reactive/index.js'
//     }
//   },
//   {
//     title: 'Conditional Rendering',
//     link: '/conditional-rendering',
//     icon: 'fas fa-exclamation-triangle',
//     module: {
//       id: 'conditional-rendering',
//       url: 'modules/conditional-rendering/index.js'
//     }
//   },
//
//   {
//     title: 'List Rendering',
//     link: '/list-rendering',
//     icon: 'fas fa-list-ul',
//     module: {
//       fresh: true,
//       id: 'list-rendering',
//       url: 'modules/list-rendering/index.js'
//     }
//   },
//
//   {
//     title: 'Animations',
//     link: '/animations',
//     icon: 'fas fa-spinner',
//     module: {
//       id: 'animations',
//       url: 'modules/animations/index.js'
//     }
//   },
//
//   {
//     title: 'API',
//     link: '/api',
//     icon: 'fas fa-code',
//     module: {
//       id: 'api',
//       url: 'modules/api/index.js'
//     }
//   },
//
//   {
//     title: 'ToDo - Demo',
//     link: '/todo-demo',
//     module: {
//       id: 'todo-demo',
//       url: 'modules/todo/index.js'
//     }
//   },
//
//   {
//     title: 'VueJS Replica - Demo',
//     link: '/vuejs-replica-demo',
//     module: {
//       id: 'vuejs-replica-demo',
//       url: 'modules/vuejs-replica/index.js'
//     }
//   }
// ];

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

// const isActiveModule = [
//   'nav.route',
//   'data.router.activeRoute'
// ].compute((mod, actMod) => {
//   return mod === actMod;
// });

const isActiveLink = [
  'data.router.activeRoute',
  'subNav.href'
].compute((currentPath, href) => {
  console.log(currentPath, href);
  return currentPath === href;
});

router.init([
  {
    path: '/',
    redirectTo: '/start'
  },
  {
    path: '/start',
    module: {
      path: 'modules/start/index.js'
    },
    title: 'Start',
    description: '',
    icon: 'fas fa-play',
  },
  {
    path: '/guide',
    module: {
      path: 'modules/guide/index.js'
    },
    title: 'Guide',
    icon: 'fas fa-map',
  },
  {
    path: '/reactive',
    module: {
      path: 'modules/reactive/index.js'
    },
    title: 'Reactive',
    icon: 'fas fa-exchange-alt',
  },
  {
    path: '/api',
    module: {
      path: 'modules/api/index.js'
    },
    title: 'API',
    icon: 'fas fa-code',
  },
  // {
  //   route: '/:moduleId',
  //   handle: (params) => {
  //     const nav = Scope.data.routes.filter(function (item) {
  //       return item.module.id === params.moduleId;
  //     })[0];
  //
  //     if (nav) {
  //       navService.setSubNavItems([]);
  //       Scope.data.activeModule = nav.module;
  //     }
  //   }
  // }
]).start();

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
        repeat: {
          data: '<>router.routes',
          as: 'nav'
        },
        $if: '<>!nav.hidden',
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
        class: {
          'nav-item': true,
          'active': '<>nav.active'
        },
        children: [
          {
            tag: 'a',
            href: '<>nav.path',
            on: {
              click: function (e) {
                e.preventDefault();
                router.navigate(this.data.nav.path);
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
            animations: {
              enter: {
                sequence: 'card',
                from: {
                  height: 0
                },
                to: {
                  height: function (value, node) {
                    return node.scrollHeight;
                  },
                  ease: 'power1.inOut',
                },
                duration: function () {
                  // return this.inputs.moduleId === Scope.data.activeModule.id && navService.subNavItems.length ? .2 : 0;
                  return .2;
                },
                position: '-=.2'
              },
              leave: {
                sequence: 'card',
                to: {
                  height: 0,
                  ease: 'power1.inOut',
                },
                duration: function () {
                  return this.node.offsetHeight > 0 ? .2 : 0;
                },
                position: '-=.2'
              }
            },
            $if: [
              'nav.path',
              'router.activeRoute.path',
              // 'data.router.activeLink.children.length',
              function (mid, ami) {
                console.log(mid, ami);
                return mid === ami;
              }
            ],
            class: {
              'sub-nav-container': true,
            },
            children: {
              repeat: {
                as: 'subNav',
                data: [
                  'nav.path',
                  'router.activeRoute.path',
                  'router.activeRoute.children',
                  function (m, am, c) {
                    if (m === am) {
                      return c.filter(i => !i.hidden);
                    }

                    return null;
                  }
                ]
              },
              animations: {
                leave: {
                  withParent: true
                }
              },
              tag: 'a',
              class: {
                active: '<>subNav.active'
              },
              text: '<>subNav.title',
              href: '<>subNav.path',
              on: {
                click: function (e) {
                  e.preventDefault();
                  debugger;
                  router.navigate(this.data.subNav.path);
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
        ...router.viewport,
        inputs: {
          content: 'This is the default content',
          items: '<>data.todos'
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
console.log(router.data);
