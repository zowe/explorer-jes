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
import { withRouter } from 'react-router';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import { orange500 } from 'material-ui/styles/colors';
import UpperCaseTextField from '../components/dialogs/UpperCaseTextField';

import { toggleFilters, setFilters, resetFilters, initialiseOwnerFilter } from '../actions/filters';
import { fetchChildrenNoCheck } from '../actions/treeNodesJobs';
import { ibmBlueDark } from '../themes/ibmcolors';

const STATUS_TYPES = ['ACTIVE', 'INPUT', 'OUTPUT'];

export class Filters extends React.Component {
    static renderStatusOptions() {
        return STATUS_TYPES.map(status => {
            return <MenuItem key={status} value={status} primaryText={status} />;
        });
    }

    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
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
        if (location && Object.keys(location.query).length > 0) {
            const queryFilters = {};
            Object.keys(location.query).forEach(filter => {
                if (filter === 'prefix' || filter === 'jobId' || (filter === 'owner' && !('jobId' in location.query))) {
                    queryFilters[filter] = location.query[filter].toUpperCase();
                }
            });
            dispatch(setFilters(queryFilters));
            dispatch(fetchChildrenNoCheck(queryFilters));
        }
    }

    componentDidMount() {
        const { owner, location, dispatch } = this.props;
        if (owner === '' && !location.query.length > 0 && (!location.query.owner && !location.query.jobId)) {
            dispatch(initialiseOwnerFilter());
        }
    }

    getOwnerAndPrefixErrorText() {
        return this.isOwnerAndPrefixWild() ? ' ' : '';
    }

    isOwnerAndPrefixWild() {
        const { prefix, owner } = this.props;
        return prefix === '*' && owner === '*';
    }

    toggle(isToggled) {
        const { dispatch } = this.props;
        dispatch(toggleFilters(isToggled));
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

    handleStatusChange(event, index, value) {
        const { dispatch } = this.props;
        dispatch(setFilters({
            status: value,
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
        this.toggle(false);
        dispatch(fetchChildrenNoCheck(this.props));
    }

    render() {
        const { prefix, owner, status, jobId, isToggled } = this.props;
        const rightAlign = {
            display: 'inline-block',
            float: 'right',
            width: '50%',
        };
        const leftAlign = {
            width: '50%',
        };
        const formErrorText = {
            color: orange500,
            paddingTop: '0px',
        };
        const hiddenErrorText = {
            position: 'absolute',
            color: orange500,
        };
        const labelStyle = {
            color: orange500,
        };

        return (
            <div>
                <Card
                    id="filter-view"
                    expanded={isToggled}
                    onExpandChange={this.toggle}
                >
                    <CardHeader
                        title="Job Filters"
                        actAsExpander={true}
                        showExpandableButton={true}
                    />
                    <CardText expandable={true}>
                        <form onSubmit={e => { return this.applyValues(e); }}>
                            <div>
                                <UpperCaseTextField
                                    floatingLabelText="Owner"
                                    floatingLabelStyle={this.isOwnerAndPrefixWild() ? labelStyle : null}
                                    value={owner}
                                    fieldChangedCallback={this.handleOwnerChange}
                                    fullWidth={false}
                                    style={leftAlign}
                                    errorText={this.getOwnerAndPrefixErrorText()}
                                    errorStyle={hiddenErrorText}
                                />
                                <UpperCaseTextField
                                    floatingLabelText="Prefix"
                                    floatingLabelStyle={this.isOwnerAndPrefixWild() ? labelStyle : null}
                                    value={prefix}
                                    fieldChangedCallback={this.handlePrefixChange}
                                    fullWidth={false}
                                    style={rightAlign}
                                    errorText={this.getOwnerAndPrefixErrorText()}
                                    errorStyle={hiddenErrorText}
                                />
                                {this.isOwnerAndPrefixWild() ? <label style={formErrorText}>Owner=* & Prefix=* may take a long time to load, APPLY to proceed</label> : <br />}
                            </div>
                            <div>
                                <UpperCaseTextField
                                    floatingLabelText="Job ID"
                                    value={jobId}
                                    fieldChangedCallback={this.handleJobIdChange}
                                    fullWidth={false}
                                    style={leftAlign}
                                />
                                <SelectField
                                    floatingLabelText="Status"
                                    floatingLabelFixed={true}
                                    value={status}
                                    onChange={this.handleStatusChange}
                                    fullWidth={false}
                                    style={rightAlign}
                                >

                                    <MenuItem value="" primaryText="*" />
                                    {Filters.renderStatusOptions()}
                                </SelectField>
                            </div>
                            <CardActions>
                                <RaisedButton
                                    label="APPLY"
                                    labelColor={ibmBlueDark}
                                    primary={true}
                                    type="submit"
                                />
                                <RaisedButton
                                    label="RESET"
                                    labelColor={ibmBlueDark}
                                    secondary={true}
                                    onClick={this.resetValues}
                                />
                            </CardActions>

                        </form>
                    </CardText>
                </Card>
            </div>
        );
    }
}

Filters.propTypes = {
    prefix: PropTypes.string,
    owner: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    jobId: PropTypes.string.isRequired,
    isToggled: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.shape({
        query: PropTypes.object,
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
