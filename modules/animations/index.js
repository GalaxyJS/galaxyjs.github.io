const view = Scope.import('galaxy/view');
const effects = Scope.import('services/effects.js');
const exapndable = Scope.import('services/expandable.js');

const firstAnimationExample = Scope.importAsText('./first-animation.example.js');

Scope.data.dialog = {
  originNode: null,
  targetNode: null,
};

view.init([
  // dialogBlueprint,

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
            module: {
              id: 'first-animation-example',
              url: './first-animation.example.js'
            }
          },
          '<p>This is the code that results in the above animation.</p>',
          {
            tag: 'pre',
            class: 'prettyprint lang-js',
            html: firstAnimationExample,
            expandable: exapndable
          }
        ]
      }
    ]
  }
]);
