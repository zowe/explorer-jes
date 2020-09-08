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
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionActions from '@material-ui/core/AccordionActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import queryString from 'query-string';
import UpperCaseTextField from '../components/dialogs/UpperCaseTextField';
import { getStorageItem, setStorageItem, LAST_FILTERS } from '../utilities/storageHelper';

import { setFilters, resetFilters, setOwnerAndFetchJobs } from '../actions/filters';
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
        this.setFocusOnOwner = this.setFocusOnOwner.bind(this);
        this.applyValues = this.applyValues.bind(this);
        this.filterOwnerRef = null;
        this.handlePrefixChange = this.handlePrefixChange.bind(this);
        this.handleOwnerChange = this.handleOwnerChange.bind(this);
        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.handleJobIdChange = this.handleJobIdChange.bind(this);
        this.isOwnerAndPrefixWild = this.isOwnerAndPrefixWild.bind(this);
    }

    componentDidMount() {
        const { location, dispatch, owner, username } = this.props;
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

        const lastFilters = getStorageItem(LAST_FILTERS);
        if (lastFilters > '') {
            if (Object.keys(lastFilters).length > 0) {
                dispatch(setFilters(lastFilters));
                dispatch(fetchJobs(lastFilters));
            }
        } else if (owner === '' && (!location || !location.search || !location.search.includes('owner'))) {
            dispatch(setOwnerAndFetchJobs(username, this.props));
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
                        // eslint-disable-next-line no-console
                        console.warn(`Unknown app2app type=${data.dispatchType}`);
                }
            }
        }
        window.addEventListener('message', e => { receiveMessage(e); }, false);
        window.top.postMessage('iframeload', '*');
    }

    setFocusOnOwner() {
        if (this.filterOwnerRef) {
            this.filterOwnerRef.focusTextInput();
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
        const { username, dispatch } = this.props;
        dispatch(resetFilters(username));
    }

    applyValues(e) {
        const { dispatch, owner, prefix, status, jobId } = this.props;
        e.preventDefault();
        this.toggleFilters();

        setStorageItem(LAST_FILTERS, JSON.stringify({ owner, prefix, status, jobId }));
        dispatch(fetchJobs(this.props));
    }

    toggleFilters() {
        const { updateFiltersToggledFunc } = this.props;
        this.setState({ toggled: !this.state.toggled });
        if (updateFiltersToggledFunc) {
            updateFiltersToggledFunc();
        }
    }

    render() {
        const { prefix, owner, status, jobId } = this.props;
        return (
            <Accordion
                id="filter-view"
                expanded={this.state.toggled}
            >
                <AccordionSummary
                    id="filter-view-header"
                    expandIcon={<ExpandMoreIcon />}
                    onClick={() => { this.toggleFilters(); }}
                >
                    Job Filters
                </AccordionSummary>
                <form
                    role="search"
                    aria-label="Job Filters"
                    id="filter-form"
                    onSubmit={e => { return this.applyValues(e); }}
                >
                    <AccordionDetails style={{ display: 'block' }}>
                        <UpperCaseTextField
                            id="filter-owner-field"
                            label="Owner"
                            value={owner}
                            error={owner.trim() === ''}
                            fieldChangedCallback={this.handleOwnerChange}
                            style={{ width: '50%' }}
                            disabled={!this.state.toggled}
                            ref={elem => { this.filterOwnerRef = elem; return this.filterOwnerRef; }}
                        />
                        <UpperCaseTextField
                            id="filter-prefix-field"
                            label="Prefix"
                            value={prefix}
                            error={prefix.trim() === ''}
                            fieldChangedCallback={this.handlePrefixChange}
                            style={{ width: '50%' }}
                            disabled={!this.state.toggled}
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
                                disabled={!this.state.toggled}
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
                                    disabled={!this.state.toggled}
                                >
                                    <MenuItem key="*" value="*">*</MenuItem>
                                    {Filters.renderStatusOptions()}
                                </Select>
                            </FormControl>
                        </div>
                    </AccordionDetails>
                    <AccordionActions>
                        <Button
                            id="filters-apply-button"
                            variant="contained"
                            color="primary"
                            primary={'true'}
                            type="submit"
                            disabled={!this.state.toggled}
                        >
                        APPLY
                        </Button>
                        <Button
                            id="filters-reset-button"
                            variant="contained"
                            color="secondary"
                            onClick={this.resetValues}
                            disabled={!this.state.toggled}
                        >
                        RESET
                        </Button>
                    </AccordionActions>
                </form>
            </Accordion>
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
    username: PropTypes.string.isRequired,
    updateFiltersToggledFunc: PropTypes.func,
};

function mapStateToProps(state) {
    const filterRoot = state.get('filters');
    const validationRoot = state.get('validation');
    return {
        prefix: filterRoot.get('prefix'),
        owner: filterRoot.get('owner'),
        status: filterRoot.get('status'),
        jobId: filterRoot.get('jobId'),
        isToggled: filterRoot.get('isToggled'),
        username: validationRoot.get('username'),
    };
}

const ConnectedFilter = withRouter(connect(mapStateToProps)(Filters));
export default ConnectedFilter;
