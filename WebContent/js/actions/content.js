/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import { atlasFetch } from '../utilities/urlUtils';
import { constructAndPushMessage } from './snackbarNotifications';
import { checkForValidationFailure } from './validation';

export const REQUEST_CONTENT = 'REQUEST_CONTENT';
export const RECEIVE_CONTENT = 'RECEIVE_CONTENT';
export const REMOVE_CONTENT = 'REMOVE_CONTENT';
export const UPDATE_CONTENT = 'UPDATE_CONTENT';
export const CHANGE_SELECTED_CONTENT = 'CHANGE_SELECTED_CONTENT';
export const INVALIDATE_CONTENT = 'INVALIDATE_CONTENT';

export const REQUEST_SUBMIT_JCL = 'REQUEST_SUBMIT_JCL';
export const RECEIVE_SUBMIT_JCL = 'RECEIVE_SUBMIT_JCL';
export const INVALIDATE_SUBMIT_JCL = 'INVALIDATE_SUBMIT_JCL';

export const NO_CONTENT_IN_RESPONSE_ERROR_MESSAGE = 'No Content in response from API';

function requestContent(jobName, jobId, fileName, fileId, fileLabel, controller) {
    return {
        type: REQUEST_CONTENT,
        jobName,
        jobId,
        fileName,
        fileId,
        fileLabel,
        controller,
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

export function invalidateContent(fileLabel, fileId) {
    return {
        type: INVALIDATE_CONTENT,
        fileLabel,
        fileId,
    };
}

export function getFileLabel(jobId, fileName = '') {
    return `${jobId}-${fileName}`;
}

function checkResponse(response) {
    if (response.ok) {
        return response.json();
    }
    return response.json().then(e => { throw Error(e.message); });
}

function dispatchReceiveContent(dispatch, jobName, jobId, fileName, fileId, fileLabel, json, readOnly = true) {
    if ('content' in json) {
        return dispatch(receiveContent(jobName, jobId, fileName, fileId, json.content, fileLabel, readOnly));
    }
    throw Error(json.message || NO_CONTENT_IN_RESPONSE_ERROR_MESSAGE);
}

export function fetchJobFile(jobName, jobId, fileName, fileId) {
    return dispatch => {
        const fileLabel = getFileLabel(jobId, fileName);
        const controller = new AbortController();
        dispatch(requestContent(jobName, jobId, fileName, fileId, fileLabel, controller));
        return atlasFetch(`jobs/${jobName}/${jobId}/files/${fileId}/content`, { credentials: 'include', signal: controller.signal })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                return checkResponse(response);
            })
            .then(json => {
                return dispatchReceiveContent(dispatch, jobName, jobId, fileName, fileId, getFileLabel(jobId, fileName), json);
            })
            .catch(e => {
                if (e.name === 'AbortError') return;
                dispatch(constructAndPushMessage(`${e.message} - ${jobName}:${jobId}:${fileName}`));
                dispatch(invalidateContent(fileLabel, fileId));
            });
    };
}

export function fetchConcatenatedJobFiles(jobName, jobId) {
    return dispatch => {
        const fileLabel = getFileLabel(jobName, jobId);
        const controller = new AbortController();
        dispatch(requestContent(jobName, jobId, jobId, jobId, fileLabel, controller));
        return atlasFetch(`jobs/${jobName}/${jobId}/files/content`, { credentials: 'include', signal: controller.signal })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                return checkResponse(response);
            })
            .then(json => {
                return dispatchReceiveContent(dispatch, jobName, jobId, jobId, jobId, fileLabel, json);
            })
            .catch(e => {
                if (e.name === 'AbortError') return;
                dispatch(constructAndPushMessage(`${e.message} - ${jobName}:${jobId}:`));
                dispatch(invalidateContent());
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
        const controller = new AbortController();
        dispatch(requestContent(jobName, jobId, '', fileId, getFileLabel(jobId), controller));
        return atlasFetch(contentPath, { credentials: 'include', signal: controller.signal })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                return checkResponse(response);
            })
            .then(json => {
                if (json.content) {
                    return getFileNameFromJob(jobName, jobId, fileId)
                        .then(
                            fileName => {
                                if (fileName) {
                                    return dispatchReceiveContent(dispatch, jobName, jobId, fileName, fileId, getFileLabel(jobId, fileName), json);
                                }
                                throw Error(fileName);
                            },
                        ).catch(e => {
                            throw Error(e);
                        });
                }
                throw Error(json.message || NO_CONTENT_IN_RESPONSE_ERROR_MESSAGE);
            })
            .catch(e => {
                if (e.name === 'AbortError') return;
                dispatch(constructAndPushMessage(`${e.message} - ${jobName}:${jobId}:${fileId}`));
                dispatch(invalidateContent());
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
        const fileLabel = getFileLabel(jobId, 'JCL');
        const controller = new AbortController();
        dispatch(requestContent(jobName, jobId, 'JCL', 0, fileLabel, controller));
        return atlasFetch(`jobs/${jobName}/${jobId}/files/JCL/content`, { credentials: 'include', signal: controller.signal })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                return checkResponse(response);
            })
            .then(json => {
                return dispatchReceiveContent(dispatch, jobName, jobId, 'JCL', 0, fileLabel, json, false);
            })
            .catch(e => {
                if (e.name === 'AbortError') return;
                dispatch(constructAndPushMessage(`${e.message} - ${jobName}:${jobId}:JCL`));
                dispatch(invalidateContent(fileLabel));
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
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                return checkResponse(response);
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
