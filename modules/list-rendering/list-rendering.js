const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');
const expandable = Scope.import('services/expandable.js');

const simpleListExample = Scope.importAsText('./simple-list.example.js');

view.blueprint({
  tag: 'div',
  class: 'card big',
  animations: animations.cardInOut,
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/list.jpg',
      height: '420',
      alt: 'List',
    },
    {
      tag: 'h1',
      text: 'List Rendering'
    },
    {
      tag: 'section',
      class: 'content',
      children: [
        '<p>We can use the <strong>repeat</strong> property to render a list of items based on an array.</p>',
        '<p><strong>repeat</strong> uses the <code class="prettyprint lang-js">changes</code> property of the bound array to render the' +
        ' content.</p>',
        '<p><code class="prettyprint lang-js">changes</code> is reactive property that is being added to arrays by GalaxyJS' +
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
    view.enterKeyframe(() => {
      PR.prettyPrint();
    })
  ]
});
