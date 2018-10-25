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
import RightArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import { Card, CardText } from 'material-ui/Card';
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
        this.getLeftColumn = this.getLeftColumn.bind(this);
        this.toggleTreeCard = this.toggleTreeCard.bind(this);
    }

    componentWillMount() {
        const { dispatch, validated } = this.props;
        if (!validated) {
            dispatch(validateUser());
        }
    }

    getLeftColumn() {
        const treeColumns = this.state.treeVisible ? 'component col col-3' : 'component col col-0';
        if (this.state.treeVisible) {
            return (
                <div className={treeColumns}>
                    <JobNodeTreeComponent toggleTreeCard={this.toggleTreeCard} />
                </div>);
        }
        return (
            <Card
                className="component col col-0-2"
                containerStyle={{ paddingBottom: 'inherit' }}
                onClick={() => { this.toggleTreeCard(); }}
            >
                <CardText style={{ paddingLeft: 'inherit' }}>
                    <RightArrow className="card-action" />
                </CardText>
            </Card>);
    }

    toggleTreeCard() {
        this.setState({ treeVisible: !this.state.treeVisible });
    }

    render() {
        const { validated, isValidating } = this.props;
        if (validated) {
            const nodeViewerColumns = this.state.treeVisible ? 'component col col-9' : 'component col col-11-8';
            return (
                <div className="row group">
                    {this.getLeftColumn()}
                    <div className={nodeViewerColumns}>
                        <ConnectedNodeViewer />
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
