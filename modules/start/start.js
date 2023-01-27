const view = Scope.import('galaxy/view');
const router = Scope.import('galaxy/router');
const animations = Scope.import('services/animations.js');

Scope.data.myValue = 10;

view.blueprint([
  {
    class: 'start-page',
    animations: {
      enter: {
        timeline: 'main-nav-timeline',
        position: 'side-bar+=.25',
        from: {
          opacity: 0,
        },
        to: {
          opacity: 1,
          duration: .25,
        },
      },
      leave: {
        timeline: 'main-nav-timeline',
        position: 'pre-side-bar+=.2',
        to: {
          ease: 'Power1.easeIn',
          transformOrigin: 'top center',
          display: 'none',
          // scale: .96,
          opacity: 0,
          // delay: .1,
          duration: .25
        },
      }
    },
    children: [
      {
        animations: {
          enter: {
            timeline: 'main-nav-timeline',
            position: 'side-bar+=.5',
            from: {
              y: '-10%'
            },
            to: {
              y: 0,
              duration: .3
            },
          },
          leave: {
            timeline: 'main-nav-timeline',
            position: 'pre-side-bar',
            to: {
              ease: 'Power1.easeIn',
              y: '-50%',
              duration: .5
            },
          }
        },
        tag: 'img',
        class: 'banner',
        src: 'assets/images/galaxy-large.jpg',
        alt: 'Galaxy',
      },

      {
        animations: {
          enter: {
            timeline: 'main-nav-timeline',
            from: {
              opacity: 0,
              y: '-5%'
            },
            to: {
              opacity: 1,
              y: 0,
              duration: .3
            },
          },
        },
        tag: 'h1',
        class: 'title',
        html: 'GalaxyJS'
      },

      {
        animations: {
          enter: {
            timeline: 'main-nav-timeline',
            from: {
              opacity: 0,
              y: '-5%'
            },
            to: {
              opacity: 1,
              y: 0,
              duration: .3
            },
          },
        },
        tag: 'h1',
        html: 'The framework for <br>elegant web applications'
      },

      {
        animations: {
          enter: {
            timeline: 'main-nav-timeline',
            position: '-=.15',
            from: {
              opacity: 0,
              y: '-3%'
            },
            to: {
              opacity: 1,
              y: 0,
              duration: .3,
            },
          },
        },
        tag: 'section',
        class: 'content',
        children: [
          '<p>GalaxyJS is an opinionated framework for building visually rich web applications. ' +
          'Its main key feature is utilizing the power of a crazy fast animation library called <a href="https://greensock.com/gsap" target="_blank">GSAP</a>.</p>',
          {
            tag: 'h2',
            text: 'Don\'t runway from the DOM(Document Object Model), embrace it!'
          },
          {
            tag: 'ul',
            children: [
              '<li><strong>Animations</strong> are built in, utilizing the power of a crazy fast animation library called <a href="https://greensock.com/gsap" target="_blank">GSAP</a>.</li>' +
              '<li><strong>Versatile</strong> in order to achieve most optimal solution for your app.</li>'
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
              // {
              //   tag: 'a',
              //   class: 'icon gitter',
              //   href: 'https://gitter.im/GalaxyJS/galaxy?utm_source=share-link&utm_medium=link&utm_campaign=share-link',
              //   target: '_blank',
              //   rel: 'noopener',
              //   children: { tag: 'img', src: 'https://badges.gitter.im/GalaxyJS/galaxy.svg', alt: 'gitter badge icon' }
              // }
            ]
          },

          {
            tag: 'div',
            class: 'flex-bar jc-center',
            children: {
              tag: 'button',
              class: 'big',
              html: '<i class="fas fa-graduation-cap"></i><span>Get Started</span>',
              on: {
                click() {
                  router.navigateToPath('/learn');
                }
              }
            }
          }
        ]
      }
    ]
  },
  // view.enterKeyframe(() => {
  //   Galaxy.setupTimeline('main-nav-timeline', {
  //     'pre-side-bar': 0,
  //     'side-bar': .5
  //   });
  // })
]);
