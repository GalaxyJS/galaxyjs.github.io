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
  _animations: animations.cardInOut,
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
          text: (len = '<>data.products.length') => {
            return 'No of product type: ' + len;
          }
        },
        {
          tag: 'ul',
          children: [
            {
              tag: 'li',
              class: 'flex-row',
              _repeat: {
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
                    _animations: {
                      leave: {
                        timeline: 'DESTROY',
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
                      color: (q = '<>product.quantity') => {
                        return q < 1 ? '#aaa' : '#3a0';
                      },
                    },
                    tag: 'span',
                    text: (q = '<>product.quantity') => {
                      return q < 1 ? ' out of stock' : ' in stock';
                    },
                  }
                },
                {
                  tag: 'button',
                  class: 'flex-item-al',
                  text: 'Add',
                  _data: {
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
                  text: (products = '<>data.test') => {
                    console.log('products', products);
                    return 'Total: ' + products.reduce(function (sum, item) {
                      return sum + item.quantity;
                    }, 0);
                  }
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
