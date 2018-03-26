const data = {
  property: 'some property',
  title: 'data-1 title',
  __portal__: {
    id: 'Scope.data',
    refs: [
      'Scope.data', 'Scope.data2.set1'
    ],
    nodesMap: {
      property: {
        keys: ['text'],
        nodes: ['h1']
      }
    },
    shadow: {
      property: null
    }
  }
};

const data2 = {
  set1: data,
  title: 'data-2 title',
  list: [
    {
      n: 1
    },
    {
      n: 2
    }
  ],

  __portal__: {
    id: 'Scope.data2',
    refs: ['Scope.data2'],
    nodesMap: {},
    shadow: {
      set1: {
        id: 'Scope.data2.set1',
        nodesMap: {},
        // refs is the same array in Scope.data and Scope.data2.set1
        refs: [
          'Scope.data',
          'Scope.data2.set1'
        ],
        // This shadow is custom to Scope.data2.set1
        // This is the main difference to the old architecture
        shadow: {
          property: {
            id: 'Scope.data.set1.property',
            keys: ['h2'],
            nodes: [],
            shadow: null
          }
        }
      },
      title: null
    }
  }
};

const Scope = {
  data: data,
  data2: data2,
  activeData: null,

  __portal__: {
    id: 'Scope',
    refs: [],
    nodesMap: {
      activeData: {
        keys: ['text'],
        nodes: ['pre']
      }
    },
    shadow: {
      data: {
        // Parent should be also notified when a property changes
        // You can think of cases where a property is an object and that property is bound to ui node that shows
        // the stringify of the property value
        parent: 'Scope',
        id: 'Scope.data',
        // refs is the same array in Scope.data and Scope.data2.set1
        refs: [
          'Scope.data',
          'Scope.data2.set1'
        ],
        nodesMap: {
          property: {
            keys: ['text'],
            nodes: ['h1']
          }
        },
        shadow: {
          property: null
        }
      },
      data2: {
        id: 'Scope.data2',
        parents: [],
        nodeMaps: {},
        shadow: {
          set1: {
            id: 'Scope.data2.set1',
            nodes: [],
            // refs is the same array in Scope.data and Scope.data2.set1
            refs: [
              'Scope.data',
              'Scope.data2.set1'
            ],
            // This shadow is custom to Scope.data2.set1
            // This is the main difference to the old architecture
            shadow: {
              property: {
                id: 'Scope.data.set1.property',
                keys: ['h2'],
                nodes: [],
                shadow: null
              }
            }
          }
        }
      },
      activeData: {
        id: 'Scope.activeData',
        nodesMap: {
          title: {
            keys: ['text'],
            nodes: ['p']
          }
        },
        refs: ['Scope.activeData'],
        shadow: {
          title: 'string'
        }
      }
    }
  }
};

function assignProcess(key /* set1 */, value /* data */) {
  const valuePortal = value.__portal__;
  const portal = this.__portal__;

  const newParents = portal.getPropertiesByKey(key);
  valuePortal.addParent(newParents);
}

Scope.data = {
  property: 'New'
};

function replaceProcess(key /* data */, value /* { property: 'New' }*/) {
  const portal = this.__portal__;
  const oldValue = this[key];
  const oldValuePortal = oldValue ? oldValue.__portal__ : null;
  const self = portal.parents[0];

  // here are 2 ways to handle new value object
  // Update all the references - WRONG
  // delete oldValue.__portal__;
  // this.setPortalFor(value, oldValuePortal);

  // or data and set1 get separated
  const propertyShadow = self.shadow[key];
  oldValuePortal.removeParent(propertyShadow);

  // const interlinks = propertyShadow.nodes.filter(/*allNonViewNodes*/);
  // oldValuePortal.removeParent(propertyShadow);

  const newPortal = new Portal();
  newPortal.addParent(propertyShadow);
  this.setPortalFor(value, newPortal);
}

function replaceProcess2(value /* { property: 'New' }*/) {
  const portal = this.__portal__;
  const oldValue = this['set1'];
  const oldValuePortal = oldValue ? oldValue.__portal__ : null;
  const self = portal.parents[0];

  // or data and set1 get separated
  const propertyShadow = self.shadow['set1'];
  oldValuePortal.removeParent(propertyShadow);

  const newPortal = new Portal();
  newPortal.addParent(propertyShadow);
  this.setPortalFor(value, newPortal);
}

// Define properties on the shadow and if there is a value available, define those properties on the value as well

