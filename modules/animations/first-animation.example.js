const view = Scope.import('galaxy/view');

const originalDataList = [
  'fa fa-smile',
  'fa fa-smile-beam',
  'fa fa-smile-wink',
  'fa fa-laugh-squint',
  'fa fa-laugh-beam',
  'fa fa-grin-beam',
  'fa fa-grin-beam-sweat',
  'fa fa-kiss-wink-heart',
  'fa fa-surprise',
  'fa fa-grin-hearts',
];
Scope.data.boxes = originalDataList.slice(0);

view.blueprint([
  {
    tag: 'div',
    class: 'flex-bar',
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
      style: {
        width: '75px'
      },
      animations: {
        enter: {
          addTo: 'main-nav-timeline',
          timeline: 'boxes',
          from: {
            display: 'none',
            scale: 0,
            opacity: 1,
          },
          to: {
            scale: 1,
            display: null,
            clearProps: '',
            ease: 'elastic.out(1,.5)'
          },
          duration: 1,
          position: '-=.87',
        },
        leave: {
          addTo: 'main-nav-timeline',
          timeline: 'boxes',
          to: {
            scale: 0,
            opacity: 0
          },
          duration: .26,
          position: '-=.22',
        }
      },
      class: 'box',
      repeat: {
        data: '<>data.boxes',
        as: 'item',
      },
      children: [
        {
          class: 'height'
        },
        {
          tag: 'i',
          class: '<>item',
        }
      ]
    }
  }
]);
