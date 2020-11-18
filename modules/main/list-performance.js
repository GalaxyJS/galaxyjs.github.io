const view = Scope.import('galaxy/view');

Scope.data.list = [];
for (let i = 0; i < 1000; i++) {
  Scope.data.list.push({
    title: 'index: ' + i
  });
}

view.config.cleanContainer = true;
view.init([
  {
    children: {
      tag: 'button',
      text: 'RUN',
      on: {
        click() {
          const t0 = performance.now();
          for (let i = 0; i < Scope.data.list.length; i++) {
            Object.assign(Scope.data.list[i], { title: 'new-' + i });
          }

          const t1 = performance.now();
          console.log('Call to doSomething took ' + (t1 - t0) + ' milliseconds.');
        }
      }
    }
  },
  {
    children: {
      tag: 'p',
      $for: {
        data: '<>data.list',
        as: 'iitem'
      },
      text: '<>iitem.title'
    }
  }
]);
