export default (Scope) => {
  const view = Scope.import('galaxy/view');

  view.blueprint({
    tag: 'p',
    text: 'Hello World! I am a paragraph.'
  });
};
