/* globals Scope */

var view = Scope.import('galaxy/view');
var inputs = Scope.import('galaxy/inputs');
console.info(inputs);
view.init([
  {
    tag: 'label',
    text: '[inputs.value]'
  },
  {
    tag: 'input',
    value: '[inputs.value]'
  }
]);
