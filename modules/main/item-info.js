const view = Scope.import('galaxy/view');
const inputs = Scope.import('galaxy/inputs');
console.info(Scope.inputs);
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
            text: 'person = typeof string',
            on: {
              click: function () {
                inputs.person = 'person text';
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
            text: 'person = personTwo',
            on: {
              click: function () {
                inputs.person = inputs.personTwo;
              }
            }
          },
          {
            tag: 'button',
            text: 'person.name = new',
            on: {
              click: function () {
                inputs.person.name = 'New';
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
            text: 'inputs.person = null',
            on: {
              click: function () {
                inputs.person = null;
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
