/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

import { Map, List } from 'immutable';
import {
    TOGGLE_NODE,
    REQUEST_CHILDREN,
    RECEIVE_CHILDREN,
    INVALIDATE_CHILDREN,
    SET_FILTERS,
    RESET_FILTERS,
    RESET_CHILDREN,
} from '../actions/treeNodesJobs';
import {
    ROOT_NODE_TYPE,
    JOB_NAME_NODE_TYPE,
    JOB_INSTANCE_NODE_TYPE,
    JOB_STEP_NODE_TYPE,
    JOB_STEP_PARENT_NODE_TYPE,
    JOB_OUTPUT_FILE_NODE_TYPE,
    JOB_OUTPUT_FILE_PARENT_NODE_TYPE,
    JOB_STEP_DD_NODE_TYPE,
    JOB_STEP_DD_DSN_NODE_TYPE,
} from '../constants/jobNodeTypesConstants';

export const ROOT_NODE_ID = 'jobs';
const ROOT_NODE = Map({
    id: ROOT_NODE_ID,
    label: 'JES Jobs',
    nodeType: ROOT_NODE_TYPE,
    childNodesURI: `${ROOT_NODE_ID}?owner=`,
    childIds: List([]),
    isFetchingChildren: false,
    isToggled: false,
    jobName: '',
});
const INITIAL_TREE_NODES_STATE = Map({
    [ROOT_NODE_ID]: ROOT_NODE,
});

export function getChildIdsFromJSON(treeNode, json) {
    switch (treeNode.get('nodeType')) {
        case ROOT_NODE_TYPE:
            return json.map(child => {
                return `${treeNode.get('id')}/${child.name}`;
            });
        case JOB_NAME_NODE_TYPE:
            return json.map(child => {
                return `${treeNode.get('childNodesURI')}/${child.jobId}`;
            });
        case JOB_STEP_PARENT_NODE_TYPE:
            return json.map(child => {
                return `${treeNode.get('childNodesURI')}/${child.step}`;
            });
        case JOB_STEP_NODE_TYPE:
            return json.map(child => {
                return `${treeNode.get('childNodesURI')}/${child.dd}`;
            });
        case JOB_OUTPUT_FILE_PARENT_NODE_TYPE:
            return json.map(child => {
                return `${treeNode.get('childNodesURI')}/${child.id}`;
            });
        default:
            return null;
    }
}

