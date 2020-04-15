/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import JobTree from '../JobTree';
import ConnectedContentViewer from '../ContentViewer';
import LoginDialog from '../../components/dialogs/LoginDialog';
import ConnectedSnackbar from '../../components/Snackbar';

const HomeView = props => {
    const { validated } = props;
    if (validated) {
        return (
            <div className="row group">
                <div className="component col col-3">
                    <JobTree />
                </div>
                <div className="component col col-9">
                    <ConnectedContentViewer />
                </div>
                <ConnectedSnackbar />
            </div>
        );
    }
    return <LoginDialog />;
};

HomeView.propTypes = {
    validated: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    const validationRoot = state.get('validation');
    return {
        validated: validationRoot.get('validated'),
        isValidating: validationRoot.get('isValidating'),
    };
}

const ConnectedHomeView = connect(mapStateToProps)(HomeView);
export default ConnectedHomeView;
