const view = Scope.import('galaxy/view');

const originalDataList = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'
];
Scope.data.boxes = originalDataList.slice(0);

view.init([
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
      animations: {
        enter: {
          addTo: 'card',
          sequence: 'boxes',
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
          duration: .9,
          position: '-=.8'
        },
        leave: {
          sequence: 'card',
          to: {
            scale: 0,
            opacity: 0
          },
          duration: .25,
          position: '-=0.22'
        }
      },
      class: 'box',
      repeat: {
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
