/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
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

// uncomment to enable redux dev tool in development
const store = applyMiddleware(thunk, createLogger())(createStore)(rootReducer, Map({}),
    //  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

// TODO: Need webpack changes to disable console log state changes
// const store = createStore(rootReducer, Map({}), applyMiddleware(thunk));

const theme = createMuiTheme({
    overrides: {
        MuiCard: {
            root: {
                backgroundColor: '#F5F8F8',
            },
        },
        MuiExpansionPanel: {
            root: {
                backgroundColor: '#F5F8F8',
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
