/** @type {Galaxy.Router} */
const router = Scope.import('galaxy/router');
/** @type {Galaxy.View} */
const view = Scope.import('galaxy/view');


Scope.data.scopeTitle = 'Scope Title';

view.components({
  'app-article': Scope.import('components/app-article.js')
});

view.clean();
view.blueprint([
  {
    tag: 'app-article',
    props: {
      title: 'test',
      text: 'Wassuuuuuuuuduup!!!'
    }
  },
  {
    tag: 'h3',
    text: '<>data.scopeTitle'
  },
  // {
  //   module: {
  //     path: 'modules/learn/index.js'
  //   }
  // }
]);
console.log(Scope.data);
