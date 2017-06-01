/* global Scope, View */

var ft = performance.now();
Scope.benchmark = 'Waiting...';

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

  for (var i = 0; i < 1000; i++) {
    Scope.navItems.push({
      title: 'New City ' + i,
      link: '#new-city'
    });

    // if (i % 100 === 0) {
    //   Scope.navItems.pop();
    // }
  }
  //
  // Scope.countries[ 1 ].show = true;

  // Scope.navItems[1].title = 'changed';
  // Scope.navItems.splice(1, 1, {
  //   title: 'Added via splice',
  //   link: '#'
  // });

  // Scope.navItems.sort(function (a, b) {
  //   return a.title.localeCompare(b.title);
  // });

  // Scope.navItems.unshift({
  //   title: 'un shifted'
  // });

  // Scope.obj.outside = 'Hooray after 2 sec';

  // Scope.country = {
  //   cities: [],
  //   title: 'No Way'
  // };

  var endTime = performance.now();
  Scope.benchmark = endTime - ft - 200;
  console.info('benchmark:', Scope.benchmark);
}, 200);

// Scope.navBarText = ['This is the main-nav'];
// Scope.obj = {
//   outside: 'Hooray Here Too!',
//   inside: {
//     value: 'Hooray!'
//   }
// };

View.init({
  t: 'div',
  id: 'app-pane',

  children: [
    {
      t: 'div',
      id: 'main-nav',
      class: 'main-nav',
      children: [
        // {
        //   reactive: {
        //     for: 'item in navItems'
        //     // if: 'item.done'
        //   },
        //   t: 'a',
        //   href: '[item.link]',
        //   text: '[item.title]'
        // }
      ]
    },
    {
      t: 'div',
      id: 'main-content',
      class: 'main-content',
      children: [
        {
          t: 'h3',
          html: '[benchmark]'
        },
        {
          // reactive: {
          //   for: 'item in navItems'
          // },
          // mutator: {
          //   text: function (value) {
          //     return 'h4 ' + value + ' h4';
          //   }
          // },
          // $if: '[item.done]',
          // $for: 'item in navItems',
          // t: 'h4',
          // text: '[item.title]'
        },
        {
          t: 'ul',
          children: [
            {
              $for: 'item in navItems',
              t: 'li',
              children: [
                {
                  mutator: {
                    text: function (value) {
                      return 'Mutated: ' + value;
                    }
                  },
                  t: 'h3',
                  text: '[item.title]'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});

// setInterval(function () {
//   Scope.navBarText.push(' G');
// }, 1000);
