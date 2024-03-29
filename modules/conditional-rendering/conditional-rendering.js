export default (Scope) => {
  const animations = Scope.import('services/animations.js');
  const view = Scope.import('galaxy/view');
  const expandable = Scope.import('services/expandable.js');

  view.blueprint({
    tag: 'div',
    class: 'card big',
    animations: animations.cardInOut,
    children: [
      {
        tag: 'section',
        class: 'content',
        children: [
          {
            tag: 'h1',
            text: 'Conditional Rendering'
          },
          {
            tag: 'p',
            html: 'With <strong>if</strong> you can specify presence of the element inside dom based on a condition.'
          },
          {
            tag: 'p',
            text: 'Keep in mind that when the condition is false the element will be detach from DOM, ' +
              'but not destroyed and upon condition true it will be reattached to DOM.'
          },
          '<p class="example">Example</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: Scope.importAsText('./single-node.example.js'),
            expandable: expandable
          },
          {
            class: 'example-box',
            module: {
              id: 'single-node-example',
              path: './single-node.example.js'
            },
          },

          {
            tag: 'h2',
            text: 'Multiple Nodes'
          },
          {
            tag: 'p',
            html: 'If multiple nodes which are direct children of the same parent and have <strong>if</strong> condition,' +
              ' then they follow default rendering order upon condition change.'
          },
          '<p class="example">Example</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: Scope.importAsText('./multiple-nodes.example.js'),
            expandable: expandable
          },
          {
            class: 'example-box',
            module: {
              id: 'multiple-nodes-example',
              path: './multiple-nodes.example.js'
            },
          },
          // -----
          '<h2>Condition on a list</h2>',
          '<p class="example">Example</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: Scope.importAsText('./list.example.js'),
            expandable: expandable
          },
          {
            class: 'example-box',
            module: {
              id: 'list-example',
              path: './list.example.js'
            },
          },
          '<h2>Rendering Bahvior</h2>' +
          '<p>The way <strong>if</strong> handles DOM manipulation is important to be understood. ' +
          'When condition is <code class="prettyprint">false</code>, then the element will be detached from DOM and upon <code class="prettyprint">true</code> ' +
          'the same element will be reattached to the DOM</p>'
        ]
      },
      view.entering.addKeyframe(() => {
        PR.prettyPrint();
      }, 'main-nav-timeline')
    ],
  });
};
