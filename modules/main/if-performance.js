const view = Scope.import('galaxy/view');

Scope.data.cond = true;
Scope.data.visibility = true;

view.config.cleanContainer = true;
view.blueprint([
  {
    children: [
      {
        tag: 'button',
        text: 'RUN',
        on: {
          click() {
            const t0 = performance.now();

            for (let i = 0; i < 10001; i++) {
              Scope.data.cond = i % 2 === 0;
            }

            const t1 = performance.now();
            console.log('if took ' + (t1 - t0) + ' milliseconds.');
          }
        }
      },
      {
        tag: 'p',
        text: 'This is if',
        if: '<>data.cond'
      }
    ]
  },
  {
    children: {
      tag: 'button',
      text: 'RUN',
      on: {
        click() {
          const t0 = performance.now();

          for (let i = 0; i < 10001; i++) {
            Scope.data.visibility = i % 2 === 0;
          }

          const t1 = performance.now();
          console.log('visibility took ' + (t1 - t0) + ' milliseconds.');
        }
      }
    }
  },
  {
    children: {
      tag: 'p',
      visible: '<>data.visibility',
      text: 'This is visibility',
    }
  }
]);
