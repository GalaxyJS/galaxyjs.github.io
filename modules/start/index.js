/* globals Scope */

const view = Scope.import('galaxy/view');
const effects = Scope.import('services/effects.js');
const data = Scope.import('data/products.js');

Scope.data.p = data;

console.log(data)
view.init({
  class: 'card big',
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/galaxy.jpeg',
      height: '420',
      alt: 'Galaxy',
      blurCaption: effects.getBlurCaption()
    },
    '<h1>Welcome To GalaxyJS</h1>',
    {
      tag: 'section',
      class: 'content',
      children: [
        '<h2>The framework to make stunning web applications</h2>'
      ]
    },
    {
      tag: 'section',
      class: 'content',
      children: [
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
          tag: 'strong',
          text: '<>data.p.length'
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
