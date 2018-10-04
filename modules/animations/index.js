const view = Scope.import('galaxy/view');
const css = Scope.import('./style.css');

Scope.data.boxes = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'
];

view.init([
  {
    class: 'card',
    animations: {
      enter: {
        sequence: 'card',
        startAfter: 'main-nav-items',

        from: {
          x: 100,
          y: 150,
          rotationZ: -20,
          opacity: 0
        },
        duration: .5
      }
    },
    children: [
      {
        tag: 'section',
        class: 'content',
        children: [
          {
            tag: 'h1',
            text: 'Animations'
          },
          {
            animations: {
              enter: {
                sequence: 'boxes',
                startAfter: 'card',

                from: {
                  scale: 0
                },
                duration: .4,
                position: '-=.3'
              }
            },
            class: 'box',
            $for: {
              data: '<>data.boxes.changes',
              as: 'item'
            },
            text: '<>item'
          }
        ]
      }
    ]
  }
]);
