const view = Scope.import('galaxy/view');

view.init({
  class: 'example-box',
  children: [
    {
      tag: 'h3',
      text: 'Inline compute'
    },
    {
      tag: 'h5',
      children: [
        'Full Name: ',
        {
          tag: 'strong',
          text: [
            '<>data.firstName',
            '<>data.lastName',
          ].createComputable((fn, ln) => (fn || '...') + ' ' + (ln || '...'))
        }
      ]
    },
    {
      tag: 'input',
      class: 'w-50',
      placeholder: 'First Name',
      value: '<>data.firstName'
    },
    {
      tag: 'input',
      class: 'w-50',
      placeholder: 'Last Name',
      value: '<>data.lastName'
    },
  ]
});
