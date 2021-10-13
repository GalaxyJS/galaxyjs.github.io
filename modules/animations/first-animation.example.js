const view = Scope.import('galaxy/view');

const originalDataList = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'
];
Scope.data.boxes = originalDataList.slice(0);

view.blueprint([
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
      style: {
        width: '67px',
      },
      _animations: {
        enter: {
          addTo: 'card',
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
          position: '-=.87'
        },
        leave: {
          timeline: 'card',
          to: {
            scale: 0,
            opacity: 0
          },
          duration: .26,
          position: '-=0.22'
        }
      },
      class: 'box',
      _repeat: {
        data: '<>data.boxes',
        as: 'item'
      },
      children: [
        {
          class: 'height'
        },
        {
          tag: 'span',
          text: '<>item',
        }]
    }
  }
]);
