/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
 */

import React from 'react';
import ConnectedRealtimeContentViewer from '../components/RealtimeContentViewer';

const SyslogViewer = props => {
    return (
        <ConnectedRealtimeContentViewer
            languageSyntax="syslog"
            contentURI="syslog"
            {...props}
        />);
};
export default SyslogViewer;

