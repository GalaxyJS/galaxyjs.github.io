export default (Scope) => {
  const view = Scope.useView();

  view.blueprint({
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
            text: (fn = '<>data.firstName', ln = '<>data.lastName') => (fn || '...') + ' ' + (ln || '...')
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
};
