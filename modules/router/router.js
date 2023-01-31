const view = Scope.import('galaxy/view');
// const router = Scope.import('galaxy/router');
const animations = Scope.import('services/animations.js');
const expandable = Scope.import('services/expandable.js');
const simpleRouterExample = Scope.importAsText('./simple-router.example.js');

// router.setup([
//   {
//     path: '/',
//     redirectTo: '/fundamentals'
//   },
//   {
//     path: '/:section',
//     hidden: true,
//     handle: (params) => {
//       if (!document.querySelector('#' + params.section)) {
//         return true;
//       }
//
//       gsap.to('#main-content', { scrollTo: { y: '#' + params.section, offsetY: 30 }, duration: .3 });
//       return true;
//     }
//   },
//   {
//     path: '/fundamentals',
//     title: 'Fundamentals'
//   },
// ]);

view.blueprint({
  class: 'card big',
  animations: animations.cardInOut,
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/junction.jpg',
      height: '420',
      alt: 'Galaxy',
    },
    {
      tag: 'h1',
      text: 'Router'
    },

    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'p',
          text: 'To use GalaxyJS native router, you need to import galaxy/router.'
        },
        {
          tag: 'p',
          class: 'example',
          text: 'Example'
        },
        {
          tag: 'pre',
          class: 'prettyprint lang-js',
          expandable: expandable,
          text: simpleRouterExample
        }
      ]
    },

    {
      tag: 'section',
      class: 'content',
      module: {
        path: './simple-router.example.js'
      }
    },

    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h2',
          text: 'onTransition'
        },
        {
          tag: 'p',
          class: 'example',
          text: 'Example'
        },
      ]
    },

    view.enterKeyframe(() => {
      PR.prettyPrint();
    }, 'main-nav-timeline')
  ]
});
