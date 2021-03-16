/* globals Scope, Promise, PR */
const view = Scope.import('galaxy/view');
// const router = Scope.import('galaxy/router');
const animations = Scope.import('services/animations.js');
const navService = Scope.import('services/navigation.js');
const effects = Scope.import('services/effects.js');

Scope.surfaces = [];
Scope.progressText = 'Ready to make request';
Scope.flag = true;

const items = [
  {
    title: 'Installation',
    href: 'guide/installation'
  },
  {
    title: 'Bootstrap',
    href: 'guide/bootstrap'
  },
  {
    title: 'The Progressive Way',
    href: 'guide/the-progressive-way'
  }
];

navService.setSubNavItems(items);

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
      src: 'assets/images/guide.jpg',
      height: '410',
    },
    '<h1>Guide Page</h1>',
    {
      class: 'content',
      tag: 'section',
      children: [
        '<h2 id="/guide/installation">Installation</h2>' +
        '<p>Simply copy & paste the following into your page\'s head</p>',
        {
          tag: 'pre',
          class: 'prettyprint lang-html',
          text: '<script src="https://cdn.jsdelivr.net/gh/GalaxyJS/galaxyjs.github.io/galaxyjs/galaxy.js"></script>'
        },
        '<h2>Recommended project file & folder structure</h2>' +
        '<p>You can have whatever directory structure you like as long as you know how to the load modules. The following structure is' +
        ' recommended and we are using this structure though out our guide.</p>',
        {
          tag: 'pre',
          class: 'prettyprint lang-js',
          text: 'project\n' +
            '|-app  \n' +
            '| |-assets\n' +
            '| |-modules\n' +
            '| | |-main\n' +
            '| | | |-index.js\n' +
            '| | \n' +
            '| |-services \n' +
            '| |-index.html\n' +
            '|\n' +
            '|-node_modules\n' +
            '|-package.json'
        },
        '<p>Too lazy to do it yourself!?, Here... clone the following repository ;)</p>',
        {
          tag: 'pre',
          class: 'prettyprint lang-html',
          text: '-- GALAXYJS BOILERPLATE PROJECT URL --'
        },
        '<h2 id="/guide/bootstrap">Bootstrap</h2>' +
        '<p>Add this code into the app/index.html</p>',
        {
          tag: 'pre',
          class: 'prettyprint lang-html',
          text: '<!DOCTYPE html>\n' +
            '<html>\n' +
            '  <head>\n' +
            '    <title>Learning GalaxyJS</title>\n' +
            '    <meta charset="UTF-8">\n' +
            '\n' +
            '    <script src="path/to/galaxy-min.js"></script>\n' +
            '\n' +
            '    <script>\n' +
            '      (function () {\n' +
            '          // This will ensure that you boot Galaxy when everything is loaded\n' +
            '          // If you are using JQuery, you can also use $(document).ready(run);\n' +
            '          window.addEventListener(\'load\', run);\n' +
            '\n' +
            '          function run() {\n' +
            '              Galaxy.boot({\n' +
            '                  // The path to your main module file\n' +
            '                  url: \'modules/main/index.js\',\n' +
            '                  // The container element for your app\n' +
            '                  element: document.querySelector(\'body\')\n' +
            '              }).then(function (module) {\n' +
            '                  module.start();\n' +
            '              });\n' +
            '          }\n' +
            '      })();\n' +
            '    </script>\n' +
            '  </head>\n' +
            '\n' +
            '  <body>\n' +
            '    Loading...\n' +
            '  </body>\n' +
            '</html>'
        },
        '<h2>Main module</h2>' +
        '<p>Add this code into the app/modules/index.js</p>',
        {
          tag: 'pre',
          class: 'prettyprint lang-js',
          text: '//Import the view addon\n' +
            'const view = Scope.import(\'galaxy/view\');\n\n' +
            '// This will remove all the contents of the parent element which in this case is body\n' +
            'view.config.cleanContainer = true;\n' +
            'view.init({\n' +
            '  tag: \'h1\',\n' +
            '  text: \'Hello World!\'\n' +
            '})'
        },
        {
          tag: 'p',
          text: 'TADAAA! you have created your first app with GalaxyJS!'
        },
        {
          tag: 'h2',
          html: 'Now, lets see what is going on here!'
        },
        '<pre class="prettyprint inline lang-js">Scope.import(\'galaxy/view\')</pre>' +
        '<p>is loading the view addon which provides functionality necessary to create the UI/UX' +
        ' of your module and/or component.</p>',
        '<pre class="prettyprint inline lang-js">view.config.cleanContainer = true</pre> ' +
        '<p>Above code tells the view addon to start by cleaning the its parent and then render its content. In this case, this code will' +
        ' remove the \'Loading...\' from the body.</p>',
        {
          tag: 'p',
          html: 'Then we initialize our view with a <strong>h1</strong> tag and <strong>\'Hello World!\'</strong> as its text content.'
        },
        '<pre class="prettyprint inline lang-js">view.init({\n' +
        '  tag: \'h1\',\n' +
        '  text: \'Hello World!\'\n' +
        '});</pre>',
        '<h2 id="/guide/the-progressive-way">The Progressive Way</h2>' +
        '<p>Sometimes you already have a page and you just want to add some reactive functionality to some elements. You can easily do this by transforming your target element into a Galaxy module:</p>',
        {
          tag: 'pre',
          class: 'prettyprint lang-js',
          text: 'const module = {\n' +
            '        // Addons that you need for your module\n' +
            '        imports: [\'galaxy/view\'],\n' +
            '        // The element which is going to be the module\n' +
            '        element: document.querySelector(\'#target\'),\n' +
            '        constructor: function (Scope) {\n' +
            '           const view = Scope.import(\'galaxy/view\');\n' +
            '           view.config.cleanContainer = true;\n' +
            '           view.init({\n' +
            '             tag: \'h2\',\n' +
            '             text: \'Hello World from GalaxyJS!\'\n' +
            '           });\n' +
            '        }\n' +
            '      };\n' +
            '\n' +
            '// load module\n' +
            'Galaxy.load(module);'
        },
        '<h2>List Rendering</h2>',
        '<p style="font-size: .87em">To learn more go to <a href="#/list-rendering">List Rendering</a></p>',
        '<p>GalaxyJS provide <strong>repeat</strong> directive for list rendering. <strong>repeat</strong> reacts to <code class="prettyprint' +
        ' lang-js">array.change</code> property which is provided automatically by GalaxyJS on array values that are bound to view.</p>',
        {
          tag: 'pre',
          class: 'prettyprint lang-js',
          text: 'const module = {\n' +
            '      // Addons that you need for your module\n' +
            '      imports: [\'galaxy/view\'],\n' +
            '      // The element which is going to be the module\n' +
            '      element: document.querySelector(\'#target\'),\n' +
            '      constructor: function (Scope) {\n' +
            '         const view = Scope.import(\'galaxy/view\');\n' +
            '\n' +
            '         Scope.data.list = [\n' +
            '           {\n' +
            '              title: \'Item 1\'\n' +
            '           },\n' +
            '           {\n' +
            '              title: \'Item 2\'\n' +
            '           },\n' +
            '           {\n' +
            '              title: \'Item 3\'\n' +
            '           },\n' +
            '         ];\n' +
            '\n' +
            '         view.config.cleanContainer = true;\n' +
            '         view.init({\n' +
            '           tag: \'ul\',\n' +
            '           children: {\n' +
            '             repeat: {\n' +
            '                // Bind to data.list property\n' +
            '                data: \'<>data.list\',\n' +
            '                // An alias for each list item\n' +
            '                as: \'item\'\n' +
            '             },\n' +
            '             tag: \'li\',\n' +
            '             text: \'<>item.title\'\n' +
            '           }\n' +
            '         });\n' +
            '      }\n' +
            '    };\n' +
            '\n' +
            '// load module\n' +
            'Galaxy.load(module);'
        }
      ]
    }
  ]
});


