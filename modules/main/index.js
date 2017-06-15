/* global Scope */


var view = Scope.import('galaxy/view');

var ft = performance.now();
Scope.benchmark = 'Waiting...';

Scope.modules = [
  {
    id: 'start',
    url: 'modules/start/index.js'
  }
];

Scope.activeModule = null;

Scope.flag = false;

Scope.navItems = [
  {
    title: 'Start',
    link: '#start',
    module: {
      id: 'start',
      url: 'modules/start/index.js'
    }
  },
  {
    title: 'Guide',
    link: '#guide',
    module: {
      id: 'guide',
      url: 'modules/guide/index.js'
    }
  },
  {
    title: 'API',
    link: '#api'
  }
];

// Scope.city = 'aaaaaaaaaaaaaaaa';
// Scope.countries = [
//   {
//     title: 'Iran',
//     show: true,
//     cities: [
//       {
//         title: 'Tehran'
//       },
//       {
//         title: 'Mashhad'
//       }
//     ]
//   },
//   {
//     title: 'Netherlands',
//     show: true,
//     cities: [
//       {
//         title: 'Utrecht'
//       },
//       {
//         title: 'Amsterdam'
//       },
//       {
//         title: 'Hilversum'
//       },
//       {
//         title: 'Almere'
//       }
//     ]
//   }
// ];

setTimeout(function () {
  // for (var i = 0; i < 1000; i++) {
  //   Scope.navItems.push({
  //     title: 'New City ' + (i + 1),
  //     link: '#new-city'
  //   });
  // }

  // Scope.navItems[0].title = 'CHANGED!';
  Scope.moduleInputs = {
    title: 'Even more TITLE',
    content: 'End of the new content',
    yes: 'not good',
    no: 'maybe good'
  };
  // Scope.flag = true;
  // Scope.activeModule = Scope.modules[0];
  var endTime = performance.now();
  Scope.benchmark = endTime - ft - 2500;
  console.info('benchmark:', Scope.benchmark);
}, 2500);

Scope.moduleInputs = {
  title: 'asdasd',
  content: 'This is the default content'
};

view.init([
  {
    tag: 'div',
    id: 'main-nav',
    class: 'main-nav',
    children: [
      {
        $for: 'item in navItems',
        tag: 'a',
        href: '[item.link]',
        text: '[item.title]',
        click: function (event) {
          Scope.activeModule = this.data.item.module;
          console.info(this);
        }
      }
    ]
  },
  {
    tag: 'div',
    id: 'main-content',
    class: 'main-content',
    children: [
      {
        tag: 'div',
        class: 'card',
        children: [
          {
            tag: 'section',
            class: 'content',
            children: [
              {
                tag: 'h2',
                text: '[benchmark]'
              },
              {
                tag: 'p',
                class: 'field',
                children: [
                  {
                    tag: 'label',
                    text: 'Input title'
                  },
                  {
                    tag: 'input',
                    value: '[moduleInputs.title]'
                  }
                ]
              },
              {
                $for: 'item in navItems',
                tag: 'p',
                class: 'field',
                children: [
                  {
                    tag: 'label',
                    text: '[item.title]'
                  },
                  {
                    tag: 'input',
                    value: '[item.title]'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        module: '[activeModule]',
        inputs: '[moduleInputs]',
        children: [
          {
            tag: 'p',
            text: 'No content at the moment!'
          },
          {
            tag: 'p',
            text: '[moduleInputs.content]'
          },
          {
            tag: 'p',
            text: 'Some more paragraph in between just to test content'
          }
        ]
      }
    ]
  }
]);

// setInterval(function () {
//   Scope.navBarText.push(' G');
// }, 1000);
