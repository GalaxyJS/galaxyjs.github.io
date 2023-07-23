import Navigation from '/services/navigation.js';
export default (Scope) => {
  /** @type Galaxy.View */
  const view = Scope.useView();
  const router = Scope.useRouter();

  Scope.data.navService = Navigation;
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

  router.setTitle('GalaxyJS');
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
      pageTitle: 'GalaxyJS - Build Visually Rich Web Apps',
      description: '',
      icon: 'fas fa-play',
    },
    {
      path: '/learn',
      viewports: {
        main: 'modules/learn/learn.js'
      },
      title: 'Learn',
      pageTitle: 'Learn',
      icon: 'fas fa-map',
    },
    {
      path: '/reactivity',
      viewports: {
        main: 'modules/reactivity/reactivity.js'
      },
      title: 'Reactivity',
      pageTitle: 'Reactivity',
      icon: 'fas fa-exchange-alt',
    },
    {
      path: '/conditional-rendering',
      viewports: {
        main: 'modules/conditional-rendering/conditional-rendering.js'
      },
      title: 'Conditional Rendering',
      icon: 'fas fa-exclamation-triangle',
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
  ]).onTransition((from, to) => {
    if (window.innerWidth < 768) {
      // Scope.data.expandNav = false;
    }

    switch (from) {
      case '/start':
        Galaxy.setupTimeline('main-timeline', {
          'pre-side-bar': 0,
          'side-bar': .5,
        });
        break;
      case null:
      default:
        Galaxy.setupTimeline('main-timeline', {
          'pre-side-bar': 0,
          'side-bar': .1,
        });
    }

    if (from && to === '/start') {
      Galaxy.setupTimeline('main-timeline', {
        'pre-side-bar': 0,
        'side-bar': .5,
      });
    }
  }).onInvoke((path, viewport) => {
    // console.info('invoke: ' + path + '\nviewport: ' + viewport);
  }).onLoad((path, viewport) => {
    // console.info('load: ' + path + '\nviewport: ' + viewport);
  });

  router.notFound(function () {
    console.error('404, Not Found!');
  });

  view.container.node.innerHTML = '';
  view.blueprint([
    {
      tag: 'button',
      class: 'btn-main-menu',
      html: '<i class="fa fa-bars"></i>',
      if: (ap = '<>router.activePath') => {
        return ap && ap !== '/start';
      },
      on: {
        click(vn) {
          if (window.innerWidth < 768) {
            Scope.data.expandNav = !Scope.data.expandNav;
          }
        }
      },
    },
    view.entering.startKeyframe('main-timeline', '+=1'),
    {
      tag: 'div',
      id: 'main-nav',
      class: {
        'main-nav': true,
        'expand': '<>data.expandNav',
      },
      animations: {
        enter: {
          timeline: 'main-timeline',
          from: {
            x: '-100%',
          },
          to: {
            x: () => {
              if (window.innerWidth <= 768) {
                return '-100%';
              }
              return 0;
            },
            duration: .5,
          }
        },
        leave: {
          timeline: 'main-timeline',
          position: '-=.5',
          to: {
            x: '-100%',
            duration: .5,
          }
        },
        // 'add:expand': {
        //   timeline: 'main-timeline',
        //   from: {
        //     x: '-100%',
        //   },
        //   to: {
        //     x: 0,
        //     boxShadow: '0 15px 25px rgba(40, 40, 40, .35)',
        //     duration: 1.3
        //   },
        // },
        // 'remove:expand': {
        //   to: {
        //     x: () => {
        //       if (window.innerWidth <= 768) {
        //         return '-100%';
        //       }
        //       return 0;
        //     },
        //     boxShadow: '0 0 0 rgba(40, 40, 40, .35)',
        //     duration: .2
        //   },
        // }
      },
      if: (ap = '<>router.activePath') => {
        return ap && ap !== '/start';
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
        view.entering.startKeyframe('main-timeline'),
        {
          tag: 'div',
          repeat: {
            data: '<>router.navs',
            as: 'nav'
          },
          // if: (activePath = '<>router.activePath') => activePath && activePath !== '/start',
          animations: {
            enter: {
              timeline: 'main-timeline',
              position: '-=.56',
              from: {
                transition: 'none',
                autoAlpha: 0,
                x: '-35%',
              },
              to: {
                autoAlpha: 1,
                x: 0,
                ease: 'elastic.out(1, .5)',
                // clearProps: 'all',
                duration: .6
              }
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
                  position: '-=.35',
                  from: {
                    height: 0
                  },
                  to: {
                    height: 'auto',
                    duration: .35,
                  },
                },
                leave: {
                  withParent: true,
                  timeline: 'nav',
                  position: '-=.35',
                  to: {
                    height: 0,
                    duration: function (v, node) {
                      return node.offsetHeight > 0 ? .35 : 0;
                    },
                  },
                }
              },
              if: function (navPath = '<>nav.path', activePath = '<>router.activePath', length = '<>router.activeRoute.children.length') {
                return navPath === activePath && length;
              },
              class: 'sub-nav-container',
              children: {
                repeat: {
                  as: 'subNav',
                  data: function (navPath = '<>nav.path', activeRoutePath = '<>router.activePath', childRoutes = '<>router.activeRoute.children') {
                    if (navPath === activeRoutePath) {
                      // console.info(this.parent.node, navPath, activeRoutePath, childRoutes)
                      return childRoutes.filter(i => !i.hidden);
                    }

                    return undefined;
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
                href: '<>subNav.fullPath',
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
          timeline: 'main-timeline',
          position: '-=.5',
          to: {
            marginLeft: () => {
              if (window.innerWidth <= 768) {
                return 0;
              }
              return window.innerWidth <= 1024 ? 220 : 270;
            },
            clearProps: 'none',
            duration: .01,
          }
        },
        'remove:in': {
          timeline: 'main-timeline',
          position: '-=.5',
          to: {
            duration: .5,
            onComplete: function(sd) {
              this.node.style.paddingLeft = 0;
            }
          }
        },
      },
      tag: 'div',
      id: 'main-content',
      class: {
        'main-content': true,
        'in': (ap = '<>router.activePath') => {
          return ap !== '/start';
        },
      },
      on: {
        click: () => {
          Scope.data.expandNav = false;
        }
      },
      children: [
        // view.entering.startKeyframe('main-timeline', '+=2'),
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
  ]);

  router.start();
};

