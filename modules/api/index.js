/* global Scope */
var view = Scope.import('galaxy/view');
var animations = Scope.import('services/animations.js');

view.init({
  tag: 'div',
  class: 'card big',
  animation: animations.cardInOut,
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/tools.jpg'
    },
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h1',
          text: 'API'
        },
        {
          tag: 'h2',
          text: 'Galaxy.GalaxyScope'
        },
        {
          tag: 'ul',
          children: [
            {
              tag: 'li',
              html: '<strong>parentScope</strong> The id of this module'
            },
            {
              tag: 'li',
              html: '<strong>systemId</strong> The id of this module'
            },
            {
              tag: 'li',
              html: '<strong>element</strong> ...'
            },
            {
              tag: 'li',
              html: '<strong>on(event, handler)</strong> ...'
            },
            {
              tag: 'li',
              html: '<strong>observe(object)</strong> ...'
            }
          ]
        }
      ]
    }
  ]
});
