/* global Scope, PR */
const style = Scope.import('./style.css');
const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');
const router = Scope.import('galaxy/router');

Scope.data.api = {
  scope: [
    {
      title: 'data',
      description: 'The host object for all the properties that are bound to view.'
    },
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
      description: 'Path to the host module'
    },
    {
      title: 'import(path)',
      description: 'Import module from the specified path.'
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
    },
    {
      title: 'enterKeyframe(onComplete, sequence, duration)',
      description: 'Create a enter keyframe node which invokes onComplete with respect to active animations.'
    },
    {
      title: 'leaveKeyframe(onComplete, sequence, duration)',
      description: 'Create a leave keyframe node which invokes onComplete with respect to active animations.'
    }
  ],
  viewNode: [
    {
      title: 'createNode()',
      description: 'If set true, the view will empty its container upon initialization. Default is set to false.'
    },
  ]
};

router.init([
  {
    path: '/',
    redirectTo: '/scope'
  },
  {
    path: '/:section',
    hidden: true,
    handle: (params, pp) => {
      if (!document.querySelector('#' + params.section)) {
        return true;
      }

      gsap.to('#main-content', {scrollTo: {y: '#' + params.section, offsetY: 30}, duration: .3});
      return true;
    }
  },
  {
    path: '/scope',
    title: 'Scope'
  },
  {
    path: '/module',
    title: 'Module'
  },
  {
    path: '/view',
    title: 'View'
  },
  {
    path: '/viewnode',
    title: 'ViewNode'
  },
]);

view.init({
  tag: 'div',
  class: 'card big',
  animations: animations.cardInOut,
  children: [
    style,
    {
      tag: 'img',
      id: 'scope',
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
        'It is available as a addon and can be retrieved by: <br/>' +
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
          text: 'ViewNode'
        },
        {
          tag: 'h4',
          text: 'Galaxy.view.ViewNode'
        }
      ]
    },
    view.enterKeyframe(() => {
      PR.prettyPrint();
      router.start();
    }, 'card')
  ]
});
