/* globals Scope */

var view = Scope.import('galaxy/view');
var inputs = Scope.import('galaxy/inputs');

view.init([
  {
    tag: 'label',
    text: '[inputs.link]'
  },
  {
    tag: 'input',
    value: '[inputs.title]'
  }
]);
