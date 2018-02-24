const view = Scope.import('galaxy/view');

Scope.data.test1 = {
  prop: 'value 1',
  prop2: 'value 2'
};

Scope.data.test2 = {
  prop: 't2 value'
};

view.init([
  {
    tag: 'h3',
    text: [
      '<>data.test1.prop',
      function (p) {
        return '--- ' + p;
      }
    ]
  },
  {
    tag: 'p',
    text: [
      '<>data.test1',
      function (values) {
        if (typeof values === 'object') {
          return 'test1 -> ' + JSON.stringify(values, null, 2);
        }

        return values;
      }
    ]
  },
  {
    tag: 'p',
    text: [
      '<>data.test2',
      function (values) {
        if (typeof values === 'object') {
          return 'test2 -> ' + JSON.stringify(values, null, 2);
        }

        return values;
      }
    ]
  },
]);

setTimeout(function () {
  console.info(Scope);
  // Scope.data.test1 = {
  //   prop: 'value 1',
  //   prop2: 'value 2'
  // };

  Scope.data.test1 = Scope.data.test2;

  setTimeout(function () {
    Scope.data.test1.prop ='aaaa';
  },1000)
}, 1000);
