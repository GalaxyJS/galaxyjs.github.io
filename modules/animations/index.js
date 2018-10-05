const view = Scope.import('galaxy/view');
const effects = Scope.import('services/effects.js');

// const css = Scope.import('./style.css');

const originalDataList = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'
];
Scope.data.boxes = originalDataList.slice(0);

view.init([
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
                    opacity: 0,
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
              text: '<>item'
            }
          },
          '<p>This is the code that results in the above animation.</p>' +
          '<pre class="prettyprint lang-js">' +
          '{\n' +
          '  class: \'box\',\n' +
          '  animations: {\n' +
          '    enter: {\n' +
          '      sequence: \'boxes\',\n' +
          '      // \'startAfter\' will force this animation sequence to start after `sequence-name` is finished \n'+
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
          '</pre>'
        ]
      }
    ]
  }
]);
