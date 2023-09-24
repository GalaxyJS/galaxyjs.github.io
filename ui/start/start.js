export default (Scope) => {
  const view = Scope.useView();
  const router = Scope.useRouter();

  Scope.data.myValue = 10;

  view.blueprint([
    {
      class: 'start-page',
      animations: {
        enter: {
          timeline: 'main-timeline',
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
            duration: .5,
          },
        },
        leave: {
          timeline: 'main-timeline',
          position: '-=.5',
          to: {
            ease: 'Power1.easeIn',
            transformOrigin: 'top center',
            display: 'none',
            opacity: 0,
            duration: .5
          },
        }
      },
      children: [
        {
          animations: {
            enter: {
              timeline: 'main-timeline',
              position: '-=.5',
              from: {
                y: '-10%'
              },
              to: {
                y: 0,
                duration: .5
              },
            },
            leave: {
              timeline: 'main-timeline',
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
              timeline: 'main-timeline',
              position: '-=.25',
              from: {
                opacity: 0,
                y: '-5%'
              },
              to: {
                opacity: 1,
                y: 0,
                duration: .4
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
              timeline: 'main-timeline',
              position: '-=.25',
              from: {
                opacity: 0,
                y: '-5%'
              },
              to: {
                opacity: 1,
                y: 0,
                duration: .4
              },
            },
          },
          tag: 'h1',
          html: 'The framework for <br>elegant web applications'
        },

        {
          animations: {
            enter: {
              timeline: 'main-timeline',
              position: '-=.25',
              from: {
                opacity: 0,
                y: '-3%'
              },
              to: {
                opacity: 1,
                y: 0,
                duration: .4,
              },
            },
          },
          tag: 'section',
          class: 'content',
          children: [
            '<p>GalaxyJS is an opinionated javascript framework for building visually rich web applications. ' +
            'Its main feature is utilizing the power of a crazy fast animation library called <a href="https://greensock.com/gsap" target="_blank">GSAP</a>.</p>',
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
            },
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
                }
              ]
            }
          ]
        }
      ]
    }
  ]);
};

