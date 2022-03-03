const view = Scope.import('galaxy/view');

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
