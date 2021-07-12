const view = Scope.import('galaxy/view');

view.init({
  class: 'example-box',
  children: {
    tag: 'p',
    text: '<>inputs.fromParent',
  }
});
