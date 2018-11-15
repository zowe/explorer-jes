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
import { Map } from 'immutable';
import List from 'material-ui/List';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import ConnectedJobNode from './JobNode';
import { ROOT_NODE_TYPE } from '../constants/jobNodeTypesConstants';
import ConnectedFilter from './Filters';
import RefreshIcon from '../components/RefreshIcon';
import { ROOT_NODE_ID } from '../reducers/treeNodesJobs';
import { refreshJobs, fetchChildrenNoCheck } from '../actions/treeNodesJobs';
import { LOADING_MESSAGE } from '../reducers/filters';
import FullHeightTree from './FullHeightTree';

export class JobNodeTree extends React.Component {
    componentWillReceiveProps(nextProps) {
        const { owner, dispatch } = this.props;
        if (owner === LOADING_MESSAGE && nextProps.owner && nextProps.owner !== LOADING_MESSAGE) {
            dispatch(fetchChildrenNoCheck(nextProps));
        }
    }

    getFilterValues() {
        const { owner, prefix, returnCode, status, type, rootJobNode } = this.props;
        if (rootJobNode.get('nodeType') === ROOT_NODE_TYPE && rootJobNode.get('isToggled')) {
            let filtersString = `Owner= ${owner} Prefix= ${prefix || '*'}`;
            if (returnCode) { filtersString += ` Return Code= ${ConnectedFilter.returnCodeToString(returnCode)}`; }
            if (status) { filtersString += ` Status= ${status}`; }
            if (type) { filtersString += ` Type= ${type}`; }
            return filtersString;
        }
        return null;
    }

    checkIfFetchingChildren() {
        const { rootJobNode } = this.props;
        return (rootJobNode.get('nodeType') === ROOT_NODE_TYPE && rootJobNode.get('isFetchingChildren'));
    }

    render() {
        const { dispatch } = this.props;
        return (
            <Card class="tree-card" containerStyle={{ paddingBottom: 0 }}>
                <CardHeader title="JES Viewer" subtitle={this.getFilterValues()} />
                <CardText id="tree-text-content">
                    <ConnectedFilter />
                    <RefreshIcon
                        isFetching={this.checkIfFetchingChildren()}
                        submitAction={() => { return dispatch(refreshJobs()); }}
                        dispatch={dispatch}
                    />
                    <FullHeightTree>
                        <List>
                            <ConnectedJobNode id={ROOT_NODE_ID} />
                        </List>
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
    rootJobNode: PropTypes.instanceOf(Map),
    dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const filtersRoot = state.get('filters');
    const jobsTreeRoot = state.get('treeNodesJobs');
    return {
        prefix: filtersRoot.get('prefix'),
        owner: filtersRoot.get('owner'),
        returnCode: filtersRoot.get('returnCode'),
        status: filtersRoot.get('status'),
        type: filtersRoot.get('type'),
        rootJobNode: jobsTreeRoot.get(ROOT_NODE_ID),
    };
}

const ConnectedJobNodeTree = connect(mapStateToProps)(JobNodeTree);
export default ConnectedJobNodeTree;
