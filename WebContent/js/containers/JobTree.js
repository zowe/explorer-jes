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
import Announcer from '../components/Announcer';

const NO_JOBS_FOUND_MESSAGE = 'No jobs found';

class JobNodeTree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: null,
            filtersToggled: false,
        };
    }
    /* eslint-disable */
    componentWillReceiveProps(nextProps) {
        const { owner, dispatch, isFetching } = this.props;
        if (!isFetching && owner === LOADING_MESSAGE && nextProps.owner && nextProps.owner !== LOADING_MESSAGE) {
            dispatch(fetchJobs(nextProps));
        }
    }

    componentDidUpdate(prevProps) {
        const { isFetching: isFetchingCurrent } = this.props;
        const { isFetching: isFetchingPrev } = prevProps;
        if (isFetchingCurrent && !isFetchingPrev) {
            this.setState({ message: 'Jobs loading' });
        }
        if (!isFetchingCurrent && isFetchingPrev) {
            this.setState({ message: 'Jobs loaded' });
        }
    }

    getFilterValues() {
        const {
            owner,
            prefix,
            jobId,
            status,
        } = this.props;
        let filtersString = `Owner= ${owner} Prefix= ${prefix || '*'} JobId= ${jobId}`;
        if (status) { filtersString += ` Status= ${status}`; }
        return filtersString;
    }

    updateFiltersToggled = () => {
        /* eslint-disable */
        this.setState({ filtersToggled: !this.state.filtersToggled });
    };

    renderJobs() {
        const {
            jobs,
            isFetching,
            sortBy,
            dispatch,
            expand,
        } = this.props;
        let sortedJobs = jobs;
        if (sortBy === 'JOB ID') {
            sortedJobs = jobs.sort((a, b) => {
                return a.get('jobId') > b.get('jobId') ? 1 : -1;
            });
        } else if (sortBy === 'PREFIX') {
            sortedJobs = jobs.sort((a, b) => {
                return a.get('jobName') > b.get('jobName') ? 1 : -1;
            });
        }
        // const sortedJobs = jobs;
        if (sortedJobs && sortedJobs.size >= 1) {
            return sortedJobs.map((job, index) => {
                return (
                    <JobInstance key={job.get('label')} expand={expand} job={job} dispatch={dispatch} pos={index} size={jobs.size} />
                );
            });
        }
        if (!isFetching) {
            return (
                <div className="job-instance" role="none">
                    <li
                        role="treeitem"
                        aria-level="1"
                    >
                        <ErrorIcon className="node-icon" />
                        <span className="job-label">{NO_JOBS_FOUND_MESSAGE}</span>
                    </li>
                </div>);
        }
        return null;
    }

    render() {
        const { dispatch, isFetching, jobs } = this.props;
        const NOT_EXPANDED_FILTER_OFFSET_HEIGHT = 100;
        const EXPANDED_FILTER_OFFSET_HEIGHT = 333;
        return (
            <Card class="tree-card">
                <CardHeader subheader={this.getFilterValues()} />
                <div style={{
                    paddingRight: '33px',
                    textAlign: 'right',
                    color: '#2E77A1',
                    display: jobs.size > 0 ? '' : 'none',
                }}
                >
                    Jobs Found: 
                    {jobs.size}
                </div>
                <CardContent id="tree-text-content">
                    <ConnectedFilter updateFiltersToggledFunc={this.updateFiltersToggled} />
                    <RefreshIcon
                        isFetching={isFetching}
                        submitAction={() => { return dispatch(fetchJobs(this.props)); }}
                        dispatch={dispatch}
                    />
                    <FullHeightTree offset={this.state.filtersToggled ? EXPANDED_FILTER_OFFSET_HEIGHT : NOT_EXPANDED_FILTER_OFFSET_HEIGHT}>
                        <ul id="job-list" role="tree">
                            {this.renderJobs()}
                        </ul>
                    </FullHeightTree>
                </CardContent>
                <Announcer message={this.state.message} />
            </Card>
        );
    }
}

JobNodeTree.propTypes = {
    prefix: PropTypes.string,
    owner: PropTypes.string,
    jobId: PropTypes.string,
    status: PropTypes.string,
    sortBy: PropTypes.string,
    expand: PropTypes.bool,
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
        sortBy: filtersRoot.get('sortBy'),
        expand: filtersRoot.get('expand'),
        isFetching: jobNodesRoot.get('isFetching'),
        jobs: jobNodesRoot.get('jobs'),
    };
}

const ConnectedJobNodeTree = connect(mapStateToProps)(JobNodeTree);
export default ConnectedJobNodeTree;
