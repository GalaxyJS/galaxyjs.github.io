/* global Scope */
Scope.export = function (blueprint, props) {
  props.focused = false;

  return {
    class: 'field',
    focused: '<>focused',
    children: [
      {
        tag: 'label',
        text: (l = '<>label') => {
          return l;
        }
      },
      {
        tag: 'input',
        value: '<>value.title',
        on: {
          focus: function () {
            props.focused = true;
          },
          blur: function () {
            props.focused = false;
          },
          keyup: function (event) {
            if (event.keyCode === 13) {
              // const event = new CustomEvent('confirm');
              // this.dispatchEvent(event);
              props.onConfirm();
            }
          }
        }
      }
    ]
  };
};
