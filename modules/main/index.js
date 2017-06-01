/* global Scope, View */

var ft = performance.now();
Scope.benchmark = 'Waiting...';

Scope.activeModule = {
  id: 'start',
  url: './modules/start/index.js'
};

Scope.flag = false;

Scope.navItems = [
  {
    title: 'Start',
    link: '#start'
  },
  {
    title: 'Guide',
    link: '#guide'
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
  //     title: 'New City ' + i,
  //     link: '#new-city'
  //   });
  // }

  Scope.flag = true;
  var endTime = performance.now();
  Scope.benchmark = endTime - ft - 500;
  console.info('benchmark:', Scope.benchmark);
}, 500);

View.init({
  tag: 'div',
  id: 'app-pane',

  children: [
    {
      tag: 'div',
      id: 'main-nav',
      class: 'main-nav',
      children: [
        {
          $for: 'item in navItems',
          $if: '[flag]',
          tag: 'a',
          href: '[item.link]',
          text: '[item.title]'
        }
      ]
    },
    {
      tag: 'div',
      id: 'main-content',
      class: 'main-content',
      children: [
        {
          tag: 'h3',
          html: '[benchmark]'
        },
        {
          module: '[activeModule]',
          children: {
            tag: 'p',
            text: 'No content at the moment!'
          }
        }
      ]
    }
  ]
});

// setInterval(function () {
//   Scope.navBarText.push(' G');
// }, 1000);
