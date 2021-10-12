const router = Scope.import('galaxy/router');
const view = Scope.import('galaxy/view');

router.routes();

view.config.cleanContainer = true;
Scope.data.scopeTitle = 'Scope Title';

view.components({
  'app-article': Scope.import('components/app-article.js')
});

view.blueprint([
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
  },
  // {
  //   _module: {
  //     path: 'modules/learn/index.js'
  //   }
  // }
]);
console.log(Scope.data);
