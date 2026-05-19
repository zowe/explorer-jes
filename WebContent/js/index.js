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

const store = appMiddleware(createStore)(rootReducer, Map({}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#818cf8',
            dark: '#6366f1',
            light: '#a5b4fc',
        },
        secondary: {
            main: '#a78bfa',
        },
        background: {
            default: '#06060f',
            paper: '#0f1022',
        },
        text: {
            primary: '#eef0ff',
            secondary: '#8b8fba',
            disabled: '#5a5d8a',
        },
        divider: 'rgba(99, 102, 241, 0.12)',
    },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        fontSize: 13,
    },
    shape: {
        borderRadius: 10,
    },
    overrides: {
        MuiCssBaseline: {
            '@global': {
                body: {
                    backgroundColor: '#06060f',
                    color: '#eef0ff',
                },
            },
        },
        MuiCard: {
            root: {
                backgroundColor: '#0a0a1a',
                borderRadius: 0,
                boxShadow: 'none',
            },
        },
        MuiAccordion: {
            root: {
                backgroundColor: '#0f1022',
                '&::before': {
                    display: 'none',
                },
            },
        },
        MuiAccordionSummary: {
            root: {
                color: '#eef0ff',
            },
        },
        MuiTypography: {
            body1: {
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                fontWeight: 400,
                fontSize: '0.875rem',
                color: '#eef0ff',
            },
            body2: {
                color: '#8b8fba',
            },
        },
        MuiButton: {
            root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 6,
            },
            containedPrimary: {
                background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                boxShadow: '0 2px 12px rgba(129, 140, 248, 0.3)',
                '&:hover': {
                    background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)',
                    boxShadow: '0 4px 20px rgba(129, 140, 248, 0.5)',
                },
            },
        },
        MuiIconButton: {
            root: {
                color: '#8b8fba',
                transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    backgroundColor: 'rgba(129, 140, 248, 0.1)',
                    color: '#818cf8',
                },
            },
        },
        MuiPaper: {
            root: {
                backgroundColor: '#0f1022',
            },
            elevation1: {
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            },
        },
        MuiCardHeader: {
            root: {
                color: '#eef0ff',
            },
            subheader: {
                color: '#5a5d8a',
            },
        },
        MuiTableCell: {
            root: {
                borderBottomColor: 'rgba(99, 102, 241, 0.08)',
                color: '#eef0ff',
            },
            head: {
                color: '#8b8fba',
                fontWeight: 600,
            },
        },
        MuiTableRow: {
            root: {
                '&:hover': {
                    backgroundColor: 'rgba(26, 28, 69, 0.5) !important',
                },
            },
        },
        MuiChip: {
            root: {
                borderRadius: 6,
            },
        },
        MuiTab: {
            root: {
                textTransform: 'none',
                fontWeight: 500,
                color: '#8b8fba',
                '&.Mui-selected': {
                    color: '#818cf8',
                },
            },
        },
        MuiTabs: {
            indicator: {
                backgroundColor: '#818cf8',
            },
        },
        MuiOutlinedInput: {
            root: {
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(99, 102, 241, 0.15)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(129, 140, 248, 0.4)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#818cf8',
                    borderWidth: 1,
                },
            },
            input: {
                color: '#eef0ff',
                '&::placeholder': {
                    color: '#5a5d8a',
                    opacity: 1,
                },
            },
        },
        MuiInputBase: {
            root: {
                color: '#eef0ff',
            },
        },
        MuiFormLabel: {
            root: {
                color: '#5a5d8a',
                '&.Mui-focused': {
                    color: '#818cf8',
                },
            },
        },
        MuiSelect: {
            icon: {
                color: '#5a5d8a',
            },
        },
        MuiMenu: {
            paper: {
                backgroundColor: '#151635',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: 10,
            },
        },
        MuiDialog: {
            paper: {
                backgroundColor: '#0f1022',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: 14,
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
            },
        },
        MuiDialogTitle: {
            root: {
                color: '#eef0ff',
            },
        },
        MuiDialogContent: {
            root: {
                color: '#eef0ff',
            },
        },
        MuiMenuItem: {
            root: {
                color: '#eef0ff',
                fontSize: '13px',
                '&:hover': {
                    backgroundColor: 'rgba(129, 140, 248, 0.08)',
                },
                '&.Mui-selected': {
                    backgroundColor: 'rgba(129, 140, 248, 0.12)',
                },
            },
        },
        MuiLinearProgress: {
            root: {
                borderRadius: 4,
                height: 2,
            },
            colorPrimary: {
                backgroundColor: 'rgba(26, 28, 69, 0.5)',
            },
            barColorPrimary: {
                backgroundColor: '#818cf8',
            },
        },
        MuiTableSortLabel: {
            root: {
                color: '#5a5d8a',
                '&:hover': {
                    color: '#8b8fba',
                },
                '&.MuiTableSortLabel-active': {
                    color: '#818cf8',
                },
            },
            icon: {
                color: '#5a5d8a !important',
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
    </MuiThemeProvider>,
    document.getElementById('app'),
);
