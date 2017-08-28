/* globals Scope */

var view = Scope.import('galaxy/view');
var animations = Scope.import('services/animations.js');

view.init({
  class: 'card big',
  animation: animations.cardInOut,
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'modules/start/images/galaxy-1.jpeg'
    },
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h1',
          text: 'Welcome'
        },
        {
          tag: 'h3',
          text: 'GalaxyJS is library to help you to implement your web application into isolated modules'
        },
        {
          tag: 'p',
          text: 'It\'s build on the premise that it\'s not a framework but a library.'
        },
        {
          tag: 'p',
          text: 'Things you need to know before start using GalaxyJS'
        },
        {
          tag: 'ul',
          children: [
            {
              tag: 'li',
              html: 'It\'s depends on Javascript <strong>new Function()</strong> feature'
            },
            {
              tag: 'li',
              text: ' Its structure encourages you to write more DRY code'
            }
          ]
        }
      ]
    },
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h2',
          text: 'Why GalaxyJS?'
        },
        {
          tag: 'h3',
          text: 'Easy to learn... That\'s it!'
        },
        {
          tag: 'p',
          text: 'The difference between Vanilla JS and a Javascript framework is like the difference between a galaxy and a planet. Planets exist inside the galaxy.'
        },
        {
          tag: 'p',
          html: 'Each planet has its own atmosphere, its environment, its local rules and its ecosystem <i>(if there is life on that planet of course)</i>.'
        },
        {
          tag: 'p',
          html: 'With GalaxyJS you can create your own favorite application ecosystem <i>(framework)</i>, which suits your project the best.'
        }
      ]
    }
  ]
})
;
