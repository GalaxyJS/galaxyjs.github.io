/* globals Scope */

var view = Scope.import('galaxy/view');
var inputs = Scope.import('galaxy/inputs');

// console.info(inputs, Scope);
view.init({
  class: 'card big',
  children: [
    {
      class: 'content',
      tag: 'section',
      children: [
        {
          tag: 'h1',
          text: 'Guide Page'
        },
        {
          tag: 'h3',
          text: '[inputs.title]'
        },
        {
          content: '*'
        },
        {
          tag: 'blockquote',
          children: [
            {
              tag: 'p',
              text: '[inputs.content]'
            }
          ]
        }
      ]
    }
  ]
});

//
// setTimeout(function () {
//   inputs.content = 'End -> some others';
// }, 5500);
