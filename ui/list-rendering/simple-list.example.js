/**
 *
 * @param {Galaxy.Scope} Scope
 */
export default (Scope) => {
  const view = Scope.useView();

  Scope.data.capitals = ['Amsterdam', 'Paris', 'Budapest', 'Berlin', 'Prague', 'Vienna'];
  view.blueprint([
    {
      animations: {
        enter: {
          withParent: true,
          from: {
            opacity: 0
          },
          to: {
            opacity: 1,
            duration: .5
          },
        }
      },
      tag: 'p',
      repeat: {
        data: '<>data.capitals', // You can also use '<>data.list.changes' if you wish to bind to ArrayChange property
        as: 'item',
        trackBy: true
      },
      text: '<>item',
      on: {
        click: function () {
          console.log(this.data);
        }
      }
    },
    {
      tag: 'div',
      class: 'flex-bar',
      children: [
        {
          tag: 'button',
          text: 'Add "Tehran" at index 2',
          on: {
            click: function () {
              Scope.data.capitals.splice(2, 0, 'Tehran');
            }
          }
        },
        {
          tag: 'button',
          text: 'Add "Rome" at the begging',
          on: {
            click: function () {
              Scope.data.capitals.unshift('Rome');
            }
          }
        },
        {
          tag: 'button',
          text: 'Reset',
          on: {
            click: function () {
              Scope.data.capitals = ['Amsterdam', 'Paris', 'Budapest', 'Berlin', 'Prague', 'Vienna'];
            }
          }
        }
      ]
    }
  ]);
};
