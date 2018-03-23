const view = Scope.import('galaxy/view');
const inputs = Scope.import('galaxy/inputs');
console.info('inputs', Scope.inputs);
debugger;
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
        tag: 'h2',
        text: '<>inputs.person.name'
      },
      {
        children: {
          tag: 'a',
          $for: {
            data: '<>inputs.person.children',
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
            text: 'person.name = Elena',
            on: {
              click: function () {
                inputs.person.name = 'Elena';
              }
            }
          }
        ]
      },
      {
        tag: 'p',
        children: [
          {
            tag: 'button',
            text: 'inputs.person = null',
            on: {
              click: function () {
                inputs.person = null;
              }
            }
          },
          {
            tag: 'button',
            text: 'person = typeof string',
            on: {
              click: function () {
                inputs.person = 'some string';
              }
            }
          },
          {
            tag: 'button',
            text: 'person = {Dakota}',
            on: {
              click: function () {
                inputs.person = {
                  name: 'Dakota',
                  age: 22,
                  gender: 'female'
                };
              }
            }
          },
          {
            tag: 'button',
            text: 'Set new object with children list property',
            on: {
              click: function () {
                inputs.person = {
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
            text: 'person.children[0].name = Helen',
            on: {
              click: function () {
                inputs.person.children[0].name = 'Helen';
              }
            }
          },
          {
            tag: 'button',
            text: 'person = personTwo',
            on: {
              click: function () {
                inputs.person = inputs.personTwo;
              }
            }
          }
        ]
      },
      {
        tag: 'p',
        children: [
          {
            tag: 'button',
            text: 'inputs.title = typeof object',
            on: {
              click: function () {
                inputs.title = {};
              }
            }
          },
          {
            tag: 'button',
            text: 'inputs.title = typeof string',
            on: {
              click: function () {
                inputs.title = 'Title has been changed';
              }
            }
          }
        ]
      }
    ]
  }
]);
