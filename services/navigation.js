export default (Scope) => {
  Scope.export = {
    subNavItems: [],
    setSubNavItems: function (items) {
      this.subNavItems = items;
    }
  };
};
