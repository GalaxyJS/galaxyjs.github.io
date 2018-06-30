const view = Scope.import('galaxy/view');
Scope.import('galaxy/inputs');

Scope.data.focused = false;

view.init({
  class: 'field',
  focus: '<>data.focused',
  children: [
    {
      tag: 'label',
      text: 'ToDo item'
    },
    {
      tag: 'input',
      value: '<>inputs.data.title',
      on: {
        focus: function () {
          Scope.data.focused = true;
        },
        blur: function () {
          Scope.data.focused = false;
        },
        keyup: function (event) {
          if (event.keyCode === 13) {
            const event = new CustomEvent('confirm');
            view.broadcast(event);
          }
        }
      }
    }
  ]
});
