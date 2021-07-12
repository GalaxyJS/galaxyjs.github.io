const view = Scope.import('galaxy/view');
Scope.data.capitals = ['Amsterdam', 'Paris', 'Budapest', 'Berlin', 'Prague', 'Vienna'];

view.init({
  tag: 'p',
  repeat: {
    data: '<>data.capitals', // You can also use '<>data.list.changes' if you wish to bind to ArrayChange property
    as: 'item',
  },
  text: '<>item',
  on:{
    click: function() {
      console.log(this.data);
    }
  }
});
