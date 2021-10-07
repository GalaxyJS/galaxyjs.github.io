const view = Scope.import('galaxy/view');
const animations = Scope.import('services/animations.js');

Scope.data.myValue = 10;

view.init({
  class: 'card big',
  _animations: animations.cardInOut,
  children: [
    {
      tag: 'img',
      class: 'banner',
      src: 'assets/images/galaxy.jpeg',
      height: '420',
      alt: 'Galaxy',
    },
    '<h1>Welcome To GalaxyJS</h1>',
    {
      tag: 'section',
      class: 'content',
      children: [
        '<h2>The framework to make visually stunning web applications</h2>'
      ]
    },
    {
      tag: 'section',
      class: 'content',
      children: [
        '<p>GalaxyJS is an opinionated framework for building visually rich web applications. Its main key feature is utilizing the power of a crazy fast animation library called <a href="https://greensock.com/gsap" target="_blank">GSAP</a></p>',
        {
          tag: 'h4',
          text: 'Don\'t runway from the DOM(Document Object Model), slay it like a dragon.'
        },
        {
          tag: 'ul',
          children: [
            '<li><strong>Animations</strong> are built in, utilizing the power of a crazy fast animation library called <a href="https://greensock.com/gsap" target="_blank">GSAP</a></li>' +
            '<li><strong>Versatile</strong> in order to achieve most optimal solution for your app</li>'
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
});
