const view = Scope.import('galaxy/view');

Galaxy.View.COMPONENTS['app-article'] = function (bp, scope, view) {
  return {
    tag: 'article',
    children: [
      {
        tag: 'h1',
        text: scope.title
      },
      {
        tag: 'p',
        text: '<>text'
      }
    ]
  };
};

view.config.cleanContainer = true;
Scope.data.scopeTitle = 'Scope Title';
view.init([
  {
    tag: 'app-article',
    _data: {
      title: '<>data.scopeTitle',
      text: 'Wassuuuuuuuuduup!!!'
    }
  },
  {
    tag: 'h3',
    text: '<>data.scopeTitle'
  }
]);
console.log(Scope.data);
