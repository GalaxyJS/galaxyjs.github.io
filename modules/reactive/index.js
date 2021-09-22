/* globals Scope, PR */

const view = Scope.import('galaxy/view');
const router = Scope.import('galaxy/router');
const animations = Scope.import('services/animations.js');
// const navService = Scope.import('services/navigation.js');
const exapndable = Scope.import('services/expandable.js');
const scrollToRouter = Scope.import('services/scroll-to-router.js');

const arrayInstanceExample = Scope.importAsText('./array-instance.example.text');
const inlineComputedBindExample = Scope.importAsText('./inline-computed-bind.example.js');
const arrayComputedBindExample = Scope.importAsText('./array-computed-bind.example.js');
const moduleWithInputsExample = Scope.importAsText('./module-with-inputs.example.text');
const classAndStyleExample = Scope.importAsText('./class-and-style.example.js');
const viewNodeInputsExample = Scope.importAsText('./view-node-inputs.example.js');
const valuePropertyExample = Scope.importAsText('./value-property.example.js');
Scope.data.citiesList = ['Amsterdam', 'Paris'];

router.init([
  {
    path: '/',
    redirectTo: '/fundamentals'
  },
  scrollToRouter,
  {
    title: 'Fundamentals',
    path: '/fundamentals'
  },
  {
    title: 'Computed binds',
    path: '/computed-binds'
  },
  {
    title: 'Class and Style',
    path: '/class-and-style'
  },
  {
    title: 'Inputs property',
    path: '/inputs-property'
  },
  {
    title: 'Value property',
    path: '/value-property'
  }
]);

