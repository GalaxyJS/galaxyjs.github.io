const view = Scope.import('galaxy/view');

const fullNameComputed = [
  'data.firstName',
  'data.lastName'
].compute((fn, ln) => (fn || '...') + ' ' + (ln || '...'));

view.init({
  class: 'example-box',
  children: [
    {
      tag: 'h3',
      text: 'Variable compute'
    },
    {
      tag: 'h5',
      children: [
        'Full Name: ',
        {
          tag: 'strong',
          text: fullNameComputed
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
    }
  ]
});
