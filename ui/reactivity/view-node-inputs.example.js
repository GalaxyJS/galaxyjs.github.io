export default (Scope) => {
  const view = Scope.useView();

  view.blueprint({
    class: 'example-box',
    children: {
      tag: 'p',
      text: '<>data.fromParent',
    }
  });
};
