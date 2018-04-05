const view = Scope.import('galaxy/view');

Scope.data.title = 'test';
console.info(Scope);
view.init({
  tag: 'h2',
  text: '<>data'
});