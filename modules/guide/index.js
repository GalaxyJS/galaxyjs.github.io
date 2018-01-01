/* globals Scope, Promise, PR */
Scope.import('galaxy/inputs');

let view = Scope.import('galaxy/view');
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
// observer.on('items', function (value, oldValue) {
//   debugger;
// });
let ha;
console.info(Scope);

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
  animation: animations.cardInOut,
  lifeCycle: {
    postInsert: function () {
      PR.prettyPrint();
    }
  },
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
        // {
        //   tag: 'h1',
        //   text: 'Guide Page'
        // },
        // {
        //   tag: 'h2',
        //   text: 'Installation'
        // },
        // {
        //   tag: 'p',
        //   text: 'Simply copy & paste the following into your page\'s head'
        // },
        // {
        //   tag: 'pre',
        //   class: 'prettyprint lang-html',
        //   text: '<script src="https://gitcdn.xyz/repo/GalaxyJS/galaxyjs.github.io/wip/galaxyjs/galaxy.js"></script>'
        // },
        // {
        //   tag: 'h2',
        //   text: 'Recommended project file & folder structure'
        // },
        // {
        //   tag: 'p',
        //   text: 'You can have whatever directory structure you like as long as you know how to the load modules. The following structure is recommended and we are using this structure though out our guide.'
        // },
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
        // {
        //   tag: 'pre',
        //   class: 'prettyprint lang-html',
        //   text: '<!doctype html>\n' +
        //   '<html>\n' +
        //   '  <head>\n' +
        //   '    <title>Learning GalaxyJS</title>\n' +
        //   '    <meta charset="UTF-8">\n' +
        //   '\n' +
        //   '    <script src="path/to/galaxy-min.js"></script>\n' +
        //   '\n' +
        //   '    <script>\n' +
        //   '      (function () {\n' +
        //   '          // This will ensure that you boot Galaxy when everything is loaded\n' +
        //   '          // If you are using JQuery, you can also use $(document).ready(run);\n' +
        //   '          window.addEventListener(\'load\', run);\n' +
        //   '\n' +
        //   '          function run() {\n' +
        //   '              Galaxy.boot({\n' +
        //   '                  // The path to your main module file\n' +
        //   '                  url: \'modules/main/index.js\',\n' +
        //   '                  // The container element for your app\n' +
        //   '                  element: document.getElementById(\'body\')\n' +
        //   '              }).then(function (module) {\n' +
        //   '                  module.start();\n' +
        //   '              });\n' +
        //   '          }\n' +
        //   '      })();\n' +
        //   '    </script>\n' +
        //   '  </head>\n' +
        //   '\n' +
        //   '  <body>\n' +
        //   '    Loading...\n' +
        //   '  </body>\n' +
        //   '</html>    '
        // },
        {
          tag: 'button',
          text: 'Request Surfaces',
          on: {
            click: function () {
              // Scope.flag = !Scope.flag;
              // return;
              Scope.progressText = 'Please wait...';
              // Scope.surfaces = ha;
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
            }
          }
        },
        {
          tag: 'button',
          text: 'Clear',
          on: {
            click: function () {
              Scope.surfaces = [];
              this.broadcast(new CustomEvent('test', {
                bubbles: true,
                detail: {
                  someStuff: true
                }
              }));
            }
          }
        },
        {
          tag: 'h3',
          text: '<>inputs.items.length',
          $if: '<>flag',
          on: {
            click: function () {
              console.info(Scope);
            }
          },
          // animation: animations.createSlideInOut('surfaces', 'card')
        },
        {
          tag: 'p',
          $for: 'surface in surfaces',
          // text: '<>surface.id',
          children: [
            {
              tag: 'h3',
              text: '<>surface.id'
            },
            {
              tag: 'ul',
              children: {
                tag: 'li',
                class: 'material-item',
                $for: 'material in surface.data',
                text: '<>material.id',
                animation: [
                  'surface.id',
                  'material.id',
                  function (surfaceId, mid) {
                    return animations.createSlideInOut(surfaceId + mid + '-anim', 'card', 'items-leave');
                  }
                ],
                children: {
                  tag: 'p',
                  children: {
                    $for: {
                      data: [
                        'material.data',
                        function (data) {
                          return data.slice(0, 5);
                          // return data;
                        }
                      ],
                      as: 'color'
                    },
                    inputs: {
                      materialId: '<>material.id',
                      color: '<>color'
                    },
                    lifecycle: {
                      // preInsert: function (inputs, data, sequence) {
                      //   sequence.next(function (done) {
                      //     data.iconURL = 'https://bertplantagie-clientapi-accept.3dimerce.mybit.nl/api/thumbnail/40x40/' + inputs.materialId + '/' + inputs.color.id;
                      //     const img = new Image(40, 40);
                      //     img.src = data.iconURL;
                      //     img.addEventListener('load', done, false);
                      //     img.addEventListener('error', function () {
                      //       data.iconURL = 'https://dummyimage.com/40x40/fff/f00&text=X';
                      //       done();
                      //     }, false);
                      //   });
                      // }
                    },
                    title: [
                      '$forIndex',
                      'color.id',
                      function (index, id) {
                        return (index + 1) + ' - ' + id;
                      }
                    ],
                    // src: '<>this.iconURL',
                    src: [
                      'material.id',
                      'color.id',
                      function (materialId, colorId) {
                        return 'https://bertplantagie-clientapi-accept.3dimerce.mybit.nl/api/thumbnail/40x40/' + materialId + '/' + colorId;
                      }
                    ],
                    tag: 'img',
                    class: 'color-item',
                    width: 40,
                    height: 40,
                    animation: [
                      'surface.id',
                      'material.id',
                      function (surfaceId, materialId) {
                        return animations.createPopInOut(surfaceId + materialId + '-color', surfaceId + materialId + '-anim', surfaceId + materialId + '-anim');
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      ]
    }
  ]
});


