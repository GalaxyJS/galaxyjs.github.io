function TodoField(props, blueprint) {
  props.focused = false;

  return {
    class: 'field',
    focused: '<>focused',
    children: [
      {
        tag: 'label',
        text: (l = '<>label', v = '<>value.title') => {
          return l + ` (${v ? v.length : 0} Char)`;
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
              props.onConfirm();
            }
          }
        }
      }
    ]
  };
};

export default TodoField;
