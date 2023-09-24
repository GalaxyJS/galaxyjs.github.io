import { expandable } from '/services/expandable.js';
export default (Scope) => {
  const view = Scope.useView();
  const howToLOadGSAPExample = Scope.importAsText('./how-to-load-gsap.example.html');
  const firstAnimationExample = Scope.importAsText('./first-animation.example.js');

  Scope.data.sliderValue = 0;
  Scope.data.animationPaused = true;
  const playAndPauseButton = {
    tag: 'button',
    html: (animationPaused = '<>data.animationPaused') => {
      if (animationPaused) {
        return '<i class="fa fa-play"></i>';
      } else {
        return '<i class="fa fa-pause"></i>';
      }
    },
    on: {
      click: function () {
        if (pageAnimation.paused()) {
          pageAnimation.resume();
        } else {
          pageAnimation.paused(true);
        }

        if (pageAnimation.progress() === 1) {
          pageAnimation.restart();
        }

        Scope.data.animationPaused = pageAnimation.paused();
      }
    }
  };
  const pageAnimation = gsap.timeline({
    paused: true,
    onUpdate: () => {
      Scope.data.sliderValue = pageAnimation.progress() * 100;
    },
    onComplete: () => {
      Scope.data.animationPaused = true;
    }
  });

  Scope.data.dots = [];
  for (let i = 0, len = 10; i < len; i++) {
    Scope.data.dots.push('');
  }

  Scope.data.dialog = {
    originNode: null,
    targetNode: null,
  };
  let resolve1, resolve2;
  const promise1 = new Promise((resolve) => {
    resolve1 = resolve;
  });

  const promise2 = new Promise((resolve) => {
    resolve2 = resolve;
  });
  view.blueprint([
    {
      class: 'card big anime',
      animations: {
        enter: {
          timeline: 'main-timeline',
          // position: 'side-bar+=.5',
          from: {
            // x: 80,
            y: 100,
            opacity: 0,
            duration: .5
          },
        },
        leave: {
          timeline: 'main-timeline',
          to: {
            y: 150,
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
              // position: 'side-bar+=1',
              from: {
                filter: 'grayscale(100%)'
              },
              to: {
                filter: 'grayscale(0%)',
                duration: .4
              }
            },
          },
          tag: 'img',
          class: 'banner',
          src: 'assets/images/asphalt-blur-cars.jpg',
          height: '410',
        },
        view.entering.startKeyframe('main-timeline'),
        {
          tag: 'h1',
          style: {
            textTransform: 'unset'
          },
          // text: 'Animations'
          children: {
            animations: {
              enter: {
                timeline: 'main-timeline',
                position: '-=.75',
                from: {
                  opacity: 0,
                  x: 100,
                },
                to: {
                  opacity: 1,
                  x: 0,
                  ease: 'elastic.out(1, .75)',
                  duration: .8
                },
              },
            },
            tag: 'span',
            repeat: {
              data: ('Animations').split(''),
              as: 'letter'
            },
            text: '<>letter'
          }
        },
        {
          tag: 'section',
          class: 'content',
          children: [
            {
              tag: 'p',
              html: 'GalaxyJS uses <a href="https://greensock.com/gsap/" target="_blank">GSAP</a>, a professional-grade JavaScript animation for the modern web, and integrates with it seamlessly.'
            },
            {
              tag: 'p',
              text: 'However, in order to enable animations, you need to load GSAP library and it should be loaded before GalaxyJS.'
            },
            {
              tag: 'pre',
              class: 'prettyprint lang-html',
              text: howToLOadGSAPExample
            }
          ]
        },

        {
          tag: 'section',
          class: 'content',
          children: [
            {
              tag: 'h2',
              text: 'Philosophy'
            },
            {
              tag: 'p',
              text: 'A web application can be seen as a continues animation. Every state change represents, more or less, a keyframe in this animation. GalaxyJS\'s goal is to provide the best tools necessary to realize this philosophy.'
            },
            {
              tag: 'h2',
              text: 'Showcase'
            },
            {
              tag: 'p',
              text: 'Here is an example animation that respect parent\'s animation. The box will be animated in and out within the same timeline of this page animation. Try to navigate to a different page to see the effect.'
            },
            {
              tag: 'p',
              class: 'example',
              text: 'Example'
            },
            {
              tag: 'pre',
              class: 'prettyprint lang-js',
              text: firstAnimationExample,
              expandable: expandable
            },
            view.entering.startKeyframe('main-timeline'),
            {
              class: 'example-box',
              module: {
                path: './first-animation.example.js'
              }
            },
          ]
        },

        {
          tag: 'section',
          class: 'content',
          children: [
            {
              tag: 'button',
              text: 'Resolve promise',
              on: {
                click: function () {
                  resolve1();
                  // pageAnimation.resume(0);
                }
              }
            },
            {
              tag: 'h2',
              text: 'Custom GSAP Timeline'
            },
            {
              tag: 'input',
              type: 'range',
              min: 0,
              max: 100,
              value: '<>data.sliderValue',
              step: 1,
              on: {
                input: () => {
                  pageAnimation.pause().progress(Scope.data.sliderValue / 100);
                }
              }
            },
            {
              tag: 'div',
              class: 'flex-bar jc-center ai-center',
              children: [
                playAndPauseButton,
                {
                  tag: 'p',
                  style: {
                    width: '200px'
                  },
                  children: [
                    {
                      tag: 'span',
                      text: (v = '<>data.sliderValue') => {
                        return 'Animation progress: ';
                      }
                    },
                    {
                      tag: 'strong',
                      text: (v = '<>data.sliderValue') => {
                        return Math.round(v) + '%';
                      }
                    }
                  ]
                }
              ],
            }
          ]
        },
        {
          tag: 'section',
          class: 'content dots-animation',
          children: [
            {
              animations: {
                enter: {
                  timeline: pageAnimation,
                  from: {
                    x: -15,
                    opacity: 0
                  },
                  to: {
                    x: 0,
                    opacity: 1,
                    duration: .2
                  },
                }
              },
              tag: 'p',
              text: 'Ready...'
            },
            view.entering.addKeyframe(null, pageAnimation, 1),
            {
              animations: {
                enter: {
                  timeline: pageAnimation,
                  position: '-=.1',
                  from: {
                    x: -15,
                    opacity: 0
                  },
                  to: {
                    x: 0,
                    opacity: 1,
                    duration: .2
                  },
                }
              },
              tag: 'p',
              text: 'Set...'
            },
            view.entering.addKeyframe(null, pageAnimation, 1),
            {
              animations: {
                enter: {
                  timeline: pageAnimation,
                  position: '-=.1',
                  from: {
                    x: -30,
                    opacity: 0
                  },
                  to: {
                    x: 0,
                    opacity: 1,
                    duration: .2
                  },
                }
              },
              tag: 'strong',
              text: 'Go!'
            },
            view.entering.addKeyframe(null, pageAnimation, .2),
            {
              animations: {
                enter: {
                  timeline: pageAnimation,
                  position: '-=.1',
                  from: {
                    x: 30,
                    opacity: 0
                  },
                  to: {
                    x: 0,
                    opacity: 1,
                    duration: .2
                  },
                }
              },
              class: 'dot',
              repeat: {
                data: '<>data.dots'
              }
            },
            {
              animations: {
                enter: {
                  timeline: pageAnimation,
                  position: '+=.1',
                  from: {
                    x: 15,
                    opacity: 0
                  },
                  to: {
                    x: 0,
                    opacity: 1,
                    duration: .2
                  },
                }
              },
              tag: 'strong',
              text: 'Finish!'
            },
          ]
        }
      ]
    },
    () => {
      PR.prettyPrint();
      pageAnimation.progress(Scope.data.sliderValue / 100);
    },
  ]);
};
