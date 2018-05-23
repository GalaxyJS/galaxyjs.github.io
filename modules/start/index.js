/* globals Scope */

const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');

view.init({
  class: 'card big',
  animations: animations.cardInOut,
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/galaxy.jpeg',
      height: '410'
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
          text: 'GalaxyJS is framework that helps you to build a framework for your web application'
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
          html: 'With GalaxyJS you can create your own favorite application\'s ecosystem/<i>framework</i>, which suits your project the best.'
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
          text: 'It\'s very, pretty easy to learn.'
        },
        {
          tag: 'ul',
          children: [
            {
              tag: 'li',
              html: '<strong>Performant</strong>, it uses native setter/getter to achieve reactive UI'
            },
            {
              tag: 'li',
              html: '<strong>Flexible Structure</strong> in order to achieve most optimal solution for your app'
            },
            {
              tag: 'li',
              html: '<strong>Animations</strong> are built in utilizing the power of a crazy fast animation library called <a' +
              ' href="https://greensock.com/gsap" target="_"blank"">GSAP</a>'
            },
            {
              tag: 'li',
              html: '<strong>Scalability</strong> and <strong>Extendability</strong>'
            }
          ]
        }
      ]
    }
  ]
})
;
