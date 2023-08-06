// simple-component.example.js

export default function SimpleComponent(props, blueprint) {
  console.log(props);
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
}
