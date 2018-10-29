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
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import CircularProgress from 'material-ui/CircularProgress';
import RightArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import { Card, CardText } from 'material-ui/Card';
import ConnectedNodeViewer from '../NodeViewer';
import ConnectedSnackbar from '../../components/Snackbar';
import { validateUser } from '../../actions/validation';

class FullScreenViewer extends React.Component {
    constructor() {
        super();
        this.getTreeQueryParams = this.getTreeQueryParams.bind(this);
    }

    componentWillMount() {
        const { dispatch, validated } = this.props;
        if (!validated) {
            dispatch(validateUser());
        }
    }

    getTreeQueryParams() {
        const { location } = this.props;
        if (location && location.query) {
            if (location.query.jobName && location.query.jobId && location.query.fileId) {
                return `?prefix=${location.query.jobName}&jobId=${location.query.jobId}&fileId=${location.query.fileId}`;
            }
        }
        return '';
    }

    render() {
        const { validated, isValidating, location } = this.props;
        if (validated) {
            return (
                <div className="row group">
                    <Link to={`/${this.getTreeQueryParams()}`}>
                        <Card
                            className="component col col-0-2"
                            containerStyle={{ paddingBottom: 'inherit' }}
                        >
                            <CardText style={{ paddingLeft: 'inherit' }}>
                                <RightArrow className="card-action" />
                            </CardText>
                        </Card>
                    </Link>
                    <div className="component col col-11-8">
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

FullScreenViewer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    validated: PropTypes.bool.isRequired,
    isValidating: PropTypes.bool.isRequired,
    location: PropTypes.shape({
        query: PropTypes.shape({
            jobName: PropTypes.string.isRequired,
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

const ConnectedFullScreenViewer = connect(mapStateToProps)(FullScreenViewer);
export default ConnectedFullScreenViewer;
