/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

/* global document */
import 'whatwg-fetch';

import { Map } from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, HashRouter, Switch } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
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

const store = appMiddleware(createStore)(rootReducer, Map({}),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

const theme = createMuiTheme({
    overrides: {
        MuiCard: {
            root: {
                backgroundColor: '#F5F8F8',
            },
        },
        MuiAccordion: {
            root: {
                backgroundColor: '#F5F8F8',
            },
        },
        MuiTypography: {
            body1: {
                fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '0.875rem',
            },
        },
    },
});

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <Provider store={store}>
            <HashRouter>
                <Switch>
                    <Route exact={true} path="/" component={JobsView} />
                    <Route path="/jobs" component={JobsView} />
                    <Route path="/viewer" component={FullScreenView} />
                </Switch>
            </HashRouter>
        </Provider>
    </MuiThemeProvider>
    , document.getElementById('app'));
