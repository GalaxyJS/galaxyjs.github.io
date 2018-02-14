/* global Scope */

const animations = Scope.import('services/animations.js');
const view = Scope.import('galaxy/view');
const data = Scope.import('./data.js');

Scope.data.products = data;

console.info(Scope);

view.init({
  tag: 'div',
  class: 'card',
  animation: animations.cardInOut,
  children: [
    {
      tag: 'section',
      class: 'content',
      children: [
        {
          tag: 'h2',
          text: 'VueJS Replica'
        },
        {
          tag: 'ul',
          children: [
            {
              tag: 'li',
              class: 'flex-row',
              $for: {
                data: '<>data.products',
                as: 'product'
              },
              // text: [
              //   'product.quantity',
              //   'product.title',
              //   function (q, t) {
              //     return q + ' ' + t;
              //   }
              // ],
              children: [
                {
                  tag: 'input',
                  class: 'flex-item-25',
                  value: '<number>product.quantity'
                },
                {
                  tag: 'label',
                  class: 'flex-item-50',
                  text: '<>product.title',
                  children: {
                    tag: 'span',
                    text: ' - OUT OF STOCK',
                    $if: [
                      'product.quantity',
                      function (q) {
                        return q === 0;
                      }
                    ]
                  }
                },

                {
                  tag: 'button',
                  class: 'flex-item-al',
                  text: 'Add',
                  inputs: {
                    productQ: '<>product.quantity'
                  },
                  on: {
                    click: function () {
                      this.inputs.productQ += 1;
                    }
                  }
                }
              ]
            },
            {
              tag: 'h3',
              text: [
                'data.products',
                function (p) {
                  return 'Total: ' + p.reduce(function (sum, item) {
                    return sum + item.quantity;
                  }, 0);
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
