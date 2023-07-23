export default (Scope) => {
  const view = Scope.useView();

  view.blueprint({
    tag: 'p',
    text: 'Hello World! I am a paragraph.'
  });
};
