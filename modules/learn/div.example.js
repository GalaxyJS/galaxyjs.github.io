const view = Scope.import('galaxy/view');

view.blueprint({
  tag: 'div',
  children: {
    tag: 'p',
    text: 'Hello World from inside a div!'
  }
});
