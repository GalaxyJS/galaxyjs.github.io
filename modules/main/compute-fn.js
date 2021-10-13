const view = Scope.import('galaxy/view');

Scope.data.first = 'First';
Scope.data.last = 'Last';

view.config.cleanContainer = true;
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
