[![Build Status](https://img.shields.io/travis/markdalgleish/redux-tap/master.svg?style=flat-square)](http://travis-ci.org/markdalgleish/redux-tap) [![Coverage Status](https://img.shields.io/coveralls/markdalgleish/redux-tap/master.svg?style=flat-square)](https://coveralls.io/r/markdalgleish/redux-tap) [![npm](https://img.shields.io/npm/v/redux-tap.svg?style=flat-square)](https://www.npmjs.com/package/redux-tap)

# redux-tap

Simple side-effect middleware for [Redux](https://github.com/reactjs/redux).

```bash
$ npm install --save redux-tap
```

## Usage

```js
import { createStore, applyMiddleware } from 'redux';
import tap from 'redux-tap';
import rootReducer from './reducers';

// For example, select any action with metadata:
const selectMeta = action => action.meta;

// Once selected, access the selected value, action and current state:
const middleware = tap(selectMeta, (meta, action, state) => {
  // In this case, we'll simply log to the console:
  console.log(meta, action, state);
});

// Note: this API requires redux@>=3.1.0
const store = createStore(
  rootReducer,
  applyMiddleware(middleware)
);
```

As a real-world example, you can use redux-tap to declaratively track analytics events:

```js
import { createStore, applyMiddleware } from 'redux';
import tap from 'redux-tap';
import rootReducer from './reducers';
import { track } from 'my-analytics-lib';

const selectAnalytics = ({ meta }) => meta && meta.analytics;
const middleware = tap(selectAnalytics, ({ event, data }) => {
  track(event, data);
});

const store = createStore(
  rootReducer,
  applyMiddleware(middleware)
);

// Now, you can declare analytics metadata on any action:
dispatch({
  type: 'REPO_STARRED',
  payload: { id },
  meta: {
    analytics: {
      event: 'Repo Starred',
      data: { id }
    }
  }
});
```

## License

[MIT License](http://markdalgleish.mit-license.org/)
