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
import { Link } from 'react-router';
import { Map } from 'immutable';
import List from 'material-ui/List';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import LeftArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import ConnectedJobNode from './JobNode';
import { ROOT_NODE_TYPE } from '../jobNodeTypesConstants';
import ConnectedFilter from './Filters';
import RefreshIcon from '../components/RefreshIcon';
import { ROOT_NODE_ID } from '../reducers/treeNodesJobs';
import { refreshJobs, fetchChildrenNoCheck } from '../actions/treeNodesJobs';
import { LOADING_MESSAGE } from '../reducers/filters';
import FullHeightTree from './FullHeightTree';

const REFRESH_ICON_PADDING_HEIGHT = 20;

export class JobNodeTree extends React.Component {
    constructor() {
        super();
        this.getFullScreenQuery = this.getFullScreenQuery.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const { owner, dispatch } = this.props;
        if (owner === LOADING_MESSAGE && nextProps.owner && nextProps.owner !== LOADING_MESSAGE) {
            dispatch(fetchChildrenNoCheck(nextProps));
        }
    }

    getFilterValues() {
        const { owner, prefix, status, rootJobNode } = this.props;
        if (rootJobNode.get('nodeType') === ROOT_NODE_TYPE && rootJobNode.get('isToggled')) {
            let filtersString = `Owner= ${owner} Prefix= ${prefix || '*'}`;
            if (status) { filtersString += ` Status= ${status}`; }
            return filtersString;
        }
        return null;
    }

    getFullScreenQuery() {
        const { contentSourceId } = this.props;
        if (contentSourceId && contentSourceId.includes('jobs/') && contentSourceId.includes('ids/') && contentSourceId.includes('files/')) {
            const jobName = contentSourceId.substring(contentSourceId.indexOf('jobs/') + 5, contentSourceId.indexOf('/ids'));
            const jobId = contentSourceId.substring(contentSourceId.indexOf('ids/') + 4, contentSourceId.indexOf('/files'));
            const fileId = contentSourceId.substring(contentSourceId.indexOf('files/') + 6);
            return `?jobName=${jobName}&jobId=${jobId}&fileId=${fileId}`;
        }
        return '';
    }

    checkIfFetchingChildren() {
        const { rootJobNode } = this.props;
        return (rootJobNode.get('nodeType') === ROOT_NODE_TYPE && rootJobNode.get('isFetchingChildren'));
    }

    render() {
        const { dispatch } = this.props;
        return (
            <Card class="tree-card" containerStyle={{ paddingBottom: 0 }}>
                <CardHeader>
                    <span className="card-title" >JES Viewer</span>
                    <Link to={`/viewer${this.getFullScreenQuery()}`}>
                        <span className="card-action-right">
                            <LeftArrow />
                        </span>
                    </Link>
                    <div className="card-subtitle" >{this.getFilterValues()}</div>

                </CardHeader>

                <CardText id="tree-text-content">
                    <ConnectedFilter />
                    <RefreshIcon
                        isFetching={this.checkIfFetchingChildren()}
                        submitAction={() => { return dispatch(refreshJobs()); }}
                        dispatch={dispatch}
                    />
                    <FullHeightTree offset={REFRESH_ICON_PADDING_HEIGHT}>
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
    status: PropTypes.string,
    rootJobNode: PropTypes.instanceOf(Map),
    dispatch: PropTypes.func.isRequired,
    contentSourceId: PropTypes.string,
};

function mapStateToProps(state) {
    const filtersRoot = state.get('filters');
    const jobsTreeRoot = state.get('treeNodesJobs');
    const contentRoot = state.get('content');
    return {
        prefix: filtersRoot.get('prefix'),
        owner: filtersRoot.get('owner'),
        returnCode: filtersRoot.get('returnCode'),
        status: filtersRoot.get('status'),
        type: filtersRoot.get('type'),
        rootJobNode: jobsTreeRoot.get(ROOT_NODE_ID),
        contentSourceId: contentRoot.get('sourceId'),
    };
}

const ConnectedJobNodeTree = connect(mapStateToProps)(JobNodeTree);
export default ConnectedJobNodeTree;
