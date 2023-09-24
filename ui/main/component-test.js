import AppArticle from '/components/app-article.js';

export default (Scope) => {
  /** @type {Galaxy.View} */
  const view = Scope.useView();

  Scope.data.scopeTitle = 'Scope Title';

  view.components({
    'app-article': AppArticle
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
};
