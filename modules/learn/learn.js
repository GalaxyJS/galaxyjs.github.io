const view = Scope.import('galaxy/view');
const router = Scope.import('galaxy/router');
const animations = Scope.import('services/animations.js');
const expandable = Scope.import('services/expandable.js');

router.setup([
  {
    path: '/',
    redirectTo: '/installation'
  },
  {
    path: '/:section',
    hidden: true,
    handle: (params) => {
      if (!document.querySelector('#' + params.section)) {
        return true;
      }

      gsap.to('#main-content', { scrollTo: { y: '#' + params.section, offsetY: 30 }, duration: .3 });
      return true;
    }
  },
  {
    path: '/installation',
    title: 'Installation'
  },
  {
    path: '/getting-started',
    title: 'Getting Started'
  },
  {
    path: '/ui-creation',
    title: 'UI Creation'
  }
]);

view.components({
  'simple-component': Scope.import('./simple-component.example.js')
});

view.blueprint([
  {
    class: 'card big',
    animations: animations.cardInOut,
    children: [
      {
        tag: 'img',
        id: 'installation',
        class: 'banner',
        src: 'assets/images/learn.jpg',
        height: '410',
      },
      '<h1>Learn</h1>',
      {
        class: 'content',
        tag: 'section',
        children: [
          '<h2>Installation</h2>' +
          '<p>Simply copy & paste the following into your page\'s head.</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-html',
            text: '<script src="https://cdn.jsdelivr.net/gh/GalaxyJS/galaxyjs.github.io/galaxyjs/galaxy.js">\n</script>'
          },
          '<h3>Recommended project file & folder structure</h3>' +
          '<p>You can have whatever directory structure you like as long as you know how to the load modules. The following structure is' +
          ' recommended and we are using this structure though out our learn.</p>',
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
              '|-nodemodules\n' +
              '|-package.json'
          },
          // '<p>Too lazy to do it yourself!? Here... clone the following repository 😉</p>',
          // {
          //   tag: 'pre',
          //   class: 'prettyprint lang-html',
          //   text: '-- GALAXYJS BOILERPLATE PROJECT URL --'
          // },
          '<h2 id="getting-started">Getting started</h2>' +
          '<p class="important">This documentation assumes intermediate level knowledge of JavaScript, CSS and HTML. ' +
          'If you are completely new to frontend development, we recommend that you learn the basics first and then come back!</p>' +
          '<p>There are 2 ways to use GalaxyJS:</p>' +
          '<ol><li>Start a project with GalaxyJS from scratch.</li>' +
          '<li>Add GalaxyJS to an existing webpage.</li></ol>' +
          '<h3>1. Start a project from scratch 😎👍👍</h3>' +
          '<p>This is the easiest way to start since you are going to use GalaxyJS as your web application framework.</p>' +
          '<p>First create a project directory with the recommended structure that is suggested above. Then add this code into the <code class="prettyprint">/app/index.html</code></p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-html',
            text: Scope.importAsText('./start-from-scratch.example.html')
          },
          '<h3>Main module</h3>' +
          '<p>Add this code into the <code class="prettyprint">app/modules/index.js</code></p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: '//Import the view addon\n' +
              'const view = Scope.import(\'galaxy/view\');\n\n' +
              '// This will remove all the contents of the parent element which in this case is body\n' +
              'view.container.node.innerHTML = \'\';\n' +
              'view.blueprint({\n' +
              '  tag: \'h1\',\n' +
              '  text: \'Hello World!\'\n' +
              '})'
          },
          {
            tag: 'p',
            text: 'TADAAA! you have created your first app with GalaxyJS!'
          },
          {
            tag: 'h3',
            html: 'Now, lets see what is going on here!'
          },
          '<pre class="prettyprint inline lang-js">const view = Scope.import(\'galaxy/view\');</pre>' +
          '<p>This line is loading the view addon which provides functionality necessary to create the UI/UX' +
          ' of your module and/or component.</p>',
          '<pre class="prettyprint inline lang-js">view.container.node.innerHTML = \'\'</pre> ' +
          '<p>Above code tells the view addon to start by cleaning its parent and then render its content. In this case, this code will' +
          ' remove the \'Loading...\' from the body.</p>',
          {
            tag: 'p',
            html: 'Then we initialize our view with a <strong>h1</strong> tag and <strong>\'Hello World!\'</strong> as its text content.'
          },
          '<pre class="prettyprint inline lang-js">view.blueprint({\n' +
          '  tag: \'h1\',\n' +
          '  text: \'Hello World!\'\n' +
          '});</pre>',
          '<h3>2. Add GalaxyJS to an existing webpage</h3>' +
          '<p>Sometimes you already have a page and you just want to add some reactive functionality to a page. You can easily do this by transforming your target element into a Galaxy module:</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: Scope.importAsText('./galaxy-module.example.js')
          },
          '<h2 id="ui-creation">UI Creation</h2>',
          '<h3>Modules</h3>',
          '<p>Modules are the building blocks of your application. A module can serve a visual purpose like a UI component, or it can a serve functional purpose like a service.</p>',
          '<p>For a visual module you can think of a page or a section of application UI or something simpler like a button or a text field.</p>',
          '<p>For a functional module you can think of a services, utilities and etc.</p>',
          '<p>Simpler way of describing a module would be that: A module is a just bunch of codes 😂.' +
          ' Those codes could either draw something on the screen 😎 or do something behind the screen 🤓.</p>',
          '<p>Now lets build our first module. A module that renders a paragraph with text \'Hello World\'.</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: Scope.importAsText('./hello-world.example.js')
          },
          '<p>In the above code we started by importing <code class="prettyprint">\'galaxy/view\'</code> addon which we need in order to create a UI.</p>',
          '<p><code class="prettyprint">view.blueprint()</code> accepts an array or object which is the blueprint of ' +
          'our UI. In this case a <strong>p</strong> tag with <strong>Hello World!</strong> as its text.</p>',
          {
            class: 'example-box',
            module: {
              path: './hello-world.example.js'
            }
          },
          '<p>How about a div with a paragraph!</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: Scope.importAsText('./div.example.js')
          },
          '<p>With <code class="prettyprint">children</code> property we can add nodes to an element ' +
          'or in other word <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started#nesting_elements" target="_blank">nesting elements(MDN)</a>.</p>',
          {
            class: 'example-box',
            module: {
              path: './div.example.js'
            }
          },
          '<p>As you can see, you create your HTML structures by using JS objects. This way you don\'t have to ' +
          'go back and forth between JS and HTML.</p>',
          '<p>Keep in mind that a blueprint object is not template/static object. it\'s a live object which reflects the ui state.</p>',
          // ------
          '<h3>Components</h3>',
          '<p>Components are very similar to modules in many aspects, except:</p>',
          '<ol><li>They can only have one root element.</li>' +
          '<li>They strictly meant for building reusable UI blocks.</li></ol>',
          '<p>Here is an example of a component that takes 2 properties, title and description and shows them.</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: Scope.importAsText('./simple-component.example.js'),
            // expandable
          },
          '<p>Next step is to make sure to add the component to the <code class="prettyprint lang-js">view</code>. The <strong>key</strong> would be the component\'s tag name and <strong>value</strong> would be the components\'s builder function.</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: 'view.components({\n' +
              '  \'simple-component\': Scope.import(\'./simple-component.example.js\')\n' +
              '});'
          },
          '<p>And here is how to use the component</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: '{\n' +
              '  tag: \'simple-component\',\n' +
              '  props: {\n' +
              '    title: \'Much Title\',\n' +
              '    description: \'Very description.\'\n' +
              '  }\n' +
              '}'
          },
          '<p>And here is the result:</p>',
          {
            tag: 'simple-component',
            props: {
              title: 'Much Title',
              description: 'Very description.'
            }
          },
          // ------
          '<h3>List Rendering</h3>',
          '<p>To learn more go to <a href="/list-rendering">List Rendering</a></p>',
          '<p>GalaxyJS provide <strong>repeat</strong> property for list rendering. <strong>repeat</strong> reacts to <code class="prettyprint' +
          ' lang-js">array.change</code> property which is provided automatically by GalaxyJS on array values that are bound to view.</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            text: 'const module = {\n' +
              '  // Addons that you need for your module\n' +
              '  imports: [\'galaxy/view\'],\n' +
              '  // The element which is going to be the module\n' +
              '  element: document.querySelector(\'#target\'),\n' +
              '  constructor: function (Scope) {\n' +
              '     const view = Scope.import(\'galaxy/view\');\n' +
              '\n' +
              '     Scope.data.list = [\n' +
              '       {\n' +
              '          title: \'Item 1\'\n' +
              '       },\n' +
              '       {\n' +
              '          title: \'Item 2\'\n' +
              '       },\n' +
              '       {\n' +
              '          title: \'Item 3\'\n' +
              '       },\n' +
              '     ];\n' +
              '\n' +
              '     view.config.cleanContainer = true;\n' +
              '     view.blueprint({\n' +
              '       tag: \'ul\',\n' +
              '       children: {\n' +
              '         repeat: {\n' +
              '            // Bind to data.list property\n' +
              '            data: \'<>data.list\',\n' +
              '            // An alias for each list item\n' +
              '            as: \'item\'\n' +
              '         },\n' +
              '         tag: \'li\',\n' +
              '         text: \'<>item.title\'\n' +
              '       }\n' +
              '     });\n' +
              '  }\n' +
              '};\n' +
              '\n' +
              '// load module\n' +
              'Galaxy.load(module);'
          }
        ]
      }
    ]
  },
  // view.addTimeline({
  //   enter: {
  //     addTo: 'main-nav-timeline',
  //     timeline: () => {
  //       return gsap.timeline({autoRemoveChildren: true}).fromTo(document.querySelectorAll('.card:last-child p'),
  //         {
  //           x: 30,
  //           opacity: 0
  //         },
  //         {
  //           opacity: 1,
  //           x: 0,
  //           duration: .5,
  //           stagger: .2
  //         });
  //     }
  //   }
  // }),
  view.enterKeyframe((a) => {
    PR.prettyPrint();
    router.start();
  }, 'main-nav-timeline'),

]);


