/* globals Scope */

let view = Scope.import('galaxy/view');
let inputs = Scope.import('galaxy/inputs');

Scope.mod = {
  url: null
};

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

setTimeout(function () {
  Scope.mod = {
    url: 'modules/text-field.js'
  };
  // Scope.mod.url = 'modules/text-field.js';
}, 3000);
