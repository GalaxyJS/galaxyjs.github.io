/* globals Scope */

var view = Scope.import('galaxy/view');
var inputs = Scope.import('galaxy/inputs');

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
              $for: 'item in inputs.items',
              tag: 'p',
              text: '[item.title]',
              children: [
                {
                  tag: 'input',
                  type: 'checkbox',
                  checked: '[item.done]'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
