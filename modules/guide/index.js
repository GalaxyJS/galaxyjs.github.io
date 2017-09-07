/* globals Scope, Promise, PR */
Scope.import('galaxy/inputs');

let view = Scope.import('galaxy/view');
let animations = Scope.import('services/animations.js');

Scope.on('module.init', function () {
  console.info('Module guide initialized');
});

Scope.on('module.start', function () {
  PR.prettyPrint();
});

Scope.on('module.destroy', function () {
  console.info('Module guide destroyed');
});
Scope.surfaces = [];
Scope.progressText = 'Ready to make request';

console.info(Scope);
// var observer = Scope.observe(inputs);
// observer.on('items', function (value, oldValue) {
//   debugger;
// });


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
        },
        {
          tag: 'button',
          text: 'Request Surfaces',
          on: {
            click: function () {
              let s = performance.now();
              Scope.progressText = 'Please wait...';
              fetch('https://bertplantagie-clientapi-accept.3dimerce.mybit.nl/api/products/blake_joni_tara').then(function (response) {
                response.json().then(function (data) {
                  let surfaces = data.data.productData.data[0].data.filter(function (item) {
                    return item.baseType === 'surface';
                  });
                  Scope.progressText = 'Done! After ' + (Math.round(performance.now() - s));
                  Scope.surfaces = surfaces;
                });
              });
            }
          }
        },
        {
          tag: 'h3',
          text: '[progressText]'
        },
        {
          tag: 'p',
          // animation: animations.itemInOut,
          $for: 'surface in surfaces',
          text: '[surface.id]',
          children: {
            tag: 'ul',
            children: {
              tag: 'li',
              class: 'material-item',
              $for: 'material in surface.data',
              animation: [
                'material.id',
                function (materialId) {
                  return animations.createSlideInOut(materialId);
                }
              ],
              text: '[material.id]',
              children: {
                tag: 'p',
                children: {
                  tag: 'img',
                  class: 'color-item',
                  animation: [
                    'material.id',
                    function (materialId) {
                      return animations.createPopInOut(materialId);
                    }
                  ],
                  $for: 'color in material.data',
                  src: [
                    'material.id',
                    'color.id',
                    function (material, color) {
                      return 'https://bertplantagie-clientapi-accept.3dimerce.mybit.nl/api/thumbnail/40x40/' + material + '/' + color;
                    }
                  ]
                }
              }
            }
          }
        }
      ]
    }
  ]
});
