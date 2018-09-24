/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

import { atlasFetch } from '../utilities/urlUtils';
import { constructAndPushMessage } from './snackbarNotifications';

export const REQUEST_CONTENT = 'REQUEST_CONTENT';
export const RECEIVE_CONTENT = 'RECEIVE_CONTENT';
export const INVALIDATE_CONTENT = 'INVALIDATE_CONTENT';
export const INVALIDATE_CONTENT_IF_OPEN = 'INVALIDATE_CONTENT_IF_OPEN';

const GET_CONTENT_FAIL_MESSAGE = 'Get content failed for';

function requestContent(nodeId) {
    return {
        type: REQUEST_CONTENT,
        nodeId,
    };
}

function receiveContent(sourceId, label, content, isContentHTML, isContentRealtime) {
    return {
        type: RECEIVE_CONTENT,
        sourceId,
        label,
        content,
        isContentHTML,
        isContentRealtime,
    };
}

export function invalidateContent() {
    return {
        type: INVALIDATE_CONTENT,
    };
}

export function invalidateContentIfOpen(path) {
    return {
        type: INVALIDATE_CONTENT_IF_OPEN,
        path,
    };
}

function fetchContent(node) {
    return dispatch => {
        dispatch(requestContent(node.get('id')));
        const contentURL = node.get('id');

        return atlasFetch(contentURL, { credentials: 'include' })
            .then(response => { return response.json(); })
            .then(json => {
                dispatch(receiveContent(node.get('id'), node.get('label'), json.content));
            })
            .catch(() => {
                dispatch(constructAndPushMessage(`${GET_CONTENT_FAIL_MESSAGE} ${node.get('id')}`));
                return dispatch(invalidateContent());
            });
    };
}

function getFileNameFromJob(jobName, jobId, fileId) {
    const contentPath = `jobs/${jobName}/ids/${jobId}/files`;
    return atlasFetch(contentPath, { credentials: 'include' })
        .then(response => { return response.json(); })
        .then(json => {
            return json.find(file => {
                return parseInt(file.id, 10) === parseInt(fileId, 10);
            });
        })
        .then(file => {
            return file.ddname;
        });
}

export function fetchContentNoNode(jobName, jobId, fileId) {
    return dispatch => {
        const contentPath = `jobs/${jobName}/ids/${jobId}/files/${fileId}`;
        dispatch(requestContent(contentPath));
        return atlasFetch(contentPath, { credentials: 'include' })
            .then(response => { return response.json(); })
            .then(json => {
                return getFileNameFromJob(jobName, jobId, fileId).then(
                    fileName => {
                        if (fileName) {
                            dispatch(receiveContent(contentPath, `${jobName} - ${jobId} - ${fileName}`, json.content, false, false));
                        } else {
                            throw Error();
                        }
                    },
                ).catch(() => {
                    throw Error();
                });
            })
            .catch(() => {
                dispatch(constructAndPushMessage(`${GET_CONTENT_FAIL_MESSAGE} ${contentPath}`));
                return dispatch(invalidateContent());
            });
    };
}

export function openContentIfAvailable(nodeId) {
    return (dispatch, getState) => {
        const node = getState().get('treeNodesJobs').get(nodeId);
        if (node.get('hasContent')) {
            return dispatch(fetchContent(node));
        }
        return dispatch(invalidateContent());
    };
}

export function openRealtimeContent(nodeId) {
    return (dispatch, getState) => {
        dispatch(requestContent(nodeId));
        const node = getState().get('treeNodesJobs').get(nodeId);
        dispatch(receiveContent(nodeId, `Real-time tail of ${node.get('label')}`, '', false, true));
    };
}
