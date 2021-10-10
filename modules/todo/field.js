/* global Scope */
const view = Scope.import('galaxy/view');

Scope.data.focused = false;

view.init({
  class: 'field',
  focused: '<>data.focused',
  children: [
    {
      tag: 'label',
      text: 'ToDo item'
    },
    {
      tag: 'input',
      value: '<>data.entry.title',
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
            view.dispatchEvent(event);
          }
        }
      }
    }
  ]
});
