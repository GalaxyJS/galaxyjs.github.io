// simple-component.example.js
export default (Scope) => {
  Scope.export = function (props, blueprint) {
    return {
      class: 'example-box',
      children: [
        {
          tag: 'h1',
          text: '<>title'
        },
        {
          tag: 'p',
          text: '<>description'
        }
      ]
    };
  };
};
