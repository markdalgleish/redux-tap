import { assert } from 'chai';
import { spy } from 'sinon';
import { createStore, applyMiddleware } from 'redux';
import tap from '../src';

describe('Given: A Store with redux-tap middleware', () => {
  let store;
  let selectorSpy;
  let callbackSpy;

  beforeEach(() => {
    callbackSpy = spy();
    selectorSpy = spy();
    const selector = (...args) => {
      selectorSpy(...args);
      const { meta } = args[0];
      return meta && meta.foobar;
    };
    const createStoreWithMiddleware = applyMiddleware(tap(selector, callbackSpy))(createStore);
    const initialState = { name: 'jane smith', loggedIn: false };
    const reducer = (state = initialState, action) => {
      switch (action.type) {
        case 'LOGIN': {
          return { ...state, loggedIn: true };
        }

        default: {
          return state;
        }
      }
    }
    store = createStoreWithMiddleware(reducer, initialState);
  });

  describe('When: An action with selected meta is dispatched', () => {
    beforeEach(() => store.dispatch({
      type: 'LOGIN',
      meta: { foobar: 'payload' }
    }));

    it('Then: It should invoke the selector with the action', () => {
      const [ action ] = selectorSpy.getCall(0).args;
      assert.deepEqual(action, {
        type: 'LOGIN',
        meta: { foobar: 'payload' }
      });
    });

    it('Then: It should invoke the callback with the selected value as the first argument', () => {
      const [ meta ] = callbackSpy.getCall(0).args;
      assert.deepEqual(meta, 'payload');
    });

    it('Then: It should invoke the callback with the action as the second argument', () => {
      const [ _, action ] = callbackSpy.getCall(0).args;
      assert.deepEqual(action, {
        type: 'LOGIN',
        meta: { foobar: 'payload' }
      });
    });

    it('Then: It should invoke the callback with the store as the third argument', () => {
      const [ _, __, callbackStore ] = callbackSpy.getCall(0).args;
      const { getState, dispatch } = callbackStore;
      assert.equal(typeof getState, 'function');
      assert.equal(typeof dispatch, 'function');
    });
  });

  describe('When: An action that does not match the selector is dispatched', () => {
    beforeEach(() => store.dispatch({
      type: 'LOGIN',
      meta: { not: 'selected' }
    }));

    it('Then: It should invoke the selector with the action', () => {
      const [ action ] = selectorSpy.getCall(0).args;
      assert.deepEqual(action, {
        type: 'LOGIN',
        meta: { not: 'selected' }
      });
    });

    it('Then: It should not invoke the callback', () => {
      assert.equal(callbackSpy.callCount, 0);
    });

    it('Then: It should not interrupt the action', () => {
      assert.deepEqual(store.getState(), { name: 'jane smith', loggedIn: true });
    });
  });
});

describe('Given: A Store with redux-tap middleware with an invalid selector', () => {

  let store;
  let callbackSpy;

  beforeEach(() => {
    callbackSpy = spy();
    const selector = 'invalid';
    const createStoreWithMiddleware = applyMiddleware(tap(selector, callbackSpy))(createStore);
    const initialState = { name: 'jane smith', loggedIn: false };
    const reducer = (state = initialState, action) => {
      switch (action.type) {
        case 'LOGIN': {
          return { ...state, loggedIn: true };
        }

        default: {
          return state;
        }
      }
    }
    store = createStoreWithMiddleware(reducer, initialState);
  });

  describe('When: An action is dispatched', () => {
    beforeEach(() => store.dispatch({
      type: 'LOGIN'
    }));

    it('Then: It should not invoke the callback', () => {
      assert.equal(callbackSpy.callCount, 0);
    });

    it('Then: It should not interrupt the action', () => {
      assert.deepEqual(store.getState(), { name: 'jane smith', loggedIn: true });
    });
  });
});
