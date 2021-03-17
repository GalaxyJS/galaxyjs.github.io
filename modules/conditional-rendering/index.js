const animations = Scope.import('services/animations.js');
const view = Scope.import('galaxy/view');
const exapndable = Scope.import('services/expandable.js');

const singleNodeExample = Scope.importAsText('./single-node.example.js');
const multipleNodesExample = Scope.importAsText('./multiple-nodes.example.js');
const listExample = Scope.importAsText('./list.example.js');

view.init({
  tag: 'div',
  class: 'card big',
  animations: animations.cardInOut,
  lifecycle: {
    postChildrenInsert: function () {
      PR.prettyPrint();
    }
  },
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
          html: 'With <strong>$if</strong> you can specify presence of the element inside dom based on a condition.'
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
          html: singleNodeExample,
          expandable: exapndable
        },
        // '<pre class="prettyprint lang-js">' + singleNodeExample + '</pre>',
        {
          tag: 'section',
          module: {
            id: 'single-node-example',
            url: './single-node.example.js'
          },
        },

        {
          tag: 'h2',
          text: 'Multiple Nodes'
        },
        {
          tag: 'p',
          html: 'If multiple nodes which are direct children of the same parent and have <strong>$if</strong> condition,' +
            ' then they follow default rendering order upon condition change.'
        },
        '<p class="example">Example</p>',
        {
          tag: 'pre',
          class: 'prettyprint lang-js',
          html: multipleNodesExample,
          expandable: exapndable
        },
        // '<pre class="prettyprint lang-js">' + multipleNodesExample + '</pre>',
        {
          tag: 'section',
          module: {
            id: 'multiple-nodes-example',
            url: './multiple-nodes.example.js'
          },
        },

        '<h2>Condition on a list</h2>',
        '<p class="example">Example</p>',
        {
          tag: 'pre',
          class: 'prettyprint lang-js',
          html: listExample,
          expandable: exapndable
        },
        {
          tag: 'section',
          module: {
            id: 'list-example',
            url: './list.example.js'
          },
        },
        '<h2>Rendering Strategy</h2>' +
        '<p>The way <strong>$if</strong> handles DOM manipulation is important to be understood. ' +
        'When condition is false, then the element will be detached from DOM and upon true ' +
        'the same element will be reattached to the DOM</p>'
      ]
    }
  ]
});
