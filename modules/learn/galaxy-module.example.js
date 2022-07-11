const module = {
  // Addons that you need for your module
  imports: ['galaxy/view'],
  // The element which is going to be the module
  element: document.querySelector('#target'),
  constructor: function (Scope) {
    const view = Scope.import('galaxy/view');
    view.container.node.innerHTML = '';
    view.blueprint({
      tag: 'h2',
      text: 'Hello World from GalaxyJS!'
    });
  }
};

// load module
Galaxy.load(module);
