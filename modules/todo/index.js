/* global Scope */

var view = Scope.import('galaxy/view');

Scope.items = ['First item'];
Scope.newItem = '';

view.init({
  tag: 'div',
  class: 'card',
  children: [
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          $for: 'item in items',
          tag: 'p',
          text: '[item]'
        },
        {
          tag: 'input',
          placeholder: 'New todo item title',
          value: '[newItem]'
        },
        {
          tag: 'button',
          text: 'Add',
          click: function () {
            if (Scope.newItem) {
              Scope.items.push(Scope.newItem);
              Scope.newItem = '';
            }
          }
        }
      ]
    }
  ]
});
