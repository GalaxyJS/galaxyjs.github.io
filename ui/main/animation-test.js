export default (Scope) => {
  const view = Scope.useView();

  view.container.node.innerHTML = '';
  view.blueprint({});
};
