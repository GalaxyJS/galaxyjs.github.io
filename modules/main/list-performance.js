const view = Scope.import('galaxy/view');

Scope.data.list = [];
// for (let i = 0; i < 1000; i++) {
//   Scope.data.list.push({
//     title: 'index: ' + i
//   });
// }

view.config.cleanContainer = true;
view.init([
  {
    children: {
      tag: 'button',
      text: 'RUN',
      on: {
        click() {
          const t0 = performance.now();
          // for (let i = 0; i < Scope.data.list.length; i++) {
          //   Object.assign(Scope.data.list[i], { title: 'new-' + i });
          // }

          for (let i = 0; i < 10000; i++) {
            Scope.data.list.push({
              title: 'index: ' + i
            });
          }

          // const main = document.getElementById('main');
          // for (let i = 0; i < 10000; i++) {
          //   const p = document.createElement('p');
          //   p.innerText = 'index: ' + i;
          //   main.appendChild(p);
          // }

          const t1 = performance.now();
          console.log('Call to doSomething took ' + (t1 - t0) + ' milliseconds.');
        }
      }
    }
  },
  {
    id: 'main',
    class: 'main-content',
    children: {
      tag: 'p',
      repeat: {
        data: '<>data.list',
        as: 'iitem'
      },
      text: '<>iitem.title'
    }
  }
]);
