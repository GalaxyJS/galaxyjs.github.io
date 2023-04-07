export default (Scope) => {
  const animations = Scope.import('services/animations.js');
  const view = Scope.import('galaxy/view');
  const data = Scope.import('data/products.js');

  Scope.data = {
    products: data,
    test: data
  };

  view.blueprint({
    tag: 'div',
    class: 'card',
    animations: animations.cardInOut,
    children: [
      {
        tag: 'section',
        class: 'content',
        children: [
          {
            tag: 'p',
            html: 'This is a replica(with improved styling) of the example app given in the <a href="https://www.youtube.com/watch?v=p1iLqZnZPdo" target="_blank"><strong>WHY VUE.JS</strong></a> video and meant for educational purposes.'
          },
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
                repeat: {
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
                      style: {
                        paddingLeft: '10px',
                        fontSize: '.85em',
                        fontWeight: 'bold',
                        marginLeft: 'auto',
                        color: (q = '<>product.quantity') => {
                          return q < 1 ? '#b55' : '#3a0';
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
                    on: {
                      click: function () {
                        this.data.product.quantity += 1;
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
};
