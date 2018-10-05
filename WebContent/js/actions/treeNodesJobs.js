/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

/* global fetch */
import { atlasFetch } from '../utilities/urlUtils';
import { ROOT_NODE_ID } from '../reducers/treeNodesJobs';
import { JOB_NAME_NODE_TYPE, JOB_INSTANCE_NODE_TYPE, JOB_STEP_DD_NODE_TYPE } from '../jobNodeTypesConstants';
import { constructAndPushMessage } from './snackbarNotifications';

export const SELECT_NODE = 'SELECT_NODE';
export const TOGGLE_NODE = 'TOGGLE_NODE';
export const REQUEST_CHILDREN = 'REQUEST_CHILDREN';
export const RECEIVE_CHILDREN = 'RECEIVE_CHILDREN';
export const INVALIDATE_CHILDREN = 'INVALIDATE_CHILDREN';
export const RESET_CHILDREN = 'RESET_CHILDREN';
export const REQUEST_PURGE_JOB = 'REQUEST_PURGE_JOB';
export const RECEIVE_PURGE_JOB = 'RECEIVE_PURGE_JOB';
export const INVALIDATE_PURGE_JOB = 'INVALIDATE_PURGE_JOB';


const FETCH_CHILDREN_FAIL_MESSAGE = 'Fetch failed for';
const PURGE_JOB_SUCCESS_MESSAGE = 'Purge request succeeded for';
const PURGE_JOB_FAIL_MESSAGE = 'Purge request failed for';

export function selectNode(nodeId) {
    return {
        type: SELECT_NODE,
        nodeId,
    };
}

export function toggle(nodeId) {
    return {
        type: TOGGLE_NODE,
        nodeId,
    };
}

function requestChildren(nodeId) {
    return {
        type: REQUEST_CHILDREN,
        nodeId,
    };
}

function receiveChildren(nodeId, childData, autoExpandChildren) {
    return {
        type: RECEIVE_CHILDREN,
        nodeId,
        childData,
        autoExpandChildren,
    };
}

function invalidateChildren(nodeId) {
    return {
        type: INVALIDATE_CHILDREN,
        nodeId,
    };
}

export function resetTreeNodesJobs() {
    return {
        type: RESET_CHILDREN,
    };
}

function requestPurge(jobName, jobId) {
    return {
        type: REQUEST_PURGE_JOB,
        jobName,
        jobId,
    };
}

function receivePurge(jobName, jobId) {
    return {
        type: RECEIVE_PURGE_JOB,
        jobName,
        jobId,
    };
}

function invalidatePurge(jobName, jobId) {
    return {
        type: INVALIDATE_PURGE_JOB,
        jobName,
        jobId,
    };
}

function shouldFetchChildren(node) {
    const childNodesURI = node.get('childNodesURI');
    const childIds = node.get('childIds');
    const isFetchingChildren = node.get('isFetchingChildren');

    return (childNodesURI && childIds !== null && childIds.size === 0 && !isFetchingChildren);
}

function constructFullyQualifiedURI(baseURI, filters) {
    let uri = `${baseURI + filters.owner
    }&prefix=${filters.prefix ? filters.prefix : '*'
    }&returnCode=${filters.returnCode ? filters.returnCode : '*'
    }&type=${filters.type ? filters.type : '*'}`;

    if (filters.status && filters.status !== '*') {
        uri += `&status=${filters.status}`;
    }
    return uri;
}

function fetchChildren(node, filters) {
    return dispatch => {
        const nodeId = node.get('id');
        let childNodesURI = node.get('childNodesURI');
        dispatch(requestChildren(nodeId));
        if (nodeId === ROOT_NODE_ID) {
            if (filters.owner && filters.owner !== 'Loading...') {
                childNodesURI = constructFullyQualifiedURI(childNodesURI, filters);
            } else {
                childNodesURI += '*';
            }
        }
        return atlasFetch(childNodesURI, { credentials: 'include' })
            .then(response => { return response.json(); })
            .then(json => {
                const autoExpandChildren = ('jobId' in filters && filters.jobId !== '*');
                dispatch(receiveChildren(nodeId, json, autoExpandChildren));
            })
            .catch(() => {
                dispatch(constructAndPushMessage(`${FETCH_CHILDREN_FAIL_MESSAGE} ${nodeId}`));
                dispatch(invalidateChildren(nodeId));
            });
    };
}

export function toggleAndFetchChildrenIfNeeded(nodeId, filters) {
    return (dispatch, getState) => {
        dispatch(toggle(nodeId));
        const node = getState().get('treeNodesJobs').get(nodeId);
        if (shouldFetchChildren(node)) {
            return dispatch(fetchChildren(node, filters));
        }
        return {};
    };
}

export function fetchChildrenNoCheck(filters) {
    return (dispatch, getState) => {
        const node = getState().get('treeNodesJobs').get(ROOT_NODE_ID);
        return dispatch(fetchChildren(node, filters));
    };
}

function findAllNodesToRefresh(state, nodeId) {
    const nodesToRefresh = [];
    const node = state.get(nodeId);
    const childIds = node.get('childIds');

    if (childIds && childIds.size > 0) {
        const nodeType = node.get('nodeType');
        if (nodeType !== JOB_INSTANCE_NODE_TYPE && nodeType !== JOB_NAME_NODE_TYPE && nodeType !== JOB_STEP_DD_NODE_TYPE) {
            nodesToRefresh.push(nodeId);
        }

        childIds.forEach(childId => { return nodesToRefresh.push(...findAllNodesToRefresh(state, childId)); });
    }
    return nodesToRefresh;
}

export function refreshJobs() {
    return (dispatch, getState) => {
        const treeNodes = getState().get('treeNodesJobs');
        const nodesToRefresh = findAllNodesToRefresh(treeNodes, ROOT_NODE_ID);
        return nodesToRefresh.forEach(nodeId => {
            dispatch(fetchChildren(treeNodes.get(nodeId), getState().get('filters')));
        });
    };
}

export function purgeJob(jobName, jobId) {
    return dispatch => {
        dispatch(requestPurge(jobName, jobId));
        return atlasFetch(`${jobName}/${jobId}`,
            {
                credentials: 'include',
                method: 'DELETE',
            },
        ).then(response => {
            if (response.ok) {
                return response.text();
            }
            throw Error(response.statusText);
        }).then(() => {
            dispatch(constructAndPushMessage(`${PURGE_JOB_SUCCESS_MESSAGE} ${jobName}/${jobId}`));
            return dispatch(receivePurge(jobName, jobId));
        }).catch(() => {
            dispatch(constructAndPushMessage(`${PURGE_JOB_FAIL_MESSAGE} ${jobName}/${jobId}`));
            dispatch(invalidatePurge(jobName, jobId));
        });
    };
}
