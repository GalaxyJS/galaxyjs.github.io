const view = Scope.import('galaxy/view');

console.log(Scope);
view.blueprint([
  {
    tag: 'h3',
    text: (d = '<>data.title') => {
      return d;
    }
  },
  {
    tag: 'p',
    text: 'c'
  },
]);
