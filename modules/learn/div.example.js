const view = Scope.import('galaxy/view');

view.init({
  tag: 'div',
  children: {
    tag: 'p',
    text: 'Hello World from inside a div!'
  }
});
