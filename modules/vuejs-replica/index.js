/* global Scope */

const animations = Scope.import('services/animations.js');
const view = Scope.import('galaxy/view');
const data = Scope.import('data/products.js');

Scope.data = {
  products: data,
  test: data
};

console.log(data);

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
          tag: 'h1',
          text: '<>data.products.length'
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
                        sequence: 'DESTROY',
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
                    // class: {
                    //   'default': true,
                    //   '=> data.activeProduct.title === product.title': 'active',
                    //   '=> data.activeProduct.title !== product.title': 'inactive'
                    // },
                    tag: 'span',
                    // text: 'out of stock',
                    text: [
                      'product.quantity',
                      function (q) {
                        return q < 1 ? 'out of stock' : 'in stock';
                      }
                    ]
                    // text: {
                    //   'product.quantity < 1': 'Out of Stock',
                    //   'product.quantity >= 1': 'In Stock',
                    //   'success': 'The data has been saved!',
                    //   'alert': 'Something went wrong!'
                    // }
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
                    'data.test',
                    function (products) {
                      console.log('products', products);
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
