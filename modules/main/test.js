const view = Scope.import('galaxy/view');
Scope.data.selected = 'two';
Scope.data.opts = [true];
Scope.data.active = true;

console.log(Scope.data);
view.config.cleanContainer = true;
const form = {
  tag: 'form',
  children: [
    {
      tag: 'input',
      type: 'radio',
      name: 'test',
      value: 'one',
      checked: '<>data.selected'
    },
    {
      tag: 'input',
      type: 'radio',
      name: 'test',
      value: 'two',
      checked: '<>data.selected'
    },
    {
      tag: 'input',
      type: 'radio',
      name: 'test',
      value: 'three',
      checked: '<>data.selected'
    },
    {
      tag: 'input',
      type: 'checkbox',
      name: 'opts[]',
      value: 'some',
      checked: '<>data.opts'
    },
    {
      tag: 'input',
      type: 'checkbox',
      name: 'opts[]',
      checked: '<>data.opts'
    }
  ]
};
view.init(form);
