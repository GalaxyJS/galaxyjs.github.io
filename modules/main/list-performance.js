const view = Scope.import('galaxy/view');

Scope.data.list = [];
// for (let i = 0; i < 1000; i++) {
//   Scope.data.list.push({
//     title: 'index: ' + i
//   });
// }

view.container.node.innerHTML = '';
view.blueprint([

  {
    id: 'main',
    class: 'main-content',
    children: [
      {
        children: [
          {
            tag: 'button',
            text: 'RUN',
            on: {
              click() {
                const t0 = performance.now();

                for (let i = 0; i < 10000; i++) {
                  Scope.data.list.push({
                    title: 'index: ' + i
                  });
                }

                const t1 = performance.now();
                console.log('Call to doSomething took ' + (t1 - t0) + ' milliseconds.');
              }
            }
          },
          {
            tag: 'p',
            repeat: {
              data: '<>data.list',
              as: 'iitem'
            },
            text: '<>iitem.title'
          }
        ]
      }
    ]
  }
]);
