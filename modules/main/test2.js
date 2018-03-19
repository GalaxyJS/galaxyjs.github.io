const data = {
  personNull: null,
  person: {
    name: 'Alex'
  }
};

const gv = Galaxy.GalaxyView;

console.info('data', data);
gv.walk(data);
