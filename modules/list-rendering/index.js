const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');

const simpleListExample = Scope.importAsText('./simple-list.example.js');

const countries = ['Netherlands', 'France', 'Hungary', 'Germany', 'Czech Republic', 'Austria'];
const capitals = ['Amsterdam', 'Paris', 'Budapest', 'Berlin', 'Prague', 'Vienna'];

Scope.data.countries = countries;
Scope.data.capitals = capitals;

const itemAnimations = {
  enter: {
    addTo: 'card',
    sequence: 'ok',
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
    addTo: 'card',
    sequence: 'ok',
    withParent: true,
    to: {
      overflow: 'hidden',
      paddingTop: 0,
      paddingBottom: 0,
      height: 0,
      opacity: 0
    },
    position: '-=.1',
    duration: .2
  }
};

const emptyButton = {
  tag: 'button',
  text: 'Empty',
  on: {
    click: function () {
      Scope.data.capitals = [];
      Scope.data.countries = [];
    }
  }
};

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
        '<p>We can use the <strong>repeat</strong> property to render a list of items based on an array.</p>',
        '<p><strong>repeat</strong> uses the <code class="prettyprint lang-js">changes</code> property of the bound array to render the' +
        ' content.</p>',
        '<p><code class="prettyprint lang-js">changes</code> is reactive property that is being added to arrays by GalaxyJS' +
        ' and it\'s instance of ArrayChange. </p>',
        '<p class="example">Example</p>',
        {
          tag: 'pre',
          class: 'prettyprint lang-js',
          text: simpleListExample
        },
        {
          tag: 'section',
          module: {
            id: 'simple-list-example',
            url: './simple-list.example.js'
          },
        },
        {
          tag: 'p',
          children: [
            {
              tag: 'button',
              text: 'Populate',
              on: {
                click: function () {
                  Scope.data.capitals = capitals.slice(0);
                  Scope.data.countries = countries.slice(0);
                }
              }
            },
            // {
            //   tag: 'button',
            //   text: 'Resolve',
            //   on: {
            //     click: function () {
            //       Scope.data.resolve();
            //     }
            //   }
            // },
            emptyButton
          ]
        },
        {
          class: 'flex-row start grid',
          children: [
            {
              children: [
                '<h3>Capitals</h3>',
                {
                  tag: 'ul',
                  children: [
                    {
                      tag: 'li',
                      animations: itemAnimations,
                      class: 'flex-row',
                      repeat: {
                        data: '<>data.capitals',
                        as: 'item'
                      },
                      test: '<>this.stuff',
                      text: '<>item'
                    }
                  ]
                },
              ]
            },
            {
              children: [
                '<h3>Countries</h3>',
                {
                  tag: 'ul',
                  children: [
                    {
                      tag: 'li',
                      animations: itemAnimations,
                      class: 'flex-row',
                      repeat: {
                        data: '<>data.countries',
                        as: 'item2'
                      },
                      text: '<>item2'
                    }
                  ]
                }]
            }
          ]
        }
      ]
    }
  ]
});
