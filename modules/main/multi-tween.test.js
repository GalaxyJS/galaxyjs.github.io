const view = Scope.import('galaxy/view');

Scope.data.move = false;

view.container.node.innerHTML = '';
view.blueprint({
  tag: 'main',
  children: [
    {
      tag: 'button',
      text: 'animate',
      on: {
        click() {
          Scope.data.move = !Scope.data.move;
        }
      }
    },
    {
      tag: 'h4',
      text: '<>data.move'
    },
    {
      animations: {
        'add:move': [
          {
            to: {
              left: '500px',
              ease: 'power3.out',
              clearProps: '',
              duration: 1,
            },
          },
          {
            to: {
              top: '500px',
              ease: 'power1.inout',
              clearProps: '',
              duration: 1,
            },
          }
        ],
        'remove:move': {
          to: {
            left: '100px',
            top: '100px',
            clearProps: '',
            duration: .5
          }
        },
      },
      class: {
        'move': (m = '<>data.move') => {
          return m;
        },
        'another': true
      },
      style: {
        backgroundColor: 'red',
        width: '200px',
        height: '200px',
        position: 'absolute',
        left: '100px',
        top: '100px',
      }
    }
  ]
});
