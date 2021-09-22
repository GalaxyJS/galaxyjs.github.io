function blurEffectGenerator() {
  const viewNode = this;
  const node = viewNode.node;

  viewNode.rendered.then(() => {
    if (node.complete) {
      load();
    } else {
      node.addEventListener('load', load);
    }

    function load() {
      const parent = node.parentNode;
      const height = 90;
      const offset = 0;

      const blurPanel = document.createElement('span');
      const style = blurPanel.style;
      style.backgroundColor = 'rgba(255, 255, 255, .2)';
      style.position = 'absolute';
      style.overflow = 'hidden';

      const img = document.createElement('span');
      const imgStyle = img.style;
      imgStyle.position = 'absolute';
      imgStyle.width = 'calc(100% + 40px)';
      imgStyle.height = 'calc(100% + 40px)';
      imgStyle.margin = '-20px';
      imgStyle.backgroundImage = 'url(' + node.src + ')';
      imgStyle.backgroundRepeat = 'repeat';
      imgStyle.filter = 'blur(8px)';
      blurPanel.appendChild(img);

      const cover = document.createElement('span');
      const coverStyle = cover.style;
      coverStyle.position = 'absolute';
      coverStyle.width = 'calc(100% + 20px)';
      coverStyle.height = 'calc(100% + 20px)';
      coverStyle.margin = '-10px';
      coverStyle.backgroundColor = '#000';
      coverStyle.opacity = '.04';
      blurPanel.appendChild(cover);

      parent.insertBefore(blurPanel, node);
      update();

      function update(i) {
        style.left = (node.offsetLeft + offset) + 'px';
        style.top = (node.offsetTop + node.offsetHeight - height) + 'px';
        style.width = (node.offsetWidth - (offset * 2)) + 'px';
        style.height = (height - offset) + 'px';
        imgStyle.backgroundPosition = (20 - offset) + 'px ' + (height + 20) + 'px';
        imgStyle.backgroundSize = node.offsetWidth + 'px ' + node.offsetHeight + 'px';
        if (!viewNode.destroyed.resolved) {
          requestAnimationFrame(update);
        }
      }
    }
  });
  return 'active';
}

Scope.export = {
  getBlurCaption: function () {
    // action.watch = ['data.none'];

    return blurEffectGenerator;
  }
};
