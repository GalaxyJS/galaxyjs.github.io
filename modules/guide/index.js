/* globals Scope, Promise, PR */
Scope.import('galaxy/inputs');

var view = Scope.import('galaxy/view');
var animations = Scope.import('services/animations.js');

Scope.on('module.init', function () {
  console.info('Module guide initialized');
});

Scope.on('module.start', function () {
  PR.prettyPrint();
});

Scope.on('module.destroy', function () {
  console.info('Module guide destroyed');
});

// var observer = Scope.observe(inputs);
// observer.on('items', function (value, oldValue) {
//   debugger;
// });

var contentPromise = new Promise(function (resolve) {
  setTimeout(function () {
    resolve('Content after 3 sec');
  }, 3000);
});

view.init({
  class: 'card big',
  animation: animations.cardInOut,
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
          text: contentPromise
        },
        {
          tag: 'h2',
          text: 'Recommended project file & folder structure'
        },
        {
          tag: 'pre',
          class: 'prettyprint lang-js',
          text: 'project\n' +
          '|-app  \n' +
          '| |-assets\n' +
          '| |-modules\n' +
          '| | |-main\n' +
          '| | | |-index.html\n' +
          '| | \n' +
          '| |-services ...\n' +
          '| |-index.html\n' +
          '|\n' +
          '|-node_modules\n' +
          '|-package.json'
        }
      ]
    }
  ]
});
