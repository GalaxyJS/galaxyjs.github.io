export default (Scope) => {
  const view = Scope.useView();

  view.blueprint([
    {
      tag: 'file-icon',
      props: {
        text: 'third.js'
      }
    },
    {
      tag: 'h2',
      text: 'This is Third!'
    },
    {
      tag: 'p',
      html: 'The <strong>/first</strong> route\'s module is loaded under the <strong>secondary</strong> viewport'
    }
  ]);
};
