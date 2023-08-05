import { expandable } from '/services/expandable.js';
import { animations } from '/services/animations.js';
export default (Scope) => {
  const view = Scope.useView();
  const simpleRouterExample = Scope.importAsText('./simple-router.example.js');

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

      view.entering.addKeyframe(() => {
        PR.prettyPrint();
      }, 'main-nav-timeline')
    ]
  });
};
