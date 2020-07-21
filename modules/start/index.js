/* globals Scope */

const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');
const effects = Scope.import('services/effects.js');

view.init({
  class: 'card big',
  animations: animations.cardInOut,
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/galaxy.jpeg',
      height: '410',
      alt: 'Galaxy',
      blurCaption: effects.getBlurCaption()
    },
    '<h1>Welcome</h1>',
    {
      tag: 'section',
      class: 'content',
      children: [
        '<h3>GalaxyJS is framework that helps you to build a fancy web application</h3>' +
        '<p>The difference between Vanilla JS and a Javascript framework is like the difference between a galaxy and a planet. Planets exist inside the galaxy.</p>' +
        '<p>Each planet has its own atmosphere, its environment, its local rules and its ecosystem <i>(if there is life on that planet of course)</i>.</p>' +
        '<p>With GalaxyJS you can create your own favorite application\'s ecosystem/<i>framework</i>, which suits your project the best.</p>'
      ]
    },
    {
      tag: 'section',
      class: 'content',
      children: [
        '<h2>Why GalaxyJs?</h2>',
        {
          tag: 'ul',
          children: [
            '<li><strong>Animations</strong> are built in utilizing the power of a crazy fast animation library called <a href="https://greensock.com/gsap" target="_blank">GSAP</a></li>' +
            '<li><strong>Performant</strong>, it uses native setter/getter to achieve reactive UI</li>' +
            '<li><strong>Flexible Structure</strong> in order to achieve most optimal solution for your app</li>' +
            '<li><strong>Scalability</strong> and <strong>Extendability</strong></li>'
          ]
        },

        {
          tag: 'p',
          class: 'ta-center',
          children: [
            {
              tag: 'a',
              class: 'icon link',
              href: 'https://github.com/GalaxyJS/galaxy',
              target: '_blank',
              rel: 'noopener',
              children: [
                {
                  tag: 'i',
                  class: 'fab fa-github'
                },
                {
                  tag: 'span',
                  text: 'GITHUB'
                }
              ]
            },
            {
              tag: 'a',
              class: 'icon gitter',
              href: 'https://gitter.im/GalaxyJS/galaxy?utm_source=share-link&utm_medium=link&utm_campaign=share-link',
              target: '_blank',
              rel: 'noopener',
              children: { tag: 'img', src: 'https://badges.gitter.im/GalaxyJS/galaxy.svg', alt: 'gitter badge icon' }
            }
          ]
        }
      ]
    }
  ]
})
;
