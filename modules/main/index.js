/* global Scope, View */
Scope.benchmark = {
  start: performance.now(),
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
    link: '#api',
    class: [ 'active', 'i' ]
  }
];

Scope.city = 'aaaaaaaaaaaaaaaa';
Scope.countries = [
  {
    title: 'Iran',
    show: true,
    cities: [
      {
        title: 'Tehran'
      },
      {
        title: 'Mashhad'
      }
    ]
  },
  {
    title: 'Netherlands',
    show: true,
    cities: [
      {
        title: 'Utrecht'
      },
      {
        title: 'Amsterdam'
      },
      {
        title: 'Hilversum'
      },
      {
        title: 'Almere'
      }
    ]
  }
];

setTimeout(function () {
  for (var i = 0; i < 50; i++) {
    Scope.countries[ 1 ].cities.push({
      title: 'New City #' + i
    });
  }
  //
  // Scope.countries[ 1 ].show = true;

  // Scope.navItems[ 3 ].done = true;
  // Scope.navItems.pop();

  Scope.obj.outside = 'Hooray after 2 sec';

  // Scope.country = {
  //   cities: [],
  //   title: 'No Way'
  // };

  var endTime = performance.now();
  Scope.benchmark.end = endTime - Scope.benchmark.start;
}, 2000);

Scope.navBarText = [ 'This is the main-nav' ];
Scope.obj = {
  outside: 'Hooray Here Too!',
  inside: {
    value: 'Hooray!'
  }
};

View.init({
  t: 'div',
  id: 'app-pane',

  children: [
    {
      t: 'div',
      id: 'main-nav',
      class: 'main-nav',
      children: [
        {
          reactive: {
            for: 'item in navItems'
            // if: 'item.done'
          },
          t: 'a',
          href: '[item.link]',
          text: '[item.title]',
          class: '[item.class]'
        }
      ]
    },
    {
      t: 'div',
      id: 'main-content',
      class: 'main-content',
      children: [
        // {
        //   t: 'h2',
        //   html: '[benchmark.start]'
        // },
        {
          t: 'h3',
          html: '[benchmark.end]'
        },
        {
          reactive: {
            for: 'item in navItems'
            //if: 'item.done'
          },
          mutator: {
            text: function (value) {
              return 'h4:' + value;
            }
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