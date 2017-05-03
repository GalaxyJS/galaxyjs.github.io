var itemInfo = Scope.import('from/item-info.js');

Scope.properties.init({
  class: [],
  items: [
    {
      title: 'test',
      content: 'Some content'
    }
  ]
});

View.init({
  t: 'div',
  id: 'main-card',
  children: [
    {
      t: 'virtual',
      ra_for: 'item in properties.items', // this node will be repeated for the passed list
      ra_if: 'item.done', // this will be added/removed for the passed parameter
      children: [
        {
          t: 'h2',
          class: ['title'],
          bind_text: 'item.title'
        },
        {
          t: 'p',
          class: ['content'],
          bind_class: 'properties.class',
          bind_text: 'item.content'
        },
        {
          module: itemInfo,
          id: 'some-id',
          inputs: {
            bind_itemData: 'item'
          }
        }
      ]
    }
  ]
});

