export default (Scope) => {
  const view = Scope.useView();
  const router = Scope.useRouter();

  router.setup([
    {
      path: '/',
      redirectTo: '/first'
    },

    {
      path: '/first',
      title: 'First',
      viewports: {
        main: './first.js',
        secondary: './first-secondary.js'
      }
    },

    {
      path: '/second',
      title: 'Second',
      viewports: {
        main: './second.js',
      }
    },

    {
      path: '/third',
      title: 'Third',
      viewports: {
        main: './third.js',
        secondary: './first.js'
      }
    },
  ]);

  view.components({
    'file-icon': Scope.import('./file-icon.component.js')
  });

  view.blueprint([
    {
      class: 'flex-bar jc-center',
      children: [
        {
          tag: 'button',
          repeat: {
            data: function (routes = '<>router.routes') {
              if (this.cache.routes === routes)
                return;

              this.cache.routes = routes;
              return routes.filter(r => !r.hidden);
            },
            as: 'nav'
          },
          class: {
            active: function (data, path = '<>router.activePath') {
              return path === data.nav.path;
            }
          },
          text: '<>nav.title',
          onclick() {
            router.navigateToRoute(this.data.nav);
          }
        }
      ]
    },
    {
      class: 'dual-box',
      children: [
        {
          class: 'content',
          children: [
            {
              tag: 'h3',
              text: 'Main Viewport'
            },
            {
              ...router.viewports.main,
            }
          ]
        },
        {
          class: 'content',
          children: [
            {
              tag: 'h3',
              text: 'Secondary Viewport'
            },
            {
              ...router.viewports.secondary,
            }
          ]
        }
      ]
    },
    () => {
      router.start();
    }
  ]);
};
