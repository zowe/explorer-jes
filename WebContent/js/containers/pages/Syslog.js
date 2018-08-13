/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

import React from 'react';
import SyslogCardComponent from '../SyslogCard';
import ConnectedSnackbar from '../../components/Snackbar';

const SyslogView = () => {
    return (
        <div id="content" className="row group">
            <div id="job-content-container" className="col col-12">
                <SyslogCardComponent fullScreen={true} />
            </div>
            <ConnectedSnackbar />
        </div>
    );
};
export default SyslogView;
