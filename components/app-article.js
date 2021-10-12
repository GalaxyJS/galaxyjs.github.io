Scope.export = function (bp, ls, v) {
  return {
    tag: 'article',
    children: [
      {
        tag: 'h1',
        text: ls.title
      },
      {
        tag: 'p',
        text: '<>text'
      }
    ]
  };
};
