const view = Scope.import('galaxy/view');
const inputs = Scope.import('galaxy/inputs');
console.info(Scope)
view.init([
  {
    tag: 'h2',
    text: 'Module:'
  },
  {
    children: [
      {
        tag: 'h2',
        text: '<>inputs.title'
      },
      {
        children: {
          tag: 'a',
          $for: {
            data: '<>inputs.info.children',
            as: 'child'
          },
          text: '<>child.name'
        }
      },
      {
        tag: 'p',
        children: [
          {
            tag: 'button',
            text: 'change from object to string',
            on: {
              click: function () {
                // inputs.title = null;
                inputs.info = 'info text';
                // inputs.test2.prop = 'none';
              }
            }
          },
          {
            tag: 'button',
            text: 'Set new object with children list property',
            on: {
              click: function () {
                inputs.info = {
                  children: [
                    {
                      name: 'Ellen'
                    }
                  ],
                  name: 'Edward',
                  age: 40,
                  gender: 'male'
                };
              }
            }
          },
          {
            tag: 'button',
            text: 'Set new object',
            on: {
              click: function () {
                inputs.info = {
                  name: 'Dakota',
                  age: 22,
                  gender: 'female'
                };
              }
            }
          },
          {
            tag: 'button',
            text: 'Set null',
            on: {
              click: function () {
                // inputs.title = null;
                inputs.info = null;
                // inputs.test2.prop = 'none';
              }
            }
          }
        ]
      }
    ]
  }
]);
