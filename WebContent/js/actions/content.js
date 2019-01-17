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

function requestContent(jobName, jobId, fileLabel, fileId) {
    return {
        type: REQUEST_CONTENT,
        jobName,
        jobId,
        fileLabel,
        fileId,
    };
}

function receiveContent(jobName, jobId, fileLabel, fileId, content) {
    return {
        type: RECEIVE_CONTENT,
        jobName,
        jobId,
        content,
        fileLabel,
        fileId,
    };
}

export function invalidateContent() {
    return {
        type: INVALIDATE_CONTENT,
    };
}

export function fetchJobFile(jobName, jobId, fileLabel, fileId) {
    return dispatch => {
        dispatch(requestContent(jobName, jobId, fileLabel, fileId));
        return atlasFetch(`jobs/${jobName}/${jobId}/files/${fileId}/content`, { credentials: 'include' })
            .then(response => { return response.json(); })
            .then(json => {
                if (json.content) {
                    dispatch(receiveContent(jobName, jobId, fileLabel, fileId, json.content));
                } else {
                    throw Error(json.message);
                }
            })
            .catch(e => {
                dispatch(constructAndPushMessage(e.message));
                return dispatch(invalidateContent());
            });
    };
}

function getFileNameFromJob(jobName, jobId, fileId) {
    const contentPath = `jobs/${jobName}/${jobId}/files`;
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

export function fetchJobFileNoName(jobName, jobId, fileId) {
    return dispatch => {
        const contentPath = `jobs/${jobName}/${jobId}/files/${fileId}/content`;
        dispatch(requestContent(jobName, jobId, 'UNKNOWN', fileId));
        return atlasFetch(contentPath, { credentials: 'include' })
            .then(response => { return response.json(); })
            .then(json => {
                if (json.content) {
                    return getFileNameFromJob(jobName, jobId, fileId).then(
                        fileLabel => {
                            if (fileLabel) {
                                dispatch(receiveContent(jobName, jobId, fileLabel, fileId, json.content));
                            } else {
                                throw Error(fileLabel);
                            }
                        },
                    ).catch(e => {
                        throw Error(e);
                    });
                }
                throw Error(json.message);
            })
            .catch(e => {
                dispatch(constructAndPushMessage(e.message));
                return dispatch(invalidateContent());
            });
    };
}
