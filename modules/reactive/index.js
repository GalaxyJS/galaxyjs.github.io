/* globals Scope, PR */

const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');

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
                html: 'Setting an item with index directly, e.g. <pre class="prettyprint inline lang-js">Scope.data.list[index] =' +
                ' newValue</pre>'
              },
              {
                tag: 'li',
                html: 'Setting array length, e.g. <pre class="prettyprint inline lang-js">Scope.data.list.length =' +
                ' newLength</pre>'
              }
            ]
          }
        },
        {
          tag: 'h2',
          text: 'ArrayChange'
        },
        {
          tag: 'h3',
          text: 'Galaxy.View.ArrayChange'
        },
        {
          tag: 'p',

        },

      ]
    }
  ]
});

