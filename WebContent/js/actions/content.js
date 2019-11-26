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
export const UPDATE_CONTENT = 'UPDATE_CONTENT';
export const CHANGE_SELECTED_CONTENT = 'CHANGE_SELECTED_CONTENT';
export const INVALIDATE_CONTENT = 'INVALIDATE_CONTENT';

export const REQUEST_SUBMIT_JCL = 'REQUEST_SUBMIT_JCL';
export const RECEIVE_SUBMIT_JCL = 'RECEIVE_SUBMIT_JCL';
export const INVALIDATE_SUBMIT_JCL = 'INVALIDATE_SUBMIT_JCL';

function requestContent(jobName, jobId, fileName, fileId, fileLabel) {
    return {
        type: REQUEST_CONTENT,
        jobName,
        jobId,
        fileName,
        fileId,
        fileLabel,
    };
}

function receiveContent(jobName, jobId, fileName, fileId, content, fileLabel, readOnly = true) {
    return {
        type: RECEIVE_CONTENT,
        jobName,
        jobId,
        content,
        fileName,
        fileId,
        fileLabel,
        readOnly,
    };
}

export function invalidateContent() {
    return {
        type: INVALIDATE_CONTENT,
    };
}

export function getFileLabel(jobId, fileName = '') {
    return `${jobId}-${fileName}`;
}

export function fetchJobFile(jobName, jobId, fileName, fileId) {
    return dispatch => {
        dispatch(requestContent(jobName, jobId, fileName, fileId, getFileLabel(jobId, fileName)));
        return atlasFetch(`jobs/${jobName}/${jobId}/files/${fileId}/content`, { credentials: 'include' })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return response.json().then(e => { throw Error(e.message); });
            })
            .then(json => {
                if ('content' in json) {
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
        dispatch(requestContent(jobName, jobId, '', fileId, getFileLabel(jobId)));
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

export function updateContent(content) {
    return {
        type: UPDATE_CONTENT,
        content,
    };
}

export function changeSelectedContent(index) {
    return {
        type: CHANGE_SELECTED_CONTENT,
        newSelectedContent: index,
    };
}

export function getJCL(jobName, jobId) {
    return dispatch => {
        dispatch(requestContent(jobName, jobId, 'JCL', 0, getFileLabel(jobId, 'JCL')));
        return atlasFetch(`jobs/${jobName}/${jobId}/files/JCL/content`, { credentials: 'include' })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return response.json().then(e => { throw Error(e.message); });
            })
            .then(json => {
                return dispatch(receiveContent(jobName, jobId, 'JCL', 0, json.content, getFileLabel(jobId, 'JCL'), false));
            })
            .catch(e => {
                dispatch(constructAndPushMessage(`${e.message} - ${jobName}:${jobId}:JCL`));
                return dispatch(invalidateContent());
            });
    };
}

function requestSubmitJCL() {
    return {
        type: REQUEST_SUBMIT_JCL,
        isSubmittingJCL: true,
    };
}

function receiveSubmitJCL(jobName, jobId) {
    return {
        type: RECEIVE_SUBMIT_JCL,
        jobName,
        jobId,
        isSubmittingJCL: false,
    };
}

function invalidateSubmitJCL() {
    return {
        type: INVALIDATE_SUBMIT_JCL,
        isSubmittingJCL: false,
    };
}

export function submitJCL(content) {
    return dispatch => {
        dispatch(requestSubmitJCL());
        return atlasFetch('jobs/string',
            {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jcl: content }),
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return response.json().then(e => { throw Error(e.message); });
            })
            .then(json => {
                dispatch(receiveSubmitJCL(json.jobName, json.jobId));
                dispatch(constructAndPushMessage(`${json.jobName}:${json.jobId} Submitted`));
            })
            .catch(e => {
                dispatch(invalidateSubmitJCL());
                dispatch(constructAndPushMessage(`${e.message}`));
            });
    };
}
