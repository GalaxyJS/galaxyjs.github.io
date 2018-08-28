const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');

Scope.data.list = ['Amsterdam', 'Paris', 'Budapest', 'Berlin', 'Prague', 'Vienna'];

function trackBy(item) {
  return item.title;
}

const itemAnimations = {
  config: {
    leaveWithParent: true
  },
  enter: {
    parent: 'card',
    sequence: 'list-items',
    from: {
      opacity: 0,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0
    },
    to: {
      opacity: 1,
      paddingTop: 5,
      paddingBottom: 5,
      height: function (val, node) {
        node.style.height = 'auto';
        const h = node.offsetHeight;
        node.style.height = val + 'px';
        return h + 10;
      }
    },
    position: '-=.25',
    duration: .4
  },
  leave: {
    sequence: 'list-items',
    to: {
      overflow: 'hidden',
      paddingTop: 0,
      paddingBottom: 0,
      height: 0,
      opacity: 0
    },
    position: '-=.25',
    duration: .3
  }
};

const button = {
  tag: 'button',
  text: 'Empty',
  on: {
    click: function () {
      Scope.data.list = [];
    }
  }
};

console.log(this);

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
          text: 'List Rendering'
        },
        '<p>We can use the <strong>$for</strong> property to render a list of items based on an array</p>',
        '<p><strong>$for</strong> uses the <code class="prettyprint lang-js">changes</code> property of the bound array to render the' +
        ' content.</p>',
        '<p><code class="prettyprint lang-js">changes</code> is reactive property that is being added to the arrays that by GalaxyJS' +
        ' and it\'s instance of ArrayChange. </p>',
        '<h2>Example</h2>',
        '<pre class="prettyprint lang-js">' +
        'const view = Scope.import(\'galaxy/view\');\n' +
        'Scope.data.list = [\'Amsterdam\', \'Paris\', \'Budapest\', \'Berlin\', \'Prague\', \'Vienna\'];\n' +
        '\n' +
        'view.init({\n' +
        '  tag: \'p\'\n' +
        '  $for: {\n' +
        '    data: \'<>data.list.changes\' // We bind to list.changes property \n' +
        '    as: \'item\'\n' +
        '  },\n' +
        '  text: \'<>item\'\n' +
        '});' +
        '</pre>',
        {
          tag: 'p',
          children: [
            {
              tag: 'button',
              text: 'Populate',
              on: {
                click: function () {
                  Scope.data.list = ['Amsterdam', 'Paris', 'Budapest', 'Berlin', 'Prague', 'Vienna'];
                }
              }
            },
            button
          ]
        },
        {
          tag: 'ul',

          children: [
            {
              tag: 'li',
              animations: itemAnimations,
              class: 'flex-row',
              $for: {
                data: '<>data.list.changes',
                as: 'item'
              },
              text: '<>item'
            }

            // {
            //   tag: 'li',
            //   animations: itemAnimations,
            //   class: 'flex-row',
            //   $for: {
            //     data: '<>data.list2.changes',
            //     as: 'list2Item',
            //     trackBy: trackBy
            //   },
            //   text: '<>list2Item.title'
            // }

          ]
        }
      ]
    }
  ]
});
