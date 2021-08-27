/* global Scope */

/** @type Galaxy.View */
const view = Scope.import('galaxy/view');
const router = Scope.import('galaxy/router');
const animations = Scope.import('services/animations.js');
const navService = Scope.import('services/navigation.js');

Scope.data.navService = navService;
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
  // {
  //   path: '/conditional-rendering',
  //   module: {
  //     path: 'modules/conditional-rendering/index.js'
  //   },
  //   title: 'Conditional Rendering',
  //   icon: 'fas fa-exclamation-triangle',
  // },
  // {
  //   path: '/list-rendering',
  //   module: {
  //     path: 'modules/list-rendering/index.js'
  //   },
  //   title: 'List Rendering',
  //   icon: 'fas fa-list-ul',
  // },
  {
    path: '/animations',
    module: {
      path: 'modules/animations/index.js'
    },
    title: 'Animations',
    icon: 'fas fa-spinner',
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
  //   path: '/todo-demo',
  //   module: {
  //     path: 'modules/todo/index.js'
  //   },
  //   title: 'ToDo - Demo',
  // },
  // {
  //   path: '/vuejs-replica-demo',
  //   module: {
  //     path: 'modules/vuejs-replica/index.js'
  //   },
  //   title: 'VueJS Replica - Demo',
  // }
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
]);

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
            addTo: 'card',
            sequence: 'main-nav-items',
            from: {
              transition: 'none',
              autoAlpha: 0,
              x: '-25%',
              ease: 'elastic.easeOut.config(1, .5)',
              clearProps: 'all'
            },
            position: '-=.58',
            duration: .6
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
                withParent: true,
                sequence: 'card',
                from: {
                  height: 0
                },
                to: {
                  height: 'auto',
                  // delay: .01
                },
                position: '-=.3',
                duration: .3,
              },
              leave: {
                sequence: 'card',
                to: {
                  height: 0,
                  // delay: .01
                },
                duration: function () {
                  return this.node.offsetHeight > 0 ? .3 : 0;
                },
                position: '-=.3'
              }
            },
            $if: [
              '<>nav.path',
              '<>router.activeRoute.path',
              '<>router.activeRoute.children.length',
              function (navPath, activeRoutePath, length) {
                return navPath === activeRoutePath && length;
              }
            ],
            class: 'sub-nav-container',
            children: {
              repeat: {
                as: 'subNav',
                data: [
                  '<>nav.path',
                  '<>router.activeRoute.path',
                  '<>router.activeRoute.children',
                  function (navPath, activeRoutePath, childRoutes) {
                    if (navPath === activeRoutePath) {
                      return childRoutes.filter(i => !i.hidden);
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
              href: '#',
              on: {
                click: function (e) {
                  e.preventDefault();
                  router.navigateToRoute(this.data.subNav);
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
  },
  view.keyframe.enter(() => {
    router.start();
  }, 'card')
]);
console.log(router);
