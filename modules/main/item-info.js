const view = Scope.import('galaxy/view');
const inputs = Scope.import('galaxy/inputs');
console.info(Scope)
view.init([
  {
    tag: 'h2',
    text: '<>inputs.title',
    on: {
      click: function () {
        inputs.title = 'asdasd';
        // inputs.test2.prop = 'none';
      }
    }

  },
  {
    tag: 'p',
    text: '<>inputs.data.count'
  }
]);
