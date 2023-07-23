export default (Scope) => {
  const view = Scope.useView();

  Scope.data.objectAsStyle = {
    color: 'red',
    textDecoration: 'underline'
  };
  Scope.data.stringAsStyle = 'color: red;text-decoration: underline';
  Scope.data.arrrayAsStyle = ['color: red', 'text-decoration: underline'];
  Scope.data.class = 'bold';

  view.blueprint({
    class: 'example-box',
    children: [
      {
        tag: 'p',
        style: {
          color: 'red',
          textDecoration: 'underline'
        },
        html: 'This paragraph is styled by a <strong>literal object</strong> through style property'
      },
      {
        tag: 'p',
        style: '<>data.objectAsStyle',
        html: 'This paragraph is styled by a <strong>object</strong> through style property'
      },
      {
        tag: 'p',
        style: '<>data.arrrayAsStyle',
        html: 'This paragraph is styled by a <strong>array</strong> through style property'
      },
      {
        tag: 'p',
        style: '<>data.stringAsStyle',
        html: 'This paragraph is styled by a <strong>string</strong> through style property'
      },
      {
        tag: 'p',
        class: '<>data.class',
        text: 'This paragraph is styled by a class property'
      }
    ]
  });
};
