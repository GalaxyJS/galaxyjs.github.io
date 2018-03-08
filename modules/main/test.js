const view = Scope.import('galaxy/view');

Scope.data.personOne = {
  name: 'Eeliya Rasta',
  age: 26
};
let personOneCached = Scope.data.personOne;

Scope.data.personTwo = {
  name: 'Gandolf',
  age: 121
};

console.info('personOne', Scope);

Scope.data.list = [
  {
    title: 'Item 1'
  },
  {
    title: 'Item 2'
  },
  {
    title: '<>data.personOne.prop2'
  }
];

view.init([
  {
    tag: 'h1',
    text: [
      '<>data.personTwo.name',
      function (p) {
        return 'Person two name is ' + p;
      }
    ]
  },
  {
    tag: 'p',
    text: [
      '<>data.personOne',
      function (values) {
        console.info('exper', values);
        if (typeof values === 'object') {
          return 'personOne -> ' + JSON.stringify(values, null, 2);
        }

        return 'personOne(' + (typeof values) + ') -> ' + values;
      }
    ]
  },
  {
    tag: 'p',
    text: [
      '<>data.personTwo',
      function (values) {
        if (typeof values === 'object') {
          return 'personTwo -> ' + JSON.stringify(values, null, 2);
        }

        return 'personTwo(' + (typeof values) + ') -> ' + values;
      }
    ]
  },
  {
    module: {
      url: './item-info.js'
    },
    inputs: {
      title: '<>data.personOne.name',
      person: '<>data.personOne',
      personTwo: '<>data.personTwo'
    }
  }
  // {
  //   tag: 'h4',
  //   inputs: {
  //     personTwo: '<>data.personTwo',
  //     item: '<>item'
  //   },
  //   $for: {
  //     data: '<>data.list',
  //     as: 'item'
  //   },
  //   text: '<>item.title',
  //   class: {
  //     bold: [
  //       'item.title',
  //       'data.personTwo.prop',
  //       function (title, prop2) {
  //         console.info(title, prop2, title === prop2);
  //         return title === prop2;
  //         // return true;
  //       }
  //     ]
  //   },
  //   on: {
  //     click: function () {
  //       // debugger;
  //       console.info(this);
  //       this.inputs.personTwo.prop = this.inputs.item.title;
  //       // this.inputs.item = 'value 1';
  //     }
  //   }
  // }
]);

setTimeout(function () {
  // Scope.data.personTwo = {
  //   prop: 'Item 2',
  //   axe: 'nice'
  // };
  // Scope.data.personOne = Scope.data.personTwo;

  setTimeout(function () {
    // console.info('Scope.data.personOne ', Scope.data.personOne);
    // console.info('personOne cached', personOneCached);
    // Scope.data.list = [
    //   {
    //     title: 'new list1'
    //   },
    //   {
    //     title: 'new list2'
    //   },
    //   {
    //     title: '<>data.personOne.prop'
    //   }
    // ];
    // Scope.data.personTwo.name = 'Dakota';
    // Scope.data.personTwo = {
    //   data: [
    //     {
    //       title: 'test'
    //     }
    //   ],
    //   name: 'Dakota',
    //   age: 22,
    //   gender: 'female'
    // };
  }, 2500);
}, 1000);
