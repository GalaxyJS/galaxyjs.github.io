export default (Scope) => {
  const view = Scope.import('galaxy/view');

  view.blueprint({
    data: {
      fromParent: 'This is a message from parent module!'
    },
    module: {
      url: 'path-to-module-file.js'
    }
  });
};
