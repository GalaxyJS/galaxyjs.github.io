export default (Scope) => {
  const view = Scope.import('galaxy/view');

  const itemAnimations = {
    enter: {
      withParent: true,
      timeline: 'if-timeline',
      position: '-=.2',
      from: {
        opacity: 0,
        x: 25,
      },
      to: {
        opacity: 1,
        x: 0,
        ease: 'sine.out',
        duration: .3
      },
    },
    leave: {
      withParent: true,
      timeline: 'if-timeline',
      position: '-=.25',
      to: {
        x: 50,
        opacity: 0,
        ease: 'power1.in',
        duration: .3
      },
    }
  };

  Scope.data.conditionForMultiple = true;
  view.blueprint([
    {
      tag: 'div',
      class: 'flex-bar',
      children: [
        {
          tag: 'button',
          text: 'Toggle',
          on: {
            click: function () {
              Scope.data.conditionForMultiple = !Scope.data.conditionForMultiple;
            }
          }
        }
      ]
    },
    {
      tag: 'p',
      children: [
        'Condition is: ',
        {
          tag: 'strong',
          text: '<>data.conditionForMultiple'
        }
      ]
    },
    {
      tag: 'p',
      text: 'Item 1',
      animations: itemAnimations,
      if: '<>data.conditionForMultiple'

    },
    {
      tag: 'p',
      text: 'Item 2',
      animations: itemAnimations,
      if: '<>data.conditionForMultiple'

    },
    {
      tag: 'p',
      text: 'Item 3',
      animations: itemAnimations,
      if: '<>data.conditionForMultiple'
    },
    {
      tag: 'p',
      text: 'Item 4',
      animations: itemAnimations,
      if: '<>data.conditionForMultiple'
    },
    {
      tag: 'p',
      text: 'Item 5',
      animations: itemAnimations,
      if: '<>data.conditionForMultiple'
    }
  ]);
};
