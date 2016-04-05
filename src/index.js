const isFunction = x => typeof x === 'function';

export default (selector, callback) => store => next => action => {
  const returnValue = next(action);

  if (!isFunction(selector)) {
    return returnValue;
  }

  const selected = selector(action);

  if (!selected) {
    return returnValue;
  }

  callback(selected, action, store.getState());

  return returnValue;
};
