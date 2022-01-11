Scope.export = function ex() {
  const container = this;
  container.rendered.then(() => {
    container.node.style.position = 'relative';
    container.node.style.overflow = 'hidden';

    container.node.style.height = '80px';

    let toggle = false;
    const localScope = {
      label: 'expand'
    };
    container.createNode({
      style: {
        position: 'absolute',
        top: '15px',
        right: '15px'
      },
      tag: 'a',
      href: '#',
      text: '<>label',
      on: {
        click: function (event) {
          event.preventDefault();
          toggle = !toggle;
          if (toggle) {
            gsap.to(container.node, { height: container.node.scrollHeight, duration: .5, ease: 'power.inOut' });
            localScope.label = 'collapse';
          } else {
            gsap.to(container.node, { height: 80, duration: .5, ease: 'power.inOut' });
            localScope.label = 'expand';
          }
        }
      }
    }, localScope);
  });
};
