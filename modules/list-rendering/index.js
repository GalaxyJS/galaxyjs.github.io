const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');

const countries = ['Netherlands', 'France', 'Hungary', 'Germany', '...', '...'];
const capitals = ['Amsterdam', 'Paris', 'Budapest', 'Berlin', 'Prague', 'Vienna'];

Scope.data.countries = countries;
Scope.data.capitals = capitals;
Scope.data.pro = new Promise(function (resolve) {
  Scope.data.resolve = resolve;
});

setTimeout(() => {
  Scope.data.resolve();
  console.log('resolved');

  // for (let i = 0; i < 2000; i++) {
  //   capitals.push('city ' + i);
  // }
}, 7000);

Scope.data.pro2 = new Promise(function (resolve) {
  Scope.data.resolve2 = resolve;
});

setTimeout(() => {
  Scope.data.resolve2();
  console.log('resolved 2');

  // for (let i = 0; i < 2000; i++) {
  //   capitals.push('city ' + i);
  // }
}, 4000);

const itemAnimations = {
  // config: {
  //   leaveWithParent: true
  // },
  enter: {
    // sequence: 'card',
    addTo: 'card',
    sequence: 'ok',
    await: Scope.data.pro,
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
    withParent: true,
    sequence: 'card',
    to: {
      overflow: 'hidden',
      paddingTop: 0,
      paddingBottom: 0,
      height: 0,
      opacity: 0
    },
    position: '-=.1',
    duration: .3
  }
};

const button = {
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
  animations: {
    enter: {
      sequence: 'card',
      await: Scope.data.pro2,
      from: {
        transformOrigin: 'top center',
        scale: 1.1,
        opacity: 0,
        position: 'absolute',
        top: 0,
        x: function (val, node) {
          return node.offsetLeft;
        }
      },
      to: {
        transformOrigin: 'top center',
        top: 0,
        scale: 1,
        opacity: 1,
        position: 'absolute'
      },
      duration: .5,
    },
  },
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
        '<p>We can use the <strong>$for</strong> property to render a list of items based on an array.</p>',
        '<p><strong>$for</strong> uses the <code class="prettyprint lang-js">changes</code> property of the bound array to render the' +
        ' content.</p>',
        '<p><code class="prettyprint lang-js">changes</code> is reactive property that is being added to the arrays that by GalaxyJS' +
        ' and it\'s instance of ArrayChange. </p>',
        '<h2>Example</h2>',
        '<pre class="prettyprint lang-js">' +
        'const view = Scope.import(\'galaxy/view\');\n' +
        'Scope.data.capitals= [\'Amsterdam\', \'Paris\', \'Budapest\', \'Berlin\', \'Prague\', \'Vienna\'];\n' +
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
                  Scope.data.capitals = capitals.slice(0);
                  Scope.data.countries = countries.slice(0);
                }
              }
            },
            {
              tag: 'button',
              text: 'Resolve',
              on: {
                click: function () {
                  Scope.data.resolve();
                }
              }
            },
            button
          ]
        },
        {
          class: 'flex-row start grid',
          children: [
            {
              tag: 'ul',

              children: [
                '<h3>Capitals</h3>',
                {
                  tag: 'li',
                  animations: itemAnimations,
                  class: 'flex-row',
                  $for: {
                    data: '<>data.capitals.changes',
                    as: 'item'
                  },
                  test: '<>this.stuff',
                  text: '<>item'
                }

              ]
            },
            {
              tag: 'ul',

              children: [
                '<h3>Countries</h3>',
                {
                  tag: 'li',
                  animations: itemAnimations,
                  class: 'flex-row',
                  $for: {
                    data: '<>data.countries.changes',
                    as: 'item2'
                  },
                  text: '<>item2'
                }

              ]
            }
          ]
        }
      ]
    }
  ]
});
