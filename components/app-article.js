Scope.export = function (bp, ls, v) {
  return {
    children: [
      {
        tag: 'h1',
        text: '<>title'
      },
      {
        tag: 'p',
        text: '<>text'
      }
    ]
  };
};
