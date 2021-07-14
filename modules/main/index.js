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

const isActiveModule = [
  'nav.route',
  'data.router.activeRoute'
].compute((mod, actMod) => {
  return mod === actMod;
});

const isActiveLink = [
  'data.router.activeRoute',
  'subNav.href'
].compute((currentPath, href) => {
  console.log(currentPath, href)
  return currentPath === href;
});

router.init([
  {
    route: '/',
    redirectTo: '/start',
    hidden: true
  },
  {
    route: '/start',
    title: 'Start',
    description: '',
    icon: 'fas fa-play',
    module: {
      url: 'modules/start/index.js'
    }
  },
  {
    title: 'Guide',
    route: '/guide',
    icon: 'fas fa-map',
    module: {
      url: 'modules/guide/index.js'
    }
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

Galaxy.Router.currentPath.subscribe((path) => {
  Scope.data.currentPath = path;
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
        class: {
          'nav-item': true,
          'active': isActiveModule
        },
        repeat: {
          data: '<>data.router.routes',
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
            href: '<>nav.route',
            on: {
              click: function (e) {
                e.preventDefault();
                router.navigate(this.data.nav.route);
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
              'nav.route',
              'data.router.activeRoute',
              // 'data.router.activeLink.children.length',
              function (mid, ami) {
                return mid === ami ;
              }
            ],
            class: {
              'sub-nav-container': true,
            },
            children: {
              animations: {
                leave: {
                  withParent: true
                }
              },
              tag: 'a',
              class: {
                active: isActiveLink
              },
              repeat: {
                as: 'subNav',
                data: [
                  'nav.route',
                  'data.router.activeRoute',
                  'data.router.activeLink.children',
                  function (m, am, c) {
                    console.log(m, am,c)
                    if (m === am) {
                      return c;
                    }

                    return null;
                  }
                ]
              },
              text: '<>subNav.title',
              href: '<>subNav.route',
              on: {
                click: function (e) {
                  e.preventDefault();
                  router.navigate(this.data.subNav.href);
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
console.log(router.data)
