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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import CircularProgress from 'material-ui/CircularProgress';
import JobNodeTreeComponent from '../JobNodeTree';
import ConnectedNodeViewer from '../NodeViewer';
import ConnectedSnackbar from '../../components/Snackbar';
import { validateUser } from '../../actions/validation';

class JobsView extends React.Component {
    constructor() {
        super();
        this.state = {
            treeVisible: true,
        };
    }

    componentWillMount() {
        const { dispatch, validated } = this.props;
        if (!validated) {
            dispatch(validateUser());
        }
    }

    render() {
        const { validated, isValidating, location } = this.props;
        if (validated) {
            return (
                <div className="row group">
                    <div className="component col col-3">
                        <JobNodeTreeComponent />
                    </div>
                    <div className="component col col-9">
                        <ConnectedNodeViewer locationQuery={location.query} />
                    </div>
                    <ConnectedSnackbar />
                </div>
            );
        }
        if (isValidating) {
            return (<CircularProgress />);
        }
        return (<div className="vertical-horizontal-center">Unable to Authenticate</div>);
    }
}

JobsView.propTypes = {
    dispatch: PropTypes.func.isRequired,
    validated: PropTypes.bool.isRequired,
    isValidating: PropTypes.bool.isRequired,
    location: PropTypes.shape({
        query: PropTypes.shape({
            prefix: PropTypes.string,
            jobName: PropTypes.string,
            jobId: PropTypes.string.isRequired,
            fileId: PropTypes.string.isRequired,
        }),
    }),
};

function mapStateToProps(state) {
    const validationRoot = state.get('validation');
    return {
        validated: validationRoot.get('validated'),
        isValidating: validationRoot.get('isValidating'),
    };
}

const ConnectedJobs = connect(mapStateToProps)(JobsView);
export default ConnectedJobs;
