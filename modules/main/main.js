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

function setTimelineSetupsToDefault() {
  Galaxy.setupTimeline('main-nav-timeline', {
    'pre-side-bar': 0,
    'side-bar': .1
  });
}

// if (window.location.pathname.indexOf('/start') === 0) {
//   Galaxy.setupTimeline('main-nav-timeline', {
//     'pre-side-bar': 0,
//     'side-bar': 0.1
//   });
// } else {
//   setTimelineSetupsToDefault();
// }
setTimelineSetupsToDefault();


router.setup([
  {
    path: '/',
    redirectTo: '/start'
  },
  {
    hidden: true,
    path: '/start',
    viewports: {
      main: 'modules/start/start.js'
    },
    title: 'Start',
    description: '',
    icon: 'fas fa-play',
    onLeave() {
      Galaxy.setupTimeline('main-nav-timeline', {
        'pre-side-bar': 0,
        'side-bar': .5
      });
    },
  },
  {
    path: '/learn',
    viewports: {
      main: 'modules/learn/learn.js'
    },
    title: 'Learn',
    icon: 'fas fa-map',
    onLeave() {
      setTimelineSetupsToDefault();
    }
  },
  {
    path: '/reactive',
    viewports: {
      main: 'modules/reactive/reactive.js'
    },
    title: 'Reactive',
    icon: 'fas fa-exchange-alt',
    onLeave() {
      setTimelineSetupsToDefault();
    }
  },
  {
    path: '/conditional-rendering',
    viewports: {
      main: 'modules/conditional-rendering/conditional-rendering.js'
    },
    title: 'Conditional Rendering',
    icon: 'fas fa-exclamation-triangle',
    onLeave() {
      setTimelineSetupsToDefault();
    }
  },
  {
    path: '/list-rendering',
    viewports: {
      main: 'modules/list-rendering/list-rendering.js'
    },
    title: 'List Rendering',
    icon: 'fas fa-list-ul',
  },
  {
    path: '/animations',
    viewports: {
      main: 'modules/animations/animations.js'
    },
    title: 'Animations',
    icon: 'fas fa-spinner',
  },
  {
    path: '/router',
    viewports: {
      main: 'modules/router/router.js'
    },
    title: 'Router',
    icon: 'fas fa-road',
  },
  {
    path: '/api',
    viewports: {
      main: 'modules/api/api.js'
    },
    title: 'API',
    icon: 'fas fa-code',
  },
  {
    path: '/todo-demo',
    viewports: {
      main: 'modules/todo/todo.js'
    },
    title: 'ToDo - Demo',
  },
  {
    path: '/vuejs-replica-demo',
    viewports: {
      main: 'modules/vuejs-replica/vuejs-replica.js'
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
      'expand': '<>data.expandNav',
    },
    animations: {
      enter: {
        timeline: 'main-nav-timeline',
        position: 'side-bar',
        duration: .5,
        to: {
          // ease: 'elastic.inOut(1, .5)',
          x: 0,
          clearProps: ''
        }
      },
      leave: {
        timeline: 'main-nav-timeline',
        position: 'side-bar',
        duration: .5,
        to: {
          x: '-100%',
          clearProps: ''
        }
      },
    },
    if: (ap = '<>router.activePath') => {
      return ap && ap !== '/start';
    },
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
        text: 'GalaxyJS',
        on: {
          click() {
            router.navigateToPath('/start');
          }
        }
      },
      {
        tag: 'div',
        repeat: {
          data: '<>router.routes',
          as: 'nav'
        },
        if: (hidden = '<>nav.hidden', activePath = '<>router.activePath') => !hidden && activePath && activePath !== '/start',
        animations: {
          enter: {
            addTo: 'main-nav-timeline',
            positionInParent: 'side-bar+=.4',
            timeline: 'nav',
            from: {
              transition: 'none',
              autoAlpha: 0,
              x: '-35%',
              ease: 'elastic.out(1, .5)',
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
                timeline: 'nav',
                from: {
                  height: 0
                },
                to: {
                  height: 'auto',
                },
                position: '-=.3',
                duration: .3,
              },
              leave: {
                withParent: true,
                timeline: 'nav',
                to: {
                  height: 0,
                },
                duration: function () {
                  return this.node.offsetHeight > 0 ? .3 : 0;
                },
                position: '-=.3'
              }
            },
            if: function (navPath = '<>nav.path', activePath = '<>router.activePath', length = '<>router.activeRoute.children.length') {
              // console.log(this.node, navPath ,activePath)
              return navPath === activePath && length;
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
    animations: {
      'add:in': {
        timeline: 'main-nav-timeline',
        position: 'side-bar',
        duration: .01,
        to: {
          marginLeft: 270,
          clearProps: ''
        }
      },
      'remove:in': {
        timeline: 'main-nav-timeline',
        position: 'side-bar',
        duration: .5,
        to: {
          marginLeft: 0,
          clearProps: ''
        }
      },
    },
    tag: 'div',
    id: 'main-content',
    class: {
      'main-content': true,
      'in': (ap = '<>router.activePath') => {
        return ap !== '/start';
      }
    },
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
  }, 'main-nav-timeline'),
]);
console.log(router);
