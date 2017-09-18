/* globals Scope, Promise, PR */
Scope.import('galaxy/inputs');

let view = Scope.import('galaxy/view');
let animations = Scope.import('services/animations.js');

Scope.on('module.init', function () {
  // console.info('Module guide initialized');
});

Scope.on('module.start', function () {
  PR.prettyPrint();
});

Scope.on('module.destroy', function () {
  // console.info('Module guide destroyed');
});
Scope.surfaces = [];
Scope.progressText = 'Ready to make request';
Scope.flag = true;
// console.info(Scope);
// var observer = Scope.observe(inputs);
// observer.on('items', function (value, oldValue) {
//   debugger;
// });


view.init({
  class: 'card big',
  animation: animations.cardInOut,
  children: [
    // {
    //   tag: 'img',
    //   class: 'banner',
    //   src: 'assets/images/guide.jpg'
    // },
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
              Scope.flag = !Scope.flag;
              return;
              let s = performance.now();
              Scope.progressText = 'Please wait...';
              fetch('https://bertplantagie-clientapi-accept.3dimerce.mybit.nl/api/products/blake_joni_tara').then(function (response) {
                response.json().then(function (data) {
                  // let surfaces = data.data.productData.data[0].data.filter(function (item) {
                  //   return item.baseType === 'surface';
                  // });
                  Scope.progressText = 'Done! After ' + (Math.round(performance.now() - s));
                  // Scope.surfaces = surfaces;
                });
                Scope.surfaces = [
                  {
                    id: 'First',
                    data: [
                      {
                        id: 'bolster',
                        selected: '48_green_blue',
                        data: [
                          {
                            'id': '48_green_blue'
                          },
                          {
                            'id': '8_grey_blue'
                          },
                          {
                            'id': '10_red'
                          },
                          {
                            'id': '40_petrol'
                          }
                        ]
                      },
                      {
                        id: 'ploegwool',
                        selected: '13_diep_red',
                        data: [
                          {
                            'id': '13_diep_red'
                          },
                          {
                            'id': '14_orange'
                          },
                          {
                            'id': '17_bright_red'
                          },
                          {
                            'id': '24_light_blue'
                          }
                        ]
                      },
                      {
                        id: 'polder',
                        selected: '1_orange_square',
                        data: [
                          {
                            'id': '1_orange_square'
                          },
                          {
                            'id': '4_blue_square'
                          },
                          {
                            'id': '6_yellow_square'
                          },
                          {
                            'id': '8_grey_square'
                          }
                        ]
                      }
                    ]
                  },
                  {
                    id: 'Second',
                    data: [
                      {
                        id: 'bolster',
                        selected: '48_green_blue',
                        data: [
                          {
                            'id': '48_green_blue'
                          },
                          {
                            'id': '8_grey_blue'
                          },
                          {
                            'id': '10_red'
                          },
                          {
                            'id': '40_petrol'
                          }
                        ]
                      },
                      {
                        id: 'ploegwool',
                        selected: '13_diep_red',
                        data: [
                          {
                            'id': '13_diep_red'
                          },
                          {
                            'id': '14_orange'
                          },
                          {
                            'id': '17_bright_red'
                          },
                          {
                            'id': '24_light_blue'
                          }
                        ]
                      },
                      {
                        id: 'polder',
                        selected: '1_orange_square',
                        data: [
                          {
                            'id': '1_orange_square'
                          },
                          {
                            'id': '4_blue_square'
                          },
                          {
                            'id': '6_yellow_square'
                          },
                          {
                            'id': '8_grey_square'
                          }
                        ]
                      }
                    ]
                  }
                ];
              });
            }
          }
        },
        {
          tag: 'h3',
          text: '[progressText]',
          $if: '[flag]',
          animation: animations.createSlideInOut('surfaces')
        },
        {
          tag: 'p',
          $for: 'surface in surfaces',
          animation: [
            'surface.id',
            function () {
              return animations.createSlideInOut('surfaces');
            }
          ],
          text: '[surface.id]',
          children: {
            tag: 'ul',
            children: {
              tag: 'li',
              class: 'material-item',
              $for: 'material in surface.data',
              animation: [
                'surface.id',
                'material.id',
                function (surfaceId, materialId) {
                  return animations.createSlideInOut(surfaceId + '-' + materialId + '-material', 'surfaces');
                }
              ],
              text: '[material.id]',
              children: {
                tag: 'p',
                children: {
                  tag: 'img',
                  class: 'color-item',
                  animation: [
                    'surface.id',
                    'material.id',
                    function (surfaceId, materialId) {
                      return animations.createPopInOut(surfaceId + '-' + materialId + '-color', surfaceId + '-' + materialId + '-material');
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
