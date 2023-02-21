export default (Scope) => {
  const view = Scope.import('galaxy/view');

  const list1 = ['a', 'b', 'c'];
  const list2 = ['One', 'Two'];
  Scope.data.list = list1;
  Scope.data.obj = {
    count: 0
  };

  view.container.node.innerHTML = '';
  view.blueprint([
    {
      class: 'flex-bar',
      children: [
        {
          tag: 'button',
          text: 'Add item to list',
          onclick() {
            Scope.data.list.push((Scope.data.list.length + 10).toString(36).toLowerCase());
            Scope.data.obj.count++;
          }
        },
        {
          tag: 'button',
          text: 'Replace the list with another list',
          onclick() {
            Scope.data.list = list2;
          }
        },
      ]
    },
    {
      tag: 'p',
      text: (length = '<>data.list.length') => {
        return 'Bind via <>data.list.length, show length: ' + length;
      }
    },
    {
      tag: 'p',
      text: (list = '<>data.list') => {
        return 'Bind via <>data.list, show list.length: ' + list.count;
      }
    },
    {
      tag: 'p',
      text: (list = '<self>data.list') => {
        return 'Bind via <self>data.list, show list.length: ' + list.length;
      }
    },
    {
      tag: 'ul',
      children: {
        repeat: {
          data: '<>data.list',
          as: 'item'
        },
        tag: 'li',
        text: '<>item'
      }
    },
    {
      class: 'flex-bar',
      children: [
        {
          tag: 'button',
          text: 'Increase obj.count',
          onclick() {
            Scope.data.obj.count++;
          }
        },
        {
          tag: 'button',
          text: 'Clone and add `extra` property',
          onclick() {
            Scope.data.obj = { ...Scope.data.obj, extra: 42 };
          }
        },
      ]
    },
    {
      tag: 'p',
      text: (obj = '<>data.obj') => {
        return 'Bind via <>data.obj, show obj.count: ' + obj.count;
      }
    },
    {
      tag: 'p',
      text: (obj = '<props>data.obj') => {
        return 'Bind via <props>data.obj, show JSON.stringify(obj): ' + JSON.stringify(obj);
      }
    },
    {
      tag: 'p',
      text: (extra = '<>data.obj.extra') => {
        return 'Bind via <>data.obj.extra, show obj.extra: ' + extra;
      }
    },
    {
      tag: 'p',
      text: '<>data.obj'
    }
  ]);
};

