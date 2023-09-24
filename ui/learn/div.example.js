export default (Scope) => {
  const view = Scope.useView();

  view.blueprint({
    tag: 'div',
    children: {
      tag: 'p',
      text: 'Hello World! I am a paragraph inside a div!'
    }
  });
};
