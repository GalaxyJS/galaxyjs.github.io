Scope.export = [
  {
    route: '/',
    redirectTo: '/404',
  },
  {
    route: '/:path',
    handle: (params) => {
      if (!document.querySelector('#' + params.path)) return;
      gsap.to('#main-content', { scrollTo: { y: '#' + params.path, offsetY: 30 }, duration: .3 });
    }
  }
];
