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
import ConentViewer from '../ContentViewer';
import Snackbar from '../../components/Snackbar';
import LoginDialog from '../../components/dialogs/LoginDialog';

class FullScreenViewer extends React.Component {
    componentDidUpdate(prevProps) {
        const { title } = this.props; // title from content state

        // Update HTML title if it was changed
        if (prevProps.title !== this.props.title) {
            document.title = title;
        }
    }

    render() {
        const { validated, location } = this.props;
        if (validated) {
            return (
                <div role="main" className="row group">
                    <div id="explorer-viewer-full" className="component col col-12">
                        <ConentViewer locationSearch={location.search} />
                    </div>
                    <Snackbar />
                </div>
            );
        }
        return <LoginDialog />;
    }
}

FullScreenViewer.propTypes = {
    validated: PropTypes.bool.isRequired,
    location: PropTypes.shape({
        search: PropTypes.string,
    }),
    title: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
    const validationRoot = state.get('validation');
    const contentRoot = state.get('content');
    return {
        validated: validationRoot.get('validated'),
        isValidating: validationRoot.get('isValidating'),
        title: contentRoot.get('title'),
    };
}

const ConnectedFullScreenViewer = connect(mapStateToProps)(FullScreenViewer);
export default ConnectedFullScreenViewer;
