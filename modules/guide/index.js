/* globals Scope, Promise, PR */
Scope.import('galaxy/inputs');

let view = Scope.import('galaxy/view');
let tag = Scope.import('galaxy/tag');
let animations = Scope.import('services/animations.js');

Scope.on('module.init', function () {
  // console.info('Module guide initialized');
});

Scope.on('module.start', function () {
});

Scope.on('module.destroy', function () {
  // console.info('Module guide destroyed');
});
Scope.surfaces = [];
Scope.progressText = 'Ready to make request';
Scope.flag = true;
// var observer = Scope.observe(inputs);
// observer.on('items', function (value, valueBindingSample) {
//   debugger;
// });
console.info(tag.h3('some text').class('test-class'));

// fetch('https://bertplantagie-clientapi-accept.3dimerce.mybit.nl/api/products/blake_joni_tara').then(function (response) {
//   response.json().then(function (data) {
//     // let s = performance.now();
//     let surfaces = data.data.productData.data[0].data.filter(function (item) {
//       return item.type === 'surfaces';
//     });
//
//     ha = surfaces;
//     // Scope.surfaces = surfaces.slice(2, 5);
//     // Scope.progressText = 'Done! After ' + (Math.round(performance.now() - s));
//   });
// });

view.init({
  class: 'card big',
  animations: animations.cardInOut,
  lifecycle: {
    postInsert: function () {
      view;
      // debugger;
    },
    postChildrenInsert: function () {
      view;
      // debugger;
      PR.prettyPrint();
    },
    rendered: function () {
      view;
      // debugger;
    }
  },
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/guide.jpg'
    },
    {
      class: 'content',
      tag: 'section',
      children: [
        {
          tag: 'h1',
          text: 'Guide Page'
        },
        {
          tag: 'h2',
          text: 'Installation'
        },
        {
          tag: 'p',
          text: 'Simply copy & paste the following into your page\'s head'
        },
        {
          tag: 'pre',
          class: 'prettyprint lang-html',
          text: '<script src="https://gitcdn.xyz/repo/GalaxyJS/galaxyjs.github.io/wip/galaxyjs/galaxy.js"></script>'
        },
        tag.h2('Recommended project file & folder structure'),

        {
          tag: 'p',
          text: 'You can have whatever directory structure you like as long as you know how to the load modules. The following structure is recommended and we are using this structure though out our guide.'
        },
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
        {
          tag: 'h2',
          text: 'Bootstrap'
        },
        {
          tag: 'p',
          text: 'Add this code into the app/index.html'
        },
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
        {
          tag: 'h2',
          text: 'Main module'
        },
        {
          tag: 'p',
          text: 'Add this code into the app/modules/index.js'
        },
        {
          tag: 'pre',
          class: 'prettyprint lang-js',
          text: 'var view = Scope.import(\'galaxy/view\');\n' +
          'view.init({\n' +
          '  tag:\'h1\',\n' +
          '  text:\'Hello World!\'\n' +
          '})'
        },
        {
          tag: 'h3',
          text: 'TADAAA! you have created your first app with GalaxyJS!'
        },
        {
          tag: 'p',
          html: '<strong>Lets see what is going on here</strong>'
        },
        {
          tag: 'p',
          html: '<pre class="prettyprint inline lang-js">Scope.import(\'galaxy/view\')</pre> is loading the view addon which provides functionality ' +
          'necessary to create the UI/UX of your module and/or component'
        }
      ]
    }
  ]
});


