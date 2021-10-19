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

router.setup([
  {
    path: '/',
    redirectTo: '/start'
  },
  {
    path: '/start',
    viewports: {
      main: 'modules/start/index.js'
    },
    title: 'Start',
    description: '',
    icon: 'fas fa-play',
  },
  {
    path: '/learn',
    viewports: {
      main: 'modules/learn/index.js'
    },
    title: 'Learn',
    icon: 'fas fa-map',
  },
  {
    path: '/reactive',
    viewports: {
      main: 'modules/reactive/index.js'
    },
    title: 'Reactive',
    icon: 'fas fa-exchange-alt',
  },
  {
    path: '/conditional-rendering',
    viewports: {
      main: 'modules/conditional-rendering/index.js'
    },
    title: 'Conditional Rendering',
    icon: 'fas fa-exclamation-triangle',
  },
  {
    path: '/list-rendering',
    viewports: {
      main: 'modules/list-rendering/index.js'
    },
    title: 'List Rendering',
    icon: 'fas fa-list-ul',
  },
  {
    path: '/animations',
    viewports: {
      main: 'modules/animations/index.js'
    },
    title: 'Animations',
    icon: 'fas fa-spinner',
  },
  {
    path: '/api',
    viewports: {
      main: 'modules/api/index.js'
    },
    title: 'API',
    icon: 'fas fa-code',
  },
  {
    path: '/todo-demo',
    viewports: {
      main: 'modules/todo/index.js'
    },
    title: 'ToDo - Demo',
  },
  {
    path: '/vuejs-replica-demo',
    viewports: {
      main: 'modules/vuejs-replica/index.js'
    },
    title: 'VueJS Replica - Demo',
  }
]);

router.notFound(function () {
  console.error('404, Not Found!');
});

view.container.node.innerHTML = '';
view.blueprint([
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
        if: (hidden = '<>nav.hidden') => !hidden,
        animations: {
          enter: {
            addTo: 'card',
            timeline: 'main-nav-items',
            from: {
              transition: 'none',
              autoAlpha: 0,
              x: '-25%',
              ease: 'elastic.out(1.15, .5)',
              clearProps: 'all'
            },
            position: '-=.56',
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
                html: (data, title = '<>nav.title') => {
                  return title ? title.replaceAll('- Demo', '<strong>DEMO</strong>') : '';
                }
              }
            ]
          },
          {
            animations: {
              enter: {
                withParent: true,
                timeline: 'card',
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
                timeline: 'card',
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
            if: function (navPath = '<>nav.path', activeRoutePath = '<>router.activeRoute.path', length = '<>router.activeRoute.children.length') {
              // console.log(navPath, activeRoutePath, length)
              return navPath === activeRoutePath && length;
            },
            class: 'sub-nav-container',
            children: {
              repeat: {
                as: 'subNav',
                data: function (navPath = '<>nav.path', activeRoutePath = '<>router.activeRoute.path', childRoutes = '<>router.activeRoute.children') {
                  if (navPath === activeRoutePath) {
                    return childRoutes.filter(i => !i.hidden);
                  }

                  return null;
                },
                trackBy: 'path'
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
        ...router.viewports.main,
        data: {
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
  view.enterKeyframe(() => {
    router.start();
  }, 'card'),
]);
console.log(router);
