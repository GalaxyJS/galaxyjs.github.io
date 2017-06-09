/* globals Scope */

// debugger;
var view = Scope.import('galaxy/view');
var inputs = Scope.import('galaxy/inputs');

// console.info(inputs, Scope);
view.init([
  {
    tag: 'h2',
    text: '[inputs.title]'
  },
  // {
  //   content: '*'
  // },
  {
    tag: 'p',
    text: '[inputs.content]'
  }
]);


setTimeout(function () {
  inputs.content = 'some others';
}, 5500);
