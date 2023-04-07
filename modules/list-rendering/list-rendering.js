export default (Scope) => {
  const view = Scope.import('galaxy/view');
  const animations = Scope.import('services/animations.js');
  const expandable = Scope.import('services/expandable.js');
  const simpleListExample = Scope.importAsText('./simple-list.example.js');

  view.blueprint({
    tag: 'div',
    class: 'card big',
    animations: animations.cardInOut,
    children: [
      // {
      //   tag: 'img',
      //   class: 'banner',
      //   src: 'assets/images/list.jpg',
      //   height: '420',
      //   alt: 'List',
      // },

      {
        tag: 'section',
        class: 'content',
        children: [
          {
            tag: 'h1',
            text: 'List Rendering'
          },
          '<p>We can use the <strong>repeat</strong> property to render a list of items based on an array.</p>',
          '<p><strong>repeat</strong> uses the <code class="prettyprint lang-js">changes</code> property of the bound array to render the' +
          ' content.</p>',
          '<p><code class="prettyprint lang-js">changes</code> is reactive property that is being added to array by GalaxyJS' +
          ' and it\'s instance of ArrayChange. </p>',
          '<p class="example">Example</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: simpleListExample,
            expandable
          },
          {
            class: 'example-box',
            module: {
              path: './simple-list.example.js'
            },
          },
        ]
      },
      {
        tag: 'section',
        class: 'content',
        children: [
          {
            tag: 'h2',
            text: 'Tracking item\'s rendering'
          },
          {
            tag: 'p',
            text: 'Sometimes you need to refresh a list but only render the changes. In order to achieve this, you need to track the list items by a property key.'
          },
          {
            tag: 'p',
            html: 'You can do this via <code class="prettyprint lang-js">trackBy</code> property of repeat. Just specify the property key of item\'s data that you want to be tracked. Here is an example:'
          }
        ]
      },
      view.entering.addKeyframe(() => {
        PR.prettyPrint();
      }, 'main-nav-timeline')
    ]
  });
};
