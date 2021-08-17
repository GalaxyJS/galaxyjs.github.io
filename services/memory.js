const reducers = {
  do: (state) => {
    return {
      ...state,
      do: 'sadasdasdasd'
    };
  }
};

const store = window.Redux.createStore((state, action) => {
  if (reducers.hasOwnProperty(action.type)) {
    return reducers[action.type].call(null, state);
  }

  return state;
}, {}, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

Scope.export = store;
