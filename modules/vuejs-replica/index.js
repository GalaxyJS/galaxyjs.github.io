/* global Scope */

const animations = Scope.import('services/animations.js');
const view = Scope.import('galaxy/view');
const data = Scope.import('./data.js');

Scope.data.products = data;

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
                  value: '<>product.quantity'
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
                        return !q || q < 1;
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
              tag: 'h3',
              text: [
                'data.products',
                function (products) {
                  return 'Total: ' + products.reduce(function (sum, item) {
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
