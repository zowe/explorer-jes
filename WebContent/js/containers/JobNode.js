/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

import IconButton from 'material-ui/IconButton';
import ListIcon from 'material-ui/svg-icons/action/list';
import LabelIcon from 'material-ui/svg-icons/action/label';
import LabelOutlineIcon from 'material-ui/svg-icons/action/label-outline';
import CodeIcon from 'material-ui/svg-icons/action/code';
import PersonIcon from 'material-ui/svg-icons/social/person';
import DownArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import EyeIcon from 'material-ui/svg-icons/image/remove-red-eye';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { List, Record } from 'immutable';
import ReactTooltip from 'react-tooltip';
import { openContentIfAvailable, openRealtimeContent } from '../actions/content';
import { toggleAndFetchChildrenIfNeeded, purgeJob } from '../actions/treeNodesJobs';
import {
    ROOT_NODE_TYPE,
    JOB_NAME_NODE_TYPE,
    JOB_INSTANCE_NODE_TYPE,
    JOB_STEP_DD_NODE_TYPE,
    JOB_OUTPUT_FILE_NODE_TYPE } from '../jobNodeTypesConstants';

export class JobNode extends React.Component {
    constructor(props) {
        super(props);
        this.getNodeIcon = this.getNodeIcon.bind(this);
        this.renderNodeLabel = this.renderNodeLabel.bind(this);
        this.renderChild = this.renderChild.bind(this);
        this.renderChildLabel = this.renderChildLabel.bind(this);
        this.renderJobInstanceMenu = this.renderJobInstanceMenu.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.handlePurge = this.handlePurge.bind(this);
        this.displayRealtimeContent = this.displayRealtimeContent.bind(this);
        this.getReactTooltip = this.getReactTooltip.bind(this);
    }

    getToggleIcon() {
        const { isToggled } = this.props;
        const style = { padding: 0, height: 24, width: 24 };
        return (
            <IconButton style={style} onClick={this.handleToggle}>
                {isToggled ? <DownArrowIcon /> : <RightArrowIcon />}
            </IconButton>
        );
    }

    getReactTooltip() {
        const { nodeType, content } = this.props;
        switch (nodeType) {
            case JOB_STEP_DD_NODE_TYPE:
                return content ? <ReactTooltip place="right" type="info" effect="solid" /> : null;
            default:
        }
        return null;
    }

    getNodeIcon() {
        const { nodeType, type } = this.props;
        const iconStyle = { paddingRight: 5 };

        switch (nodeType) {
            case ROOT_NODE_TYPE:
                return <ListIcon style={iconStyle} />;
            case JOB_NAME_NODE_TYPE:
                return <LabelIcon style={iconStyle} />;
            case JOB_INSTANCE_NODE_TYPE:
                switch (type) {
                    case 'TSU':
                        return <PersonIcon style={iconStyle} />;
                    case 'STC':
                        return <CodeIcon style={iconStyle} />;
                    default:
                        return <LabelOutlineIcon style={iconStyle} />;
                }
            default:
                return null;
        }
    }

    getRealtimeContentIcon() {
        const buttonStyles = {
            padding: 0,
            width: 24,
            height: 24,
            marginLeft: 5,
        };

        return (
            <IconButton
                tooltip="View Real-time Content"
                tooltipPosition="top-right"
                style={buttonStyles}
                onClick={this.displayRealtimeContent}
            >
                <EyeIcon />
            </IconButton>
        );
    }

    displayRealtimeContent() {
        const { id, dispatch } = this.props;
        dispatch(openRealtimeContent(id));
    }

    handleToggle() {
        const { id, dispatch, filters } = this.props;
        dispatch(toggleAndFetchChildrenIfNeeded(id, filters));
    }

    handleSelect() {
        const { id, dispatch } = this.props;
        dispatch(openContentIfAvailable(id));
    }

    handlePurge() {
        const { dispatch, label, parentId } = this.props;
        dispatch(purgeJob(parentId, label));
    }

    renderNodeLabelText() {
        const { label, returnCode, status, nodeType } = this.props;
        const statusStyleAbend = { color: 'red', display: 'inline' };
        const statusStyleComplete = { color: 'grey', display: 'inline' };
        if (nodeType === JOB_INSTANCE_NODE_TYPE) {
            if (returnCode) {
                if (returnCode.toLowerCase().includes('abend') || returnCode.toLowerCase().includes('jcl error')) {
                    return (<div>{label}<div style={statusStyleAbend}> [{returnCode}]</div></div>);
                }
                if (returnCode.toLowerCase().includes('cc 0000')) {
                    return (<div>{label}<div style={statusStyleComplete}> [{returnCode}]</div></div>);
                }
                return `${label} [${returnCode}]`;
            } else if (status) {
                return (`${label} [${status}]`);
            }
        }
        return label;
    }

    renderNodeLabel() {
        const {
            label,
            hasContent,
            program,
            stepName,
            nodeType,
            status,
            content,
            childIds,
        } = this.props;

        const nodeNameClass = `node-label${hasContent ? ' content-link' : ''}`;
        return (
            nodeType !== ROOT_NODE_TYPE
                ? <div>
                    <ContextMenuTrigger id={label}>
                        {childIds
                            ? this.getToggleIcon()
                            : <span className="node-toggle-placeholder" />
                        }
                        {this.getNodeIcon()}
                        {this.getReactTooltip()}
                        <span
                            className={nodeNameClass}
                            data-tip={content}
                            role={'treeitem'}
                            tabIndex="-1"
                            onClick={hasContent ? this.handleSelect : null}
                        >
                            {this.renderNodeLabelText()}
                        </span>
                        {program ? <span className="node-annotation">: {program}</span> : null}
                        {stepName ? <span className="node-annotation">({stepName})</span> : null}
                        {nodeType === JOB_OUTPUT_FILE_NODE_TYPE && status === 'ACTIVE' ? this.getRealtimeContentIcon() : null}
                    </ContextMenuTrigger>
                    {nodeType === JOB_INSTANCE_NODE_TYPE ? this.renderJobInstanceMenu(label) : null}
                </div>
                : null
        );
    }

