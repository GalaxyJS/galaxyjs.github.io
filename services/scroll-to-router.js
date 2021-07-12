Scope.export = {
  '/': '/404',
  '/:path': function (params) {
    if (!document.querySelector('#' + params.path)) return;
    gsap.to('#main-content', { scrollTo: { y: '#' + params.path, offsetY: 30 }, duration: .3 });
  }
};
