export default (Scope) => {
  const view = Scope.useView();

  Scope.data.first = 'First';
  Scope.data.last = 'Last';

  view.container.node.innerHTML = '';
  view.blueprint([
    {
      text: function (f = '<>data.first', l = '<>data.last') {
        return 'function: ' + f + ' ' + l;
      }
    },
    {
      text: (f = '<>data.first', l = '<>data.last') => {
        return '() => {} ' + f + ' ' + l;
      }
    },
    {
      text: (f = '<>data.first', l = '<>data.last') => '() => exp: ' + f + ' ' + l
    },
    {
      text: function (data, l = '<>data.last') {
        debugger
        return 'function';
      }
    },
    {
      text: (data) => {
        return 'arrow function';
      }
    }
  ]);
};
