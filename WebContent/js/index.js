/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import { Map } from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, HashRouter, Switch } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { ThemeProviderWrapper } from './themes/ThemeContext';
import rootReducer from './reducers';
import JobsView from './containers/pages/Jobs';
import FullScreenView from './containers/pages/FullScreen';
import { getStorageItem, ENABLE_REDUX_LOGGER } from './utilities/storageHelper';

// redux dev tool extension enabled
let appMiddleware;
if (getStorageItem(ENABLE_REDUX_LOGGER) === true) {
    appMiddleware = applyMiddleware(thunk, createLogger());
} else {
    appMiddleware = applyMiddleware(thunk);
}

const store = appMiddleware(createStore)(rootReducer, Map({}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

ReactDOM.render(
    <ThemeProviderWrapper>
        <Provider store={store}>
            <HashRouter>
                <Switch>
                    <Route exact={true} path="/" component={JobsView} />
                    <Route path="/jobs" component={JobsView} />
                    <Route path="/viewer" component={FullScreenView} />
                </Switch>
            </HashRouter>
        </Provider>
    </ThemeProviderWrapper>,
    document.getElementById('app'),
);