function createChildNodes(state, treeNode, json, autoExpandChildren) {
    let childNodes = Map({});
    switch (treeNode.get('nodeType')) {
        case ROOT_NODE_TYPE:
            if (json) {
                json.forEach(jobName => {
                    const parentURI = treeNode.get('id');
                    const jobNameId = `${parentURI}/${jobName.name}`;
                    const jobNameChildNodesURI = `${jobNameId}/ids`;
                    const existingNode = state.get(jobNameId);

                    // Add childIds
                    const jobInstances = [];
                    if (jobName.jobInstances) {
                        jobName.jobInstances.forEach(jobInstance => {
                            const jobInstanceId = `${jobNameChildNodesURI}/${jobInstance.jobId}`;
                            jobInstances.push(jobInstanceId);
                        });
                    }

                    const jobNameNode = Map({
                        id: jobNameId,
                        label: jobName.name,
                        nodeType: JOB_NAME_NODE_TYPE,
                        isFetchingChildren: false,
                        childIds: List(jobInstances),
                        childNodesURI: jobNameChildNodesURI,
                        jobName: jobName.name,
                        isToggled: (existingNode && !autoExpandChildren) ? existingNode.get('isToggled') : autoExpandChildren,
                    });

                    childNodes = childNodes.set(jobNameId, jobNameNode);

                    // Add nodes for job instances
                    childNodes = childNodes.merge(createChildNodes(state, jobNameNode, jobName, autoExpandChildren));
                });
            }
            break;
        case JOB_NAME_NODE_TYPE: {
            let jobIds = null;
            if (json.jobInstances) {
                jobIds = json.jobInstances;
            } else if (json.jobIds) {
                jobIds = json.jobIds;
            }

            if (jobIds) {
                jobIds.forEach(child => {
                    const childId = `${treeNode.get('childNodesURI')}/${child.jobId}`;
                    const childStepsId = `${childId}/steps`;
                    const childOutputFilesId = `${childId}/files`;
                    const jobName = treeNode.get('jobName');
                    const owner = child.owner;
                    const type = child.type;
                    const existingNode = state.get(childId);
                    const existingStepsNode = state.get(childStepsId);
                    const existingOutputFilesNode = state.get(childOutputFilesId);
                    const childIdsList = List([childStepsId, childOutputFilesId]);

                    childNodes = childNodes.set(childId, Map({
                        id: childId,
                        label: child.jobId,
                        nodeType: JOB_INSTANCE_NODE_TYPE,
                        isFetchingChildren: false,
                        childIds: childIdsList,
                        jobName,
                        owner,
                        type,
                        isToggled: existingNode ? existingNode.get('isToggled') : false,
                        status: child.status,
                        returnCode: child.returnCode,
                    }));
                    childNodes = childNodes.set(childStepsId, Map({
                        id: childStepsId,
                        label: 'Steps',
                        nodeType: JOB_STEP_PARENT_NODE_TYPE,
                        isFetchingChildren: false,
                        childIds: existingStepsNode ? existingStepsNode.get('childIds') : List([]),
                        childNodesURI: childStepsId,
                        jobName,
                        owner,
                        type,
                        isToggled: existingStepsNode ? existingStepsNode.get('isToggled') : false,
                    }));
                    childNodes = childNodes.set(childOutputFilesId, Map({
                        id: childOutputFilesId,
                        label: 'Files',
                        nodeType: JOB_OUTPUT_FILE_PARENT_NODE_TYPE,
                        isFetchingChildren: false,
                        childIds: existingOutputFilesNode ? existingOutputFilesNode.get('childIds') : List([]),
                        childNodesURI: childOutputFilesId,
                        jobName,
                        owner,
                        type,
                        isToggled: existingOutputFilesNode ? existingOutputFilesNode.get('isToggled') : false,
                        status: child.status,
                    }));
                });
            }
            break;
        } case JOB_STEP_PARENT_NODE_TYPE:
            if (json) {
                json.forEach(child => {
                    const childId = `${treeNode.get('childNodesURI')}/${child.step}`;
                    const existingNode = state.get(childId);

                    childNodes = childNodes.set(childId, Map({
                        id: childId,
                        label: child.name,
                        nodeType: JOB_STEP_NODE_TYPE,
                        isFetchingChildren: false,
                        childIds: existingNode ? existingNode.get('childIds') : List([]),
                        childNodesURI: `${childId}/dds`,
                        jobName: treeNode.get('jobName'),
                        owner: treeNode.get('owner'),
                        type: treeNode.get('type'),
                        isToggled: existingNode ? existingNode.get('isToggled') : false,
                        stepNumber: child.step,
                        program: child.program,
                    }));
                });
            }
            break;
        case JOB_STEP_NODE_TYPE:
            if (json) {
                json.forEach(child => {
                    const childId = `${treeNode.get('childNodesURI')}/${child.dd}`;
                    const jobName = treeNode.get('jobName');
                    const owner = treeNode.get('owner');
                    const type = treeNode.get('type');
                    let childIds = null;
                    const existingNode = state.get(childId);

                    if (child.datasets && child.datasets.length > 0) {
                        childIds = List([]);
                        child.datasets.forEach(dsn => {
                            const dsnId = `datasets/${dsn}/content`;
                            childNodes = childNodes.set(dsnId, Map({
                                id: dsnId,
                                label: dsn,
                                nodeType: JOB_STEP_DD_DSN_NODE_TYPE,
                                hasContent: true,
                                isFetchingChildren: false,
                                childIds: null,
                                jobName,
                                owner,
                                type,
                                isToggled: false,
                            }));
                            childIds = childIds.push(dsnId);
                        });
                    }

                    childNodes = childNodes.set(childId, Map({
                        id: childId,
                        label: child.name,
                        nodeType: JOB_STEP_DD_NODE_TYPE,
                        isFetchingChildren: false,
                        childIds,
                        jobName,
                        content: child.content,
                        owner,
                        type,
                        isToggled: existingNode ? existingNode.get('isToggled') : false,
                    }));
                });
            }
            break;
        case JOB_OUTPUT_FILE_PARENT_NODE_TYPE:
            if (json) {
                json.forEach(child => {
                    const childId = `${treeNode.get('childNodesURI')}/${child.id}`;

                    childNodes = childNodes.set(childId, Map({
                        id: childId,
                        label: child.ddname,
                        nodeType: JOB_OUTPUT_FILE_NODE_TYPE,
                        hasContent: true,
                        isFetchingChildren: false,
                        childIds: null,
                        jobName: treeNode.get('jobName'),
                        owner: treeNode.get('owner'),
                        type: treeNode.get('type'),
                        status: treeNode.get('status'),
                        stepName: child.stepname,
                        isToggled: false,
                    }));
                });
            }
            break;
        default:
            return childNodes;
    }
    return childNodes;
}

function node(state, action) {
    switch (action.type) {
        case TOGGLE_NODE:
            return state.set('isToggled', !state.get('isToggled'));
        case REQUEST_CHILDREN:
            return state.set('isFetchingChildren', true);
        case RECEIVE_CHILDREN: {
            const newChildren = List(getChildIdsFromJSON(state, action.childData));
            return state.merge({
                isFetchingChildren: false,
                childIds: newChildren,
                isToggled: (newChildren.size !== 0),
            });
        } case INVALIDATE_CHILDREN:
            // TODO: clean up old children?
            return state.merge({
                isFetchingChildren: false,
                isToggled: false,
            });
        default:
            return state;
    }
}

export default function treeNodesJobs(state = INITIAL_TREE_NODES_STATE, action) {
    const { nodeId } = action;
    if (typeof nodeId === 'undefined') {
        return state;
    }

    // TODO:: Do we ever use SET/RESET Filters from here, should we remove them?
    let newNodes = Map({});
    switch (action.type) {
        case SET_FILTERS:
        case RESET_FILTERS: {
            const rootNode = state.get(ROOT_NODE_ID).merge({
                childIds: List([]),
                isToggled: false,
            });
            return state.clear().set(ROOT_NODE_ID, rootNode);
        }
        case RESET_CHILDREN:
            return INITIAL_TREE_NODES_STATE;
        case RECEIVE_CHILDREN: {
            if (action.childData) {
                newNodes = createChildNodes(state, state.get(nodeId), action.childData, action.autoExpandChildren);
            }
        }
        // falls through
        default:
            /* eslint-disable no-param-reassign */
            state = state.merge(newNodes);
            /* eslint-enable no-param-reassign */

            // Update node
            return state.set(nodeId, node(state.get(nodeId), action));
    }
}
