const view = Scope.import('galaxy/view');

Scope.data.person1 = {
  name: 'Eeliya Rasta',
  // children: [
  //   {
  //     name: 'foo bar'
  //   }
  // ],
  address: {
    city: 'Nijkerk'
  },
  age: 25
};

Scope.data.person2 = {
  name: 'Gandolf',
  age: 11000
};
//
Scope.name = 'Scope name';

// Scope.data.people = [
//   {
//     name: 'foo',
//     children: [
//       {
//         name: 'foo bar'
//       }
//     ]
//   },
//   {
//     name: 'baz',
//     children: [
//       {
//         name: 'baz bar'
//       }
//     ]
//   }
// ];
// const personOneCache = Scope.data.personOne;
// console.info('personOne cached', personOneCache);
// Scope.data.person3 = Scope.data.person1;
// Scope.data.person4 = Scope.data.person1;
// Scope.data.personThree = null;

// Scope.data.list = [];
//
// Scope.data.newItem = {
//   count: 1,
//   title: 'old val'
// };

console.info('Scope', Scope);

view.init([
  {
    tag: 'h1',
    text: '<>data.person1.name'
  },
  {
    tag: 'h1',
    text: '<>data.person2.age'
  },
  {
    tag: 'p',
    text: '<>data.person3.address.city'
  },
  // {
  //   tag: 'p',
  //   text: [
  //     '<>data.personOne',
  //     function (values) {
  //       console.info('exper', values);
  //       if (typeof values === 'object') {
  //         return 'personOne -> ' + JSON.stringify(values, null, 2);
  //       }
  //
  //       return 'personOne(' + (typeof values) + ') -> ' + values;
  //     }
  //   ]
  // },
  // {
  //   tag: 'p',
  //   text: [
  //     '<>data.personTwo',
  //     function (values) {
  //       if (typeof values === 'object') {
  //         return 'personTwo -> ' + JSON.stringify(values, null, 2);
  //       }
  //
  //       return 'personTwo(' + (typeof values) + ') -> ' + values;
  //     }
  //   ]
  // },
  // {
  //   tag: 'h2',
  //   text: '<>data.personTwo.name'
  // },
  // {
  //   tag: 'p',
  //   text: [
  //     '<>data.personThree',
  //     function (values) {
  //       if (typeof values === 'object') {
  //         return 'personThree is personOne -> ' + JSON.stringify(values, null, 2);
  //       }
  //
  //       return 'personThree(' + (typeof values) + ') -> ' + values;
  //     }
  //   ]
  // },
  // {
  //   tag: 'h3',
  //   text: '<>data.personThree.name'
  // },
  {
    class: 'content',
    children: [
      // {
      //   tag: 'button',
      //   text: 'data.personOne = {Emmy}',
      //   on: {
      //     click: function () {
      //       Scope.data.personOne = {
      //         name: 'Emmy'
      //       };
      //
      //       console.info(Scope.data.personOne);
      //     }
      //   }
      // },
      // {
      //   tag: 'button',
      //   text: 'data.personOne.name = Matilda',
      //   on: {
      //     click: function () {
      //       Scope.data.personOne.name = 'Matilda';
      //
      //       console.info(Scope.data.personOne);
      //     }
      //   }
      // },
      // {
      //   tag: 'button',
      //   text: 'data.personOne = Anna',
      //   on: {
      //     click: function () {
      //       Scope.data.personOne = {
      //         children: [
      //           {
      //             name: 'Matilda'
      //           }
      //         ],
      //         name: 'Anna'
      //       };
      //     }
      //   }
      // },
      // {
      //   tag: 'button',
      //   text: 'data.personTwo = {Gandolf}',
      //   on: {
      //     click: function () {
      //       window.personTwo = Scope.data.personTwo = {
      //         name: 'Gandolf'
      //       };
      //
      //       // Scope.data.personTwo = Scope.data.personOne;
      //
      //       console.info(Scope.data.personTwo);
      //     }
      //   }
      // },
      {
        tag: 'button',
        text: 'data.personOne = people1',
        on: {
          click: function () {
            Scope.data.personOne = Scope.data.people[0];
          }
        }
      },
      {
        tag: 'button',
        text: 'data.personOne = people2',
        on: {
          click: function () {
            Scope.data.personOne = Scope.data.people[1];
          }
        }
      }
    ]
  },
  {
    class: 'content',
    module: {
      url: './item-info.js'
    },
    inputs: {
      // title: '<>data.personOne.name',
      // title: Scope.data.personOne.name,
      // person: Scope.data.personOne,
      person: '<>data.person1'
      // personTwo: '<>data.personTwo'
    }
  },
  // {
  //   tag: 'h4',
  //   text: [
  //     'data.newItem',
  //     function (length) {
  //       return JSON.stringify(length);
  //     }
  //   ]
  // },
  // {
  //   tag: 'h4',
  //   text: [
  //     'data.list',
  //     function (list) {
  //       return 'Total count:' + list.reduce(function (sum, item) {
  //         return sum + item.count;
  //       }, 0);
  //     }
  //   ]
  // },
  // {
  //   tag: 'p',
  //   $for: {
  //     data: '<>data.list',
  //     as: 'item'
  //   },
  //   text: [
  //     'item',
  //     function (item) {
  //       return item.title + ' - ' + item.count;
  //     }
  //   ]
  // },
  // {
  //   tag: 'p',
  //   text: '<>data.newItem2.title'
  // },
  // {
  //   tag: 'p',
  //   text: '<>data.newItem.title'
  // },
  // {
  //   tag: 'input',
  //   value: '<>data.newItem.title'
  // },
  // {
  //   tag: 'button',
  //   text: 'Add new item to the list',
  //   on: {
  //     click: function () {
  //       Scope.data.list.push(Scope.data.newItem);
  //       Scope.data.newItem = {
  //         count: 1,
  //         title: ''
  //       };
  //     }
  //   }
  // },
  // {
  //   tag: 'button',
  //   text: 'Change Item 1 count randomly',
  //   on: {
  //     click: function () {
  //       // Scope.data.newItem = Scope.data.newItem2;
  //       Scope.data.list[0].count = Math.ceil(15 * Math.random());
  //       // debugger;
  //     }
  //   }
  // }
]);

setTimeout(function () {
  // Scope.data.personOne = Scope.data.people[0];
  // Scope.data.personTwo = {
  //   prop: 'Item 2',
  //   axe: 'nice'
  // };
  // Scope.data.person3 = Scope.data.person2;

  setTimeout(function () {
    //   Scope.data.person3 = {};
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