view.init({
  class: 'card big',
  _animations: animations.cardInOut,
  children: [
    {
      tag: 'img',
      id: 'fundamentals',
      class: 'banner',
      src: 'assets/images/watch.jpg',
      height: '355',
    },
    {
      tag: 'h1',
      text: 'Reactive'
    },
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h2',
          text: 'Fundamentals'
        },
        {
          tag: 'p',
          text: 'GalaxyJS automatically transform properties that are bound to UI into reactive properties so any changes to them at the later' +
            ' point will be reflected in the view.'
        },
        {
          tag: 'p',
          text: 'The properties that can be bound to UI are:'
        },
        '<ul>' +
        '<li><code class="prettyprint lang-js">Scope.data</code> which refers to the module\'s data.</li>' +
        '<li><code class="prettyprint lang-js">this</code> which refers to the corresponding node.</li>' +
        '</ul>',
        {
          class: 'example-box',
          children: [
            {
              tag: 'input',
              value: '<>data.text'
            },
            {
              tag: 'p',
              children: [
                'Type something in the above field and see it show up here: ',
                {
                  tag: 'strong',
                  text: '<>data.text'
                }
              ]
            }
          ]
        },
        {
          tag: 'p',
          class: 'important',
          text: 'Keep in mind that the data that is not bound to view, is not reactive.'
        },
        {
          tag: 'p',
          text: 'If data that is bound to UI is type of array, then all the methods that mutate array are override by GalaxyJS so they' +
            ' also trigger view update. The methods that are being overridden are:',
          children: {
            tag: 'ul',
            children: [
              {
                tag: 'li',
                text: 'push()'
              },
              {
                tag: 'li',
                text: 'pop()'
              },
              {
                tag: 'li',
                text: 'shift()'
              },
              {
                tag: 'li',
                text: 'unshift()'
              },
              {
                tag: 'li',
                text: 'splice()'
              },
              {
                tag: 'li',
                text: 'sort()'
              },
              {
                tag: 'li',
                text: 'reverse()'
              }
            ]
          }
        },
        '<p class="important">There are some <strong>limitations</strong> to array reactivity.</p>',
        {
          tag: 'p',
          html: 'Changing array in the following manners won\'t trigger' +
            ' view update:'
        },
        {
          tag: 'ul',
          children: [
            {
              tag: 'li',
              html: '<p>- Setting an item with index directly, e.g.</p><pre class="prettyprint lang-js">Scope.data.citiesList[index] =' +
                ' newValue</pre>'
            },
            {
              tag: 'li',
              html: '<p>- Setting array length, e.g.</p><pre class="prettyprint lang-js">Scope.data.citiesList.length =' +
                ' newLength</pre>'
            }
          ]
        },
        '<h2>ArrayChange</h2>' +
        '<h4>Galaxy.View.ArrayChange</h4>' +
        '<p>An ArrayChange object represents the changes that has been made to an reactive array, consider the following code</p>' +
        '<pre class="prettyprint lang-js">' +
        'Scope.data.citiesList = [\'Amsterdam\',\'Paris\']; \n' +
        '\n' +
        '// push will result in creation of a new ArrayChange object that will be used to update view\n' +
        'Scope.data.citiesList.push(\'Budapest\');\n' +
        '// ["Amsterdam", "Paris", "Budapest"]' +
        '</pre>' +
        '<p>The ArrayChange instance would look like this</p>' +
        '<pre class="prettyprint lang-js">' + arrayInstanceExample + '</pre>',
        '<p class="example">Example</p>' +
        '<p>Open your developer tools and see the console. </p>' +
        '<p>You should see an ArrayChange object with type <strong>reset</strong> and initial array items as params.</p>',
        {
          tag: 'ul',
          class: 'circle',
          children: {
            _repeat: {
              data: ['<>data.citiesList.changes'].createComputable(function (array) {
                console.info('\n%O \nType of change is %c%s%c \nparameters: %o \n', array, 'color: orange', array.type, 'color: unset', array.params);
                return array;
              }),
              as: 'city'
            },
            tag: 'li',
            text: '<>city'
          }
        },
        {
          tag: 'section',
          children: [
            '<p>By pressing the following button, you will see an <code class="prettyprint lang-js">ArrayChange</code> instance with type <strong>push</strong> and' +
            ' <code class="prettyprint lang-js">[\'Budapest\']</code> as params.</p>',
            {
              tag: 'button',
              text: 'Add \'Budapest\' to the list',
              disabled: ['<>data.citiesList'].createComputable(function (list) {
                return list.indexOf('Budapest') !== -1;
              }),
              on: {
                click: function () {
                  Scope.data.citiesList.push('Budapest');
                }
              }
            }
          ]
        },
        {
          tag: 'section',
          children: [
            '<p>By pressing the following button, you will see an <code class="prettyprint lang-js">ArrayChange</code> instance with type <strong>splice</strong> and' +
            ' <code class="prettyprint lang-js">[2, 1]</code> as params.</p>',
            {
              tag: 'button',
              text: 'Remove \'Budapest\' from the list',
              disabled: ['<>data.citiesList'].createComputable(function (list) {
                return list.indexOf('Budapest') === -1;
              }),
              on: {
                click: function () {
                  const index = Scope.data.citiesList.indexOf('Budapest');
                  if (index !== -1) {
                    Scope.data.citiesList.splice(index, 1);
                  }
                }
              }
            }
          ]
        },

        '<h2 id="computed-binds">Computed binds</h2>',
        '<p>Sometimes you might want to manipulate a bound value before it\'s rendered. To do this you need a computed bind.</p>',
        '<p>A computed bind is basically a function that watches the properties you specify for it and gets called anytime any of those properties changes.</p>',
        {
          _module: {
            path: './inline-computed-bind.example.js'
          }
        },
        {
          tag: 'pre',
          exapndable: exapndable,
          class: 'prettyprint lang-js',
          text: inlineComputedBindExample
        },

        '<h4>Array.prototype.createComputable</h4>',
        '<p>For higher code quality we suggest that instead of using inline compute syntax, you use <code class="prettyprint lang-js">Array.prototype.createComputable</code> function. Here is an example:</p>',
        {
          _module: {
            path: './array-computed-bind.example.js'
          }
        },
        {
          tag: 'pre',
          exapndable: exapndable,
          class: 'prettyprint lang-js',
          text: arrayComputedBindExample
        },

        {
          tag: 'h2',
          id: 'class-and-style',
          text: 'Class and Style'
        },
        '<p>The <code class="prettyprint lang-js">class</code> and <code class="prettyprint lang-js">style</code> property support variety of types like string, array, object and literal object.</p>',
        {
          _module: {
            path: './class-and-style.example.js'
          }
        },
        {
          tag: 'pre',
          exapndable: exapndable,
          class: 'prettyprint lang-js',
          text: classAndStyleExample
        },

        {
          tag: 'h2',
          id: 'inputs-property',
          text: 'Inputs property'
        },
        '<p>The <code class="prettyprint lang-js">_inputs</code> property can be used to send data to a module. This property only accepts a literal object as input.</p>',
        {
          tag: 'pre',
          exapndable: exapndable,
          class: 'prettyprint lang-js',
          text: moduleWithInputsExample
        },
        '<p>You can access the _inputs properties from within the context of a module via <code class="prettyprint lang-js">Scope.inputs</code></p>',
        {
          _inputs: {
            fromParent: 'This is a message from parent module!'
          },
          _module: {
            path: './view-node-inputs.example.js'
          }
        },
        {
          tag: 'pre',
          exapndable: exapndable,
          class: 'prettyprint lang-js',
          text: viewNodeInputsExample
        },

        '<h2 id="value-property">Value property</h2>',
        '<p>sadasdsadasd</p>',
        {
          tag: 'pre',
          exapndable: exapndable,
          class: 'prettyprint lang-js',
          text: valuePropertyExample
        },
        {
          _module: {
            path: './value-property.example.js'
          }
        },
      ]
    },
    view.enterKeyframe(() => {
      router.start();
      PR.prettyPrint();
    }, 'card', .1)
  ]
});

