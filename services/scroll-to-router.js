export default (Scope) => {
  Scope.export = {
    path: '/:section',
    hidden: true,
    handle: (params) => {
      if (!document.querySelector('#' + params.section)) {
        return true;
      }

      gsap.to('#main-content', { scrollTo: { y: '#' + params.section, offsetY: 30 }, duration: .3 });
      return true;
    }
  };
};
