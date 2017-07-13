/* global Scope */


var view = Scope.import('galaxy/view');

Scope.modules = [
  {
    id: 'start',
    url: 'modules/start/index.js'
  }
];

Scope.activeModule = null;

Scope.flag = false;

Scope.navItems = [
  {
    title: 'Start',
    link: '#start',
    module: {
      id: 'start',
      url: 'modules/start/index.js'
    }
  },
  {
    title: 'Guide',
    link: '#guide',
    module: {
      id: 'guide',
      url: 'modules/guide/index.js'
    }
  },
  {
    title: 'API',
    link: '#api'
  }
];


Scope.moduleInputs = {
  title: 'asdasd',
  content: 'This is the default content'
};

view.init([
  {
    tag: 'div',
    id: 'main-nav',
    class: 'main-nav',
    children: [
      {
        $for: 'item in navItems',
        tag: 'a',
        href: '[item.link]',
        text: '[item.title]',
        click: function (event) {
          Scope.activeModule = this.data.item.module;
          console.info(this);
        }
      }
    ]
  },
  {
    tag: 'div',
    id: 'main-content',
    class: 'main-content',
    children: [
      {
        tag: 'div',
        class: 'card',
        children: [
          {
            tag: 'section',
            class: 'content',
            children: [
              {
                tag: 'h2',
                text: '[benchmark]'
              },
              {
                tag: 'p',
                class: 'field',
                children: [
                  {
                    tag: 'label',
                    text: 'Input title'
                  },
                  {
                    tag: 'input',
                    value: '[moduleInputs.title]'
                  }
                ]
              },
              {
                $for: 'item in navItems',
                class: 'field',

                module: {
                  url: 'modules/text-field.js'
                },
                inputs: '[item]'
                // inputs: {
                //   label: '[item.title]',
                //   value: '[item.title]'
                // }

                // tag: 'p',
                // children: [
                //   {
                //     tag: 'label',
                //     text: '[item.title]'
                //   },
                //   {
                //     tag: 'input',
                //     value: '[item.title]'
                //   }
                // ]
              },
              {}
            ]
          }
        ]
      },
      {
        module: '[activeModule]',
        inputs: '[moduleInputs]',
        children: [
          {
            tag: 'p',
            text: 'No content at the moment!'
          },
          {
            tag: 'p',
            text: '[moduleInputs.content]'
          },
          {
            tag: 'p',
            text: 'Some more paragraph in between just to test content'
          }
        ]
      }
    ]
  }
]);
