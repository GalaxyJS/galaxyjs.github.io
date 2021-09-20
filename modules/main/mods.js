const view = Scope.import('galaxy/view');

view.config.cleanContainer = true;
view.init([
  {
    tag: 'p',
    text: 'a'
  },
  {
    tag: 'p',
    text: 'b'
  },
  {

    module: {
      path: './mod-c.js'
    }
  },
  {
    tag: 'p',
    text: 'd'
  },
]);
