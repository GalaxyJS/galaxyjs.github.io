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
    _module: {
      path: './mod-c.js'
    },
    _inputs: {
      title: 'Mod C'
    }
  },
  {
    tag: 'p',
    text: 'd'
  },
  {
    children: [
      {
        tag: 'button',
        text: 'Remove mod-c',
        onclick: () => {
          Scope.data.comp = null;
        }
      }
    ]
  }
]);
