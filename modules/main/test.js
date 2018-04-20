const view = Scope.import('galaxy/view');

Scope.data.list = [
  {
    id: '1'
  },
  {
    id: '2'
  },
  {
    id: '3'
  }
];

view.config.cleanContainer = true;
view.init({
  children: [
    {
      $for: {
        data: '<>data.list',
        as: 'item',
        trackBy: function (item, index) {
          return item ? item.id : index;
        }
      },
      text: '<>item.id'
    }
  ]
});

setTimeout(function () {
  debugger;
  Scope.data.list = [
    {
      id: '4'
    },
    {
      id: '1'
    },
  ];
  debugger;
}, 1000);