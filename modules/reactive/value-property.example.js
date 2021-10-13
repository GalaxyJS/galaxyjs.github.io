const view = Scope.import('galaxy/view');

Scope.data.selectedOption = 'opt-2';
view.blueprint({
  class: 'example-box',
  children: [
    {
      tag: 'h5',
      text: '<>data.selectedOption'
    },
    {
      tag: 'select',
      value: '<>data.selectedOption',
      children: [
        {
          tag: 'option',
          text: 'Option 1',
          value: 'opt-1'
        },
        {
          tag: 'option',
          text: 'Option 2',
          value: 'opt-2'
        },
        {
          tag: 'option',
          text: 'Option 3',
          value: 'opt-3'
        }
      ]
    }
  ]
});
