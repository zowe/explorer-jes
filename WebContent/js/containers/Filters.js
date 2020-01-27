/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import queryString from 'query-string';
import UpperCaseTextField from '../components/dialogs/UpperCaseTextField';

import { setFilters, resetFilters, initialiseOwnerFilter } from '../actions/filters';
import { fetchJobs } from '../actions/jobNodes';

const STATUS_TYPES = ['ACTIVE', 'INPUT', 'OUTPUT'];

export class Filters extends React.Component {
    static renderStatusOptions() {
        return STATUS_TYPES.map(status => {
            return <MenuItem id={`status-${status}`} key={status} value={status}>{status}</MenuItem>;
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            toggled: false,
        };
        this.toggleFilters = this.toggleFilters.bind(this);
        this.resetValues = this.resetValues.bind(this);
        this.applyValues = this.applyValues.bind(this);

        this.handlePrefixChange = this.handlePrefixChange.bind(this);
        this.handleOwnerChange = this.handleOwnerChange.bind(this);
        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.handleJobIdChange = this.handleJobIdChange.bind(this);
        this.isOwnerAndPrefixWild = this.isOwnerAndPrefixWild.bind(this);
    }

    componentWillMount() {
        const { location, dispatch } = this.props;
        if (location && location.search) {
            const urlQueryParams = queryString.parse(location.search);

            if (Object.keys(urlQueryParams).length > 0) {
                const queryFilters = {};
                Object.keys(urlQueryParams).forEach(filter => {
                    if (['owner', 'prefix', 'jobId', 'status'].indexOf(filter) > -1) {
                        queryFilters[filter] = urlQueryParams[filter].toUpperCase();
                    }
                });
                if (Object.keys(queryFilters).length > 0) {
                    dispatch(setFilters(queryFilters));
                    dispatch(fetchJobs(queryFilters));
                }
            }
        }

        function receiveMessage(event) {
            const data = event.data;
            let messageData;
            if (data && data.dispatchType && data.dispatchData) {
                switch (data.dispatchType) {
                    case 'launch':
                    case 'message': {
                        if (data.dispatchType === 'launch') {
                            if (data.dispatchData.launchMetadata) {
                                messageData = data.dispatchData.launchMetadata.data;
                            }
                        } else {
                            messageData = data.dispatchData.data;
                        }

                        if (messageData && messageData.owner && messageData.jobId) {
                            dispatch(setFilters(messageData));
                            dispatch(fetchJobs(messageData));
                        }
                        break;
                    }
                    default:
                        console.warn(`Unknown app2app type=${data.dispatchType}`);
                }
            }
        }
        window.addEventListener('message', e => { receiveMessage(e); }, false);
        window.top.postMessage('iframeload', '*');
    }

    componentDidMount() {
        const { owner, location, dispatch } = this.props;
        if (owner === '' && (!location || !location.search || !location.search.includes('owner'))) {
            dispatch(initialiseOwnerFilter());
        }
    }

    isOwnerAndPrefixWild() {
        const { prefix, owner } = this.props;
        return prefix === '*' && owner === '*';
    }

    handlePrefixChange(value) {
        const { dispatch } = this.props;
        dispatch(setFilters({
            prefix: value,
        }));
    }

    handleOwnerChange(value) {
        const { dispatch } = this.props;
        dispatch(setFilters({
            owner: value,
        }));
    }

    handleStatusChange(event) {
        const { dispatch } = this.props;
        dispatch(setFilters({
            status: event.target.value,
        }));
    }

    handleJobIdChange(value) {
        const { dispatch } = this.props;
        dispatch(setFilters({
            jobId: value,
        }));
    }

    resetValues() {
        const { dispatch } = this.props;
        dispatch(resetFilters());
    }

    applyValues(e) {
        const { dispatch } = this.props;
        e.preventDefault();
        this.toggleFilters();
        dispatch(fetchJobs(this.props));
    }

    toggleFilters() {
        this.setState({ toggled: !this.state.toggled });
    }

    render() {
        const { prefix, owner, status, jobId } = this.props;
        return (
            <ExpansionPanel
                id="filter-view"
                expanded={this.state.toggled}
            >
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    onClick={() => { this.toggleFilters(); }}
                >
                    Job Filters
                </ExpansionPanelSummary>
                <form
                    id="filter-form"
                    onSubmit={e => { return this.applyValues(e); }}
                >
                    <ExpansionPanelDetails style={{ display: 'block' }}>
                        <UpperCaseTextField
                            id="filter-owner-field"
                            label="Owner"
                            value={owner}
                            error={owner.trim() === ''}
                            fieldChangedCallback={this.handleOwnerChange}
                            style={{ width: '50%' }}
                        />
                        <UpperCaseTextField
                            id="filter-prefix-field"
                            label="Prefix"
                            value={prefix}
                            error={prefix.trim() === ''}
                            fieldChangedCallback={this.handlePrefixChange}
                            style={{ width: '50%' }}
                        />
                        {this.isOwnerAndPrefixWild() ? <label>Owner=* & Prefix=* may take a long time to load, APPLY to proceed</label> : <br />}
                        <div style={{ paddingTop: '5px' }}>
                            <UpperCaseTextField
                                id="filter-jobId-field"
                                label="Job ID"
                                value={jobId}
                                error={jobId.trim() === ''}
                                fieldChangedCallback={this.handleJobIdChange}
                                style={{ width: '50%' }}
                            />
                            <FormControl
                                style={{ width: '50%' }}
                                id="filter-status-field"
                            >
                                <InputLabel>Status</InputLabel>
                                <Select
                                    label="Status"
                                    value={status}
                                    onChange={this.handleStatusChange}
                                >
                                    <MenuItem key="*" value="*">*</MenuItem>
                                    {Filters.renderStatusOptions()}
                                </Select>
                            </FormControl>
                        </div>
                    </ExpansionPanelDetails>
                    <ExpansionPanelActions>
                        <Button
                            id="filters-apply-button"
                            variant="contained"
                            color="primary"
                            primary={'true'}
                            type="submit"
                        >
                        APPLY
                        </Button>
                        <Button
                            id="filters-reset-button"
                            variant="contained"
                            color="secondary"
                            onClick={this.resetValues}
                        >
                        RESET
                        </Button>
                    </ExpansionPanelActions>
                </form>
            </ExpansionPanel>
        );
    }
}

Filters.propTypes = {
    prefix: PropTypes.string,
    owner: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    jobId: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.shape({
        search: PropTypes.string,
    }),
};

function mapStateToProps(state) {
    const stateRoot = state.get('filters');
    return {
        prefix: stateRoot.get('prefix'),
        owner: stateRoot.get('owner'),
        status: stateRoot.get('status'),
        jobId: stateRoot.get('jobId'),
        isToggled: stateRoot.get('isToggled'),
    };
}

const ConnectedFilter = withRouter(connect(mapStateToProps)(Filters));
export default ConnectedFilter;
