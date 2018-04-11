/* global Scope */
const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');

const router = Scope.import('galaxy/router');

router.init({
  '/': function () {
    console.log('API Router');
  },
  '/:subId': function (params) {
    console.log('API Router', params);
  }
});

view.init({
  tag: 'div',
  class: 'card big',
  animations: animations.cardInOut,
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/tools.jpg',
      height: '600'
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
        },
        {
          tag: 'h2',
          text: 'Galaxy.GalaxyModule'
        },
        {
          tag: 'h2',
          text: 'Galaxy.GalaxySequence'
        },
        {
          tag: 'h2',
          text: 'Galaxy.GalaxyObserver'
        },
        {
          tag: 'h2',
          text: 'Galaxy.View'
        },
        {
          tag: 'h2',
          text: 'Galaxy.View.ViewNode'
        }
      ]
    }
  ]
});
