const view = Scope.import('galaxy/view');

// Scope.data.personOne = {
//   name: 'Eeliya Rasta'
// };

// Scope.data.personTwo = null;

// const personOneCache = Scope.data.personOne;
// console.info('personOne cached', personOneCache);
// Scope.data.personThree = Scope.data.personOne;
// Scope.data.personThree = null;

Scope.data.list = [
  {
    title: 'Title 1',
    count: 3
  },
  {
    title: 'Title 2',
    count: 3
  },
  {
    title: 'Title 3',
    count: 3
  }
];
//
Scope.data.newItem = {
  count: 1,
  title: 'old val'
};
//
// Scope.data.newItem2 = {
//   count: 2,
//   title: null
// };

console.info('Scope', Scope);

view.init([
  // {
  //   tag: 'h1',
  //   text: '<>data.personOne.name'
  // },
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
  //   text:'<>data.personTwo.name'
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
  //   text:'<>data.personThree.name'
  // },
  // {
  //   class: 'content',
  //   children: [
  //     {
  //       tag: 'button',
  //       text: 'data.personOne = {Emmy}',
  //       on: {
  //         click: function () {
  //           Scope.data.personOne = {
  //             name: 'Emmy'
  //           };
  //
  //           console.info(Scope.data.personOne);
  //         }
  //       }
  //     },
  //     {
  //       tag: 'button',
  //       text: 'data.personOne.name = Matilda',
  //       on: {
  //         click: function () {
  //           Scope.data.personOne.name = 'Matilda';
  //
  //           console.info(Scope.data.personOne);
  //         }
  //       }
  //     },
  //     {
  //       tag: 'button',
  //       text: 'data.personTwo = {Gandolf}',
  //       on: {
  //         click: function () {
  //           window.personTwo = Scope.data.personTwo = {
  //             name: 'Gandolf'
  //           };
  //
  //           // Scope.data.personTwo = Scope.data.personOne;
  //
  //           console.info(Scope.data.personTwo);
  //         }
  //       }
  //     },
  //     {
  //       tag: 'button',
  //       text: 'data.personThree = {Elena}',
  //       on: {
  //         click: function () {
  //           Scope.data.personThree = {
  //             name: 'Elena'
  //           };
  //         }
  //       }
  //     },
  //     {
  //       tag: 'button',
  //       text: 'data.personThree.name = Jey Jey',
  //       on: {
  //         click: function () {
  //           Scope.data.personThree.name = 'Jey Jey';
  //         }
  //       }
  //     }
  //   ]
  // },
  // {
  //   class: 'content',
  //   module: {
  //     url: './item-info.js'
  //   },
  //   inputs: {
  //     title: '<>data.personOne.name',
  //     // title: Scope.data.personOne.name,
  //     // person: Scope.data.personOne,
  //     person: '<>data.personOne',
  //     // personTwo: '<>data.personTwo'
  //   }
  // },
  {
    tag: 'h4',
    text: [
      'data.newItem',
      function (length) {
        return JSON.stringify(length);
      }
    ]
  },
  {
    tag: 'h4',
    text: [
      'data.list',
      function (list) {
        return 'Total count:' + list.reduce(function (sum, item) {
          return sum + item.count;
        }, 0);
      }
    ]
  },
  {
    tag: 'p',
    $for: {
      data: '<>data.list',
      as: 'item'
    },
    text: [
      'item',
      function (item) {
        return item.title + ' - ' + item.count;
      }
    ]
  },
  // {
  //   tag: 'p',
  //   text: '<>data.newItem2.title'
  // },
  {
    tag: 'p',
    text: '<>data.newItem.title'
  },
  {
    tag: 'input',
    value: '<>data.newItem.title'
  },
  {
    tag: 'button',
    text: 'Add new item to the list',
    on: {
      click: function () {
        Scope.data.list.push(Scope.data.newItem);
        Scope.data.newItem = {
          count: 1,
          title: ''
        };
      }
    }
  },
  {
    tag: 'button',
    text: 'Change Item 1 count randomly',
    on: {
      click: function () {
        // Scope.data.newItem = Scope.data.newItem2;
        Scope.data.list[0].count = Math.ceil(15 * Math.random());
        // debugger;
      }
    }
  }
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
