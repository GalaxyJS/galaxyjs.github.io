const view = Scope.import('galaxy/view');

view.blueprint([
  {
    tag: 'file-icon',
    props: {
      text: 'second.js'
    }
  },
  {
    tag: 'h2',
    text: 'This is Second!'
  },
]);

