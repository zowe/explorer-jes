/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import ErrorIcon from '@material-ui/icons/Error';
import ConnectedFilter from './Filters';
import RefreshIcon from '../components/RefreshIcon';
import { fetchJobs } from '../actions/jobNodes';
import { LOADING_MESSAGE } from '../reducers/filters';
import FullHeightTree from './FullHeightTree';
import JobInstance from '../components/JobInstance';

const NO_JOBS_FOUND_MESSAGE = 'No jobs found';

class JobNodeTree extends React.Component {
    componentWillReceiveProps(nextProps) {
        const { owner, dispatch, isFetching } = this.props;
        if (!isFetching && owner === LOADING_MESSAGE && nextProps.owner && nextProps.owner !== LOADING_MESSAGE) {
            dispatch(fetchJobs(nextProps));
        }
    }

    getFilterValues() {
        const { owner, prefix, jobId, status } = this.props;
        let filtersString = `Owner= ${owner} Prefix= ${prefix || '*'} JobId= ${jobId}`;
        if (status) { filtersString += ` Status= ${status}`; }
        return filtersString;
    }

    renderJobs() {
        const { jobs, dispatch } = this.props;
        if (jobs && jobs.size >= 1) {
            return jobs.map(job => {
                return (
                    <JobInstance key={job.get('label')} job={job} dispatch={dispatch} />
                );
            });
        }
        return (
            <div className="job-instance">
                <li>
                    <ErrorIcon className="node-icon" />
                    <span className="job-label">{NO_JOBS_FOUND_MESSAGE}</span>
                </li>
            </div>);
    }

    render() {
        const { dispatch, isFetching } = this.props;
        return (
            <Card class="tree-card">
                <CardHeader subheader={this.getFilterValues()} />
                <CardContent id="tree-text-content">
                    <ConnectedFilter />
                    <RefreshIcon
                        isFetching={isFetching}
                        submitAction={() => { return dispatch(fetchJobs(this.props)); }}
                        dispatch={dispatch}
                    />
                    <FullHeightTree >
                        <ul id="job-list">
                            {this.renderJobs()}
                        </ul>
                    </FullHeightTree>
                </CardContent>

            </Card>
        );
    }
}

JobNodeTree.propTypes = {
    prefix: PropTypes.string,
    owner: PropTypes.string,
    jobId: PropTypes.string,
    status: PropTypes.string,
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
        jobId: filtersRoot.get('jobId'),
        status: filtersRoot.get('status'),
        isFetching: jobNodesRoot.get('isFetching'),
        jobs: jobNodesRoot.get('jobs'),
    };
}

const ConnectedJobNodeTree = connect(mapStateToProps)(JobNodeTree);
export default ConnectedJobNodeTree;
