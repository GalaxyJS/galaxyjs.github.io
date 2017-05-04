/* global Scope, View */

Scope.navBarText = [ 'This is the main-nav' ];
Scope.obj = {
  outside: 'Hooray Here Too!',
  inside: {
    value: 'Hooray!'
  }
};

View.init({
  t: 'div',
  id: 'app-pane',

  children: [
    {
      t: 'div',
      id: 'main-nav',
      class: 'main-nav',
      bind_html: 'navBarText'
    },
    {
      t: 'div',
      id: 'main-content',
      class: 'main-content',
      bind_html: 'obj.outside',
      children: [
        {
          t: 'h2',
          bind_html: 'obj.inside.value'
        },
        {
          t: 'h3',
          bind_html: 'navBarText'
        },
        {
          t: 'h4',
          bind_html: 'navBarText'
        },
        {
          t: 'h5',
          bind_html: 'navBarText'
        },
        {
          t: 'h6',
          bind_html: 'navBarText'
        }
      ]
    }

  ]
});

setInterval(function () {
  Scope.navBarText.push(' G');
}, 1000);
