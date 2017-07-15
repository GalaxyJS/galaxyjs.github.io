/* globals Scope */

var view = Scope.import('galaxy/view');
var inputs = Scope.import('galaxy/inputs');

view.init([
  {
    tag: 'label',
    text: '[inputs.label]'
  },
  {
    tag: 'input',
    value: '[inputs.value]'
  }
]);
