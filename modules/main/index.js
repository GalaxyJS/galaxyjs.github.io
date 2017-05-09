/* global Scope, View */

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
    class: ['active','i']
  }
];

setTimeout(function () {
  // for (var i = 0; i < 50000; i++) {
  //   Scope.navItems.push({
  //     title: 'new ' + i,
  //     link: '#new',
  //     done: true
  //   });
  // }

  // Scope.navItems[ 3 ].done = true;
  // Scope.navItems.pop();

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

Scope.benchmark = {
  start: performance.now(),
  end: 'Waiting...'
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
        // {
        //   reactive: {
        //     for: 'item in navItems',
        //     if: 'item.done'
        //   },
        //   t: 'h4',
        //   html: '[item.title]'
        // },
        // {
        //   t: 'h5',
        //   html: '[navBarText]'
        // },
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
