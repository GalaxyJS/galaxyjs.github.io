/* global Scope, View */
var ft = performance.now();

Scope.benchmark = {
  start: ft,
  end: 'Waiting...'
};

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
  Scope.benchmark.end = endTime - Scope.benchmark.start - 500;
  console.info('benchmark:', Scope.benchmark.end);
}, 500);

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
          html: '[benchmark.end]'
        },
        {
          reactive: {
            for: 'item in navItems'
          },
          mutator: {
            // text: function (value) {
            //   return 'h4 ' + value + ' h4';
            // }
          },
          t: 'h4',
          text: '[item.title]'
        },
        //{
        //  t: 'ol',
        //  children: [
        //    {
        //      reactive: {
        //        for: 'country in countries'
        //      },
        //      t: 'li',
        //      children: [
        //        {
        //          mutator: {
        //            text: function (value) {
        //              console.info(this.__galaxyView__, '<-->', value);
        //              return 'Mutated: ' + value;
        //            }
        //          },
        //          t: 'h3',
        //          text: '[country.title]'
        //        },
        //        {
        //          t: 'ul',
        //          children: [
        //            {
        //              reactive: {
        //                for: 'city in country.cities',
        //                if: 'country.show'
        //              },
        //              t: 'li',
        //              text: '[city.title]'
        //            }
        //          ]
        //        }
        //      ]
        //    }
        //  ]
        //},
        // {
        //   t: 'h6',
        //   html: '[navBarText]'
        // }
      ]
    }
  ]
});

// setInterval(function () {
//   Scope.navBarText.push(' G');
// }, 1000);
