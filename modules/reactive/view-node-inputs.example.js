const view = Scope.import('galaxy/view');

view.blueprint({
  class: 'example-box',
  children: {
    tag: 'p',
    text: '<>data.fromParent',
  }
});
