/* global Scope, PR */
const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');
const router = Scope.import('galaxy/router');
const navService = Scope.import('services/navigation.js');
const inputs = Scope.import('galaxy/inputs');


const items = [
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
];
// setTimeout(function () {
  navService.setSubNavItems(items);
// }, 500);

// inputs.handlers.subNavs = ['asdasd'];
router.init({
  '/': function () {
    // debugger;
    console.log('API Router Root');
  },
  '/:subId': function (params) {
    // debugger;
    console.log('API Router', params);
  }
});

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
        '<p>Modules are the building blocks of the application and they can be variety of things like components, services, utilities and etc.</p>' +
        '<p>Modules will provide you with a Galaxy.Scope instance which gives you the ability to import plugins and other type of' +
        ' resources.</p>',
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
        '<p>View provide functionality for creating UI elements.</p> ' +
        '<p>It is available as a plugin and can be retrieved by ' +
        '<code class="prettyprint lang-js">const view = Scope.import(\'galaxy/view\');</code></p>',
        {
          tag: 'ul',
          children: [
            '<strong>init(uiBlueprint)</strong>' +
            '<p>init method gets an UI blueprint object as argument and renders it and also take care of data bindings. For example,' +
            ' following code will create a pharagraph tag with `Hello World!` text inside it.</p>' +
            '<pre class="prettyprint lang-js">view.init({ tag: \'p\', text: \'Hello World!\' });</pre>'
          ]
        },
        {
          tag: 'h2',
          text: 'Galaxy.View.ViewNode'
        }
      ]
    }
  ]
});
