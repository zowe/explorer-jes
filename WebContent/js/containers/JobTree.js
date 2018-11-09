/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import ConnectedFilter from './Filters';
import RefreshIcon from '../components/RefreshIcon';
import { fetchJobs } from '../actions/jobNodes';
import { LOADING_MESSAGE } from '../reducers/filters';
import FullHeightTree from './FullHeightTree';
import JobInstance from '../components/JobInstance';

export class JobNodeTree extends React.Component {
    componentWillReceiveProps(nextProps) {
        const { owner, dispatch } = this.props;
        if (owner === LOADING_MESSAGE && nextProps.owner && nextProps.owner !== LOADING_MESSAGE) {
            dispatch(fetchJobs(nextProps));
        }
    }

    getFilterValues() {
        const { owner, prefix, returnCode, status, type } = this.props;
        let filtersString = `Owner= ${owner} Prefix= ${prefix || '*'}`;
        if (returnCode) { filtersString += ` Return Code= ${ConnectedFilter.returnCodeToString(returnCode)}`; }
        if (status) { filtersString += ` Status= ${status}`; }
        if (type) { filtersString += ` Type= ${type}`; }
        return filtersString;
    }

    renderJobs() {
        const { jobs, dispatch } = this.props;
        return jobs.map(job => {
            return (
                <JobInstance key={job.get('label')} job={job} dispatch={dispatch} />
            );
        });
    }

    render() {
        const { dispatch, isFetching } = this.props;
        return (
            <Card class="tree-card" containerStyle={{ paddingBottom: 0 }}>
                <CardHeader subtitle={this.getFilterValues()} />
                <CardText id="tree-text-content">
                    <ConnectedFilter />
                    <RefreshIcon
                        isFetching={isFetching}
                        submitAction={() => { return dispatch(fetchJobs(this.props)); }}
                        dispatch={dispatch}
                    />
                    <FullHeightTree >
                        <ul>
                            {this.renderJobs()}
                        </ul>
                    </FullHeightTree>
                </CardText>

            </Card>
        );
    }
}

JobNodeTree.propTypes = {
    prefix: PropTypes.string,
    owner: PropTypes.string,
    returnCode: PropTypes.string,
    status: PropTypes.string,
    type: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
    jobs: PropTypes.instanceOf(List),
};

function mapStateToProps(state) {
    const filtersRoot = state.get('filters');
    const jobNodesRoot = state.get('jobNodes');
    return {
        prefix: filtersRoot.get('prefix'),
        owner: filtersRoot.get('owner'),
        returnCode: filtersRoot.get('returnCode'),
        status: filtersRoot.get('status'),
        type: filtersRoot.get('type'),
        isFetching: jobNodesRoot.get('isFetching'),
        jobs: jobNodesRoot.get('jobs'),
    };
}

const ConnectedJobNodeTree = connect(mapStateToProps)(JobNodeTree);
export default ConnectedJobNodeTree;
