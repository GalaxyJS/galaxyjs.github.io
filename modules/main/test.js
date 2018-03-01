const view = Scope.import('galaxy/view');

Scope.data.test1 = {
  prop: 'value 1',
  prop2: 'value 2'
};

Scope.data.test2 = {
  prop: 'value 3'
};

Scope.data.list = [
  {
    title: 'Item 1'
  },
  {
    title: 'Item 2'
  },
  {
    title: '<>data.test1.prop2'
  }
];

Scope.count = 1;

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
  {
    module: {
      url: './item-info.js'
    },
    inputs: {
      test2: '<>data.test2',
      data: {
        count: '<>count'
      }

    }
  },
  {
    tag: 'h4',
    inputs: {
      test2: '<>data.test2',
      item: '<>item'
    },
    $for: {
      data: '<>data.list',
      as: 'item'
    },
    text: '<>item.title',
    class: {
      bold: [
        'item.title',
        'data.test2.prop',
        function (title, prop2) {
          console.info(title, prop2, title === prop2);
          return title === prop2;
          // return true;
        }
      ]
    },
    on: {
      click: function () {
        // debugger;
        console.info(this);
        this.inputs.test2.prop = this.inputs.item.title;
        // this.inputs.item = 'value 1';
      }
    }
  }
]);

setTimeout(function () {
  console.info(Scope);
  // Scope.data.test2 = {
  //   prop: 'Item 2',
  //   axe: 'nice'
  // };
  Scope.data.test1 = Scope.data.test2;

  setTimeout(function () {
    // Scope.data.list = [
    //   {
    //     title: 'new list1'
    //   },
    //   {
    //     title: 'new list2'
    //   },
    //   {
    //     title: '<>data.test1.prop'
    //   }
    // ];
    Scope.data.test2.prop = 'Item 1';
  }, 1500);
}, 1000);
