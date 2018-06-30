/* globals Scope, PR */

const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');

Scope.data.list = ['Amsterdam', 'Paris']

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
      height: '355'
    },
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h1',
          text: 'Reactive'
        },
        {
          tag: 'p',
          text: 'GalaxyJS automatically transform data that are bound to UI into reactive data so any changes to that data at the later' +
          ' point will be reflected in the view'
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
        {
          tag: 'p',
          html: 'There are some <strong>limitations</strong> to array reactivity. Changing array in the following manners won\'t trigger' +
          ' view update:',
          children: {
            tag: 'ul',
            children: [
              {
                tag: 'li',
                html: 'Setting an item with index directly, e.g. <code class="prettyprint lang-js">Scope.data.list[index] =' +
                ' newValue</code>'
              },
              {
                tag: 'li',
                html: 'Setting array length, e.g. <code class="prettyprint lang-js">Scope.data.list.length =' +
                ' newLength</code>'
              }
            ]
          }
        },
        '<h2>ArrayChange</h2>' +
        '<h3>Galaxy.View.ArrayChange</h3>' +
        '<p>An ArrayChange object represents the changes that has been made to a reactive array, consider following:</p>' +
        '<pre class="prettyprint lang-js">' +
        'Scope.data.list = [\'Amsterdam\',\'Paris\']; \n' +
        '\n' +
        '// push will result in creation of a new ArrayChange object that will be used to update view\n' +
        'Scope.data.list.push(\'Budapest\');\n' +
        '// ["Amsterdam", "Paris", "Budapest"]' +
        '</pre>' +
        '<p>The ArrayChange instance would look like this:</p>' +
        '<pre class="prettyprint lang-js">' +
        'arrayChangeInstance.type === \'push\' // Refer to action that happened on the array\n' +
        'arrayChangeInstance.params === [\'Budapest\'];  // Arguments that has been passed to the push method\n' +
        'arrayChangeInstance.original;  // Reference to the original array' +
        '</pre>',
        '<h2>Example:</h2>' +
        '<p>Open your developer tools and see the console. </p>' +
        '<p>You should see an ArrayChange object with type <strong>reset</strong> and initial array items as params.</p>',
        {
          tag: 'ul',
          class: 'circle',
          children: {
            $for: {
              data: [
                'data.list.changes',
                function (changes) {
                  console.info('ArrayChange instance:', changes);
                  console.info('Type of change is', '`' + changes.type + '`', '\nparameters:', changes.params, '\n\n');
                  return changes;
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
            '<p>By the pressing the following button, you will see an ArrayChange instance with type <strong>push</strong> and' +
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
            '<p>By the pressing the following button, you will see an ArrayChange instance with type <strong>splice</strong> and' +
            ' <code class="prettyprint lang-js">[2, 1]</code> as params.</p>',
            {
              tag: 'button',
              text: 'Remove \'Budapest\' from the list',
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

