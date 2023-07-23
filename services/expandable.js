const expandable = function () {
  const container = this;
  container.rendered.then(() => {
    container.node.style.position = 'relative';
    container.node.style.overflow = 'hidden';

    container.node.style.height = '80px';

    let toggle = false;
    const expandHTML = '<i class="fas fa-expand"></i><span>Expand</span>';
    const collapseHTML = '<i class="fas fa-minus"></i><span>Collapse</span>';
    const localScope = {
      label: expandHTML
    };
    container.createNode({
      style: {
        position: 'absolute',
        top: '15px',
        right: '15px'
      },
      class: 'nocode',
      tag: 'button',
      html: '<>label',
      on: {
        click: function (event) {
          event.preventDefault();
          toggle = !toggle;
          if (toggle) {
            gsap.to(container.node, { height: container.node.scrollHeight, duration: .5, ease: 'power.inOut' });
            localScope.label = collapseHTML;
          } else {
            gsap.to(container.node, { height: 80, duration: .5, ease: 'power.inOut' });
            localScope.label = expandHTML;
          }
        }
      }
    }, localScope);
  });
};

export { expandable };
