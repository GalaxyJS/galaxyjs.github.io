export default (Scope) => {
  const view = Scope.useView();

  view.blueprint({
    data: {
      fromParent: 'This is a message from parent module!'
    },
    module: {
      url: 'path-to-module-file.js'
    }
  });
};
