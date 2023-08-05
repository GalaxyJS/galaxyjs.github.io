export default (Scope) => {
  const view = Scope.useView();

  view.blueprint([
    {
      tag: 'file-icon',
      props: {
        text: 'first.js'
      }
    },
    {
      tag: 'h2',
      text: 'This is First!'
    }
  ]);
};
