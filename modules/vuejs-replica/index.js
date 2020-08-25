/* global Scope */

const animations = Scope.import('services/animations.js');
const view = Scope.import('galaxy/view');
const data = Scope.import('./data.js');

Scope.data.products = data;
Scope.data.test = data;
Scope.data.test2 = data;

view.init({
  tag: 'div',
  class: 'card',
  animations: animations.cardInOut,
  children: [
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h1',
          text: 'VueJS Replica'
        },
        {
          tag: 'ul',
          children: [
            {
              tag: 'li',
              class: 'flex-row',
              $for: {
                data: '<>data.products.changes',
                as: 'product'
              },
              children: [
                {
                  tag: 'input',
                  class: 'flex-item-25',
                  type: 'number',
                  min: 0,
                  value: '<>product.quantity'
                },
                {
                  tag: 'label',
                  class: 'flex-item-50',
                  text: '<>product.title',
                  children: {
                    animations: {
                      leave: {
                        to: {
                          opacity: 0
                        },
                        duration: .5
                      }
                    },
                    style: {
                      paddingLeft: '10px',
                      fontSize: '.85em',
                      fontWeight: 'bold',
                      marginLeft: 'auto',
                      color: [
                        'product.quantity',
                        function (q) {
                          return q < 1 ? '#aaa' : '#3a0';
                        }
                      ],
                    },
                    tag: 'span',
                    // text: 'out of stock',
                    text: [
                      'product.quantity',
                      function (q) {
                        return q < 1 ? 'out of stock' : 'in stock';
                      }
                    ]
                  }
                },
                {
                  tag: 'button',
                  class: 'flex-item-al',
                  text: 'Add',
                  inputs: {
                    product: '<>product'
                  },
                  on: {
                    click: function () {
                      this.inputs.product.quantity += 1;
                    }
                  }
                }
              ]
            },
            {
              tag: 'div',
              children: [
                {
                  tag: 'h3',
                  text: [
                    'data.test2',
                    function (products) {
                      console.log('ffff');
                      return 'Total: ' + products.reduce(function (sum, item) {
                        return sum + item.quantity;
                      }, 0);
                    }
                  ]
                }
              ]
            },
            {
              tag: 'hr'
            },
            {
              class: 'field',
              focus: '<>this.focused',
              children: [
                {
                  tag: 'label',
                  text: 'New Item'
                },
                {
                  tag: 'input',
                  value: '<>this.title',
                  on: {
                    focus: function () {
                      this.parent.data.focused = true;
                    },
                    blur: function () {
                      this.parent.data.focused = false;
                    },
                    keyup: function (event) {
                      if (event.keyCode === 13 && this.data.title) {
                        Scope.data.products.push({
                          id: (new Date()).getTime(),
                          quantity: 0,
                          title: this.data.title
                        });
                        this.data.title = null;
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
