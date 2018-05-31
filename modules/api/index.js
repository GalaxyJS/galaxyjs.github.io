/* global Scope */
const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');
const router = Scope.import('galaxy/router');
const navService = Scope.import('services/navigation.js');

navService.setSubNavItems([
  {
    title: 'Galaxy.Scope'
  },
  {
    title: 'Galaxy.Module'
  },
  {
    title: 'Galaxy.Sequence'
  },
  {
    title: 'Galaxy.Observer'
  },
  {
    title: 'Galaxy.View'
  },
  {
    title: 'Galaxy.View.ViewNode'
  }
]);

router.init({
  '/': function () {
    console.log('API Router');
  },
  '/:subId': function (params) {
    console.log('API Router', params);
  }
});

view.init({
  tag: 'div',
  class: 'card big',
  animations: animations.cardInOut,
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/tools.jpg',
      height: '410'
    },
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h1',
          text: 'API'
        },
        {
          tag: 'h2',
          text: 'Galaxy.Scope'
        },
        {
          tag: 'ul',
          children: [
            {
              tag: 'li',
              html: '<strong>systemId</strong> The id of this module'
            },
            {
              tag: 'li',
              html: '<strong>parentScope</strong> Reference to the parent scope'
            },
            {
              tag: 'li',
              html: '<strong>element</strong> Reference to the HTML element'
            },
            {
              tag: 'li',
              children: [
                {
                  tag: 'strong',
                  text: 'on(event, handler)'
                },
                {
                  tag: 'p',
                  html: 'Register event listener on the different stage of module lifecycle. ' +
                  'Stages are <code class="prettyprint lang-js">\'module.init\'</code>' +
                  ', <code class="prettyprint lang-js">\'module.start\'</code> ' +
                  'and <code class="prettyprint lang-js">\'module.destroy\'</code>'
                }
              ]
            },
            {
              tag: 'li',
              html: '<strong>observe(object)</strong> ...'
            }
          ]
        },
        {
          tag: 'h2',
          text: 'Galaxy.Module'
        },
        {
          tag: 'h2',
          text: 'Galaxy.Sequence'
        },
        {
          tag: 'h2',
          text: 'Galaxy.Observer'
        },
        {
          tag: 'h2',
          text: 'Galaxy.View'
        },
        {
          tag: 'h2',
          text: 'Galaxy.View.ViewNode'
        }
      ]
    }
  ]
});