    renderChild(childId) {
        const { id } = this.props;
        return (
            <li key={childId}>
                <ConnectedNode id={childId} parentId={id} />
            </li>
        );
    }

    renderChildLabel() {
        const { childIds, isFetchingChildren, isToggled } = this.props;
        if (childIds.size === 0) {
            return (isFetchingChildren ? <li>Loading...</li> : null);
        }
        return (isToggled ? childIds.map(this.renderChild) : null);
    }

    renderJobInstanceMenu(id) {
        return (
            <ContextMenu id={id}>
                <MenuItem onClick={this.handlePurge}>
                    Purge Job
                </MenuItem>
            </ContextMenu>
        );
    }

    render() {
        const { childIds } = this.props;
        return (
            <div className="node">
                {this.renderNodeLabel()}
                {childIds ?
                    <ul>
                        {this.renderChildLabel()}
                    </ul>
                    : null
                }
            </div>
        );
    }
}

JobNode.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    nodeType: PropTypes.string.isRequired,
    isFetchingChildren: PropTypes.bool.isRequired,
    childIds: PropTypes.instanceOf(List),
    isToggled: PropTypes.bool.isRequired,
    parentId: PropTypes.string,
    // Optional/Job-specific properties
    type: PropTypes.string,
    hasContent: PropTypes.bool,
    status: PropTypes.string,
    program: PropTypes.string,
    stepName: PropTypes.string,
    content: PropTypes.string,
    returnCode: PropTypes.string,
    // filters
    filters: PropTypes.instanceOf(Record),
    dispatch: PropTypes.func.isRequired,
};

function convertSimplePatternToRegexp(filterValue) {
    return (filterValue === '*') ? '.*' : `^${filterValue.replace(/\*/g, '.*?')}$`;
}

function filterJobInstanceIds(state, nodeId) {
    const treeState = state.get('treeNodesJobs');
    const nodeState = treeState.get(nodeId);
    const childIds = nodeState.get('childIds');
    const filters = state.get('filters');
    const ownerFilter = filters.get('owner') || filters.get('userId') || '*';
    const ownerFilterPattern = convertSimplePatternToRegexp(ownerFilter);
    const jobIdFilter = filters.get('jobId') || '*';
    const jobIdFilterPattern = convertSimplePatternToRegexp(jobIdFilter);
    const statusFilterPattern = filters.get('status') || '.*';

    return childIds.filter(childId => {
        const childNode = treeState.get(childId);
        const owner = childNode.get('owner');
        const status = childNode.get('status');
        const jobId = childNode.get('id');
        return (owner.match(ownerFilterPattern)
                && status.match(statusFilterPattern)
                && jobId.substring(jobId.lastIndexOf('/') + 1).match(jobIdFilterPattern));
    });
}

function filterJobNameIds(state, nodeId) {
    const treeState = state.get('treeNodesJobs');
    const prefixFilter = state.get('filters').get('prefix') || '*';
    const prefixFilterPattern = convertSimplePatternToRegexp(prefixFilter);
    return treeState.get(nodeId).get('childIds').filter(jobNameNodeId => {
        const jobNameNode = treeState.get(jobNameNodeId);
        const jobNameChildIds = filterJobInstanceIds(state, jobNameNodeId);

        return jobNameNode.get('jobName').match(prefixFilterPattern) && (jobNameChildIds.size > 0);
    });
}

function applyFilterToChildIds(state, nodeId) {
    const treeState = state.get('treeNodesJobs');
    const nodeState = treeState.get(nodeId);
    const nodeType = nodeState.get('nodeType');
    const jobIdFilter = state.get('filters').get('jobId');

    if (nodeType === ROOT_NODE_TYPE && jobIdFilter !== '*') {
        return filterJobNameIds(state, nodeId);
    } else if (nodeType === JOB_NAME_NODE_TYPE) {
        return filterJobInstanceIds(state, nodeId);
    }
    return nodeState.get('childIds');
}

function mapStateToProps(state, ownProps) {
    const treeState = state.get('treeNodesJobs');
    const nodeState = treeState.get(ownProps.id);
    const filterState = state.get('filters');

    const childIds = applyFilterToChildIds(state, ownProps.id);

    return {
        id: nodeState.get('id'),
        label: nodeState.get('label'),
        nodeType: nodeState.get('nodeType'),
        isFetchingChildren: nodeState.get('isFetchingChildren'),
        childIds,
        isToggled: nodeState.get('isToggled'),
        type: nodeState.get('type'),
        hasContent: nodeState.get('hasContent'),
        status: nodeState.get('status'),
        returnCode: nodeState.get('returnCode'),
        program: nodeState.get('program'),
        content: nodeState.get('content'),
        stepName: nodeState.get('stepName'),
        filters: filterState,
    };
}

const ConnectedNode = connect(mapStateToProps)(JobNode);
export default ConnectedNode;
