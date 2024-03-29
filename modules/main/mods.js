const view = Scope.import('galaxy/view');

view.container.node.innerHTML = '';
view.blueprint([
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
    },
    data: {
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
console.log(Scope)
