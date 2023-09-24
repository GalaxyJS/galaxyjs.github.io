export default function AppArticle (componentScope, blueprint, view) {
  return {
    children: [
      {
        tag: 'h1',
        text: '<>title'
      },
      {
        tag: 'p',
        text: '<>text'
      }
    ]
  };
};
