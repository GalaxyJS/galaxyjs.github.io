const view = Scope.import('galaxy/view');

const originalDataList = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g'
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
            Scope.data.boxes = [];
            view.keyframe.action(() => {
              Scope.data.boxes = originalDataList.slice(0);
            }, 'card');
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
        width: 'calc(100% / ' + Scope.data.boxes.length + ')',
      },
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
