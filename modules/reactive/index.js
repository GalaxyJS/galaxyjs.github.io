/* globals Scope, PR */

const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');
const effects = Scope.import('services/effects.js');

const arrayInstanceExample = Scope.importAsText('./array-instance.example.text');
Scope.data.list = ['Amsterdam', 'Paris'];

view.init({
  class: 'card big',
  animations: animations.cardInOut,
  lifecycle: {
    postChildrenInsert: function () {
      PR.prettyPrint();
    }
  },
  children: [
    {
      tag: 'img',
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
          tag: 'p',
          text: 'GalaxyJS automatically transform properties that are bound to UI into reactive properties so any changes to them at the later' +
            ' point will be reflected in the view.'
        },
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
          html: '<strong>Keep in mind that the data that is not bound to view, is not reactive.</strong>'
        },
        {
          tag: 'p',
          text: 'If data that is bound to UI is type of array, then all the methods that mutate array are override by GalaxyJS so they' +
            ' also trigger view update. The methods that are being overridden are:',
          children: {
            tag: 'ul',
            class: 'circle',
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
              html: '<p>- Setting an item with index directly, e.g.</p><pre class="prettyprint lang-js">Scope.data.list[index] =' +
                ' newValue</pre>'
            },
            {
              tag: 'li',
              html: '<p>- Setting array length, e.g.</p><pre class="prettyprint lang-js">Scope.data.list.length =' +
                ' newLength</pre>'
            }
          ]
        },
        '<h2>ArrayChange</h2>' +
        '<h3>Galaxy.View.ArrayChange</h3>' +
        '<p>An ArrayChange object represents the changes that has been made to an reactive array, consider the following code</p>' +
        '<pre class="prettyprint lang-js">' +
        'Scope.data.list = [\'Amsterdam\',\'Paris\']; \n' +
        '\n' +
        '// push will result in creation of a new ArrayChange object that will be used to update view\n' +
        'Scope.data.list.push(\'Budapest\');\n' +
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
            repeat: {
              data: [
                'data.list.changes',
                function (array) {
                  console.info('\n%O \nType of change is %c%s%c \nparameters: %o \n', array, 'color: orange', array.type, 'color: unset', array.params);
                  return array;
                }
              ],
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
              disabled: [
                'data.list',
                function (list) {
                  return list.indexOf('Budapest') !== -1;
                }
              ],
              on: {
                click: function () {
                  Scope.data.list.push('Budapest');
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
              disabled: [
                'data.list',
                function (list) {
                  return list.indexOf('Budapest') === -1;
                }
              ],
              on: {
                click: function () {
                  const index = Scope.data.list.indexOf('Budapest');
                  if (index !== -1) {
                    Scope.data.list.splice(index, 1);
                  }
                }
              }
            }
          ]
        }
      ]
    }
  ]
});

