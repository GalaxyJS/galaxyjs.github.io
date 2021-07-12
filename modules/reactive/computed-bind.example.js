const view = Scope.import('galaxy/view');

view.init({
  class: 'example-box',
  children: [
    {
      tag: 'input',
      placeholder: 'First Name',
      value: '<>data.firstName'
    },
    {
      tag: 'input',
      placeholder: 'Last Name',
      value: '<>data.lastName'
    },
    {
      tag: 'p',
      children: [
        'Full Name: ',
        {
          tag: 'strong',
          text: [
            'data.firstName',
            'data.lastName',
            (fn, ln) =>  (fn || '...') + ' ' + (ln || '...')
          ]
        }
      ]
    }
  ]
});
