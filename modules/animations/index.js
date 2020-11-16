const view = Scope.import('galaxy/view');
const effects = Scope.import('services/effects.js');

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
  class: 'dialog hide',
  on_click: 'test'
};

view.init([
  {
    class: 'card big anime',
    animations: {
      enter: {
        sequence: 'card',
        from: {
          x: 80,
          y: 150,
          rotationZ: -8,
          opacity: 0
        },
        position: '+=.1',
        duration: .5
      },
      leave: {
        sequence: 'card',
        to: {
          y: 150,
          opacity: 0
        },
        position: '+=.1',
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
                    Scope.data.boxes = [];
                    view.nextFrame(() => {
                      const card = view.getAnimation('card');
                      card.addOnComplete((event) => {
                        Scope.data.boxes = originalDataList.slice(0);
                      });
                    });
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
                  sequence: 'card',
                  from: {
                    scale: 0,
                    opacity: 1
                  },
                  duration: .35,
                  position: '-=.25'
                },
                leave: {
                  sequence: 'card',
                  to: {
                    scale: 0,
                    opacity: 0
                  },
                  duration: .15,
                  position: '-=0.08'
                }
              },
              class: 'box',
              $for: {
                data: '<>data.boxes',
                as: 'item'
              },
              text: '<>item',
              on: {
                click: function () {
                  Scope.data.dialog.originNode = this.node;
                  Scope.data.dialog.targetNode = dialogBlueprint.node;
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
