const view = Scope.import('galaxy/view');
const inputs = Scope.import('galaxy/inputs');
console.info(Scope)
view.init([
  {
    tag: 'p',
    text: '<>inputs.test2.prop',
    on: {
      click: function () {
        inputs.test2.prop = 'none';
      }
    }

  },
  {
    tag: 'p',
    text: '<>inputs.data.count'
  }
]);
