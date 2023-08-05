export default (Scope) => {
  const view = Scope.useView();

  view.blueprint([
    {
      tag: 'file-icon',
      props: {
        text: 'first-secondary.js'
      }
    },
    {
      tag: 'p',
      html: 'I am being loaded via the <strong>/first</strong> route, under the <strong>secondary</strong> viewport'
    }
  ]);
};
