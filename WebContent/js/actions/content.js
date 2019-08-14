/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
 */

import { atlasFetch } from '../utilities/urlUtils';
import { constructAndPushMessage } from './snackbarNotifications';

export const REQUEST_CONTENT = 'REQUEST_CONTENT';
export const RECEIVE_CONTENT = 'RECEIVE_CONTENT';
export const REMOVE_CONTENT = 'REMOVE_CONTENT';
export const CHANGE_SELECTED_CONTENT = 'CHANGE_SELECTED_CONTENT';
export const INVALIDATE_CONTENT = 'INVALIDATE_CONTENT';

function requestContent(jobName, jobId, fileName, fileId) {
    return {
        type: REQUEST_CONTENT,
        jobName,
        jobId,
        fileName,
        fileId,
    };
}

function receiveContent(jobName, jobId, fileName, fileId, content, fileLabel) {
    return {
        type: RECEIVE_CONTENT,
        jobName,
        jobId,
        content,
        fileName,
        fileId,
        fileLabel,
    };
}

export function invalidateContent() {
    return {
        type: INVALIDATE_CONTENT,
    };
}

export function getFileLabel(jobId, fileName) {
    return `${jobId}-${fileName}`;
}

export function fetchJobFile(jobName, jobId, fileName, fileId) {
    return dispatch => {
        dispatch(requestContent(jobName, jobId, fileName, fileId));
        return atlasFetch(`jobs/${jobName}/${jobId}/files/${fileId}/content`, { credentials: 'include' })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return response.json().then(e => { throw Error(e.message); });
            })
            .then(json => {
                if (json.content) {
                    return dispatch(receiveContent(jobName, jobId, fileName, fileId, json.content, getFileLabel(jobId, fileName)));
                }
                throw Error(json.message);
            })
            .catch(e => {
                dispatch(constructAndPushMessage(`${e.message} - ${jobName}:${jobId}:${fileName}`));
                return dispatch(invalidateContent());
            });
    };
}

function getFileNameFromJob(jobName, jobId, fileId) {
    const contentPath = `jobs/${jobName}/${jobId}/files`;
    return atlasFetch(contentPath, { credentials: 'include' })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return response.json().then(e => { throw Error(e.message); });
        })
        .then(json => {
            return json.items.find(file => {
                return parseInt(file.id, 10) === parseInt(fileId, 10);
            });
        })
        .then(file => {
            return file.ddName;
        });
}

export function fetchJobFileNoName(jobName, jobId, fileId) {
    return dispatch => {
        const contentPath = `jobs/${jobName}/${jobId}/files/${fileId}/content`;
        dispatch(requestContent(jobName, jobId, '', fileId));
        return atlasFetch(contentPath, { credentials: 'include' })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return response.json().then(e => { throw Error(e.message); });
            })
            .then(json => {
                if (json.content) {
                    return getFileNameFromJob(jobName, jobId, fileId)
                        .then(
                            fileName => {
                                if (fileName) {
                                    return dispatch(receiveContent(jobName, jobId, fileName, fileId, json.content, getFileLabel(jobId, fileName)));
                                }
                                throw Error(fileName);
                            },
                        ).catch(e => {
                            throw Error(e);
                        });
                }
                throw Error(json.message);
            })
            .catch(e => {
                dispatch(constructAndPushMessage(`${e.message} - ${jobName}:${jobId}:${fileId}`));
                return dispatch(invalidateContent());
            });
    };
}

export function removeContent(index) {
    return {
        type: REMOVE_CONTENT,
        index,
    };
}

export function changeSelectedContent(index) {
    return {
        type: CHANGE_SELECTED_CONTENT,
        newSelectedContent: index,
    };
}
