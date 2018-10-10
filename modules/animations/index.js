const view = Scope.import('galaxy/view');
const effects = Scope.import('services/effects.js');

// const css = Scope.import('./style.css');

const originalDataList = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'
];
Scope.data.boxes = originalDataList.slice(0);

Scope.data.dialog = {
  originNode: null,
  targetNode: null,
};

const dialogBlueprint = {
  tag: 'div',
  class: 'dialog hide'
};

view.init([
  dialogBlueprint,
  {
    tag: 'div',
    class: {
      'dialog-animation': true,
      show: [
        'data.dialog.originNode',
        'data.dialog.targetNode',
        function (origin, target) {
          // target.originNode = origin;
          // target.target
          // console.log(origin, target);
          this.data.origin = origin;
          this.data.target = target;
          return (origin && target);
        }
      ]
    },

    animations: {
      '+=show': {
        from: function () {
          const node = this.data.origin;
          const nodeStyle = window.getComputedStyle(node);
          // const offParent = node.offsetParent;
          const dimensions = node.getBoundingClientRect();
          // const parentDimension = offParent.getBoundingClientRect();
          console.log(node.style);
          return {
            width: dimensions.width,
            height: dimensions.height,
            left: dimensions.left,
            top: dimensions.top,
            position: 'fixed',
            zIndex: 100,
            backgroundColor: nodeStyle.backgroundColor || '#fff'
          };
        },
        to: function () {
          const _this = this;
          const node = this.data.target;
          const nodeStyle = window.getComputedStyle(node);
          // const offParent = node.offsetParent;
          const dimensions = node.getBoundingClientRect();
          // const parentDimension = offParent ? offParent.getBoundingClientRect() : {left: 0, top: 0};
          // console.log(dimensions, node);
          return {
            ease: 'Power2.easeInOut',
            width: dimensions.width,
            height: dimensions.height,
            left: dimensions.left,
            top: dimensions.top,
            boxShadow: nodeStyle.boxShadow,
            // backgroundColor: nodeStyle.backgroundColor || '#fff',
            clearProps: '',
            onComplete: function () {
              requestAnimationFrame(function () {
                Scope.data.dialog.targetNode = null;
              });
            },
          };
        },

        duration: .5
      },
      '-=show': {
        to: {
          opacity: 0,
          display: 'none'
        },
        duration: .5
      }
    }
  },
  {
    class: 'card big',
    animations: {
      enter: {
        sequence: 'card',
        startAfter: 'main-nav-items',

        from: {
          x: 80,
          y: 150,
          rotationZ: -8,
          opacity: 0
        },
        duration: .5
      }
    },
    lifecycle: {
      postChildrenInsert: function () {
        PR.prettyPrint();
      }
    },
    children: [
      {
        tag: 'img',
        class: 'banner',
        src: 'assets/images/asphalt-blur-cars.jpg',
        height: '410',
        blurCaption: effects.getBlurCaption()
      },
      {
        tag: 'h1',
        text: 'Animations'
      },
      {
        tag: 'section',
        class: 'content',
        children: [
          {
            tag: 'p',
            children: [
              {
                tag: 'button',
                text: 'Replay',
                on: {
                  click: function () {
                    Scope.data.boxes = originalDataList.slice(0);
                  }
                }
              }
            ]
          },
          {
            tag: 'div',
            class: 'box-container',
            children: {
              animations: {
                enter: {
                  sequence: 'boxes',
                  startAfter: 'card',

                  from: {
                    scale: 0
                  },
                  duration: .35,
                  position: '-=.25'
                }
              },
              class: 'box',
              $for: {
                data: '<>data.boxes.changes',
                as: 'item'
              },
              text: '<>item',
              on: {
                click: function () {
                  Scope.data.dialog.originNode = this.node;
                  Scope.data.dialog.targetNode = dialogBlueprint.__node__;
                }
              }
            }
          },
          '<p>This is the code that results in the above animation.</p>' +
          '<pre class="prettyprint lang-js">' +
          '{\n' +
          '  class: \'box\',\n' +
          '  animations: {\n' +
          '    enter: {\n' +
          '      sequence: \'boxes\',\n' +
          '      // \'startAfter\' will force this animation sequence to start after `sequence-name` is finished \n' +
          '      // startAfter: \'sequence-name\',\n ' +
          '      from: {\n' +
          '        opacity: 0,\n' +
          '        scale: 0\n' +
          '      },\n' +
          '      duration: .35,\n' +
          '      position: \'-=.25\'\n' +
          '    }\n' +
          '  },\n' +
          '  $for: {\n' +
          '    data: \'<>data.boxes.changes\',\n' +
          '    as: \'item\'\n' +
          '  },\n' +
          '  text: \'<>item\'\n' +
          '}' +
          '</pre>',
          '<pre class="prettyprint lang-js">' +
          '{\n' +
          '  animations: {\n' +
          '    enter: {\n' +
          '      sequence: string,\n' +
          '\n' +
          '      startAfter: string,\n' +
          '      positionInParent: string // \'+=.3\' or \'-=.8\',\n' +
          '\n' +
          '      duration: string, // \'+=.3\' or \'-=.8\',\n' +
          '      position: string // \'+=.3\' or \'-=.8\',\n' +
          '      from: {\n' +
          '        cssPropertyName: {string|number|function},\n' +
          '      },\n' +
          '      to: {\n' +
          '        cssPropertyName: {string|number|function},\n' +
          '      }\n' +
          '    }\n' +
          '  }\n' +
          '}' +
          '</pre>'
        ]
      }
    ]
  }
]);
