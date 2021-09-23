const view = Scope.import('galaxy/view');
const exapndable = Scope.import('services/expandable.js');

const firstAnimationExample = Scope.importAsText('./first-animation.example.js');

Scope.data.dots = [];
for (let i = 0, len = 10; i < len; i++) {
  Scope.data.dots.push('');
}

Scope.data.dialog = {
  originNode: null,
  targetNode: null,
};
let resolve1, resolve2;
const promise1 = new Promise((resolve) => {
  resolve1 = resolve;
});

const promise2 = new Promise((resolve) => {
  resolve2 = resolve;
});
view.init([
  {
    class: 'card big anime',
    _animations: {
      enter: {
        timeline: 'card',
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
        timeline: 'card',
        to: {
          y: 150,
          opacity: 0
        },
        position: '+=.1',
        duration: .5
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
            class: 'example-box',
            _module: {
              path: './first-animation.example.js'
            }
          },
          // '<p>This is the code that results in the above animation.</p>',
          {
            tag: 'p',
            text: 'This is the code that results in the above animation.'
          },
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            html: firstAnimationExample,
            expandable: exapndable
          }
        ]
      },
      {
        tag: 'section',
        class: 'content',
        children: [
          {
            tag: 'button',
            text: 'Resolve first promise',
            on: {
              click: function () {
                resolve1();
              }
            }
          },
          {
            tag: 'button',
            text: 'Resolve second promise',
            on: {
              click: function () {
                resolve2();
              }
            }
          }
        ]
      },
      {
        tag: 'section',
        class: 'content dots-animation',
        children: [
          {
            _animations: {
              enter: {
                addTo: 'card',
                timeline: 'dots',
                from: {
                  scale: 0
                },
                to: {
                  scale: 1,
                },
                duration: .2
              }
            },
            tag: 'p',
            text: 'First Promise'
          },
          view.enterKeyframe('dots', .2),
          {
            _animations: {
              enter: {
                await: promise1,
                timeline: 'dots',
                from: {
                  scale: 0
                },
                to: {
                  scale: 1,
                },
                position: '-=.1',
                duration: .2
              }
            },
            tag: 'p',
            text: ':Resolved'
          },
          {
            _animations: {
              enter: {
                timeline: 'dots',
                from: {
                  scale: 0
                },
                to: {
                  scale: 1,
                },
                position: '-=.1',
                duration: .2
              }
            },
            class: 'dot',
            _repeat: {
              data: '<>data.dots'
            }
          },
          {
            _animations: {
              enter: {
                timeline: 'dots',
                from: {
                  scale: 0
                },
                to: {
                  scale: 1,
                },
                position: '-=.1',
                duration: .2
              }
            },
            tag: 'p',
            text: 'Second Promise'
          },
          view.enterKeyframe('dots', .2),
          {
            _animations: {
              enter: {
                await: promise2,
                timeline: 'dots',
                from: {
                  scale: 0
                },
                to: {
                  scale: 1,
                },
                position: '-=.1',
                duration: .2
              }
            },
            tag: 'p',
            text: ':Resolved'
          },
          {
            _animations: {
              enter: {
                timeline: 'dots',
                from: {
                  scale: 0
                },
                to: {
                  scale: 1
                },
                position: '-=.1',
                duration: .2
              }
            },
            style: {
              width: '20px',
              height: '20px',
              borderRadius: '10px',
              backgroundColor: 'lightblue'
            },
            class: 'dot',
            _repeat: {
              data: '<>data.dots'
            }
          }
        ]
      }
    ]
  },
  view.enterKeyframe(() => PR.prettyPrint()),
]);
