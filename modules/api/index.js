/* global Scope, PR */
const test = Scope.import('./style.css');
const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');
const router = Scope.import('galaxy/router');
// const navService = Scope.import('services/navigation.js');

const items = [
  {
    title: 'Scope',
    href: '/api/scope'
  },
  {
    title: 'Module',
    href: '/api/module'
  },
  {
    title: 'Observer',
    href: '/api/observer'
  },
  {
    title: 'View',
    href: '/api/view'
  },
  {
    title: 'View.ViewNode',
    href: '/api/viewnode'
  }
];
// navService.setSubNavItems(items);
Scope.data.api = {
  scope: [
    {
      title: 'systemId',
      description: 'The id of this module'
    },
    {
      title: 'parentScope',
      description: 'Reference to the parent scope'
    },
    {
      title: 'element',
      description: 'Reference to the HTML element'
    },
    {
      title: 'uri',
      description: 'Path to the module'
    },
    {
      title: 'on(event, handler)',
      description: 'Register event listener on the different stage of module lifecycle. ' +
        'Stages are <code class="prettyprint lang-js">\'module.init\'</code>' +
        ', <code class="prettyprint lang-js">\'module.start\'</code> ' +
        'and <code class="prettyprint lang-js">\'module.destroy\'</code>'
    },
    {
      title: 'observe(object)',
      description: ''
    }
  ],
  view: [
    {
      title: 'config.cleanContainer',
      description: 'If set true, the view will empty its container upon initialization. Default is set to false.'
    },
    {
      title: 'init(uiBlueprint)',
      description: 'init method gets an UI blueprint object as argument and renders it and also take care of data bindings. For example,' +
        ' following code will create a pharagraph tag with `Hello World!` text inside it.' +
        '<code class="prettyprint lang-js">view.init({ tag: \'p\', text: \'Hello World!\' });</code>'
    }
  ]
};

router.init([
  {
    path: '/',
    redirectTo: '/scope'
  },
  {
    path: '/:subId',
    handle: (params, pp) => {
      debugger;
    }
  },
  {
    path: '/scope',
    handle: () => console.log('scope has hit')
  }
]).start();

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
    test,
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/tools.jpg',
      height: '410',
    },
    {
      tag: 'h1',
      text: 'API'
    },
    {
      tag: 'section',
      class: 'content',
      children: [

        {
          tag: 'h2',
          id: 'scope',
          text: 'Scope'
        },
        {
          tag: 'ul',
          children: [
            {
              tag: 'li',
              repeat: {
                as: 'doc',
                data: '<>data.api.scope'
              },
              children: [
                {
                  tag: 'h5',
                  text: '<>doc.title'
                },
                {
                  tag: 'p',
                  html: '<>doc.description'
                }
              ]
            }
          ]
        },
        {
          tag: 'h2',
          id: 'module',
          text: 'Module'
        },
        '<p>Modules are the building blocks of the application and they can be variety of things like components, services, utilities and etc.</p>' +
        '<p>Modules will provide you with a Galaxy.Scope instance which gives you the ability to import plugins and other type of' +
        ' resources.</p>',
        {
          tag: 'h2',
          id: 'view',
          text: 'View'
        },
        '<p>View provide functionality for creating rich UI blocks. ' +
        'It is available as a plugin and can be retrieved by: <br/>' +
        '<code class="prettyprint lang-js">const view = Scope.import(\'galaxy/view\');</code></p>',
        {
          tag: 'ul',
          children: [
            {
              tag: 'li',
              repeat: {
                as: 'doc',
                data: '<>data.api.view'
              },
              children: [
                {
                  tag: 'h5',
                  text: '<>doc.title'
                },
                {
                  tag: 'p',
                  html: '<>doc.description'
                }
              ]
            }
          ]
        },
        {
          tag: 'h2',
          id: 'viewnode',
          text: 'View.ViewNode'
        }
      ]
    }
  ]
});
