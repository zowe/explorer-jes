/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

/* global document */

// Needed for onTouchTap in Material UI - remove when React implements
// http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
import 'whatwg-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import DarkView from './containers/views/DarkView';
import LightView from './containers/views/LightView';
import JobsView from './containers/pages/Jobs';
import FullScreenView from './containers/pages/FullScreen';
import SyslogView from './containers/pages/Syslog';

injectTapEventPlugin();

ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/" component={() => { return <DarkView View={JobsView} />; }} />
        <Route path="/viewer" component={() => { return <DarkView View={FullScreenView} />; }} />
        <Route path="/syslog" component={() => { return <DarkView View={SyslogView} />; }} />
        <Route path="/hc" component={() => { return <LightView View={JobsView} />; }} />
        <Route path="/hc/viewer" component={() => { return <LightView View={FullScreenView} />; }} />
        <Route path="/hc/syslog" component={() => { return <LightView View={SyslogView} />; }} />
    </Router>
    , document.getElementById('app'));
