const view = Scope.import('galaxy/view');

Scope.data.con = false;
Scope.data.list = [];
for (let i = 0; i < 20; i++) {
  Scope.data.list.push({
    title: 'index: ' + i,
    show: true
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

          Scope.data.con = true;

          const t1 = performance.now();
          console.log('Call to doSomething took ' + (t1 - t0) + ' milliseconds.');
        }
      }
    }
  },
  {
    children: {
      tag: 'p',
      repeat: {
        data: '<>data.list',
        as: 'iitem'
      },
      text: '<>iitem.title',
      $if: '<>data.con'
    }
  }
]);
